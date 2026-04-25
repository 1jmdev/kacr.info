export { HttpClient } from "./client/HttpClient.ts";
export { KacrClient } from "./client/KacrClient.ts";

export { KacrError } from "./errors/KacrError.ts";
export { NotFoundError } from "./errors/NotFoundError.ts";
export { ParseError } from "./errors/ParseError.ts";

export type * from "./models/book.ts";
export type * from "./models/common.ts";
export type * from "./models/competition.ts";
export type * from "./models/dog.ts";
export type * from "./models/handler.ts";
export type * from "./models/judge.ts";
export type * from "./models/osa.ts";
export type * from "./models/result.ts";
export type * from "./models/run.ts";

export { parseBook } from "./parsers/parseBook.ts";
export { parseCompetition } from "./parsers/parseCompetition.ts";
export { parseCompetitionList } from "./parsers/parseCompetitionList.ts";
export { parseCompetitionSearch } from "./parsers/parseCompetitionSearch.ts";
export { parseDog } from "./parsers/parseDog.ts";
export { parseHandler } from "./parsers/parseHandler.ts";
export { parseHome } from "./parsers/parseHome.ts";
export { parseJudge, parseJudgeDirectory } from "./parsers/parseJudge.ts";
export {
    parseOsa,
    parseOsaSearchForm,
    parseOsaSearchResults,
} from "./parsers/parseOsa.ts";
export { parseRun } from "./parsers/parseRun.ts";
