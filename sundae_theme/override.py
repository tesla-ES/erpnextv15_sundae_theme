import frappe

@frappe.whitelist()
def switch_theme(theme):
	# Allow any theme to be saved, mapping spaces to underscores only for the DB if needed
	# but Frappe's Select options should match exactly.
	frappe.db.set_value("User", frappe.session.user, "desk_theme", theme)
	
	# Force clear user cache so the new theme is reflected in frappe.boot on next load
	frappe.clear_cache(user=frappe.session.user)
	
	return theme