import express from "express";
import bodyParser from "body-parser";
import { errorHandler, ExpressApplication } from "./helpers/express.helpers.js";
import { configureTodoRoute } from "./routes/todo.route.js";

async function main() {
    const app = express();

    await configureMiddlewares(app);

    const port = 3001;

    app.listen(port, () => {
        console.log(`Server is listening on port: ${port}`);
    });
}

async function configureMiddlewares(app: ExpressApplication) {
    app.use(
        bodyParser.json({
            limit: "40mb",
        }),
    );

    configureApi(app);

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(errorHandler);
}

function configureApi(app: ExpressApplication) {
    configureTodoRoute(app);
}

main();
