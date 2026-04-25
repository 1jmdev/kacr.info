export function normalizeWhitespace(value: string | null | undefined): string {
    return (value ?? "").replace(/\s+/g, " ").trim();
}

export function cleanText(
    value: string | null | undefined,
): string | undefined {
    const text = normalizeWhitespace(value);
    return text.length > 0 ? text : undefined;
}

export function stripTrailingColon(value: string): string {
    return value.replace(/:\s*$/, "").trim();
}

export function textIncludes(
    value: string | undefined,
    token: string,
): boolean {
    return (value ?? "")
        .toLocaleLowerCase()
        .includes(token.toLocaleLowerCase());
}
