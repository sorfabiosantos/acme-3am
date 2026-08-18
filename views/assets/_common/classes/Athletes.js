import HttpClientBase from "./HttpClientBase.js";

export default class Athletes extends HttpClientBase {
    async me() {
        return this.get("/athletes/me");
    }

    async update(data) {
        return this.putForm("/athletes/me", data);
    }
}
