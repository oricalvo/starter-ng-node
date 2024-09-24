import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

async function main() {
    try {
        await bootstrapApplication(AppComponent, appConfig);
    }
    catch(err) {
        console.error(err);
    }
}

main();
