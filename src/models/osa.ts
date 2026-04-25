import type {
    HandlerRef,
    KacrId,
    OsaRef,
    PageResult,
    SearchResultJudge,
    SearchResultPerson,
} from "./common.ts";

export interface OsaAddress {
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
}

export interface Osa {
    id: KacrId;
    name: string;
    email?: string;
    website?: string;
    memberCount?: number;
    address?: OsaAddress;
    members: HandlerRef[];
    pagination?: PageResult<HandlerRef>["pagination"];
    sourceUrl: string;
}

export interface OsaSearchParams {
    name?: string;
    member?: string;
    location?: string;
}

export interface OsaSearchResults {
    handlers: SearchResultPerson[];
    judges: SearchResultJudge[];
    osas: OsaRef[];
    sourceUrl: string;
}
