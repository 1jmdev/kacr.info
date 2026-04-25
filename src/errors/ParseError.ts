import { KacrError } from "./KacrError.ts";

export class ParseError extends KacrError {
    constructor(
        message: string,
        readonly sourceUrl?: string,
    ) {
        super(message);
        this.name = "ParseError";
    }
}
