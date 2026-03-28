frappe.pages['control-panel'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Bench Control Console',
        single_column: true
    });

    $(frappe.render_template("control_panel", {})).appendTo(page.body);

    const cp = new ControlPanel(page);
}

class ControlPanel {
    constructor(page) {
        this.page = page;
        this.container = page.body;
        this.console = this.container.find('#console-output');
        this.apiUrl = localStorage.getItem('sun_cp_api_url') || '';
        this.apiToken = localStorage.getItem('sun_cp_api_token') || '';

        this.init();
    }

    init() {
        this.container.find('#api-url').val(this.apiUrl);
        this.update_auth_ui();

        if (this.apiUrl && this.apiToken) {
            this.start_stats_poll();
        }
        this.bind_events();
    }

    update_auth_ui() {
        if (this.apiToken) {
            this.container.find('#login-form').hide();
            this.container.find('#auth-status').show();
        } else {
            this.container.find('#login-form').show();
            this.container.find('#auth-status').hide();
        }
    }

    bind_events() {
        // Login Action
        this.container.find('#btn-login-api').click(() => {
            this.login();
        });

        // Logout
        this.container.find('#btn-logout').click(() => {
            this.apiToken = '';
            localStorage.removeItem('sun_cp_api_token');
            this.update_auth_ui();
            clearInterval(this.poll_timer);
            this.log("Logged out from API.");
        });

        // Command Buttons
        this.container.on('click', '.command-btn', (e) => {
            let cmd = $(e.currentTarget).data('cmd');
            this.run_fastapi_cmd(cmd);
        });

        // Install App
        this.container.find('#btn-install').click(() => {
            let repo = this.container.find('#install-repo').val();
            if (!repo) return frappe.msgprint(__('Enter Repo URL'));
            this.run_fastapi_cmd('install', { repo_url: repo });
        });

        this.container.find('#clear-console').click(() => {
            this.console.empty().append('<p class="text-muted">Console cleared.</p>');
        });
    }

    async login() {
        this.apiUrl = this.container.find('#api-url').val().replace(/\/$/, "");
        const username = this.container.find('#api-user').val();
        const password = this.container.find('#api-pass').val();

        if (!this.apiUrl || !username || !password) {
            return frappe.msgprint(__('Please enter API URL, Username, and Password'));
        }

        this.log(`> Attempting login to ${this.apiUrl}...`);

        try {
            const response = await fetch(`${this.apiUrl}/api/v1/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (data.token) {
                this.apiToken = data.token;
                localStorage.setItem('sun_cp_api_url', this.apiUrl);
                localStorage.setItem('sun_cp_api_token', this.apiToken);
                this.update_auth_ui();
                this.start_stats_poll();
                frappe.show_alert({ message: __('Connected Successfully'), indicator: 'green' });
                this.log("Login successful. Monitoring started.");
            } else {
                this.log(`Login Failed: ${data.detail || 'Invalid Credentials'}`, 'text-danger');
            }
        } catch (e) {
            this.log(`Login Error: ${e.message}`, 'text-danger');
        }
    }

    start_stats_poll() {
        if (this.poll_timer) clearInterval(this.poll_timer);
        this.fetch_stats();
        this.poll_timer = setInterval(() => this.fetch_stats(), 5000);
    }

    async fetch_stats() {
        if (!this.apiUrl || !this.apiToken) return;

        try {
            const response = await fetch(`${this.apiUrl}/api/v1/system/status`, {
                headers: { 'Authorization': `Bearer ${this.apiToken}` }
            });
            if (response.status === 401) {
                this.log("Session expired. Please login again.", "text-warning");
                this.container.find('#btn-logout').click();
                return;
            }
            const data = await response.json();
            this.update_gauges(data);
            this.update_info(data);
        } catch (e) {
            console.error("Stats fetch failed", e);
        }
    }

    update_gauges(data) {
        const stats = {
            cpu: data.cpu_usage || data.cpu || 0,
            ram: data.ram_usage || data.ram || 0,
            disk: data.disk_usage || data.disk || 0
        };

        Object.keys(stats).forEach(key => {
            let val = Math.round(stats[key]);
            this.container.find(`#${key}-val`).text(`${val}%`);
            this.container.find(`#${key}-gauge .gauge-fill`).css('height', `${val}%`);
            if (val > 85) this.container.find(`#${key}-gauge`).addClass('pulse-red');
            else this.container.find(`#${key}-gauge`).removeClass('pulse-red');
        });
    }

    update_info(data) {
        let html = `
            <p><strong>Site:</strong> ${data.site_name || 'N/A'}</p>
            <p><strong>OS:</strong> ${data.os_version || 'Linux'}</p>
            <p><strong>Uptime:</strong> ${data.uptime || 'Running'}</p>
            <p><strong>Status:</strong> <span class="label label-success">Connected to API</span></p>
        `;
        this.container.find('#system-info').html(html);
    }

    async run_fastapi_cmd(action, payload = {}) {
        if (!this.apiUrl || !this.apiToken) return frappe.msgprint(__('Login first'));

        let endpoint = `/api/v1/bench/${action}`;
        if (action === 'install') endpoint = `/api/v1/apps/install`;
        if (action === 'update') endpoint = `/api/v1/apps/update`;
        if (action === 'backup') endpoint = `/api/v1/backup/create`;
        if (action === 'logs') endpoint = `/api/v1/logs`;

        this.log(`> Executing: ${action}...`);
        this.page.set_indicator('Running...', 'orange');

        try {
            const method = (action === 'logs') ? 'GET' : 'POST';
            const body = (method === 'POST') ? JSON.stringify(payload) : null;

            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: body
            });

            const data = await response.json();
            this.page.clear_indicator();

            if (data.status === 'success' || data.message) {
                this.log(data.message || 'Action completed');
                frappe.show_alert({ message: data.message || 'Success', indicator: 'green' });
            }
            if (data.output) this.log(data.output);
            if (data.detail) this.log(`API Message: ${data.detail}`);

        } catch (e) {
            this.page.clear_indicator();
            this.log(`Fetch Error: ${e.message}`, 'text-danger');
        }
    }

    log(msg, colorClass = "") {
        let p = $('<p>').addClass(colorClass).text(msg);
        this.console.append(p);
        this.console.scrollTop(this.console[0].scrollHeight);
    }
}
