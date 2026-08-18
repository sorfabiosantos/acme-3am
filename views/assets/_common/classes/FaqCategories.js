import HttpClientBase from "./HttpClientBase.js";

export default class FaqCategories extends HttpClientBase {
    async listAll() {
        return this.get("/faqs-categories");
    }

    async listById(id) {
        return this.get("/faqs-categories/:id", { id });
    }

    async insert(data) {
        return this.postForm("/faqs-categories", data);
    }

    async update(id, data) {
        return this.putForm("/faqs-categories/:id", data, { id });
    }

    async remove(id) {
        return this.delete("/faqs-categories/:id", { id });
    }
}
