import HttpClientBase from "./HttpClientBase.js";

export default class Progress extends HttpClientBase {
    async summary() {
        return this.get("/progress/my");
    }
}
