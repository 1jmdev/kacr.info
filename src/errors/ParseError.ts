import { KacrError } from "./KacrError.ts";

/**
 * Error thrown when a page cannot be parsed into the expected shape.
 *
 * `sourceUrl` is included when available to make fixture and production issues
 * easier to debug.
 */
export class ParseError extends KacrError {
    constructor(
        message: string,
        readonly sourceUrl?: string,
    ) {
        super(message);
        this.name = "ParseError";
    }
}
