frappe.pages['newhome'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Sundae Home',
        single_column: true
    });

    $(frappe.render_template("newhome", {})).appendTo(page.body);

    fetch_workspaces(page);
}

function fetch_workspaces(page) {
    frappe.call({
        method: "frappe.desk.desktop.get_workspace_sidebar_items",
        callback: function (r) {
            if (r.message) {
                render_grid(page, r.message.pages);
            }
        }
    });
}

function render_grid(page, workspaces) {
    const grid = page.body.find('#workspace-grid');
    grid.empty();

    // Add Control Panel Card for System Managers
    if (frappe.user_roles.includes('System Manager')) {
        const cp_card = $(`
			<div class="ws-card system-card" data-name="control-panel">
				<div class="ws-icon-wrapper">
					<i class="fa fa-terminal"></i>
				</div>
				<div class="ws-title">Control Panel</div>
			</div>
		`);
        cp_card.click(() => frappe.set_route('control_panel'));
        grid.append(cp_card);
    }

    workspaces.forEach(ws => {
        if (ws.is_hidden) return;

        // Use frappe.utils.icon if available for high-quality SVGs
        const icon_html = ws.icon ? frappe.utils.icon(ws.icon, 'lg') : '<i class="octicon octicon-package"></i>';

        const card = $(`
			<div class="ws-card" data-name="${ws.name}">
				<div class="ws-icon-wrapper">
					${icon_html}
				</div>
				<div class="ws-title">${ws.label || ws.name}</div>
			</div>
		`);

        card.click(() => {
            // Fix: Frappe v15 workspaces typically use lowercase routes
            frappe.set_route(ws.name.toLowerCase());
        });

        grid.append(card);
    });
}

