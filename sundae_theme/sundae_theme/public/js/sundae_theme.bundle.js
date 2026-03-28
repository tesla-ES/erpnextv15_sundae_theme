// Sundae Theme: Bundle [v2.4.4 - Stabilization]
import "./theme_switcher";

$(document).ready(function () {
    // 1. Theme Applier (Slugified)
    const apply_theme = () => {
        let theme = frappe.boot.user.desk_theme || 'light';
        let theme_id = theme.toLowerCase().replace(/ /g, "_");

        // Handle defaults
        if (theme_id.includes("light")) theme_id = "light";
        if (theme_id.includes("dark") || theme_id.includes("night")) theme_id = "dark";

        console.log(`Sundae: Applying theme [${theme}] as [${theme_id}]`);
        document.documentElement.setAttribute('data-theme', theme_id);
    };

    apply_theme();
    frappe.realtime.on('theme_change', () => {
        setTimeout(apply_theme, 500);
    });

    // 2. Navigation Redirects
    frappe.router.on('change', () => {
        if (frappe.get_route_str() === 'home') {
            frappe.set_route('newhome');
        }
    });

    if (frappe.get_route_str() === 'home' || !frappe.get_route_str()) {
        if (window.location.pathname.startsWith('/app')) {
            frappe.set_route('newhome');
        }
    }

    // 3. Logo Redirection
    const brand_observer = new MutationObserver(() => {
        const brand = document.querySelector('.navbar-brand, .app-logo');
        if (brand && brand.getAttribute('href') !== '/app/newhome') {
            brand.setAttribute('href', '/app/newhome');
            brand.onclick = (e) => {
                e.preventDefault();
                frappe.set_route('newhome');
            };
        }
    });
    brand_observer.observe(document.body, { childList: true, subtree: true });
});