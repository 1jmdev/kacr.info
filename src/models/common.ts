export type KacrId = number;

export interface Pagination {
    currentPage: number;
    totalPages?: number;
    nextPage?: number;
    previousPage?: number;
}

export interface PageResult<T> {
    items: T[];
    pagination?: Pagination;
    sourceUrl: string;
}

export interface RefBase {
    id: KacrId;
    name: string;
    sourceUrl: string;
}

export interface HandlerRef extends RefBase {}

export interface DogRef extends RefBase {}

export interface BookRef extends RefBase {
    number?: string;
    size?: string;
}

export interface JudgeRef extends RefBase {
    countryCode?: string;
}

export interface OsaRef extends RefBase {}

export interface CompetitionRef extends RefBase {
    number?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface RunRef extends RefBase {
    date?: string;
}

export interface SearchFormOption {
    value: string;
    label: string;
}

export interface SearchFormField {
    name: string;
    label: string;
    type: "text" | "select" | "date";
    required: boolean;
    defaultValue?: string;
    options?: SearchFormOption[];
}

export interface SearchFormDefinition {
    action: string;
    method: string;
    fields: SearchFormField[];
    sourceUrl: string;
}

export interface SearchResultPerson {
    handler: HandlerRef;
    osa?: OsaRef;
}

export interface SearchResultJudge {
    judge: JudgeRef;
}

export interface HomeSection<T> {
    title: string;
    items: T[];
}

export interface HomeData {
    todaysCompetitions: CompetitionRef[];
    upcomingCompetitions: CompetitionRef[];
    newlyAddedCompetitions: CompetitionRef[];
    memberCount?: number;
    sourceUrl: string;
}

export interface CompetitionSearchParams {
    number?: string;
    name?: string;
    from?: string;
    to?: string;
    judgeId?: number;
    duration?: "any" | "single-day" | "multi-day";
    location?: string;
    page?: number;
}

export interface CompetitionListItem extends CompetitionRef {}

export interface ResultSummary {
    rank?: number;
    total?: number;
    time?: number;
    totalPenalty?: number;
    speed?: number;
    disqualified: boolean;
    raw: string;
}

export interface GroupedCompetitionResults<T> {
    competition: CompetitionRef;
    items: T[];
}
