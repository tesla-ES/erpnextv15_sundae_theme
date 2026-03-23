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

    workspaces.forEach(ws => {
        if (ws.is_hidden) return;

        const card = $(`
			<div class="ws-card" data-name="${ws.name}">
				<div class="ws-icon-wrapper">
					<i class="${ws.icon || 'octicon octicon-package'}"></i>
				</div>
				<div class="ws-title">${ws.label || ws.name}</div>
			</div>
		`);

        card.click(() => {
            frappe.set_route(ws.name);
        });

        grid.append(card);
    });
}
