import HttpClientBase from "./HttpClientBase.js";

export default class Workouts extends HttpClientBase {
    async list() {
        return this.get("/workouts/my");
    }

    async getById(id) {
        return this.get("/workouts/my/:workoutId", { workoutId: id });
    }

    async saveExecution(id, data) {
        return this.postForm("/workouts/my/:workoutId/execution", data, { workoutId: id });
    }

    async updateExecution(id, data) {
        return this.putForm("/workouts/my/:workoutId/execution", data, { workoutId: id });
    }

    async executions() {
        return this.get("/workout-executions/my");
    }
}
