export class KacrError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "KacrError";
    }
}
