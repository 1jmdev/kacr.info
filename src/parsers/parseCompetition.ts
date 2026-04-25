import { ParseError } from "../errors/ParseError.ts";
import type { Competition } from "../models/competition.ts";
import { parseDateRange } from "../utils/dates.ts";
import {
    extractMapCoordinates,
    loadHtml,
    parseJudgeRef,
    parseRunRef,
    summaryMap,
} from "../utils/html.ts";
import { parseBooleanYesNo } from "../utils/numbers.ts";
import { cleanText, stripTrailingColon } from "../utils/text.ts";
import { absoluteUrl, extractIdFromUrl } from "../utils/urls.ts";

export function parseCompetition(html: string, sourceUrl: string): Competition {
    const $ = loadHtml(html, sourceUrl);
    const id = extractIdFromUrl(sourceUrl, "competitions");
    const name = cleanText($("h1").first().text());
    if (!name) {
        throw new ParseError("Missing competition name", sourceUrl);
    }

    const summary = summaryMap($);
    const dates = parseDateRange(summary.get("Datum"));
    const judges = $(".summary li")
        .filter(
            (_, element) =>
                stripTrailingColon(
                    cleanText($(element).find("span").first().text()) ?? "",
                ) === "Rozhodčí",
        )
        .find("a[href*='/judges/']")
        .toArray()
        .map((element) => parseJudgeRef($(element)));
    const responsiblePersonLink = $(
        ".summary li a[href*='/handlers/']",
    ).first();
    const contactText = cleanText(
        $("h3:contains('Kontakt')").next(".markdown").text(),
    );
    const note = cleanText(
        $("h3:contains('Poznámka')").next(".markdown").text(),
    );
    const map = extractMapCoordinates(html);
    const linkCandidates = $("a[href]")
        .toArray()
        .map((element) => absoluteUrl($(element).attr("href") ?? sourceUrl))
        .filter((href) => href.startsWith("http"));

    const competition: Competition = {
        id,
        number: summary.get("Číslo závodu"),
        name,
        dateFrom: dates.dateFrom ?? "",
        dateTo: dates.dateTo,
        surface: summary.get("Terén"),
        indoor: parseBooleanYesNo(summary.get("Uvnitř")),
        classes: summary
            .get("Třídy")
            ?.split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        judges,
        responsiblePerson:
            responsiblePersonLink.length > 0
                ? {
                      id: extractIdFromUrl(
                          responsiblePersonLink.attr("href") ?? "",
                          "handlers",
                      ),
                      name: cleanText(responsiblePersonLink.text()) ?? "",
                      sourceUrl: absoluteUrl(
                          responsiblePersonLink.attr("href") ?? sourceUrl,
                      ),
                  }
                : undefined,
        location: {
            text: summary.get("Upřesnění místa"),
            latitude: map.latitude,
            longitude: map.longitude,
            mapUrl: summary.get("GPS")?.startsWith("http")
                ? summary.get("GPS")
                : map.mapUrl,
        },
        contact: contactText
            ? {
                  name: contactText
                      .match(/^([^,\d]+?)(?:\s+e-?mail|\s+tel:|$)/i)?.[1]
                      ?.trim(),
                  email: contactText.match(
                      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
                  )?.[0],
                  phone: contactText.match(/(?:\+?\d[\d ]{7,}\d)/)?.[0]?.trim(),
              }
            : undefined,
        website: linkCandidates.find(
            (href) => !href.includes("kacr.info") && !href.includes("mapy"),
        ),
        propositionsUrl: linkCandidates.find((href) =>
            /propozic|prop/i.test(href),
        ),
        note,
        runs: $("a[href*='/runs/']")
            .toArray()
            .map((element) => parseRunRef($(element))),
        sourceUrl,
    };

    if (competition.runs && competition.runs.length === 0) {
        delete competition.runs;
    }

    return competition;
}
