import type { CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";

import type { GroupedCompetitionResults } from "../models/common.ts";
import type { Dog, DogMeasurement, DogResult } from "../models/dog.ts";
import { parseCzechDate } from "../utils/dates.ts";
import {
    dedupeById,
    loadHtml,
    parseBookRef,
    parseCompetitionRef,
    parseHandlerRef,
    parseResultStats,
    summaryMap,
} from "../utils/html.ts";
import { parseNumber } from "../utils/numbers.ts";
import { cleanText } from "../utils/text.ts";
import { absoluteUrl, extractIdFromUrl } from "../utils/urls.ts";

function parseMeasurements($: CheerioAPI): DogMeasurement[] {
    return $("h2:contains('Měření')")
        .next("table.search_results")
        .find("tr")
        .toArray()
        .map((row: AnyNode) => {
            const cells = $(row).find("td");
            return {
                date: cleanText(cells.eq(0).text()) ?? "",
                label: cleanText(cells.eq(1).text()) ?? "",
                heightCm: parseNumber(cells.eq(2).text()),
                size: cleanText(cells.eq(3).text()),
                sourceUrl: cells.eq(0).find("a").attr("href")
                    ? absoluteUrl(cells.eq(0).find("a").attr("href") ?? "")
                    : undefined,
            };
        });
}

function parseGroupedResults(
    $: CheerioAPI,
): GroupedCompetitionResults<DogResult>[] {
    const groups: GroupedCompetitionResults<DogResult>[] = [];
    let current: GroupedCompetitionResults<DogResult> | undefined;

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
            const handlerLink = item.find("a[href*='/handlers/']").first();
            if (runLink.length === 0 || handlerLink.length === 0) {
                return;
            }

            const raw = cleanText(item.text()) ?? "";
            current.items.push({
                runId: extractIdFromUrl(runLink.attr("href") ?? "", "runs"),
                runName: cleanText(runLink.text()) ?? "",
                handler: parseHandlerRef(handlerLink),
                ...parseResultStats(raw.split(":").slice(1).join(":") || raw),
                raw,
            });
        });

    return groups;
}

export function parseDog(html: string, sourceUrl: string): Dog {
    const $ = loadHtml(html, sourceUrl);
    const summary = summaryMap($);

    return {
        id: extractIdFromUrl(sourceUrl, "dogs"),
        name: cleanText($("h1").first().text()) ?? "",
        breed: summary.get("Plemeno"),
        birthDate: parseCzechDate(summary.get("Datum narození")),
        sex: summary.get("Pohlaví"),
        identification: summary.get("Identifikace"),
        heightCm: parseNumber(summary.get("Kohoutková výška")),
        size: summary.get("Velikost"),
        books: dedupeById(
            $("h2:contains('Průkazy')")
                .next("ol.search_results")
                .find("a[href*='/books/']")
                .toArray()
                .map((element) => {
                    const book = parseBookRef($(element));
                    book.size = cleanText(
                        $(element).parent().siblings("span").text(),
                    )?.replace(/[()]/g, "");
                    return book;
                }),
        ),
        measurements: parseMeasurements($),
        results: parseGroupedResults($),
        sourceUrl,
    };
}
