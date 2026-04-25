import { describe, expect, it } from "bun:test";

import { KacrClient } from "../src/client/KacrClient.ts";

function createHtmlResponse(html: string): Response {
    return new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8" },
    });
}

describe("KacrClient", () => {
    it("builds search URLs and parses responses", async () => {
        const competitionHtml = await Bun.file(
            new URL(
                "../pageshtml/competitions-search-results.html",
                import.meta.url,
            ),
        ).text();
        const osaHtml = await Bun.file(
            new URL(
                "../pageshtml/osas-search-results-by-member-maro.html",
                import.meta.url,
            ),
        ).text();
        const requestedUrls: string[] = [];

        const client = new KacrClient({
            fetch: async (input) => {
                const url = String(input);
                requestedUrls.push(url);

                if (url.includes("/competitions/search")) {
                    return createHtmlResponse(competitionHtml);
                }

                return createHtmlResponse(osaHtml);
            },
        });

        const competitions = await client.competitions.search({
            name: "Bílany",
            from: "2026-04-25",
            to: "2026-12-31",
            duration: "single-day",
            judgeId: 123,
        });
        const osas = await client.osas.search({ member: "maro" });

        expect(requestedUrls[0]).toContain("competition%5Bname%5D=B%C3%ADlany");
        expect(requestedUrls[0]).toContain("competition%5Blength%5D=one");
        expect(requestedUrls[0]).toContain("competition%5Bjudge%5D=123");
        expect(competitions.items[0]?.id).toBe(5234);

        expect(requestedUrls[1]).toBe(
            "https://kacr.info/osas/search/by_member/maro",
        );
        expect(osas.handlers[3]?.handler.id).toBe(1764);
    });
});
