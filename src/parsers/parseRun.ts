import type { CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";
import { ParseError } from "../errors/ParseError.ts";
import type { RunResult } from "../models/result.ts";
import type { Run } from "../models/run.ts";
import { parseCzechDate } from "../utils/dates.ts";
import {
    loadHtml,
    parseBookRef,
    parseCompetitionRef,
    parseJudgeRef,
    summaryMap,
} from "../utils/html.ts";
import { parseInteger, parseNumber } from "../utils/numbers.ts";
import { cleanText } from "../utils/text.ts";
import { extractIdFromUrl } from "../utils/urls.ts";

function parseRank(value: string): number | "DIS" | string {
    const text = cleanText(value) ?? "";
    if (text === "DIS") {
        return "DIS";
    }
    const asNumber = Number(text);
    return Number.isFinite(asNumber) ? asNumber : text;
}

function parseResultRow($: CheerioAPI, row: AnyNode): RunResult {
    const cells = $(row).find("td");
    const rank = cleanText(cells.eq(0).text()) ?? "";
    const bookLink = cells.eq(1).find("a[href*='/books/']").first();
    const raw = cleanText($(row).text()) ?? "";
    const disqualified = rank === "DIS" || raw.includes("DIS");

    return {
        rank: parseRank(rank),
        book: bookLink.length > 0 ? parseBookRef(bookLink) : undefined,
        handlerName: cleanText(cells.eq(2).text()) ?? "",
        dogName: cleanText(cells.eq(3).text()) ?? "",
        faults: disqualified ? undefined : parseNumber(cells.eq(4).text()),
        refusals: disqualified ? undefined : parseNumber(cells.eq(5).text()),
        timePenalty: disqualified ? undefined : parseNumber(cells.eq(6).text()),
        totalPenalty: disqualified
            ? undefined
            : parseNumber(cells.eq(7).text()),
        time: disqualified ? undefined : parseNumber(cells.eq(8).text()),
        speed: disqualified ? undefined : parseNumber(cells.eq(9).text()),
        rating: cleanText(cells.eq(10).text()),
        disqualified,
        raw,
    };
}

export function parseRun(html: string, sourceUrl: string): Run {
    const $ = loadHtml(html, sourceUrl);
    const summary = summaryMap($);
    const competitionLink = $("a[href*='/competitions/']").first();
    if (competitionLink.length === 0) {
        throw new ParseError("Missing competition link on run page", sourceUrl);
    }

    const competition = parseCompetitionRef(competitionLink);
    const judgeLink = $("a[href*='/judges/']").first();

    return {
        id: extractIdFromUrl(sourceUrl, "runs"),
        name: cleanText($("h1").first().text()) ?? "",
        date: parseCzechDate(summary.get("Datum")) ?? "",
        competition,
        judge: judgeLink.length > 0 ? parseJudgeRef(judgeLink) : undefined,
        style: summary.get("Typ"),
        standardTime: parseNumber(summary.get("Standardní čas")),
        maxTime: parseNumber(summary.get("Maximální čas")),
        lengthMeters: parseNumber(summary.get("Délka")),
        category: summary.get("Kategorie"),
        size: summary.get("Velikost"),
        obstacleCount: parseInteger(summary.get("Počet překážek")),
        requiredSpeed: parseNumber(summary.get("Postupová rychlost")),
        results: $("table.search_results tr")
            .toArray()
            .slice(1)
            .map((row) => parseResultRow($, row)),
        sourceUrl,
    };
}
