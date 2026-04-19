frappe.provide("frappe.ui");

$(document).ready(function () {
    // Override the fetch_themes method of the existing ThemeSwitcher
    let original_fetch_themes = frappe.ui.ThemeSwitcher.prototype.fetch_themes;
    frappe.ui.ThemeSwitcher.prototype.fetch_themes = function() {
        return new Promise((resolve) => {
            // Call original to get default themes
            original_fetch_themes.call(this).then((default_themes) => {
                // Add custom themes
                let custom_themes = [
                    {
                        name: "cotton_candy",
                        label: "Cotton Candy",
                        info: "Cotton Candy Blue Theme",
                        background: "linear-gradient(135deg, #a8e6cf, #dcedc8)",
                        color: "#2c3e50"
                    },
                    {
                        name: "cherry",
                        label: "Cherry",
                        info: "Cherry Theme",
                        background: "linear-gradient(135deg, #ff6b9d, #c44569)",
                        color: "#ffffff"
                    },
                    {
                        name: "apricot",
                        label: "Apricot",
                        info: "Apricot Theme",
                        background: "linear-gradient(135deg, #ffb74d, #ff9800)",
                        color: "#ffffff"
                    },
                    {
                        name: "watermelon",
                        label: "Watermelon",
                        info: "Watermelon Theme",
                        background: "linear-gradient(135deg, #4caf50, #66bb6a)",
                        color: "#ffffff"
                    },
                    {
                        name: "odoo",
                        label: "Odoo Theme",
                        info: "Odoo Theme",
                        background: "linear-gradient(135deg, #875a7b, #5e35b1)",
                        color: "#ffffff"
                    }
                ];
                this.themes = default_themes.concat(custom_themes);
                resolve(this.themes);
            });
        });
    };
});