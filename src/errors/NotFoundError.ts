import { KacrError } from "./KacrError.ts";

/**
 * Error thrown when KACR responds with `404 Not Found`.
 */
export class NotFoundError extends KacrError {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}
