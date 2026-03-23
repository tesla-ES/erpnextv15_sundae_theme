import "./theme_switcher";

$(document).ready(function () {
    // Redirect /app/home to /app/newhome
    frappe.router.on('change', () => {
        if (frappe.get_route_str() === 'home') {
            frappe.set_route('newhome');
        }
    });

    // Check on initial load
    if (frappe.get_route_str() === 'home' || !frappe.get_route_str()) {
        // Only redirect if we are in the Desk (not login or website)
        if (window.location.pathname.startsWith('/app')) {
            frappe.set_route('newhome');
        }
    }
});