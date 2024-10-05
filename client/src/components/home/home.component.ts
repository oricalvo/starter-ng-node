import { Component, inject } from "@angular/core";
import { MatListOption, MatSelectionList } from "@angular/material/list";
import { APP_STORE_READONLY } from "../../app/app.config.js";
import { jwtDecode } from "jwt-decode";

@Component({
    selector: "app-home",
    standalone: true,
    imports: [MatSelectionList, MatListOption],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
    host: { class: "app-page" },
})
export class HomeComponent {
    private appStore = inject(APP_STORE_READONLY);
    private google: any;

    constructor() {
        window.onload = () => {
            this.google = (<any>window)["google"];
            if(!this.google) {
                console.warn("Global google object is not available");
                return;
            }

            this.google.accounts.id.initialize({
                client_id: '215791072985-e6a8k3renvfhbi8sm563sav494e9afqu.apps.googleusercontent.com',
                callback: this.onGoogleSignInAuthorized,
            });
        }
    }

    get state() {
        return this.appStore.activity;
    }

    login() {
        if(!this.google) {
            console.warn("Global google object is not available");
            return;
        }

        this.google.accounts.id.prompt();
    }

    get canSignInWithGoogle() {
        return !!this.google;
    }

    private onGoogleSignInAuthorized = (options: GoogleSignInCallbackOptions) => {
        console.log("onGoogleSignInAuthorized", options);

        const info: GoogleSignInfo = jwtDecode(options.credential);
        console.log(info.email, info.name);
    }
}

interface GoogleSignInCallbackOptions {
    clientId: string;
    credential: string;
}

interface GoogleSignInfo {
    email: string;
    name: string;
}

