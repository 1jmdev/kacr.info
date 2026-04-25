import type { KacrId } from "../models/common.ts";

const DEFAULT_BASE_URL = "https://kacr.info";

export function absoluteUrl(input: string, baseUrl = DEFAULT_BASE_URL): string {
    return new URL(input, baseUrl).toString();
}

export function extractIdFromUrl(url: string, segment: string): KacrId {
    const match = absoluteUrl(url).match(new RegExp(`/${segment}/(\\d+)`));
    if (!match) {
        throw new Error(`Unable to parse ${segment} id from ${url}`);
    }

    return Number(match[1]);
}

export function maybeExtractIdFromUrl(
    url: string,
    segment: string,
): KacrId | undefined {
    const match = absoluteUrl(url).match(new RegExp(`/${segment}/(\\d+)`));
    return match?.[1] ? Number(match[1]) : undefined;
}
