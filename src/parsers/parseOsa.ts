import { ParseError } from "../errors/ParseError.ts";
import type {
    SearchFormDefinition,
    SearchResultJudge,
    SearchResultPerson,
} from "../models/common.ts";
import type { Osa, OsaSearchResults } from "../models/osa.ts";
import {
    loadHtml,
    parseDefinitionListForm,
    parseHandlerRef,
    parseJudgeRef,
    parseOsaRef,
} from "../utils/html.ts";
import { parseInteger } from "../utils/numbers.ts";
import { parsePagination } from "../utils/pagination.ts";
import { cleanText, stripTrailingColon } from "../utils/text.ts";
import { extractIdFromUrl } from "../utils/urls.ts";

export function parseOsaSearchForm(
    html: string,
    sourceUrl: string,
): SearchFormDefinition {
    const $ = loadHtml(html, sourceUrl);
    return parseDefinitionListForm($, "form.search", sourceUrl);
}

export function parseOsaSearchResults(
    html: string,
    sourceUrl: string,
): OsaSearchResults {
    const $ = loadHtml(html, sourceUrl);
    const handlers: SearchResultPerson[] = [];
    const judges: SearchResultJudge[] = [];
    const osas = $("h2:contains('OSA')")
        .next("ol.search_results")
        .find("a[href*='/osas/']")
        .toArray()
        .map((element) => parseOsaRef($(element)));

    let section = "";
    $("#container")
        .children()
        .each((_, element) => {
            const node = $(element);
            if (node.is("h2")) {
                section = cleanText(node.text()) ?? "";
                return;
            }

            if (!node.is("ol.search_results")) {
                return;
            }

            if (section === "Psovodi") {
                node.find("li").each((__, item) => {
                    const handlerLink = $(item)
                        .find("a[href*='/handlers/']")
                        .first();
                    const osaLink = $(item).find("a[href*='/osas/']").first();
                    if (handlerLink.length === 0) {
                        return;
                    }
                    handlers.push({
                        handler: parseHandlerRef(handlerLink),
                        osa:
                            osaLink.length > 0
                                ? parseOsaRef(osaLink)
                                : undefined,
                    });
                });
            }

            if (section === "Rozhodčí") {
                node.find("li a[href*='/judges/']").each((__, item) => {
                    judges.push({ judge: parseJudgeRef($(item)) });
                });
            }
        });

    return {
        handlers,
        judges,
        osas,
        sourceUrl,
    };
}

export function parseOsa(html: string, sourceUrl: string): Osa {
    const $ = loadHtml(html, sourceUrl);
    const name = cleanText($("h1").first().text());
    if (!name) {
        throw new ParseError("Missing OSA name", sourceUrl);
    }

    const summaryMap = new Map<string, string>();
    $("ol")
        .first()
        .find("li")
        .each((_, element) => {
            const spans = $(element).find("span");
            const key = stripTrailingColon(cleanText(spans.eq(0).text()) ?? "");
            const value =
                cleanText(spans.eq(1).text()) ?? cleanText($(element).text());
            if (key && value) {
                summaryMap.set(key, value);
            }
        });

    const membersSection = $("h2:contains('Členové')").first();
    const members =
        membersSection.length > 0
            ? membersSection
                  .next("ol.search_results")
                  .find("a[href*='/handlers/']")
                  .toArray()
                  .map((element) => parseHandlerRef($(element)))
            : [];

    const addressHeading = $("h3:contains('Adresa')").first();
    const addressItems = addressHeading.next("ol").find("li");
    const addressMap = new Map<string, string>();
    addressItems.each((_, element) => {
        const itemText = cleanText($(element).text()) ?? "";
        const parts = itemText.split(":");
        const key = parts[0]?.trim();
        const value = parts.slice(1).join(":").trim();
        if (key && value) {
            addressMap.set(key, value);
        }
    });

    return {
        id: extractIdFromUrl(sourceUrl, "osas"),
        name,
        email: $("a[href^='mailto:']")
            .first()
            .attr("href")
            ?.replace(/^mailto:/, ""),
        website:
            $("a[href^='http']")
                .filter(
                    (_, element) =>
                        !($(element).attr("href") ?? "").includes("kacr.info"),
                )
                .first()
                .attr("href") ?? undefined,
        memberCount: parseInteger(
            summaryMap.get("Počet členů") ??
                $("#container")
                    .text()
                    .match(/Počet členů:\s*(\d+)/)?.[1],
        ),
        address:
            addressMap.size > 0
                ? {
                      street: addressMap.get("Ulice"),
                      postalCode: addressMap.get("PSČ"),
                      city: addressMap.get("Město"),
                      country: addressMap.get("Země"),
                  }
                : undefined,
        members,
        pagination: parsePagination($),
        sourceUrl,
    };
}
