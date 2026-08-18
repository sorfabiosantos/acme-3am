export default class DashboardMockData {
    getUser() {
        return {
            name: "Fábio Santos",
            role: "Assessor de corrida",
            initials: "FS"
        };
    }

    getSummary() {
        return [
            { label: "Atletas ativos", value: "48", change: "+6 este mês", icon: "users", tone: "orange" },
            { label: "Treinos na semana", value: "32", change: "8 para hoje", icon: "calendar-check-2", tone: "blue" },
            { label: "Aderência média", value: "86%", change: "+4,2% vs. mês anterior", icon: "trending-up", tone: "green" },
            { label: "Próximas provas", value: "4", change: "Nos próximos 30 dias", icon: "trophy", tone: "purple" }
        ];
    }

    getWorkouts() {
        return [
            { id: 1, title: "Intervalado 6 x 800 m", group: "Performance", date: "Hoje, 06:00", athletes: 18, status: "completed", statusLabel: "Concluído" },
            { id: 2, title: "Rodagem leve 7 km", group: "Iniciantes", date: "Hoje, 18:30", athletes: 12, status: "planned", statusLabel: "Planejado" },
            { id: 3, title: "Longão progressivo 14 km", group: "Meia maratona", date: "Amanhã, 06:30", athletes: 9, status: "planned", statusLabel: "Planejado" },
            { id: 4, title: "Fortalecimento e mobilidade", group: "Todos os grupos", date: "Qui, 19:00", athletes: 25, status: "pending", statusLabel: "Pendente" }
        ];
    }

    getAthletes() {
        return [
            { name: "Mariana Costa", initials: "MC", goal: "Meia maratona", adherence: 94, trend: "+12%", color: "orange" },
            { name: "Rafael Mendes", initials: "RM", goal: "Primeiros 5 km", adherence: 88, trend: "+8%", color: "blue" },
            { name: "Juliana Alves", initials: "JA", goal: "Maratona", adherence: 82, trend: "+6%", color: "purple" },
            { name: "Carlos Eduardo", initials: "CE", goal: "10 km sub-50", adherence: 79, trend: "+3%", color: "green" }
        ];
    }

    getRaces() {
        return [
            { name: "Circuito das Estações", location: "Porto Alegre, RS", date: "24 AGO", distance: "10 km", athletes: 16 },
            { name: "Meia Maratona de Canoas", location: "Canoas, RS", date: "08 SET", distance: "21 km", athletes: 8 },
            { name: "Desafio da Primavera", location: "Pelotas, RS", date: "22 SET", distance: "5 km", athletes: 24 }
        ];
    }
}
