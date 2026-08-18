export default class RunnerMockData {
    constructor() {
        this.executionByWorkout = {};
    }

    getUser() {
        return {
            id: 3,
            name: "Marina Costa",
            email: "marina@example.com",
            type_id: 3,
            photo: null,
            goal: "Meia maratona",
            level: "Intermediário",
            availability: "Segunda, quarta e sábado",
            notes: "Foco em consistência e fortalecimento.",
            assessor: "Fábio Santos"
        };
    }

    getWorkouts() {
        return [
            {
                id: 1,
                title: "Rodagem progressiva",
                description: "Comece confortável e acelere gradualmente nos dois quilômetros finais.",
                scheduledDate: "Hoje",
                scheduledAt: "06:30",
                objective: "Construir resistência",
                distance: "8 km",
                pace: "6:05–5:40 /km",
                duration: "48 min",
                group: "Meia maratona",
                assessorNotes: "Mantenha a respiração controlada. Registre como se sentiu.",
                status: "planned"
            },
            {
                id: 2,
                title: "Intervalado 5 × 800 m",
                description: "Aquecimento de 2 km, cinco repetições de 800 m e desaquecimento de 1 km.",
                scheduledDate: "Quarta, 21 ago",
                scheduledAt: "06:00",
                objective: "Ritmo de prova",
                distance: "8 km",
                pace: "5:05 /km",
                duration: "45 min",
                group: "Meia maratona",
                assessorNotes: "Recupere trotando por 2 minutos entre as repetições.",
                status: "planned"
            },
            {
                id: 3,
                title: "Longão contínuo",
                description: "Treino contínuo em ritmo confortável, sem buscar velocidade.",
                scheduledDate: "Sábado, 24 ago",
                scheduledAt: "07:00",
                objective: "Resistência",
                distance: "14 km",
                pace: "6:15 /km",
                duration: "1h28",
                group: "Meia maratona",
                assessorNotes: "Leve água e faça uma refeição leve antes da saída.",
                status: "planned"
            },
            {
                id: 4,
                title: "Rodagem leve",
                description: "Treino regenerativo para manter o volume da semana.",
                scheduledDate: "Segunda, 19 ago",
                scheduledAt: "18:30",
                objective: "Recuperação",
                distance: "6 km",
                pace: "6:30 /km",
                duration: "39 min",
                group: "Meia maratona",
                assessorNotes: "Priorize uma passada relaxada.",
                status: "completed",
                execution: {
                    status: "completed",
                    executedAt: "2026-08-19T18:35",
                    distance: "6.1",
                    duration: "38",
                    exertion: "5",
                    feeling: "good",
                    notes: "Treino confortável."
                }
            }
        ];
    }

    getRaces() {
        return [
            {
                id: 1,
                name: "Meia Maratona de Canoas",
                location: "Canoas, RS",
                date: "08 set 2026",
                distance: "21 km",
                status: "registered",
                statusLabel: "Inscrito"
            },
            {
                id: 2,
                name: "Circuito das Estações",
                location: "Porto Alegre, RS",
                date: "24 ago 2026",
                distance: "10 km",
                status: "registered",
                statusLabel: "Inscrito"
            },
            {
                id: 3,
                name: "Corrida da Orla",
                location: "Porto Alegre, RS",
                date: "12 jul 2026",
                distance: "5 km",
                status: "completed",
                statusLabel: "Concluído",
                result: "00:28:42"
            }
        ];
    }

    getProgress() {
        return {
            summary: [
                { label: "Aderência", value: "86%", detail: "nesta semana", icon: "target", tone: "orange" },
                { label: "Distância", value: "24,1 km", detail: "últimos 30 dias", icon: "route", tone: "blue" },
                { label: "Treinos feitos", value: "4 de 5", detail: "nesta semana", icon: "check-circle-2", tone: "green" },
                { label: "Tempo total", value: "2h32", detail: "últimos 30 dias", icon: "timer", tone: "purple" }
            ],
            history: [
                { period: "Agosto 2026", planned: 12, completed: 10, distance: "58,4 km", adherence: "83%" },
                { period: "Julho 2026", planned: 16, completed: 14, distance: "71,2 km", adherence: "88%" },
                { period: "Junho 2026", planned: 14, completed: 12, distance: "62,8 km", adherence: "86%" }
            ]
        };
    }

    getWeeklySummary(workouts = this.getWorkouts()) {
        const planned = workouts.length;
        const completed = workouts.filter((workout) => workout.status === "completed").length;
        return {
            planned,
            completed,
            distance: "24,1 km",
            adherence: `${Math.round((completed / planned) * 100)}%`
        };
    }

    getNextWorkout(workouts = this.getWorkouts()) {
        return workouts.find((workout) => workout.status === "planned") || null;
    }
}
