import type {
    DogRef,
    GroupedCompetitionResults,
    HandlerRef,
    KacrId,
    ResultSummary,
} from "./common.ts";

export interface BookResult extends ResultSummary {
    runId: KacrId;
    runName: string;
}

export interface Book {
    id: KacrId;
    number: string;
    confirmed?: boolean;
    handler?: HandlerRef;
    dog?: DogRef & { breed?: string };
    results: GroupedCompetitionResults<BookResult>[];
    sourceUrl: string;
}
