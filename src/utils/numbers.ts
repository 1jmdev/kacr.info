import { cleanText } from "./text.ts";

export function parseNumber(value: string | undefined): number | undefined {
    const text = cleanText(value);
    if (!text) {
        return undefined;
    }

    const normalized = text
        .replace(/\s+/g, "")
        .replace(/,/g, ".")
        .match(/-?\d+(?:\.\d+)?/g)?.[0];
    if (!normalized) {
        return undefined;
    }

    const result = Number(normalized);
    return Number.isFinite(result) ? result : undefined;
}

export function parseInteger(value: string | undefined): number | undefined {
    const parsed = parseNumber(value);
    return parsed === undefined ? undefined : Math.trunc(parsed);
}

export function parseBooleanYesNo(
    value: string | undefined,
): boolean | undefined {
    const normalized = cleanText(value)?.toLocaleLowerCase();
    if (normalized === "ano") {
        return true;
    }
    if (normalized === "ne") {
        return false;
    }
    return undefined;
}
