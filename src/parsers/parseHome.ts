import type { CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";

import type { CompetitionRef, HomeData } from "../models/common.ts";
import { loadHtml, parseCompetitionRef } from "../utils/html.ts";
import { parseInteger } from "../utils/numbers.ts";
import { cleanText, stripTrailingColon } from "../utils/text.ts";

function collectSectionItems(
    container: CheerioAPI,
    heading: string,
): CompetitionRef[] {
    const matchedHeading = container("h2, h3")
        .filter(
            (_, element: AnyNode) =>
                stripTrailingColon(
                    cleanText(container(element).text()) ?? "",
                ) === heading,
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

/**
 * Parses the public homepage into featured competition sections.
 *
 * This parser is intentionally tolerant of empty homepage fixtures and returns
 * empty sections instead of throwing when the input HTML is blank.
 *
 * @example
 * ```ts
 * const home = parseHome(html, "https://kacr.info/");
 * console.log(home.todaysCompetitions);
 * ```
 */
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
