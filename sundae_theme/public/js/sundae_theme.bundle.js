// Sundae Theme: Bundle [v2.6.0 - Robust Runtime Fix]
import "./theme_switcher";

(function() {
    console.log("Sundae: Script execution started");

    const get_current_theme = () => {
        return (frappe.boot && frappe.boot.user && frappe.boot.user.desk_theme) || 
               (frappe.boot && frappe.boot.desk_theme) || 
               'Light';
    };

    const apply_theme = () => {
        let theme = get_current_theme();
        let theme_id = theme.toLowerCase().trim().replace(/ /g, "_");

        // Map standard names
        if (theme_id.includes("light")) theme_id = "light";
        if (theme_id.includes("dark") || theme_id.includes("night")) theme_id = "dark";
        if (theme_id.includes("automatic")) theme_id = "automatic";

        const current_attr = document.documentElement.getAttribute('data-theme');
        if (current_attr !== theme_id) {
            console.log(`Sundae: Force applying theme [${theme}] -> [${theme_id}]`);
            document.documentElement.setAttribute('data-theme', theme_id);
        }
    };

    // 1. Immediate Apply
    apply_theme();

    // 2. Observer to prevent Frappe from overwriting our theme
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
                apply_theme();
            }
        });
    });

    observer.observe(document.documentElement, { attributes: true });

    // 3. Fallback on Ready & Realtime
    $(document).ready(function () {
        console.log("Sundae: Document ready, re-verifying theme");
        apply_theme();

        frappe.realtime.on('theme_change', (data) => {
            console.log("Sundae: Realtime event received", data);
            if (data && data.theme) {
                if (frappe.boot && frappe.boot.user) frappe.boot.user.desk_theme = data.theme;
                apply_theme();
            }
        });

        // Navigation Redirects
        frappe.router.on('change', () => {
            if (frappe.get_route_str() === 'home') frappe.set_route('newhome');
        });

        if (frappe.get_route_str() === 'home' || !frappe.get_route_str()) {
            if (window.location.pathname.startsWith('/app')) frappe.set_route('newhome');
        }

        // Logo fix
        $(document).on('click', '.navbar-brand, .app-logo', (e) => {
            if (frappe.get_route_str() !== 'newhome') {
                e.preventDefault();
                frappe.set_route('newhome');
            }
        });
    });
})();