export default class Dashboard {
    constructor(data) {
        this.data = data;
        this.workouts = data.getWorkouts();
        this.athletes = data.getAthletes();
        this.races = data.getRaces();
        this.workoutFilter = "all";
        this.athleteSearch = "";
    }

    render() {
        this.renderSummary();
        this.renderWorkouts();
        this.renderAthletes();
        this.renderRaces();
        this.bindEvents();
    }

    renderSummary() {
        const list = document.querySelector("[data-summary-list]");

        if (!list) {
            return;
        }

        list.innerHTML = this.data.getSummary().map((item) => `
            <article class="app-card app-summary-card">
                <div class="app-summary-card__top">
                    <span class="app-summary-card__label">${item.label}</span>
                    <span class="app-summary-card__icon ${item.tone}">
                        <i data-lucide="${item.icon}" aria-hidden="true"></i>
                    </span>
                </div>
                <strong class="app-summary-card__value">${item.value}</strong>
                <small class="app-summary-card__change">${item.change}</small>
            </article>
        `).join("");
    }

    renderWorkouts() {
        const list = document.querySelector("[data-workout-list]");
        const workouts = this.workouts.filter((workout) => (
            this.workoutFilter === "all" || workout.status === this.workoutFilter
        ));

        if (!list) {
            return;
        }

        if (workouts.length === 0) {
            list.innerHTML = '<p class="app-empty">Nenhum treino encontrado para este filtro.</p>';
            return;
        }

        list.innerHTML = workouts.map((workout) => `
            <article class="app-workout">
                <span class="app-workout__icon">
                    <i data-lucide="footprints" aria-hidden="true"></i>
                </span>
                <div>
                    <strong class="app-workout__title">${workout.title}</strong>
                    <small class="app-workout__meta">${workout.group} · ${workout.date} · ${workout.athletes} atletas</small>
                    <button class="app-workout__toggle" type="button" data-workout-toggle="${workout.id}">
                        <i data-lucide="${workout.status === "completed" ? "rotate-ccw" : "check"}" aria-hidden="true"></i>
                        ${workout.status === "completed" ? "Reabrir treino" : "Marcar como concluído"}
                    </button>
                </div>
                <span class="app-status ${workout.status}">${workout.statusLabel}</span>
            </article>
        `).join("");
    }

    renderAthletes() {
        const list = document.querySelector("[data-athlete-list]");
        const search = this.athleteSearch.toLocaleLowerCase("pt-BR");
        const athletes = this.athletes.filter((athlete) => (
            athlete.name.toLocaleLowerCase("pt-BR").includes(search)
        ));

        if (!list) {
            return;
        }

        if (athletes.length === 0) {
            list.innerHTML = '<p class="app-empty">Nenhum atleta encontrado.</p>';
            return;
        }

        list.innerHTML = athletes.map((athlete) => `
            <article class="app-athlete">
                <span class="app-athlete__avatar">${athlete.initials}</span>
                <div class="app-athlete__data">
                    <strong class="app-athlete__name">${athlete.name}</strong>
                    <small class="app-athlete__meta">${athlete.goal} · <span class="app-athlete__trend">${athlete.trend}</span></small>
                </div>
                <div class="app-athlete__progress" aria-label="${athlete.adherence}% de aderência">
                    <div class="app-progress"><span style="width: ${athlete.adherence}%"></span></div>
                    <small class="app-athlete__percent">${athlete.adherence}%</small>
                </div>
            </article>
        `).join("");
    }

    renderRaces() {
        const list = document.querySelector("[data-race-list]");

        if (!list) {
            return;
        }

        list.innerHTML = this.races.map((race) => `
            <article class="app-race">
                <time class="app-race__date">${race.date}</time>
                <div>
                    <strong class="app-race__name">${race.name}</strong>
                    <small class="app-race__meta">${race.location} · ${race.distance}</small>
                </div>
                <small class="app-race__athletes">${race.athletes} atletas</small>
            </article>
        `).join("");
    }

    bindEvents() {
        document.querySelector("[data-workout-filter]")?.addEventListener("change", (event) => {
            this.workoutFilter = event.target.value;
            this.renderWorkouts();
            this.refreshIcons();
        });

        document.querySelector("[data-athlete-search]")?.addEventListener("input", (event) => {
            this.athleteSearch = event.target.value;
            this.renderAthletes();
        });

        document.querySelector("[data-workout-list]")?.addEventListener("click", (event) => {
            const button = event.target.closest("[data-workout-toggle]");

            if (!button) {
                return;
            }

            this.toggleWorkout(Number(button.dataset.workoutToggle));
        });

        this.refreshIcons();
    }

    toggleWorkout(id) {
        const workout = this.workouts.find((item) => item.id === id);

        if (!workout) {
            return;
        }

        workout.status = workout.status === "completed" ? "planned" : "completed";
        workout.statusLabel = workout.status === "completed" ? "Concluído" : "Planejado";
        this.renderWorkouts();
        this.refreshIcons();
    }

    refreshIcons() {
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }
}
