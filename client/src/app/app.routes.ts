import { ActivatedRouteSnapshot, GuardResult, MaybeAsync, RouterStateSnapshot, Routes } from "@angular/router";
import { HomeComponent } from "../components/home/home.component";
import { AppService } from "../services/appService";
import { inject } from "@angular/core";

export const routes: Routes = [
    {
        path: "",
        component: HomeComponent,
        resolve: {
            _: () => inject(AppService).routeHome()
        }
    },
];
