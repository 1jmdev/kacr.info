import type { PageResult } from "../models/common.ts";
import type { Judge, JudgeDirectoryEntry } from "../models/judge.ts";
import { loadHtml, parseCompetitionRef } from "../utils/html.ts";
import { parsePagination } from "../utils/pagination.ts";
import { cleanText } from "../utils/text.ts";
import { absoluteUrl, extractIdFromUrl } from "../utils/urls.ts";

export function parseJudge(html: string, sourceUrl: string): Judge {
    const $ = loadHtml(html, sourceUrl);
    const name = cleanText($("h1").first().text()) ?? "";
    const countryCode = name.match(/\(([^)]+)\)\s*$/)?.[1];

    return {
        id: extractIdFromUrl(sourceUrl, "judges"),
        name,
        countryCode,
        competitions: $("ol.search_results > li a[href*='/competitions/']")
            .toArray()
            .map((element) => parseCompetitionRef($(element))),
        sourceUrl,
        pagination: parsePagination($),
    };
}

export function parseJudgeDirectory(
    html: string,
    sourceUrl: string,
): PageResult<JudgeDirectoryEntry> {
    const $ = loadHtml(html, sourceUrl);
    return {
        items: $("ol.search_results a[href*='/judges/']")
            .toArray()
            .map((element) => {
                const anchor = $(element);
                const href = absoluteUrl(anchor.attr("href") ?? sourceUrl);
                const name = cleanText(anchor.text()) ?? "";
                return {
                    id: extractIdFromUrl(href, "judges"),
                    name,
                    countryCode: name.match(/\(([^)]+)\)\s*$/)?.[1],
                    sourceUrl: href,
                };
            }),
        pagination: parsePagination($),
        sourceUrl,
    };
}
