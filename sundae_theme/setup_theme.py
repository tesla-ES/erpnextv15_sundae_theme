import frappe
from frappe.custom.doctype.property_setter.property_setter import make_property_setter

def after_install():
    add_custom_themes()

def after_migrate():
    add_custom_themes()

def add_custom_themes():
    # Define EXACT theme names for the User Desk Theme dropdown
    themes = ["Light", "Dark", "Automatic", "Cotton Candy", "Cherry", "Apricot", "Watermelon", "Odoo Theme"]
    options = "\n".join(themes)
    
    # Set the options for 'desk_theme' field in 'User' DocType
    make_property_setter("User", "desk_theme", "options", options, "Select")
    
    frappe.clear_cache(doctype="User")
    print(f"Sundae: Custom themes options updated: {', '.join(themes)}")
