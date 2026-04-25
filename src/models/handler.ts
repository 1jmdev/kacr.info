import type {
    BookRef,
    GroupedCompetitionResults,
    KacrId,
    OsaRef,
    ResultSummary,
} from "./common.ts";

export interface HandlerResult extends ResultSummary {
    runId: KacrId;
    runName: string;
    dogName: string;
    dogId: KacrId;
}

export interface Handler {
    id: KacrId;
    number?: string;
    name: string;
    osa?: OsaRef;
    isKaMember?: boolean;
    newsletter?: boolean;
    memberFrom?: string;
    memberTo?: string;
    gender?: string;
    books: BookRef[];
    results: GroupedCompetitionResults<HandlerResult>[];
    sourceUrl: string;
}
