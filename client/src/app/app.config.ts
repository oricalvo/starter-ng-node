import { ApplicationConfig, InjectionToken, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";

import { routes } from "./app.routes";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideHttpClient } from "@angular/common/http";
import { AppState, createAppStore } from "../store/appStore.js";
import { DeepReadonly } from "ts-essentials";

const appStore = ((<any>window)['appStore'] = createAppStore());

export type AppStateReadonly = DeepReadonly<AppState>;
export const APP_STORE = new InjectionToken<AppState>('APP_STORE');
export const APP_STORE_READONLY = new InjectionToken<AppStateReadonly>('APP_STORE_READONLY');

export const appConfig: ApplicationConfig = {
    providers: [
        { provide: APP_STORE, useValue: appStore },
        { provide: APP_STORE_READONLY, useValue: appStore },
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideAnimationsAsync(),
        provideAnimationsAsync(),
        provideHttpClient(),
    ],
};
