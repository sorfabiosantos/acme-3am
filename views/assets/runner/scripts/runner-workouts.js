export default class RunnerWorkouts {
    constructor(data, onToast) {
        this.data = data;
        this.onToast = onToast;
        this.filter = "all";
    }

    render(selectedId = null) {
        const workouts = this.data.getWorkouts();
        const visible = workouts.filter((workout) => this.filter === "all" || workout.status === this.filter);
        const list = document.querySelector("[data-runner-workout-list]");
        list.innerHTML = visible.length ? visible.map((workout) => `
            <article class="runner-workout-row ${workout.id === selectedId ? "is-selected" : ""}">
                <span class="runner-workout-row__date"><strong>${workout.scheduledDate}</strong><small>${workout.scheduledAt}</small></span>
                <span class="runner-workout-row__main"><strong>${workout.title}</strong><small>${workout.distance} · ${workout.pace} · ${workout.objective}</small></span>
                <span class="runner-pill runner-pill--${workout.status === "completed" ? "green" : "blue"}">${workout.status === "completed" ? "Concluído" : "Planejado"}</span>
                <button class="runner-icon-button" type="button" data-runner-select-workout="${workout.id}" aria-label="Ver ${workout.title}"><i data-lucide="chevron-right" aria-hidden="true"></i></button>
            </article>
        `).join("") : `<div class="runner-empty"><i data-lucide="calendar-off" aria-hidden="true"></i><strong>Nenhum treino encontrado</strong><p>Tente mudar o filtro para consultar outro período.</p></div>`;

        this.renderDetail(selectedId || visible[0]?.id || workouts[0]?.id);
        this.bindEvents();
        this.refreshIcons();
    }

    renderDetail(id) {
        const workout = this.data.getWorkouts().find((item) => item.id === Number(id));
        const detail = document.querySelector("[data-runner-workout-detail]");
        if (!workout) {
            detail.innerHTML = `<div class="runner-empty"><strong>Selecione um treino</strong></div>`;
            return;
        }

        detail.innerHTML = `
            <span class="runner-eyebrow">${workout.scheduledDate} · ${workout.scheduledAt}</span>
            <h3>${workout.title}</h3>
            <p class="runner-detail__description">${workout.description}</p>
            <dl class="runner-detail__metrics">
                <div><dt>Distância</dt><dd>${workout.distance}</dd></div>
                <div><dt>Ritmo</dt><dd>${workout.pace}</dd></div>
                <div><dt>Duração</dt><dd>${workout.duration}</dd></div>
            </dl>
            <div class="runner-coach-note"><i data-lucide="message-square" aria-hidden="true"></i><span><strong>Orientação do assessor</strong><small>${workout.assessorNotes}</small></span></div>
            <button class="runner-button runner-button--primary runner-button--full" type="button" data-runner-execution="${workout.id}">
                <i data-lucide="clipboard-pen-line" aria-hidden="true"></i>
                ${workout.status === "completed" ? "Editar registro" : "Registrar execução"}
            </button>
        `;
    }

    bindEvents() {
        const filter = document.querySelector("[data-runner-workout-filter]");
        if (filter && !filter.dataset.bound) {
            filter.dataset.bound = "true";
            filter.addEventListener("change", (event) => {
                this.filter = event.target.value;
                this.render();
            });
        }

        const list = document.querySelector("[data-runner-workout-list]");
        if (list && !list.dataset.bound) {
            list.dataset.bound = "true";
            list.addEventListener("click", (event) => {
                const button = event.target.closest("[data-runner-select-workout]");
                if (button) this.render(Number(button.dataset.runnerSelectWorkout));
            });
        }

        const detail = document.querySelector("[data-runner-workout-detail]");
        if (detail && !detail.dataset.bound) {
            detail.dataset.bound = "true";
            detail.addEventListener("click", (event) => {
                const button = event.target.closest("[data-runner-execution]");
                if (button) this.openExecution(Number(button.dataset.runnerExecution));
            });
        }

        const form = document.querySelector("[data-runner-execution-form]");
        if (form && !form.dataset.bound) {
            form.dataset.bound = "true";
            form.addEventListener("submit", (event) => this.saveExecution(event));
            form.querySelector("[data-runner-execution-cancel]")?.addEventListener("click", () => this.closeExecution());
        }
    }

    openExecution(id) {
        const workout = this.data.getWorkouts().find((item) => item.id === id);
        const form = document.querySelector("[data-runner-execution-form]");
        if (!workout || !form) return;
        form.elements.workout_id.value = id;
        form.elements.status.value = workout.execution?.status || "completed";
        form.elements.executed_at.value = workout.execution?.executedAt || "";
        form.elements.distance.value = workout.execution?.distance || "";
        form.elements.duration.value = workout.execution?.duration || "";
        form.elements.exertion.value = workout.execution?.exertion || "";
        form.elements.feeling.value = workout.execution?.feeling || "good";
        form.elements.notes.value = workout.execution?.notes || "";
        form.hidden = false;
        form.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    saveExecution(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const workout = this.data.getWorkouts().find((item) => item.id === Number(form.elements.workout_id.value));
        if (!workout) return;
        workout.execution = {
            status: form.elements.status.value,
            executedAt: form.elements.executed_at.value,
            distance: form.elements.distance.value,
            duration: form.elements.duration.value,
            exertion: form.elements.exertion.value,
            feeling: form.elements.feeling.value,
            notes: form.elements.notes.value
        };
        workout.status = "completed";
        this.closeExecution();
        this.render(workout.id);
        this.onToast("Registro salvo no modo demonstração. A persistência será conectada ao backend.");
    }

    closeExecution() {
        const form = document.querySelector("[data-runner-execution-form]");
        if (form) form.hidden = true;
    }

    refreshIcons() {
        if (typeof lucide !== "undefined") lucide.createIcons();
    }
}
