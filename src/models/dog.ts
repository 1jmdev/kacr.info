import type {
    BookRef,
    GroupedCompetitionResults,
    HandlerRef,
    KacrId,
    ResultSummary,
} from "./common.ts";

export interface DogMeasurement {
    date: string;
    label: string;
    heightCm?: number;
    size?: string;
    sourceUrl?: string;
}

export interface DogResult extends ResultSummary {
    runId: KacrId;
    runName: string;
    handler: HandlerRef;
}

export interface Dog {
    id: KacrId;
    name: string;
    breed?: string;
    birthDate?: string;
    sex?: string;
    identification?: string;
    heightCm?: number;
    size?: string;
    books: BookRef[];
    measurements: DogMeasurement[];
    results: GroupedCompetitionResults<DogResult>[];
    sourceUrl: string;
}
