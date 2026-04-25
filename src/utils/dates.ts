import { cleanText } from "./text.ts";

function pad(value: string): string {
    return value.padStart(2, "0");
}

/**
 * Parses a Czech-style date such as `1. 5. 2026` into `YYYY-MM-DD`.
 */
export function parseCzechDate(value: string | undefined): string | undefined {
    const text = cleanText(value);
    if (!text) {
        return undefined;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return text;
    }

    const match = text.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
    if (!match) {
        return undefined;
    }

    const [, day, month, year] = match;
    if (!day || !month || !year) {
        return undefined;
    }
    return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * Parses a date range into normalized `dateFrom` and `dateTo` values.
 */
export function parseDateRange(value: string | undefined): {
    dateFrom?: string;
    dateTo?: string;
} {
    const text = cleanText(value);
    if (!text) {
        return {};
    }

    const parts = text.split(/\s*-\s*/).map((part) => parseCzechDate(part));
    return {
        dateFrom: parts[0],
        dateTo: parts[1],
    };
}
