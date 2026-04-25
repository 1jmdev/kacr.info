import type { CompetitionRef, KacrId, PageResult } from "./common.ts";

export interface Judge {
    id: KacrId;
    name: string;
    countryCode?: string;
    competitions: CompetitionRef[];
    sourceUrl: string;
    pagination?: PageResult<CompetitionRef>["pagination"];
}

export interface JudgeDirectoryEntry {
    id: KacrId;
    name: string;
    countryCode?: string;
    sourceUrl: string;
}
