import type { SearchFormDefinition } from "../models/common.ts";
import { loadHtml, parseDefinitionListForm } from "../utils/html.ts";

/**
 * Parses the competition search form definition from the public search page.
 *
 * Use this when you want to inspect available fields instead of submitting a
 * search through {@link KacrClient}.
 *
 * @example
 * ```ts
 * const form = parseCompetitionSearch(html, "https://kacr.info/competitions/search");
 * console.log(form.fields);
 * ```
 */
export function parseCompetitionSearch(
    html: string,
    sourceUrl: string,
): SearchFormDefinition {
    const $ = loadHtml(html, sourceUrl);
    return parseDefinitionListForm($, "form.competition", sourceUrl);
}
