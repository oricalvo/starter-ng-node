import { Injectable } from "@angular/core";
import { Todo } from "@starter/dtos/dist/todo";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: "root",
})
export class ApiProxy {
    constructor(public http: HttpClient) {
    }

    async getTodos(): Promise<Todo[]> {
        return (await this.http.get<Todo[]>("/api/todo").toPromise())!;
    }
}
