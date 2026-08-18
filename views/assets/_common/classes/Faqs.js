import HttpClientBase from "./HttpClientBase.js";

export default class Faqs extends HttpClientBase {
    async listAll() {
        return this.get("/faqs");
    }

    async listAllAdmin() {
        return this.get("/faqs/admin/list");
    }

    async listById(id) {
        return this.get("/faqs/:id", { id });
    }

    async insert(data) {
        return this.postForm("/faqs", data);
    }

    async update(id, data) {
        return this.putForm("/faqs/:id", data, { id });
    }

    async remove(id) {
        return this.delete("/faqs/:id", { id });
    }
}
