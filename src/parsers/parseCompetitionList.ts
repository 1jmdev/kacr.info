import type { CompetitionListPage } from "../models/competition.ts";
import { loadHtml, parseCompetitionRef } from "../utils/html.ts";
import { parsePagination } from "../utils/pagination.ts";

export function parseCompetitionList(
    html: string,
    sourceUrl: string,
): CompetitionListPage {
    const $ = loadHtml(html, sourceUrl);
    const items = $("ol.search_results > li")
        .toArray()
        .map((element) => $(element).find("a[href*='/competitions/']").first())
        .filter((anchor) => anchor.length > 0)
        .map((anchor) => parseCompetitionRef(anchor));

    return {
        items,
        pagination: parsePagination($),
        sourceUrl,
    };
}
