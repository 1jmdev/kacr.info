import type { SearchFormDefinition } from "../models/common.ts";
import { loadHtml, parseDefinitionListForm } from "../utils/html.ts";

export function parseCompetitionSearch(
    html: string,
    sourceUrl: string,
): SearchFormDefinition {
    const $ = loadHtml(html, sourceUrl);
    return parseDefinitionListForm($, "form.competition", sourceUrl);
}
