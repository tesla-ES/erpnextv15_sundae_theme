// Sundae Theme: Bundle [v2.5.0 - Logic & Robustness Fix]
import "./theme_switcher";

$(document).ready(function () {
    console.log("Sundae: Bundle initialized");

    // 1. Theme Applier (Slugified)
    const apply_theme = () => {
        // Fallback-safe retrieval for desk_theme in v15
        let theme = (frappe.boot.user && frappe.boot.user.desk_theme) || 
                      frappe.boot.desk_theme || 
                      'Light'; // Default
        
        let theme_id = theme.toLowerCase().trim().replace(/ /g, "_");

        // Canonical mapping for standard themes
        if (theme_id.includes("light")) theme_id = "light";
        if (theme_id.includes("dark") || theme_id.includes("night")) theme_id = "dark";
        if (theme_id.includes("automatic")) theme_id = "automatic";

        console.log(`Sundae: Applying theme [${theme}] as [${theme_id}]`);
        document.documentElement.setAttribute('data-theme', theme_id);
    };

    // Initial apply
    apply_theme();

    // Listen for realtime theme changes from server
    frappe.realtime.on('theme_change', (data) => {
        console.log("Sundae: Realtime theme change received:", data);
        if (data && data.theme) {
            frappe.boot.user.desk_theme = data.theme; // Update local state
        }
        setTimeout(apply_theme, 200);
    });

    // 2. Navigation Redirects
    frappe.router.on('change', () => {
        if (frappe.get_route_str() === 'home') {
            console.log("Sundae: Redirecting to newhome");
            frappe.set_route('newhome');
        }
    });

    if (frappe.get_route_str() === 'home' || !frappe.get_route_str()) {
        if (window.location.pathname.startsWith('/app')) frappe.set_route('newhome');
    }

    // 3. Logo Fix (Return to Home)
    $(document).on('click', '.navbar-brand, .app-logo', (e) => {
        if (frappe.get_route_str() !== 'newhome') {
            e.preventDefault();
            frappe.set_route('newhome');
        }
    });
});