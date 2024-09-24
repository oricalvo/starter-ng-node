import { ExpressApplication, promisifyExpressHandler } from "./express.helpers.js";
import { Todo } from "@starter/dtos/dist/todo.js";
import { delay } from "./promise.helpers.js";

export function configureTodoRoute(app: ExpressApplication) {
    app.get("/api/todo", promisifyExpressHandler(getTodos));
}

async function getTodos(): Promise<Todo[]> {
    await delay(2500);

    return [
        {
            id: 1,
            name: "Clean home"
        }
    ];
}
