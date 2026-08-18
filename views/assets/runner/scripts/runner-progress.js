export default class RunnerProgress {
    constructor(data) {
        this.data = data;
    }

    render() {
        const progress = this.data.getProgress();
        document.querySelector("[data-runner-progress-summary]").innerHTML = progress.summary.map((item) => `
            <article class="runner-stat">
                <span class="runner-stat__icon runner-stat__icon--${item.tone}"><i data-lucide="${item.icon}" aria-hidden="true"></i></span>
                <span class="runner-stat__label">${item.label}</span>
                <strong>${item.value}</strong>
                <small>${item.detail}</small>
            </article>
        `).join("");
        document.querySelector("[data-runner-progress-history]").innerHTML = progress.history.map((item) => `
            <article class="runner-history-row">
                <strong>${item.period}</strong>
                <span>${item.completed} de ${item.planned} treinos</span>
                <span>${item.distance}</span>
                <span class="runner-pill runner-pill--green">${item.adherence}</span>
            </article>
        `).join("");
        if (typeof lucide !== "undefined") lucide.createIcons();
    }
}
