frappe.pages['control-panel'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Control Panel',
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
        this.init();
    }

    init() {
        this.refresh_status();
        this.bind_events();
    }

    bind_events() {
        var me = this;
        this.container.on('click', '.command-btn', function () {
            let cmd = $(this).data('cmd');
            me.run_command(cmd);
        });

        this.container.find('#clear-console').click(() => {
            this.console.empty().append('<p class="text-muted">Console cleared.</p>');
        });
    }

    refresh_status() {
        frappe.call({
            method: 'sundae_theme.sundae_theme.page.control_panel.control_panel.get_status',
            callback: (r) => {
                if (r.message) {
                    let info = r.message;
                    let html = `
						<p><strong>Site:</strong> ${info.site}</p>
						<p><strong>Frappe Version:</strong> ${info.version}</p>
						<p><strong>Theme Version:</strong> ${info.app_version}</p>
						<p><strong>Status:</strong> <span class="label label-success">Online</span></p>
					`;
                    this.container.find('#system-info').html(html);
                }
            }
        });
    }

    run_command(cmd) {
        this.log(`> Executing: bench ${cmd.replace('-', ' ')}...`);
        this.page.set_indicator('Running...', 'orange');

        frappe.call({
            method: 'sundae_theme.sundae_theme.page.control_panel.control_panel.run_command',
            args: { command_key: cmd },
            callback: (r) => {
                this.page.clear_indicator();
                if (r.message) {
                    if (r.message.error) {
                        this.log(`ERROR: ${r.message.error}`, 'text-danger');
                        frappe.msgprint({
                            title: __('Execution Failed'),
                            message: r.message.error,
                            indicator: 'red'
                        });
                    } else {
                        if (r.message.stdout) this.log(r.message.stdout);
                        if (r.message.stderr) this.log(r.message.stderr, 'text-warning');

                        if (r.message.returncode === 0) {
                            frappe.show_alert({ message: __('Command executed successfully'), indicator: 'green' });
                        } else {
                            frappe.show_alert({ message: __('Command completed with issues'), indicator: 'orange' });
                        }
                    }
                }
            }
        });
    }

    log(msg, colorClass = "") {
        let p = $('<p>').addClass(colorClass).text(msg);
        this.console.append(p);
        this.console.scrollTop(this.console[0].scrollHeight);
    }
}
