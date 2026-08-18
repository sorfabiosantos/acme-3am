export default class RunnerRaces {
    constructor(data) {
        this.data = data;
    }

    render() {
        document.querySelector("[data-runner-race-list]").innerHTML = this.data.getRaces().map((race) => `
            <article class="runner-race-card">
                <span class="runner-race-card__icon"><i data-lucide="trophy" aria-hidden="true"></i></span>
                <span class="runner-race-card__main"><strong>${race.name}</strong><small>${race.location} · ${race.distance}</small></span>
                <time>${race.date}</time>
                <span class="runner-pill runner-pill--${race.status === "completed" ? "green" : "orange"}">${race.statusLabel}</span>
                ${race.result ? `<small class="runner-race-card__result">Tempo: <strong>${race.result}</strong></small>` : ""}
            </article>
        `).join("");
        if (typeof lucide !== "undefined") lucide.createIcons();
    }
}
