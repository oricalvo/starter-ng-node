import { AppState } from "./appState";
import { Todo } from "@starter/dtos/dist/todo";

export abstract class AppStore implements AppState {
    declare loading: boolean;
    declare todos: Todo[];
}

export const appStore: AppState = {
    loading: false,
    todos: [],
};
