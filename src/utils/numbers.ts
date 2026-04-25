import { cleanText } from "./text.ts";

/**
 * Extracts the first numeric value from a string.
 *
 * Handles Czech decimal commas and embedded units such as `"123,4 m/s"`.
 */
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

/**
 * Parses an integer value by truncating the result of {@link parseNumber}.
 */
export function parseInteger(value: string | undefined): number | undefined {
    const parsed = parseNumber(value);
    return parsed === undefined ? undefined : Math.trunc(parsed);
}

/**
 * Parses Czech `ano` / `ne` values into booleans.
 */
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
