import frappe

@frappe.whitelist()
def switch_theme(theme):
	# Allow any theme to be saved, mapping spaces to underscores only for the DB if needed
	frappe.db.set_value("User", frappe.session.user, "desk_theme", theme)
	
	# Emit event for the UI to update instantly
	frappe.publish_realtime("theme_change", {"theme": theme}, user=frappe.session.user)
	
	# Force clear user cache so the new theme is reflected in frappe.boot on next load
	frappe.clear_cache(user=frappe.session.user)
	
	return theme