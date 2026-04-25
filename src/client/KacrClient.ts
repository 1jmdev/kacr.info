import type { Book } from "../models/book.ts";
import type { CompetitionSearchParams, HomeData } from "../models/common.ts";
import type {
    Competition,
    CompetitionListPage,
} from "../models/competition.ts";
import type { Dog } from "../models/dog.ts";
import type { Handler } from "../models/handler.ts";
import type { Judge } from "../models/judge.ts";
import type { Osa, OsaSearchParams, OsaSearchResults } from "../models/osa.ts";
import type { Run } from "../models/run.ts";
import { parseBook } from "../parsers/parseBook.ts";
import { parseCompetition } from "../parsers/parseCompetition.ts";
import { parseCompetitionList } from "../parsers/parseCompetitionList.ts";
import { parseDog } from "../parsers/parseDog.ts";
import { parseHandler } from "../parsers/parseHandler.ts";
import { parseHome } from "../parsers/parseHome.ts";
import { parseJudge } from "../parsers/parseJudge.ts";
import { parseOsa, parseOsaSearchResults } from "../parsers/parseOsa.ts";
import { parseRun } from "../parsers/parseRun.ts";
import { HttpClient, type HttpClientOptions } from "./HttpClient.ts";

type FutureCompetitionsFn = ((options?: {
    page?: number;
}) => Promise<CompetitionListPage>) & {
    search: (params: CompetitionSearchParams) => Promise<CompetitionListPage>;
};

type OsaApiFn = ((id: number, options?: { page?: number }) => Promise<Osa>) & {
    search: (params: OsaSearchParams) => Promise<OsaSearchResults>;
};

export class KacrClient {
    readonly http: HttpClient;
    readonly competitions: FutureCompetitionsFn;
    readonly osas: OsaApiFn;

    constructor(options: HttpClientOptions = {}) {
        this.http = new HttpClient(options);

        const competitions = (async (
            idOrOptions?: number | { page?: number },
        ) => {
            if (typeof idOrOptions === "number") {
                return this.getCompetition(idOrOptions);
            }

            return this.getFutureCompetitions(idOrOptions);
        }) as FutureCompetitionsFn;
        competitions.search = (params) => this.searchCompetitions(params);
        this.competitions = competitions;

        const osas = (async (id: number, options?: { page?: number }) =>
            this.getOsa(id, options)) as OsaApiFn;
        osas.search = (params) => this.searchOsas(params);
        this.osas = osas;
    }

    async home(): Promise<HomeData> {
        const { url, html } = await this.http.getHtml("/");
        return parseHome(html, url);
    }

    async getFutureCompetitions(
        options: { page?: number } = {},
    ): Promise<CompetitionListPage> {
        const { page = 1 } = options;
        const result =
            page <= 1
                ? await this.http.getHtml("/competitions/search/future")
                : await this.http.getHtml("/competitions/search", {
                      page,
                      type: "future",
                  });
        return parseCompetitionList(result.html, result.url);
    }

    async searchCompetitions(
        params: CompetitionSearchParams,
    ): Promise<CompetitionListPage> {
        const { url, html } = await this.http.getHtml("/competitions/search", {
            "competition[number]": params.number,
            "competition[name]": params.name,
            "competition[date_from]": params.from,
            "competition[date_to]": params.to,
            "competition[judge]": params.judgeId,
            "competition[location]": params.location,
            "competition[length]":
                params.duration === "single-day"
                    ? "one"
                    : params.duration === "multi-day"
                      ? "multiple"
                      : "any",
            page: params.page,
        });
        return parseCompetitionList(html, url);
    }

    async getCompetition(id: number): Promise<Competition> {
        const { url, html } = await this.http.getHtml(`/competitions/${id}`);
        return parseCompetition(html, url);
    }

    async runs(id: number): Promise<Run> {
        const { url, html } = await this.http.getHtml(`/runs/${id}`);
        return parseRun(html, url);
    }

    async handlers(id: number): Promise<Handler> {
        const { url, html } = await this.http.getHtml(`/handlers/${id}`);
        return parseHandler(html, url);
    }

    async dogs(id: number): Promise<Dog> {
        const { url, html } = await this.http.getHtml(`/dogs/${id}`);
        return parseDog(html, url);
    }

    async books(id: number): Promise<Book> {
        const { url, html } = await this.http.getHtml(`/books/${id}`);
        return parseBook(html, url);
    }

    async judges(id: number, options: { page?: number } = {}): Promise<Judge> {
        const { url, html } = await this.http.getHtml(`/judges/${id}`, {
            page: options.page,
        });
        return parseJudge(html, url);
    }

    async getOsa(id: number, options: { page?: number } = {}): Promise<Osa> {
        const { url, html } = await this.http.getHtml(`/osas/${id}`, {
            page: options.page,
        });
        return parseOsa(html, url);
    }

    async searchOsas(params: OsaSearchParams): Promise<OsaSearchResults> {
        const type = params.member
            ? "by_member"
            : params.location
              ? "near"
              : "by_name";
        const query = params.member ?? params.location ?? params.name;
        if (!query) {
            throw new Error("OSA search requires name, member, or location");
        }

        const { url, html } = await this.http.getHtml(
            `/osas/search/${type}/${encodeURIComponent(query)}`,
        );
        return parseOsaSearchResults(html, url);
    }
}
