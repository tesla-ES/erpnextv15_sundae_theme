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
        this.container.find('#api-token').val(this.apiToken);

        if (this.apiUrl) {
            this.start_stats_poll();
        }
        this.bind_events();
    }

    bind_events() {
        var me = this;

        // Save API Config
        this.container.find('#btn-save-api').click(() => {
            this.apiUrl = this.container.find('#api-url').val().replace(/\/$/, "");
            this.apiToken = this.container.find('#api-token').val();
            localStorage.setItem('sun_cp_api_url', this.apiUrl);
            localStorage.setItem('sun_cp_api_token', this.apiToken);
            frappe.show_alert({ message: __('Settings Saved'), indicator: 'green' });
            this.start_stats_poll();
        });

        // Command Buttons
        this.container.on('click', '.command-btn', function () {
            let cmd = $(this).data('cmd');
            me.run_fastapi_cmd(cmd);
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

    start_stats_poll() {
        if (this.poll_timer) clearInterval(this.poll_timer);
        this.fetch_stats();
        this.poll_timer = setInterval(() => this.fetch_stats(), 5000);
    }

    async fetch_stats() {
        if (!this.apiUrl) return;

        try {
            const response = await fetch(`${this.apiUrl}/api/v1/system/status`, {
                headers: { 'Authorization': `Bearer ${this.apiToken}` }
            });
            const data = await response.json();
            this.update_gauges(data);
            this.update_info(data);
        } catch (e) {
            console.error("Stats fetch failed", e);
        }
    }

    update_gauges(data) {
        // Assume data structure: { cpu: 25.5, ram: 60.1, disk: 40.0 }
        const stats = {
            cpu: data.cpu_usage || data.cpu || 0,
            ram: data.ram_usage || data.ram || 0,
            disk: data.disk_usage || data.disk || 0
        };

        Object.keys(stats).forEach(key => {
            let val = Math.round(stats[key]);
            this.container.find(`#${key}-val`).text(`${val}%`);
            this.container.find(`#${key}-gauge .gauge-fill`).css('height', `${val}%`);

            // Interaction: Pulse on high usage
            if (val > 85) {
                this.container.find(`#${key}-gauge`).addClass('pulse-red');
            } else {
                this.container.find(`#${key}-gauge`).removeClass('pulse-red');
            }
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
        if (!this.apiUrl) return frappe.msgprint(__('Setup API URL first'));

        let endpoint = `/api/v1/bench/${action}`;
        if (action === 'install') endpoint = `/api/v1/apps/install`;
        if (action === 'update') endpoint = `/api/v1/apps/update`;
        if (action === 'backup') endpoint = `/api/v1/backup/create`;
        if (action === 'logs') endpoint = `/api/v1/logs`;

        this.log(`> Requesting: ${endpoint}...`);
        this.page.set_indicator('Requesting...', 'orange');

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

            if (data.message) {
                this.log(data.message);
                frappe.show_alert({ message: data.message, indicator: 'green' });
            }
            if (data.output) this.log(data.output);
            if (data.error) this.log(`ERROR: ${data.error}`, 'text-danger');

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
