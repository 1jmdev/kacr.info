import { KacrClient, KacrError, NotFoundError, ParseError } from "kacr";

const client = new KacrClient({
    userAgent: "kacr-example/1.0",
    fetch: async (input, init) => {
        console.log("Fetching:", String(input));
        return fetch(input, init);
    },
});

try {
    const result = await client.competitions.search({ name: "Open" });
    console.log("Competition search returned", result.items.length, "items");
} catch (error) {
    if (error instanceof NotFoundError) {
        console.error("The resource was not found.");
    } else if (error instanceof ParseError) {
        console.error(
            "The page was fetched but parsing failed:",
            error.sourceUrl,
        );
    } else if (error instanceof KacrError) {
        console.error("General kacr error:", error.message);
    } else {
        throw error;
    }
}
