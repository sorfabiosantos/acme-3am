import AuthGuard from "../../_common/scripts/auth-guard.js";
import SessionStorage from "../../_common/scripts/storage.js";
import DashboardMockData from "./mock-data.js";
import Dashboard from "./dashboard.js";

class App {
    constructor() {
        this.storage = new SessionStorage();
        this.dashboard = new Dashboard(new DashboardMockData());
        this.sidebar = document.querySelector("#app-sidebar");
    }

    init() {
        this.renderUser();
        this.dashboard.render();
        this.bindNavigation();
        this.bindMenu();
        this.bindLogout();
        this.bindActions();
        this.refreshIcons();
    }

    renderUser() {
        const user = this.storage.getUser() || this.dashboard.data.getUser();
        const firstName = user.name?.split(" ")[0] || "assessor";
        const initials = user.name
            ? user.name.split(" ").slice(0, 2).map((name) => name[0]).join("").toUpperCase()
            : user.initials;

        document.querySelector("[data-user-name]").textContent = user.name || "Assessor";
        document.querySelector("[data-user-first-name]").textContent = firstName;
        document.querySelector("[data-user-initials]").textContent = initials;
    }

    bindNavigation() {
        document.querySelectorAll("[data-app-nav]").forEach((link) => {
            link.addEventListener("click", () => {
                document.querySelectorAll("[data-app-nav]").forEach((item) => {
                    item.classList.toggle("is-active", item === link);
                });
                this.closeMenu();
            });
        });
    }

    bindMenu() {
        document.querySelector("#app-menu-toggle")?.addEventListener("click", (event) => {
            const isOpen = this.sidebar.classList.toggle("is-open");
            event.currentTarget.setAttribute("aria-expanded", String(isOpen));
        });
    }

    bindLogout() {
        document.querySelector("[data-app-logout]")?.addEventListener("click", () => {
            this.storage.clearSession();
            window.location.replace("../index.html");
        });
    }

    bindActions() {
        document.querySelectorAll("[data-app-action]").forEach((button) => {
            button.addEventListener("click", () => {
                this.showToast("Esta ação será conectada ao backend nas próximas etapas.");
            });
        });
    }

    showToast(message) {
        const toast = document.querySelector("[data-app-toast]");

        if (!toast) {
            return;
        }

        toast.textContent = message;
        toast.classList.add("is-visible");
        window.clearTimeout(this.toastTimeout);
        this.toastTimeout = window.setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 3500);
    }

    closeMenu() {
        this.sidebar?.classList.remove("is-open");
        document.querySelector("#app-menu-toggle")?.setAttribute("aria-expanded", "false");
    }

    refreshIcons() {
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const guard = new AuthGuard();

    if (guard.protect()) {
        new App().init();
    }
});
