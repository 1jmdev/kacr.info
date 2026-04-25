import { KacrError } from "./KacrError.ts";

export class NotFoundError extends KacrError {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}
