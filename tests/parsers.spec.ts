import { describe, expect, it } from "bun:test";

import { parseBook } from "../src/parsers/parseBook.ts";
import { parseCompetition } from "../src/parsers/parseCompetition.ts";
import { parseCompetitionList } from "../src/parsers/parseCompetitionList.ts";
import { parseCompetitionSearch } from "../src/parsers/parseCompetitionSearch.ts";
import { parseDog } from "../src/parsers/parseDog.ts";
import { parseHandler } from "../src/parsers/parseHandler.ts";
import { parseJudge, parseJudgeDirectory } from "../src/parsers/parseJudge.ts";
import {
    parseOsaSearchForm,
    parseOsaSearchResults,
} from "../src/parsers/parseOsa.ts";
import { parseRun } from "../src/parsers/parseRun.ts";
import { readFixture } from "./fixtures.ts";

describe("parsers", () => {
    it("parses competition detail", async () => {
        const html = await readFixture("competitions-id.html");
        const competition = parseCompetition(
            html,
            "https://kacr.info/competitions/5682",
        );

        expect(competition.id).toBe(5682);
        expect(competition.number).toBe("26300");
        expect(competition.name).toContain("Rokytnice");
        expect(competition.dateFrom).toBe("2026-06-06");
        expect(competition.surface).toBe("tráva");
        expect(competition.indoor).toBe(false);
        expect(competition.judges[0]?.id).toBe(184);
        expect(competition.contact?.email).toBe("little.bodyguard@seznam.cz");
        expect(competition.contact?.phone).toBe("774 614 657");
        expect(competition.note).toContain("Program: 2x zkouškový jumping");
        expect(competition.location?.latitude).toBe(50.1652262);
    });

    it("parses run detail and results", async () => {
        const html = await readFixture("runs-id.html");
        const run = parseRun(html, "https://kacr.info/runs/124874");

        expect(run.id).toBe(124874);
        expect(run.name).toBe("Agility D");
        expect(run.date).toBe("2022-10-09");
        expect(run.competition.id).toBe(3696);
        expect(run.judge?.id).toBe(11);
        expect(run.standardTime).toBe(53);
        expect(run.lengthMeters).toBe(213);
        expect(run.results).toHaveLength(7);
        expect(run.results[0]).toMatchObject({
            rank: 1,
            handlerName: "Anna Maroušková",
            dogName: "A3Ch Cattie Alsior",
            speed: 4.91,
            disqualified: false,
        });
        expect(run.results[3]?.disqualified).toBe(true);
    });

    it("parses handler, dog, and book detail pages", async () => {
        const [handlerHtml, dogHtml, bookHtml] = await Promise.all([
            readFixture("handlers-id.html"),
            readFixture("dogs-id.html"),
            readFixture("books-id.html"),
        ]);

        const handler = parseHandler(
            handlerHtml,
            "https://kacr.info/handlers/3091",
        );
        const dog = parseDog(dogHtml, "https://kacr.info/dogs/13614");
        const book = parseBook(bookHtml, "https://kacr.info/books/15629");

        expect(handler.osa?.id).toBe(30);
        expect(handler.books.length).toBeGreaterThan(5);
        expect(handler.results[0]?.items[0]?.runId).toBe(128042);

        expect(dog.breed).toBe("Německý ohař krátkosrstý");
        expect(dog.measurements[0]?.heightCm).toBe(64);
        expect(dog.results[2]?.items[0]?.rank).toBe(2);

        expect(book.number).toBe("064020");
        expect(book.confirmed).toBe(true);
        expect(book.handler?.id).toBe(4603);
        expect(book.dog?.id).toBe(9032);
        expect(book.results[0]?.items[0]?.rank).toBe(19);
    });

    it("parses competition lists and search form", async () => {
        const [futureHtml, resultsHtml, searchFormHtml] = await Promise.all([
            readFixture("competitions-search-future.html"),
            readFixture("competitions-search-results.html"),
            readFixture("competitions-search.html"),
        ]);

        const future = parseCompetitionList(
            futureHtml,
            "https://kacr.info/competitions/search/future",
        );
        const searchResults = parseCompetitionList(
            resultsHtml,
            "https://kacr.info/competitions/search?competition[name]=zkouska",
        );
        const form = parseCompetitionSearch(
            searchFormHtml,
            "https://kacr.info/competitions/search",
        );

        expect(future.items[0]?.id).toBe(5682);
        expect(future.pagination?.currentPage).toBe(1);
        expect(future.pagination?.nextPage).toBe(2);

        expect(searchResults.items[0]?.id).toBe(5234);
        expect(searchResults.items[0]?.dateFrom).toBe("2026-04-25");
        expect(searchResults.pagination?.totalPages).toBe(2);

        expect(form.method).toBe("POST");
        expect(
            form.fields.find((field) => field.name === "competition[judge]")
                ?.options?.length,
        ).toBeGreaterThan(100);
        expect(
            form.fields.find((field) => field.name === "competition[date_from]")
                ?.defaultValue,
        ).toBe("25. 04. 2026");
    });

    it("parses judge pages and OSA search pages", async () => {
        const [
            judgesHtml,
            judgeHtml,
            osaSearchHtml,
            osaResultsHtml,
            globalSearchHtml,
        ] = await Promise.all([
            readFixture("judges.html"),
            readFixture("judges-id.html"),
            readFixture("osas-search.html"),
            readFixture("osas-search-results-by-member-maro.html"),
            readFixture("search-marou.html"),
        ]);

        const directory = parseJudgeDirectory(
            judgesHtml,
            "https://kacr.info/judges",
        );
        const judge = parseJudge(
            judgeHtml,
            "https://kacr.info/judges/152?page=1",
        );
        const osaSearchForm = parseOsaSearchForm(
            osaSearchHtml,
            "https://kacr.info/osas/search",
        );
        const osaResults = parseOsaSearchResults(
            osaResultsHtml,
            "https://kacr.info/osas/search/by_member/maro",
        );
        const globalResults = parseOsaSearchResults(
            globalSearchHtml,
            "https://kacr.info/search/marou",
        );

        expect(directory.items[0]?.id).toBe(273);
        expect(directory.pagination?.nextPage).toBe(2);

        expect(judge.id).toBe(152);
        expect(judge.competitions[0]?.id).toBe(2167);
        expect(judge.pagination?.nextPage).toBe(2);

        expect(
            osaSearchForm.fields.find((field) => field.name === "search[type]")
                ?.options,
        ).toHaveLength(3);
        expect(osaResults.handlers[0]?.handler.id).toBe(797);
        expect(osaResults.handlers[0]?.osa?.id).toBe(26);
        expect(globalResults.judges[0]?.judge.id).toBe(43);
    });
});
