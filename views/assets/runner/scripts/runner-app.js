import AthletesApi from "../../_common/classes/Athletes.js";
import ProgressApi from "../../_common/classes/Progress.js";
import RacesApi from "../../_common/classes/Races.js";
import Users from "../../_common/classes/Users.js";
import WorkoutsApi from "../../_common/classes/Workouts.js";
import AuthGuard from "../../_common/scripts/auth-guard.js";
import SessionStorage from "../../_common/scripts/storage.js";
import RunnerDashboard from "./runner-dashboard.js";
import RunnerMockData from "./runner-mock-data.js";
import RunnerProgress from "./runner-progress.js";
import RunnerRaces from "./runner-races.js";
import RunnerWorkouts from "./runner-workouts.js";

class RunnerApp {
    constructor() {
        this.storage = new SessionStorage("runner");
        this.guard = new AuthGuard("../index.html", "runner", 3);
        this.users = new Users();
        this.mock = new RunnerMockData();
        this.activeView = "dashboard";
        this.views = ["dashboard", "workouts", "progress", "races", "profile"];
    }

    init() {
        this.bindLogin();

        if (!this.guard.isAuthenticated()) {
            this.showLogin();
            return;
        }

        this.showApp();
        this.renderUser();
        this.bindNavigation();
        this.bindMenu();
        this.bindLogout();
        this.bindProfile();
        const token = this.storage.getToken();
        this.api = [new AthletesApi(), new ProgressApi(), new RacesApi(), new WorkoutsApi()];
        this.api.forEach((client) => client.setAuthToken(token));
        this.dashboard = new RunnerDashboard(this.mock, (view, id) => this.showView(view, id), (message) => this.showToast(message));
        this.workouts = new RunnerWorkouts(this.mock, (message) => this.showToast(message));
        this.progress = new RunnerProgress(this.mock);
        this.races = new RunnerRaces(this.mock);
        this.dashboard.render();
        this.workouts.render();
        this.progress.render();
        this.races.render();
        this.refreshIcons();
    }

    bindLogin() {
        const form = document.querySelector("[data-runner-login-form]");
        if (!form || form.dataset.bound) return;
        form.dataset.bound = "true";
        form.addEventListener("submit", (event) => this.handleLogin(event));
    }

    async handleLogin(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const button = form.querySelector("[type='submit']");
        const feedback = document.querySelector("[data-runner-login-feedback]");
        button.disabled = true;
        button.setAttribute("aria-busy", "true");
        feedback.textContent = "Validando seu acesso...";
        feedback.className = "runner-login__feedback";

        try {
            const result = await this.users.loginAthleteFromForm(form);
            if (result?.status !== "success" || Number(result.data?.type_id) !== 3 || !result.data?.token) {
                feedback.textContent = result?.message || "Não foi possível validar seu acesso.";
                feedback.classList.add("is-error");
                return;
            }

            this.storage.saveSession(result.data.token, result.data);
            window.location.reload();
        } catch (error) {
            feedback.textContent = error.message || "Não foi possível conectar ao servidor.";
            feedback.classList.add("is-error");
        } finally {
            button.disabled = false;
            button.removeAttribute("aria-busy");
        }
    }

    showLogin() {
        document.querySelector("[data-runner-login]").hidden = false;
        document.querySelector("[data-runner-app]").hidden = true;
    }

    showApp() {
        document.querySelector("[data-runner-login]").hidden = true;
        document.querySelector("[data-runner-app]").hidden = false;
    }

    renderUser() {
        const user = { ...this.mock.getUser(), ...(this.storage.getUser() || {}) };
        const firstName = user.name?.split(" ")[0] || "corredor";
        const initials = user.name ? user.name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase() : "RP";
        document.querySelectorAll("[data-runner-user-name]").forEach((element) => { element.textContent = user.name || "Corredor"; });
        document.querySelectorAll("[data-runner-first-name]").forEach((element) => { element.textContent = firstName; });
        document.querySelectorAll("[data-runner-user-initials]").forEach((element) => { element.textContent = initials; });
        document.querySelector("[data-runner-profile-name]").value = user.name || "";
        document.querySelector("[data-runner-profile-email]").value = user.email || "";
        document.querySelector("[data-runner-profile-goal]").value = user.goal || "";
        document.querySelector("[data-runner-profile-level]").value = user.level || "";
        document.querySelector("[data-runner-profile-availability]").value = user.availability || "";
        document.querySelector("[data-runner-profile-notes]").value = user.notes || "";
    }

    bindNavigation() {
        document.querySelectorAll("[data-runner-nav]").forEach((link) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                this.showView(link.dataset.runnerNav);
            });
        });
    }

    bindLogout() {
        document.querySelector("[data-runner-logout]")?.addEventListener("click", () => {
            this.storage.clearSession();
            window.location.reload();
        });
    }

    bindMenu() {
        document.querySelector("[data-runner-menu-toggle]")?.addEventListener("click", (event) => {
            const sidebar = document.querySelector("[data-runner-sidebar]");
            const isOpen = sidebar?.classList.toggle("is-open");
            event.currentTarget.setAttribute("aria-expanded", String(isOpen));
        });
    }

    bindProfile() {
        document.querySelector("[data-runner-profile-form]")?.addEventListener("submit", (event) => {
            event.preventDefault();
            this.showToast("Perfil atualizado no modo demonstração. A persistência será conectada ao backend.");
        });
    }

    showView(view, selectedWorkout = null) {
        if (!this.views.includes(view)) return;
        this.activeView = view;
        document.querySelectorAll("[data-runner-view]").forEach((section) => {
            section.hidden = section.dataset.runnerView !== view;
        });
        document.querySelectorAll("[data-runner-nav]").forEach((link) => {
            link.classList.toggle("is-active", link.dataset.runnerNav === view);
        });
        if (view === "workouts") this.workouts.render(selectedWorkout);
        this.closeMenu();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    showToast(message) {
        const toast = document.querySelector("[data-runner-toast]");
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add("is-visible");
        window.clearTimeout(this.toastTimeout);
        this.toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 4500);
    }

    closeMenu() {
        document.querySelector("[data-runner-sidebar]")?.classList.remove("is-open");
        document.querySelector("[data-runner-menu-toggle]")?.setAttribute("aria-expanded", "false");
    }

    refreshIcons() {
        if (typeof lucide !== "undefined") lucide.createIcons();
    }
}

document.addEventListener("DOMContentLoaded", () => new RunnerApp().init());
