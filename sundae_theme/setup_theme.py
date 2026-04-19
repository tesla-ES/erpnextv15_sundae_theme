import frappe
from frappe.custom.doctype.property_setter.property_setter import make_property_setter

def after_install():
	setup_user_theme_options()

def after_migrate():
	setup_user_theme_options()

def setup_user_theme_options():
	"""Add custom themes to the User DocType's desk_theme field options."""
	custom_themes = ["cotton_candy", "cherry", "apricot", "watermelon", "odoo"]
	
	# Get the current options from the User DocType
	# We use a Property Setter to stay clean and not modify core files directly
	doc = frappe.get_doc("DocType", "User")
	field = [f for f in doc.fields if f.fieldname == "desk_theme"][0]
	
	current_options = field.options.split("\n")
	new_options = list(current_options)
	
	changed = False
	for theme in custom_themes:
		if theme not in new_options:
			new_options.append(theme)
			changed = True
	
	if changed:
		make_property_setter(
			"User", 
			"desk_theme", 
			"options", 
			"\n".join(new_options), 
			"Select",
			for_doctype=False # This means it applies to DocField
		)
		frappe.db.commit()
