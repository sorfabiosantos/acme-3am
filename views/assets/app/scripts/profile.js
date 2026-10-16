import Users from "../../_common/classes/Users.js";

export default class Profile {
    constructor(storage) {
        this.storage = storage;
        this.users = new Users();
        this.photoObjectUrl = null;
    }

    init() {
        // Conecta os formulários e carrega os dados atuais do assessor.
        this.users.setAuthToken(this.storage.getToken());
        document.querySelector("[data-profile-form]")?.addEventListener("submit", (event) => {
            this.updateProfile(event);
        });
        document.querySelector("[data-profile-photo-form]")?.addEventListener("submit", (event) => {
            this.updatePhoto(event);
        });
        document.querySelector("[data-profile-photo-input]")?.addEventListener("change", (event) => {
            this.previewPhoto(event.currentTarget.files[0]);
        });

        void this.loadProfile();
    }

    async loadProfile() {
        // Busca o perfil na API e informa na tela se a operação falhar.
        try {
            const response = await this.users.getMe();
            if (response?.status !== "success" || !response.data) {
                throw new Error(response?.message || "Não foi possível carregar seu perfil.");
            }

            this.renderProfile(response.data);
        } catch (error) {
            this.showFeedback("[data-profile-feedback]", error.message || "Não foi possível carregar seu perfil.", "error");
        }
    }

    renderProfile(user) {
        // Preenche o formulário e sincroniza a sessão e os avatares.
        const form = document.querySelector("[data-profile-form]");
        form.elements.namedItem("name").value = user.name || "";
        form.elements.namedItem("email").value = user.email || "";

        const savedUser = this.storeUser(user);
        if (savedUser.token) {
            this.users.setAuthToken(savedUser.token);
        }
        this.refreshHeader(savedUser);
        const initials = this.getInitials(savedUser.name);
        document.querySelector("[data-profile-initials]").textContent = initials;
        this.showProfilePhoto(user.photo);
    }

    async updateProfile(event) {
        event.preventDefault();

        // Só permite trocar a senha quando a atual e a nova forem informadas.
        const form = event.currentTarget;
        const button = form.querySelector("[type='submit']");
        const currentPassword = form.elements.namedItem("current_password").value;
        const newPassword = form.elements.namedItem("new_password").value;

        if (Boolean(currentPassword) !== Boolean(newPassword)) {
            this.showFeedback("[data-profile-feedback]", "Para trocar a senha, preencha a senha atual e a nova senha.", "error");
            return;
        }

        if (newPassword && newPassword.length < 8) {
            this.showFeedback("[data-profile-feedback]", "A nova senha deve ter pelo menos 8 caracteres.", "error");
            return;
        }

        const data = {
            name: form.elements.namedItem("name").value.trim(),
            email: form.elements.namedItem("email").value.trim(),
        };
        if (currentPassword && newPassword) {
            data.current_password = currentPassword;
            data.new_password = newPassword;
        }

        this.setBusy(button, true, "Salvando...");
        this.showFeedback("[data-profile-feedback]", "");

        try {
            const response = await this.users.update(data);
            if (response?.status !== "success" || !response.data) {
                throw new Error(response?.message || "Não foi possível atualizar seu perfil.");
            }

            this.renderProfile(response.data);
            form.elements.namedItem("current_password").value = "";
            form.elements.namedItem("new_password").value = "";
            this.showFeedback("[data-profile-feedback]", response.message || "Perfil atualizado com sucesso.", "success");
        } catch (error) {
            this.showFeedback("[data-profile-feedback]", error.message || "Não foi possível atualizar seu perfil.", "error");
        } finally {
            this.setBusy(button, false, "Salvar dados");
        }
    }

    async updatePhoto(event) {
        event.preventDefault();

        // Valida o arquivo no navegador antes de enviá-lo à API.
        const form = event.currentTarget;
        const button = form.querySelector("[type='submit']");
        const input = form.elements.namedItem("photo");
        const photo = input.files[0];
        const feedback = "[data-profile-photo-feedback]";

        if (!photo) {
            this.showFeedback(feedback, "Selecione uma imagem para continuar.", "error");
            return;
        }

        if (photo.size > 5 * 1024 * 1024) {
            this.showFeedback(feedback, "A imagem deve ter no máximo 5 MB.", "error");
            return;
        }

        if (photo.type && !["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
            this.showFeedback(feedback, "Escolha uma imagem JPG, PNG ou WEBP.", "error");
            return;
        }

        this.setBusy(button, true, "Enviando...");
        this.showFeedback(feedback, "");

        try {
            const response = await this.users.uploadPhoto(new FormData(form));
            if (response?.status !== "success" || !response.data?.photo) {
                throw new Error(response?.message || "Não foi possível atualizar sua foto.");
            }

            const user = this.storeUser({ photo: response.data.photo });
            document.querySelector("[data-profile-initials]").textContent = this.getInitials(user.name);
            this.showProfilePhoto(user.photo);
            this.refreshHeader(user);
            form.reset();
            this.revokePhotoPreview();
            this.showFeedback(feedback, response.message || "Foto atualizada com sucesso.", "success");
        } catch (error) {
            this.showFeedback(feedback, error.message || "Não foi possível atualizar sua foto.", "error");
        } finally {
            this.setBusy(button, false, "Atualizar foto");
        }
    }

    previewPhoto(photo) {
        // Cria uma prévia local; o arquivo só é enviado ao salvar o formulário.
        this.revokePhotoPreview();
        if (!photo) {
            const user = this.storage.getUser() || {};
            this.showProfilePhoto(user.photo);
            return;
        }

        this.photoObjectUrl = URL.createObjectURL(photo);
        this.showProfilePhoto(this.photoObjectUrl);
    }

    showProfilePhoto(photo) {
        // Mostra as iniciais como alternativa se a foto estiver ausente ou falhar.
        const image = document.querySelector("[data-profile-photo]");
        const initials = document.querySelector("[data-profile-initials]");
        const photoUrl = this.getSafePhotoUrl(photo);

        image.hidden = true;
        initials.hidden = false;
        image.onerror = () => {
            image.hidden = true;
            initials.hidden = false;
        };
        image.onload = () => {
            image.hidden = false;
            initials.hidden = true;
        };

        if (photoUrl) {
            image.src = photoUrl;
        } else {
            image.removeAttribute("src");
        }
    }

    refreshHeader(user) {
        // Atualiza nome e foto no cabeçalho sem recarregar a página.
        const initials = document.querySelector("[data-user-initials]");
        initials.textContent = this.getInitials(user.name);
        document.querySelector("[data-user-name]").textContent = user.name || "Assessor";
        document.querySelector("[data-user-first-name]").textContent = user.name?.split(" ")[0] || "assessor";

        const image = document.querySelector("[data-user-photo]");
        const fallback = document.querySelector("[data-user-initials]");
        const photoUrl = this.getSafePhotoUrl(user.photo);
        image.hidden = true;
        fallback.hidden = false;
        image.onerror = () => {
            image.hidden = true;
            fallback.hidden = false;
        };
        image.onload = () => {
            image.hidden = false;
            fallback.hidden = true;
        };
        if (photoUrl) {
            image.src = photoUrl;
        } else {
            image.removeAttribute("src");
        }
    }

    storeUser(changes) {
        // Mescla os dados novos com a sessão atual para não perder outras informações.
        const user = { ...(this.storage.getUser() || {}), ...changes };
        const token = user.token || this.storage.getToken();
        if (token) {
            this.storage.saveSession(token, user);
        }
        return user;
    }

    getInitials(name = "") {
        return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "AS";
    }

    getSafePhotoUrl(photo) {
        // Restringe imagens a URLs HTTP(S) ou à prévia local do navegador.
        if (typeof photo !== "string" || photo === "") {
            return null;
        }

        try {
            const url = new URL(photo, window.location.origin);
            return ["http:", "https:", "blob:"].includes(url.protocol) ? url.href : null;
        } catch {
            return null;
        }
    }

    revokePhotoPreview() {
        // Libera a URL temporária criada para a prévia da imagem.
        if (this.photoObjectUrl) {
            URL.revokeObjectURL(this.photoObjectUrl);
            this.photoObjectUrl = null;
        }
    }

    showFeedback(selector, message, type = "") {
        const element = document.querySelector(selector);
        if (!element) {
            return;
        }

        element.textContent = message;
        element.className = `app-profile-feedback${type ? ` is-${type}` : ""}`;
    }

    setBusy(button, busy, label) {
        button.disabled = busy;
        button.textContent = busy ? "Aguarde..." : label;
    }
}
