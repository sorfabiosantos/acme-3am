import Users from "../../_common/classes/Users.js";
import Faqs from "../../_common/classes/Faqs.js";
import FaqCategories from "../../_common/classes/FaqCategories.js";
import SessionStorage from "../../_common/scripts/storage.js";

class AdminApp {
    constructor() {
        this.storage = new SessionStorage("admin");
        this.users = new Users();
        this.faqs = new Faqs();
        this.categories = new FaqCategories();
        this.faqData = [];
        this.categoryData = [];
        this.currentSection = "dashboard";
        this.faqSearch = "";
        this.faqCategoryFilter = "";
        this.categorySearch = "";
    }

    init() {
        this.bindLogin();
        this.bindNavigation();
        this.bindMenu();
        this.bindLogout();
        this.bindFaqActions();
        this.bindCategoryActions();

        if (this.storage.getToken()) {
            this.openPanel();
        } else {
            this.showLogin();
        }

        this.refreshIcons();
    }

    bindLogin() {
        document.querySelector("#admin-login-form")?.addEventListener("submit", async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const button = form.querySelector("[type='submit']");
            this.setBusy(button, true);
            this.setFeedback("[data-admin-login-feedback]", "");

            try {
                const result = await this.users.loginAdminFromForm(form);
                const token = result?.data?.token;

                if (result?.status !== "success" || !token) {
                    this.setFeedback("[data-admin-login-feedback]", result?.message || "Não foi possível entrar no painel.", "error");
                    return;
                }

                this.storage.saveSession(token, result.data);
                this.openPanel();
            } catch (error) {
                this.setFeedback("[data-admin-login-feedback]", error.message, "error");
            } finally {
                this.setBusy(button, false);
            }
        });
    }

    bindNavigation() {
        document.querySelectorAll("[data-admin-section]").forEach((button) => {
            button.addEventListener("click", () => {
                this.showSection(button.dataset.adminSection);
                this.closeMenu();
            });
        });
    }

    bindMenu() {
        document.querySelector("[data-admin-menu]")?.addEventListener("click", (event) => {
            const isOpen = document.querySelector("#admin-sidebar").classList.toggle("is-open");
            event.currentTarget.setAttribute("aria-expanded", String(isOpen));
        });
    }

    bindLogout() {
        document.querySelector("[data-admin-logout]")?.addEventListener("click", () => {
            this.storage.clearSession();
            window.location.reload();
        });
    }

    bindFaqActions() {
        document.querySelector("[data-faq-new]")?.addEventListener("click", () => this.openFaqDialog());
        document.querySelector("[data-faq-search]")?.addEventListener("input", (event) => {
            this.faqSearch = event.target.value.toLocaleLowerCase("pt-BR");
            this.renderFaqs();
        });
        document.querySelector("[data-faq-category-filter]")?.addEventListener("change", (event) => {
            this.faqCategoryFilter = event.target.value;
            this.renderFaqs();
        });
        document.querySelector("[data-faq-list]")?.addEventListener("click", (event) => {
            const editButton = event.target.closest("[data-faq-edit]");
            const deleteButton = event.target.closest("[data-faq-delete]");
            const toggleButton = event.target.closest("[data-faq-toggle]");

            if (editButton) {
                this.openFaqDialog(Number(editButton.dataset.faqEdit));
            }
            if (deleteButton) {
                this.removeFaq(Number(deleteButton.dataset.faqDelete));
            }
            if (toggleButton) {
                this.toggleFaq(Number(toggleButton.dataset.faqToggle));
            }
        });
        document.querySelector("[data-faq-form]")?.addEventListener("submit", (event) => {
            this.saveFaq(event);
        });
        document.querySelector("#faq-dialog .admin-dialog__close")?.addEventListener("click", () => {
            document.querySelector("#faq-dialog").close();
        });
        document.querySelector("#faq-dialog .admin-button--secondary")?.addEventListener("click", () => {
            document.querySelector("#faq-dialog").close();
        });
    }

    bindCategoryActions() {
        document.querySelector("[data-category-new]")?.addEventListener("click", () => this.openCategoryDialog());
        document.querySelector("[data-category-search]")?.addEventListener("input", (event) => {
            this.categorySearch = event.target.value.toLocaleLowerCase("pt-BR");
            this.renderCategories();
        });
        document.querySelector("[data-category-list]")?.addEventListener("click", (event) => {
            const editButton = event.target.closest("[data-category-edit]");
            const deleteButton = event.target.closest("[data-category-delete]");

            if (editButton) {
                this.openCategoryDialog(Number(editButton.dataset.categoryEdit));
            }
            if (deleteButton) {
                this.removeCategory(Number(deleteButton.dataset.categoryDelete));
            }
        });
        document.querySelector("[data-category-form]")?.addEventListener("submit", (event) => {
            this.saveCategory(event);
        });
        document.querySelector("#category-dialog .admin-dialog__close")?.addEventListener("click", () => {
            document.querySelector("#category-dialog").close();
        });
        document.querySelector("#category-dialog .admin-button--secondary")?.addEventListener("click", () => {
            document.querySelector("#category-dialog").close();
        });
    }

    openPanel() {
        document.querySelector("#admin-login-view").hidden = true;
        document.querySelector("#admin-app-view").hidden = false;
        this.renderAdminUser();
        this.configureClients();
        this.loadContent();
    }

    showLogin() {
        document.querySelector("#admin-login-view").hidden = false;
        document.querySelector("#admin-app-view").hidden = true;
    }

    async loadContent() {
        try {
            const [faqResult, categoryResult] = await Promise.all([
                this.faqs.listAllAdmin(),
                this.categories.listAll()
            ]);
            this.faqData = faqResult?.data || [];
            this.categoryData = categoryResult?.data || [];
            this.populateFaqCategoryFilter();
            this.renderFaqs();
            this.renderCategories();
            this.populateCategorySelect();
        } catch (error) {
            this.setFeedback("[data-faq-feedback]", "Não foi possível carregar as perguntas frequentes.", "error");
            this.setFeedback("[data-category-feedback]", "Não foi possível carregar as categorias.", "error");
        }
    }

    configureClients() {
        const token = this.storage.getToken();
        this.faqs.setAuthToken(token);
        this.categories.setAuthToken(token);
    }

    showSection(section) {
        this.currentSection = section;
        document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
            panel.hidden = panel.dataset.adminPanel !== section;
        });
        document.querySelectorAll("[data-admin-section]").forEach((button) => {
            button.classList.toggle("is-active", button.dataset.adminSection === section);
        });
        const title = { dashboard: "Visão geral", faqs: "Perguntas frequentes", categories: "Categorias" }[section];
        document.querySelector("[data-admin-page-title]").textContent = title;
    }

    renderAdminUser() {
        const user = this.storage.getUser() || { name: "Administrador" };
        const initials = user.name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
        document.querySelector("[data-admin-user-name]").textContent = user.name;
        document.querySelector("[data-admin-initials]").textContent = initials;
        this.renderMockDashboard();
    }

    renderMockDashboard() {
        const metrics = [
            ["Assessores ativos", "126", "+12% este mês"],
            ["Corredores cadastrados", "3.842", "+184 este mês"],
            ["Treinos registrados", "18.590", "+8,6% este mês"],
            ["Provas acompanhadas", "274", "32 nos próximos 30 dias"]
        ];
        document.querySelector("[data-admin-metrics]").innerHTML = metrics.map(([label, value, change]) => `
            <article class="admin-card"><span class="admin-metric__label">${label}</span><strong class="admin-metric__value">${value}</strong><small class="admin-metric__change">${change}</small></article>
        `).join("");

        const ranking = [
            ["Mariana Costa", "Assessoria Veloz", "142 corredores", "MC"],
            ["Rafael Mendes", "Run Club Sul", "96 corredores", "RM"],
            ["Juliana Alves", "Passo a Passo", "78 corredores", "JA"],
            ["Carlos Eduardo", "Corre Comigo", "65 corredores", "CE"]
        ];
        document.querySelector("[data-admin-ranking]").innerHTML = ranking.map(([name, company, runners, initials]) => `
            <div class="admin-ranking__row"><span class="admin-ranking__avatar">${initials}</span><span class="admin-ranking__data"><strong class="admin-ranking__name">${name}</strong><small class="admin-ranking__meta">${company}</small></span><strong class="admin-ranking__number">${runners}</strong></div>
        `).join("");

        const activity = [
            ["user-plus", "Novo assessor cadastrado", "Há 18 minutos"],
            ["message-circle-question", "FAQ atualizada", "Há 42 minutos"],
            ["trophy", "Nova prova adicionada", "Hoje, 08:10"],
            ["trending-up", "Meta de corredores atingida", "Ontem, 17:35"]
        ];
        document.querySelector("[data-admin-activity]").innerHTML = activity.map(([icon, title, time]) => `
            <div class="admin-activity__row"><span class="admin-activity__icon"><i data-lucide="${icon}" aria-hidden="true"></i></span><span><strong class="admin-activity__title">${title}</strong><small class="admin-activity__meta">${time}</small></span></div>
        `).join("");
    }

    renderFaqs() {
        const list = document.querySelector("[data-faq-list]");
        const filtered = this.faqData.filter((faq) => {
            const matchesSearch = faq.question.toLocaleLowerCase("pt-BR").includes(this.faqSearch);
            const matchesCategory = !this.faqCategoryFilter || String(faq.faqs_category_id) === this.faqCategoryFilter;
            return matchesSearch && matchesCategory;
        });
        document.querySelector("[data-faq-count]").textContent = `${filtered.length} pergunta(s)`;
        list.innerHTML = filtered.length ? filtered.map((faq) => `
            <tr><td>${faq.question}</td><td class="admin-table__category">${this.categoryName(faq.faqs_category_id)}</td><td>${this.statusToggle(faq)}</td><td><div class="admin-table__actions"><button class="admin-table__action" type="button" data-faq-edit="${faq.id}" aria-label="Editar"><i data-lucide="pencil" aria-hidden="true"></i></button><button class="admin-table__action admin-table__action--delete" type="button" data-faq-delete="${faq.id}" aria-label="Excluir"><i data-lucide="trash-2" aria-hidden="true"></i></button></div></td></tr>
        `).join("") : '<tr><td colspan="4">Nenhuma pergunta encontrada.</td></tr>';
        this.refreshIcons();
    }

    statusToggle(faq) {
        const active = Number(faq.active) === 1;
        const label = active ? "Ativa" : "Inativa";
        return `<button class="admin-status-toggle ${active ? "is-active" : "is-inactive"}" type="button" data-faq-toggle="${faq.id}" aria-pressed="${active}" aria-label="${active ? "Inativar" : "Ativar"} FAQ"><span class="admin-status-toggle__track"><span class="admin-status-toggle__thumb"></span></span><span>${label}</span></button>`;
    }

    async toggleFaq(id) {
        const faq = this.faqData.find((item) => Number(item.id) === id);
        if (!faq) return;

        const nextActive = Number(faq.active) === 1 ? 0 : 1;
        const result = await this.faqs.update(id, { active: nextActive });
        if (result?.status === "success") {
            faq.active = nextActive;
            this.renderFaqs();
            this.setFeedback("[data-faq-feedback]", nextActive ? "FAQ ativada." : "FAQ inativada.", "success");
        } else {
            this.setFeedback("[data-faq-feedback]", result?.message || "Não foi possível alterar o status da FAQ.", "error");
        }
    }

    renderCategories() {
        const list = document.querySelector("[data-category-list]");
        const filtered = this.categoryData.filter((category) => category.name.toLocaleLowerCase("pt-BR").includes(this.categorySearch));
        document.querySelector("[data-category-count]").textContent = `${filtered.length} categoria(s)`;
        list.innerHTML = filtered.length ? filtered.map((category) => `
            <tr><td>${category.name}</td><td><span class="admin-status">Ativa</span></td><td><div class="admin-table__actions"><button class="admin-table__action" type="button" data-category-edit="${category.id}" aria-label="Editar"><i data-lucide="pencil" aria-hidden="true"></i></button><button class="admin-table__action admin-table__action--delete" type="button" data-category-delete="${category.id}" aria-label="Excluir"><i data-lucide="trash-2" aria-hidden="true"></i></button></div></td></tr>
        `).join("") : '<tr><td colspan="3">Nenhuma categoria encontrada.</td></tr>';
        this.refreshIcons();
    }

    populateCategorySelect(selectedId = "") {
        const select = document.querySelector("#faq-category");
        select.innerHTML = '<option value="">Selecione uma categoria</option>' + this.categoryData.map((category) => `<option value="${category.id}" ${String(category.id) === String(selectedId) ? "selected" : ""}>${category.name}</option>`).join("");
    }

    populateFaqCategoryFilter() {
        const select = document.querySelector("[data-faq-category-filter]");
        if (!select) return;

        select.innerHTML = '<option value="">Todas as categorias</option>' + this.categoryData.map((category) => `<option value="${category.id}" ${String(category.id) === this.faqCategoryFilter ? "selected" : ""}>${category.name}</option>`).join("");
    }

    openFaqDialog(id = null) {
        const form = document.querySelector("[data-faq-form]");
        form.reset();
        form.elements.id.value = id || "";
        const faq = this.faqData.find((item) => item.id === id);
        document.querySelector("[data-faq-dialog-title]").textContent = faq ? "Editar pergunta" : "Nova pergunta";
        if (faq) {
            form.elements.question.value = faq.question;
            form.elements.answer.value = faq.answer;
        }
        this.populateCategorySelect(faq?.faqs_category_id);
        document.querySelector("#faq-dialog").showModal();
    }

    async saveFaq(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const id = Number(form.elements.id.value);
        const data = {
            faqs_category_id: form.elements.faqs_category_id.value,
            question: form.elements.question.value,
            answer: form.elements.answer.value
        };
        const result = id ? await this.faqs.update(id, data) : await this.faqs.insert(data);
        if (result?.status === "success" || result?.status === "created") {
            document.querySelector("#faq-dialog").close();
            await this.loadContent();
            this.setFeedback("[data-faq-feedback]", id ? "Pergunta atualizada." : "Pergunta criada.", "success");
        } else {
            this.setFeedback("[data-faq-feedback]", result?.message || "Não foi possível salvar a pergunta.", "error");
        }
    }

    async removeFaq(id) {
        if (!window.confirm("Deseja realmente remover esta pergunta?")) return;
        const result = await this.faqs.remove(id);
        if (result?.status === "success") {
            await this.loadContent();
            this.setFeedback("[data-faq-feedback]", "Pergunta removida.", "success");
        } else {
            this.setFeedback("[data-faq-feedback]", result?.message || "Não foi possível remover a pergunta.", "error");
        }
    }

    openCategoryDialog(id = null) {
        const form = document.querySelector("[data-category-form]");
        form.reset();
        form.elements.id.value = id || "";
        const category = this.categoryData.find((item) => item.id === id);
        document.querySelector("[data-category-dialog-title]").textContent = category ? "Editar categoria" : "Nova categoria";
        if (category) form.elements.name.value = category.name;
        document.querySelector("#category-dialog").showModal();
    }

    async saveCategory(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const id = Number(form.elements.id.value);
        const data = { name: form.elements.name.value };
        const result = id ? await this.categories.update(id, data) : await this.categories.insert(data);
        if (result?.status === "success" || result?.status === "created") {
            document.querySelector("#category-dialog").close();
            await this.loadContent();
            this.setFeedback("[data-category-feedback]", id ? "Categoria atualizada." : "Categoria criada.", "success");
        } else {
            this.setFeedback("[data-category-feedback]", result?.message || "Não foi possível salvar a categoria.", "error");
        }
    }

    async removeCategory(id) {
        if (!window.confirm("Deseja realmente remover esta categoria?")) return;
        const result = await this.categories.remove(id);
        if (result?.status === "success") {
            await this.loadContent();
            this.setFeedback("[data-category-feedback]", "Categoria removida.", "success");
        } else {
            this.setFeedback("[data-category-feedback]", result?.message || "Não foi possível remover a categoria.", "error");
        }
    }

    categoryName(id) {
        return this.categoryData.find((category) => Number(category.id) === Number(id))?.name || "Sem categoria";
    }

    setBusy(button, busy) {
        if (!button) return;
        button.disabled = busy;
        button.textContent = busy ? "Aguarde..." : "Entrar no painel";
    }

    setFeedback(selector, message, type = "") {
        const element = document.querySelector(selector);
        if (!element) return;
        element.textContent = message;
        element.className = `admin-feedback${type ? ` is-${type}` : ""}`;
    }

    closeMenu() {
        document.querySelector("#admin-sidebar")?.classList.remove("is-open");
        document.querySelector("[data-admin-menu]")?.setAttribute("aria-expanded", "false");
    }

    refreshIcons() {
        if (typeof lucide !== "undefined") lucide.createIcons();
    }
}

document.addEventListener("DOMContentLoaded", () => new AdminApp().init());
