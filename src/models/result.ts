import type { BookRef } from "./common.ts";

export interface RunResult {
    rank: number | "DIS" | string;
    book?: BookRef;
    handlerName: string;
    dogName: string;
    faults?: number;
    refusals?: number;
    timePenalty?: number;
    totalPenalty?: number;
    time?: number;
    speed?: number;
    rating?: string;
    disqualified: boolean;
    raw: string;
}
