/**
 * Collapses repeated whitespace and trims the result.
 *
 * @example
 * ```ts
 * normalizeWhitespace("  A\n  B  ");
 * //=> "A B"
 * ```
 */
export function normalizeWhitespace(value: string | null | undefined): string {
    return (value ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Returns cleaned text or `undefined` when the value is empty after trimming.
 */
export function cleanText(
    value: string | null | undefined,
): string | undefined {
    const text = normalizeWhitespace(value);
    return text.length > 0 ? text : undefined;
}

/**
 * Removes a trailing colon from a label-like string.
 */
export function stripTrailingColon(value: string): string {
    return value.replace(/:\s*$/, "").trim();
}

/**
 * Case-insensitive `includes` helper for loosely normalized text values.
 */
export function textIncludes(
    value: string | undefined,
    token: string,
): boolean {
    return (value ?? "")
        .toLocaleLowerCase()
        .includes(token.toLocaleLowerCase());
}
