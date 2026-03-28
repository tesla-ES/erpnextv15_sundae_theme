// Sundae Theme: Bundle [v2.4.5 - Final stabilization for pre-last]
import "./theme_switcher";

$(document).ready(function () {
    // 1. Theme Applier (Slugified)
    const apply_theme = () => {
        let theme = frappe.boot.user.desk_theme || 'light';
        let theme_id = theme.toLowerCase().replace(/ /g, "_");

        if (theme_id.includes("light")) theme_id = "light";
        if (theme_id.includes("dark") || theme_id.includes("night")) theme_id = "dark";

        console.log(`Sundae: Applying theme [${theme}] as [${theme_id}]`);
        document.documentElement.setAttribute('data-theme', theme_id);
    };

    apply_theme();
    frappe.realtime.on('theme_change', () => setTimeout(apply_theme, 500));

    // 2. Navigation Redirects
    frappe.router.on('change', () => {
        if (frappe.get_route_str() === 'home') frappe.set_route('newhome');
    });

    if (frappe.get_route_str() === 'home' || !frappe.get_route_str()) {
        if (window.location.pathname.startsWith('/app')) frappe.set_route('newhome');
    }

    // 3. Logo Fix
    $(document).on('click', '.navbar-brand, .app-logo', (e) => {
        if (frappe.get_route_str() !== 'newhome') {
            e.preventDefault();
            frappe.set_route('newhome');
        }
    });
});