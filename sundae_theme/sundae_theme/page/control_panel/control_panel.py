# Sundae Theme - Control Panel v2.3.4
# This file handles server-side execution of bench commands.
import frappe
import subprocess
from frappe import _

@frappe.whitelist()
def run_command(command_key):
    """
    Safely execute permitted bench commands.
    """
    if "System Manager" not in frappe.get_roles():
        frappe.throw(_("Not permitted"), frappe.PermissionError)

    # Map keys to actual commands to prevent arbitrary execution
    commands = {
        "clear-cache": ["bench", "clear-cache"],
        "migrate": ["bench", "migrate"],
        "build": ["bench", "build", "--app", "sundae_theme"],
        "restart": ["bench", "restart"]
    }

    if command_key not in commands:
        frappe.throw(_("Invalid command key"))

    try:
        # Note: In some environments, 'bench' might need absolute path
        # Running as a subprocess
        result = subprocess.run(
            commands[command_key],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False
        )
        
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Control Panel Command Failed"))
        return {"error": str(e)}

@frappe.whitelist()
def get_status():
    """
    Get basic server/bench status info.
    """
    return {
        "site": frappe.local.site,
        "version": frappe.get_attr("frappe.__version__"),
        "app_version": "0.0.1 (Sundae CP v2.3.4)"
    }
