import { Injectable } from "@angular/core";
import { ApiProxy } from "./api-proxy";
import { appStore, AppStore } from "../store/appStore";

@Injectable({
    providedIn: "root",
})
export class AppService {
    constructor(
        public apiProxy: ApiProxy,
        public appStore: AppStore,
    ) {}

    async routeHome() {
        this.loading(async () => {
            appStore.todos = await this.apiProxy.getTodos();
        });
    }

    async loading(fn: () => Promise<void>): Promise<void> {
        appStore.loading = true;

        try {
            await fn();
        } finally {
            appStore.loading = false;
        }
    }
}
