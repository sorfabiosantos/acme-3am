export default class RunnerDashboard {
    constructor(data, onView, onToast) {
        this.data = data;
        this.onView = onView;
        this.onToast = onToast;
    }

    render() {
        const workouts = this.data.getWorkouts();
        const user = this.data.getUser();
        const summary = this.data.getWeeklySummary(workouts);
        const nextWorkout = this.data.getNextWorkout(workouts);

        document.querySelector("[data-runner-summary]").innerHTML = [
            ["Treinos previstos", summary.planned, "nesta semana", "calendar-days"],
            ["Treinos concluídos", summary.completed, "nesta semana", "check-circle-2"],
            ["Distância acumulada", summary.distance, "últimos 7 dias", "route"],
            ["Aderência", summary.adherence, "da programação", "trending-up"]
        ].map(([label, value, detail, icon]) => `
            <article class="runner-stat">
                <span class="runner-stat__icon"><i data-lucide="${icon}" aria-hidden="true"></i></span>
                <span class="runner-stat__label">${label}</span>
                <strong>${value}</strong>
                <small>${detail}</small>
            </article>
        `).join("");

        document.querySelector("[data-runner-greeting]").textContent = `Olá, ${user.name.split(" ")[0]}!`;
        const next = document.querySelector("[data-runner-next-workout]");
        next.innerHTML = nextWorkout ? `
            <div class="runner-next__date"><span>${nextWorkout.scheduledDate}</span><strong>${nextWorkout.scheduledAt}</strong></div>
            <div class="runner-next__content">
                <span class="runner-eyebrow">Próximo treino</span>
                <h3>${nextWorkout.title}</h3>
                <p>${nextWorkout.objective} · ${nextWorkout.distance} · ${nextWorkout.pace}</p>
                <button class="runner-button runner-button--primary" type="button" data-runner-open-workout="${nextWorkout.id}">Ver treino <i data-lucide="arrow-right" aria-hidden="true"></i></button>
            </div>
        ` : `<div class="runner-empty"><i data-lucide="calendar-check-2" aria-hidden="true"></i><strong>Semana tranquila</strong><p>Você não tem treinos planejados no momento.</p></div>`;

        document.querySelector("[data-runner-alerts]").innerHTML = `
            <article class="runner-alert">
                <span class="runner-alert__icon runner-alert__icon--orange"><i data-lucide="message-circle" aria-hidden="true"></i></span>
                <span><strong>Feedback pendente</strong><small>Registre como foi sua última rodagem.</small></span>
                <button type="button" data-runner-open-workout="4" aria-label="Registrar feedback"><i data-lucide="chevron-right" aria-hidden="true"></i></button>
            </article>
            <article class="runner-alert">
                <span class="runner-alert__icon runner-alert__icon--blue"><i data-lucide="trophy" aria-hidden="true"></i></span>
                <span><strong>Próxima prova</strong><small>Meia Maratona de Canoas · 08 set</small></span>
                <button type="button" data-runner-view="races" aria-label="Ver provas"><i data-lucide="chevron-right" aria-hidden="true"></i></button>
            </article>
        `;

        document.querySelector("[data-runner-dashboard-race]").innerHTML = `
            <span class="runner-race__date">08<br><small>SET</small></span>
            <span><strong>Meia Maratona de Canoas</strong><small>Canoas, RS · 21 km</small></span>
            <span class="runner-pill runner-pill--orange">Inscrito</span>
        `;

        this.bindEvents();
        this.refreshIcons();
    }

    bindEvents() {
        document.querySelectorAll("[data-runner-open-workout]").forEach((button) => {
            button.addEventListener("click", () => {
                this.onView("workouts", Number(button.dataset.runnerOpenWorkout));
            });
        });
        document.querySelectorAll("[data-runner-view='races']").forEach((button) => {
            button.addEventListener("click", () => this.onView("races"));
        });
    }

    refreshIcons() {
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
    }
}
