import type { CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";

import type { GroupedCompetitionResults } from "../models/common.ts";
import type { Handler, HandlerResult } from "../models/handler.ts";
import { parseCzechDate } from "../utils/dates.ts";
import {
    dedupeById,
    loadHtml,
    parseBookRef,
    parseCompetitionRef,
    parseOsaRef,
    parseResultStats,
    summaryMap,
} from "../utils/html.ts";
import { parseBooleanYesNo } from "../utils/numbers.ts";
import { cleanText } from "../utils/text.ts";
import { extractIdFromUrl } from "../utils/urls.ts";

function parseGroupedResults(
    $: CheerioAPI,
): GroupedCompetitionResults<HandlerResult>[] {
    const groups: GroupedCompetitionResults<HandlerResult>[] = [];
    let current: GroupedCompetitionResults<HandlerResult> | undefined;

    $("h2:contains('Výsledky')")
        .next("ol.search_results")
        .children("li")
        .each((_, element: AnyNode) => {
            const item = $(element);
            if (item.hasClass("message")) {
                const competitionLink = item
                    .find("a[href*='/competitions/']")
                    .first();
                if (competitionLink.length > 0) {
                    current = {
                        competition: parseCompetitionRef(competitionLink),
                        items: [],
                    };
                    groups.push(current);
                }
                return;
            }

            if (!current) {
                return;
            }

            const runLink = item.find("a[href*='/runs/']").first();
            const dogLink = item.find("a[href*='/dogs/']").first();
            const raw = cleanText(item.text()) ?? "";
            if (runLink.length === 0 || dogLink.length === 0) {
                return;
            }

            const stats = parseResultStats(
                raw.split(":").slice(1).join(":") || raw,
            );
            current.items.push({
                runId: extractIdFromUrl(runLink.attr("href") ?? "", "runs"),
                runName: cleanText(runLink.text()) ?? "",
                dogId: extractIdFromUrl(dogLink.attr("href") ?? "", "dogs"),
                dogName: cleanText(dogLink.text()) ?? "",
                ...stats,
                raw,
            });
        });

    return groups;
}

/**
 * Parses a handler page, including books and grouped competition results.
 *
 * @example
 * ```ts
 * const handler = parseHandler(html, "https://kacr.info/handlers/123");
 * console.log(handler.books);
 * ```
 */
export function parseHandler(html: string, sourceUrl: string): Handler {
    const $ = loadHtml(html, sourceUrl);
    const summary = summaryMap($);
    const osaLink = $(".summary a[href*='/osas/']").first();
    const booksContainer = $("h2:contains('Průkazy')").parent(
        "ol.search_results",
    );

    return {
        id: extractIdFromUrl(sourceUrl, "handlers"),
        number: summary.get("Číslo"),
        name: cleanText($("h1").first().text()) ?? "",
        osa: osaLink.length > 0 ? parseOsaRef(osaLink) : undefined,
        isKaMember: parseBooleanYesNo(summary.get("Člen KA")),
        newsletter: parseBooleanYesNo(summary.get("Klubový zpravodaj")),
        memberFrom: parseCzechDate(summary.get("Členem KA od")),
        memberTo: parseCzechDate(summary.get("Členem KA do")),
        gender: summary.get("Pohlaví"),
        books: dedupeById(
            booksContainer
                .children("li")
                .toArray()
                .map((element) => {
                    const item = $(element);
                    const link = item.find("a[href*='/books/']").first();
                    const book = parseBookRef(link);
                    book.size = cleanText(
                        item.find("span").eq(1).text(),
                    )?.replace(/[()]/g, "");
                    return book;
                }),
        ),
        results: parseGroupedResults($),
        sourceUrl,
    };
}
