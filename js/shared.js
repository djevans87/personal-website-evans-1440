const THEME_KEY = "preferred-theme";
const THEMES = ["light", "dark"];
const DEFAULT_THEME = "light";

const themeLink = document.getElementById("theme");
const themeButton = document.getElementById("theme-toggle");

function applyTheme(theme) {
    const safeTheme = THEMES.includes(theme) ? theme : DEFAULT_THEME;
    themeLink.href = "css/theme-" + safeTheme + ".css";

    if (themeButton) {
        themeButton.textContent = safeTheme === "dark" ? "Light mode" : "Dark mode";
    }
}
applyTheme(localStorage.getItem(THEME_KEY));

if (themeButton) {
    themeButton.addEventListener("click", function () {
        const nextTheme = themeLink.href.includes("theme-dark") ? "light" : "dark";

        applyTheme(nextTheme);
        localStorage.setItem(THEME_KEY, nextTheme);
    });
}

const yearSpan = document.getElementById("year");
if (yearSpan) {
    yearSpan.textContent = String(new Date().getFullYear());
}