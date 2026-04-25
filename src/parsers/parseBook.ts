import type { CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";

import type { Book, BookResult } from "../models/book.ts";
import type { GroupedCompetitionResults } from "../models/common.ts";
import {
    loadHtml,
    parseCompetitionRef,
    parseDogRef,
    parseHandlerRef,
    parseResultStats,
    summaryMap,
} from "../utils/html.ts";
import { parseBooleanYesNo } from "../utils/numbers.ts";
import { cleanText } from "../utils/text.ts";
import { extractIdFromUrl } from "../utils/urls.ts";

function parseGroupedResults(
    $: CheerioAPI,
): GroupedCompetitionResults<BookResult>[] {
    const groups: GroupedCompetitionResults<BookResult>[] = [];
    let current: GroupedCompetitionResults<BookResult> | undefined;

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
            if (runLink.length === 0) {
                return;
            }

            const raw = cleanText(item.text()) ?? "";
            current.items.push({
                runId: extractIdFromUrl(runLink.attr("href") ?? "", "runs"),
                runName: cleanText(runLink.text()) ?? "",
                ...parseResultStats(raw.split(":").slice(1).join(":") || raw),
                raw,
            });
        });

    return groups;
}

/**
 * Parses a book page, including linked handler, linked dog, and grouped run
 * results.
 *
 * @example
 * ```ts
 * const book = parseBook(html, "https://kacr.info/books/123");
 * console.log(book.dog);
 * ```
 */
export function parseBook(html: string, sourceUrl: string): Book {
    const $ = loadHtml(html, sourceUrl);
    const summary = summaryMap($);
    const handlerLink = $("h2:contains('Psovod')")
        .next("ol.search_results")
        .find("a[href*='/handlers/']")
        .first();
    const dogLink = $("h2:contains('Pes')")
        .next("ol.search_results")
        .find("a[href*='/dogs/']")
        .first();
    const dogText = cleanText(
        $("h2:contains('Pes')").next("ol.search_results").text(),
    );

    return {
        id: extractIdFromUrl(sourceUrl, "books"),
        number: cleanText($("h1").first().text()) ?? "",
        confirmed: parseBooleanYesNo(summary.get("Potvrzen")),
        handler:
            handlerLink.length > 0 ? parseHandlerRef(handlerLink) : undefined,
        dog:
            dogLink.length > 0
                ? {
                      ...parseDogRef(dogLink),
                      breed:
                          dogText?.split(",").slice(1).join(",").trim() ||
                          undefined,
                  }
                : undefined,
        results: parseGroupedResults($),
        sourceUrl,
    };
}
