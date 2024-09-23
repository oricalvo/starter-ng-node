import express from "express";
import bodyParser from "body-parser";
import {errorHandler, ExpressApplication, promisifyExpressHandler} from "./express.helpers.js";
import {Todo} from "@starter/dtos/dist/todo";
import {delay} from "./promise.helpers.js";

async function main() {
    const app = express();

    await configureMiddlewares(app);

    const port = 3001;

    app.listen(port, () => {
        console.log(`Server is listening on port: ${port}`)
    });
}

main();

async function getTodos(): Promise<Todo[]> {
    await delay(2500);

    return [
        {
            id: 1,
            name: "Clean home"
        }
    ];
}

async function configureMiddlewares(app: ExpressApplication) {
    app.use(bodyParser.json({
        limit: "40mb",
    }));

    app.use(bodyParser.urlencoded({ extended: true }));

    app.get("/todo", promisifyExpressHandler(getTodos));

    app.use(errorHandler);
}
