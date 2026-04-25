import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

import { ParseError } from "../errors/ParseError.ts";
import type {
    BookRef,
    CompetitionRef,
    DogRef,
    HandlerRef,
    JudgeRef,
    OsaRef,
    RunRef,
    SearchFormDefinition,
    SearchFormField,
} from "../models/common.ts";
import { parseDateRange } from "./dates.ts";
import { parseNumber } from "./numbers.ts";
import { cleanText, stripTrailingColon } from "./text.ts";
import {
    absoluteUrl,
    extractIdFromUrl,
    maybeExtractIdFromUrl,
} from "./urls.ts";

/**
 * Loads HTML into Cheerio and rejects blank documents.
 */
export function loadHtml(html: string, sourceUrl: string): cheerio.CheerioAPI {
    if (html.trim().length === 0) {
        throw new ParseError("Received empty HTML document", sourceUrl);
    }
    return cheerio.load(html);
}

/**
 * Reads the standard `.summary` list into a key-value map.
 */
export function summaryMap($: cheerio.CheerioAPI): Map<string, string> {
    const entries = new Map<string, string>();
    $(".summary li").each((_, element) => {
        const spans = $(element).find("span");
        const key = stripTrailingColon(cleanText(spans.eq(0).text()) ?? "");
        const value = cleanText(spans.eq(1).text());
        if (key && value) {
            entries.set(key, value);
        }
    });
    return entries;
}

/**
 * Parses a competition link into a typed lightweight competition reference.
 */
export function parseCompetitionRef(
    anchor: cheerio.Cheerio<AnyNode>,
): CompetitionRef {
    const href = anchor.attr("href");
    if (!href) {
        throw new ParseError("Missing competition link");
    }

    const sourceUrl = absoluteUrl(href);
    const { dateFrom, dateTo } = parseDateRange(
        anchor.closest("p").find(".right").text(),
    );

    return {
        id: extractIdFromUrl(sourceUrl, "competitions"),
        name: cleanText(anchor.text()) ?? "",
        dateFrom,
        dateTo,
        sourceUrl,
    };
}

/**
 * Parses a run link into a typed run reference.
 */
export function parseRunRef(anchor: cheerio.Cheerio<AnyNode>): RunRef {
    const href = anchor.attr("href");
    if (!href) {
        throw new ParseError("Missing run link");
    }

    const sourceUrl = absoluteUrl(href);
    return {
        id: extractIdFromUrl(sourceUrl, "runs"),
        name: cleanText(anchor.text()) ?? "",
        sourceUrl,
    };
}

/**
 * Parses a handler link into a typed handler reference.
 */
export function parseHandlerRef(anchor: cheerio.Cheerio<AnyNode>): HandlerRef {
    const href = anchor.attr("href");
    if (!href) {
        throw new ParseError("Missing handler link");
    }
    const sourceUrl = absoluteUrl(href);
    return {
        id: extractIdFromUrl(sourceUrl, "handlers"),
        name: cleanText(anchor.text()) ?? "",
        sourceUrl,
    };
}

/**
 * Parses a dog link into a typed dog reference.
 */
export function parseDogRef(anchor: cheerio.Cheerio<AnyNode>): DogRef {
    const href = anchor.attr("href");
    if (!href) {
        throw new ParseError("Missing dog link");
    }
    const sourceUrl = absoluteUrl(href);
    return {
        id: extractIdFromUrl(sourceUrl, "dogs"),
        name: cleanText(anchor.text()) ?? "",
        sourceUrl,
    };
}

/**
 * Parses a judge link into a typed judge reference.
 */
export function parseJudgeRef(anchor: cheerio.Cheerio<AnyNode>): JudgeRef {
    const href = anchor.attr("href");
    if (!href) {
        throw new ParseError("Missing judge link");
    }
    const sourceUrl = absoluteUrl(href);
    const label = cleanText(anchor.text()) ?? "";
    const match = label.match(/\(([^)]+)\)\s*$/);
    return {
        id: extractIdFromUrl(sourceUrl, "judges"),
        name: label,
        countryCode: match?.[1],
        sourceUrl,
    };
}

/**
 * Parses an OSA link into a typed OSA reference.
 */
export function parseOsaRef(anchor: cheerio.Cheerio<AnyNode>): OsaRef {
    const href = anchor.attr("href");
    if (!href) {
        throw new ParseError("Missing OSA link");
    }
    const sourceUrl = absoluteUrl(href);
    return {
        id: extractIdFromUrl(sourceUrl, "osas"),
        name: cleanText(anchor.text()) ?? "",
        sourceUrl,
    };
}

/**
 * Parses a book link into a typed book reference.
 */
export function parseBookRef(link: cheerio.Cheerio<AnyNode>): BookRef {
    const href = link.attr("href");
    if (!href) {
        throw new ParseError("Missing book link");
    }
    const sourceUrl = absoluteUrl(href);
    return {
        id: extractIdFromUrl(sourceUrl, "books"),
        name: cleanText(link.text()) ?? "",
        number: cleanText(link.text()),
        sourceUrl,
    };
}

/**
 * Parses a KACR form rendered as a definition-list-like `<ol>` structure.
 */
export function parseDefinitionListForm(
    $: cheerio.CheerioAPI,
    formSelector: string,
    sourceUrl: string,
): SearchFormDefinition {
    const form = $(formSelector).first();
    if (form.length === 0) {
        throw new ParseError(`Missing form ${formSelector}`, sourceUrl);
    }

    const fields: SearchFormField[] = [];
    form.find("li").each((_, element) => {
        const item = $(element);
        const input = item.find("input, select").first();
        const name = input.attr("name");
        if (!name) {
            return;
        }

        const label = cleanText(item.find("label").first().text()) ?? name;
        const isSelect = input.is("select");
        const type = isSelect
            ? "select"
            : item.hasClass("calendar")
              ? "date"
              : "text";

        const field: SearchFormField = {
            name,
            label,
            type,
            required: item.hasClass("required"),
            defaultValue: cleanText(
                input.attr("value") ??
                    input.find("option[selected]").attr("value"),
            ),
        };

        if (isSelect) {
            field.options = input
                .find("option")
                .toArray()
                .map((option) => ({
                    value: $(option).attr("value") ?? "",
                    label: cleanText($(option).text()) ?? "",
                }));
        }

        fields.push(field);
    });

    return {
        action: absoluteUrl(form.attr("action") ?? sourceUrl),
        method: (form.attr("method") ?? "get").toUpperCase(),
        fields,
        sourceUrl,
    };
}

/**
 * Extracts map coordinates embedded in inline JavaScript when present.
 */
export function extractMapCoordinates(html: string): {
    latitude?: number;
    longitude?: number;
    mapUrl?: string;
} {
    const coords = html.match(
        /L\.marker\(\[(?<lat>-?\d+(?:\.\d+)?),\s*(?<lng>-?\d+(?:\.\d+)?)\]\)/,
    );
    const mapUrl = html.match(/logo_link='([^']+)'/)?.[1];
    return {
        latitude: coords?.groups?.lat ? Number(coords.groups.lat) : undefined,
        longitude: coords?.groups?.lng ? Number(coords.groups.lng) : undefined,
        mapUrl: mapUrl ? absoluteUrl(mapUrl) : undefined,
    };
}

/**
 * Returns normalized text for a grouped-results heading node.
 */
export function groupHeadingText(
    $: cheerio.CheerioAPI,
    element: AnyNode,
): string | undefined {
    return cleanText($(element).text());
}

/**
 * Parses compact result snippets used on handler, dog, and book pages.
 */
export function parseResultStats(raw: string): {
    rank?: number;
    total?: number;
    time?: number;
    totalPenalty?: number;
    speed?: number;
    disqualified: boolean;
} {
    const normalized = cleanText(raw) ?? "";
    if (normalized.toLocaleLowerCase().includes("diskvalifikov")) {
        return { disqualified: true };
    }

    const rankMatch = normalized.match(/(\d+)\/(\d+)/);
    const values = normalized.split(",").map((part) => cleanText(part));
    return {
        rank: rankMatch?.[1] ? Number(rankMatch[1]) : undefined,
        total: rankMatch?.[2] ? Number(rankMatch[2]) : undefined,
        time: parseNumber(
            values.find((value) => value?.includes(" s"))?.replace(" s", ""),
        ),
        totalPenalty: parseNumber(
            values
                .find((value) => value?.includes("tr. b."))
                ?.replace(" tr. b.", ""),
        ),
        speed: parseNumber(
            values.find((value) => value?.includes("m/s"))?.replace(" m/s", ""),
        ),
        disqualified: false,
    };
}

/**
 * Removes duplicate objects by numeric `id`, keeping the first occurrence.
 */
export function dedupeById<T extends { id: number }>(items: T[]): T[] {
    const seen = new Set<number>();
    return items.filter((item) => {
        if (seen.has(item.id)) {
            return false;
        }
        seen.add(item.id);
        return true;
    });
}

/**
 * Extracts a linked id when a string happens to contain a matching KACR URL.
 */
export function extractOptionalLinkedId(
    textOrHref: string | undefined,
    segment: string,
): number | undefined {
    if (!textOrHref) {
        return undefined;
    }
    return maybeExtractIdFromUrl(textOrHref, segment);
}
