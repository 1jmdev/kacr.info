/**
 * Base error for this library.
 *
 * Catch this when you want one umbrella error type for request and parsing
 * failures.
 */
export class KacrError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "KacrError";
    }
}
