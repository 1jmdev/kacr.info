import type { CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";

import type { CompetitionRef, HomeData } from "../models/common.ts";
import { loadHtml, parseCompetitionRef } from "../utils/html.ts";
import { parseInteger } from "../utils/numbers.ts";
import { cleanText } from "../utils/text.ts";

function collectSectionItems(
    container: CheerioAPI,
    heading: string,
): CompetitionRef[] {
    const matchedHeading = container("h2, h3")
        .filter(
            (_, element: AnyNode) =>
                cleanText(container(element).text()) === heading,
        )
        .first();
    if (matchedHeading.length === 0) {
        return [];
    }

    const list = matchedHeading.nextAll("ol.search_results").first();
    return list
        .find("a[href*='/competitions/']")
        .toArray()
        .map((element: AnyNode) => parseCompetitionRef(container(element)));
}

export function parseHome(html: string, sourceUrl: string): HomeData {
    if (html.trim().length === 0) {
        return {
            todaysCompetitions: [],
            upcomingCompetitions: [],
            newlyAddedCompetitions: [],
            sourceUrl,
        };
    }

    const $ = loadHtml(html, sourceUrl);
    const pageText = cleanText($("#container").text()) ?? "";
    const memberCount = parseInteger(
        pageText.match(/KAČR má\s+(\d+)\s+člen/iu)?.[1],
    );

    return {
        todaysCompetitions: collectSectionItems($, "Dnešní závody"),
        upcomingCompetitions: collectSectionItems($, "Nejbližší závody"),
        newlyAddedCompetitions: collectSectionItems($, "Nově přidané závody"),
        memberCount,
        sourceUrl,
    };
}
