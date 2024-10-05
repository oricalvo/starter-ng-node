import { inject, Injectable } from "@angular/core";
import { APP_STORE } from "../app/app.config.js";

@Injectable({
    providedIn: "root",
})
export class AppService {
    private appStore = inject(APP_STORE);

    constructor() {
        (<any>window)["appService"] = this;
    }

    async routeHome() {
        this.loading(async () => {});
    }

    async loading(fn: () => Promise<void>): Promise<void> {
        const state = this.appStore.activity;

        state.running++;

        try {
            await fn();
        }
        finally {
            state.running--;
        }
    }
}
