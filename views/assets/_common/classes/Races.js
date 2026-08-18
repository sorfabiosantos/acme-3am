import HttpClientBase from "./HttpClientBase.js";

export default class Races extends HttpClientBase {
    async list() {
        return this.get("/races/my");
    }
}
