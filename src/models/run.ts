import type { CompetitionRef, JudgeRef, KacrId } from "./common.ts";
import type { RunResult } from "./result.ts";

export interface Run {
    id: KacrId;
    name: string;
    date: string;
    competition: CompetitionRef;
    judge?: JudgeRef;
    style?: string;
    standardTime?: number;
    maxTime?: number;
    lengthMeters?: number;
    category?: string;
    size?: "XS" | "S" | "M" | "I" | "ML" | "L" | string;
    obstacleCount?: number;
    requiredSpeed?: number;
    results: RunResult[];
    sourceUrl: string;
}
