import type {
    CompetitionRef,
    HandlerRef,
    JudgeRef,
    KacrId,
    PageResult,
    RunRef,
} from "./common.ts";

export interface CompetitionLocation {
    text?: string;
    latitude?: number;
    longitude?: number;
    mapUrl?: string;
}

export interface CompetitionContact {
    name?: string;
    email?: string;
    phone?: string;
}

export interface Competition {
    id: KacrId;
    number?: string;
    name: string;
    dateFrom: string;
    dateTo?: string;
    surface?: string;
    indoor?: boolean;
    classes?: string[];
    judges: JudgeRef[];
    responsiblePerson?: HandlerRef;
    location?: CompetitionLocation;
    contact?: CompetitionContact;
    website?: string;
    propositionsUrl?: string;
    note?: string;
    runs?: RunRef[];
    sourceUrl: string;
}

export type CompetitionListPage = PageResult<CompetitionRef>;
