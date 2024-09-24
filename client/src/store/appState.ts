import { Todo } from "@starter/dtos/dist/todo";

export interface AppState {
    loading: boolean;
    todos: Todo[];
}
