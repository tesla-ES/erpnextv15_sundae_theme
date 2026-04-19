frappe.provide("frappe.ui");

frappe.ui.ThemeSwitcher = class CustomThemeSwitcher extends frappe.ui.ThemeSwitcher {
    constructor() {
        super()
    }

    fetch_themes() {
        return new Promise((resolve) => {
            this.themes = [
                {
                    name: "light",
                    label: ("Frappe Light"),
                    info: ("Light Theme"),
                },
                {
                    name: "dark",
                    label: "Timeless Night",
                    info: "Dark Theme",
                },
                {
                    name: "automatic",
                    label: "Automatic",
                    info: "Uses system's theme to switch between light and dark mode",
                },
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

            resolve(this.themes);
        });
    }
}