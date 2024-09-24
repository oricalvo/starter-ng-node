import { Component } from "@angular/core";
import { AppStore } from "../../store/appStore";
import { MatListOption, MatSelectionList } from "@angular/material/list";
import { AppState } from "../../store/appState";

@Component({
    selector: "app-home",
    standalone: true,
    imports: [MatSelectionList, MatListOption],
    templateUrl: "./home.component.html",
    styleUrl: "./home.component.scss",
    host: { class: "app-page" },
})
export class HomeComponent {
    constructor(public appStore: AppStore) {}

    get state(): AppState {
        return this.appStore;
    }
}
