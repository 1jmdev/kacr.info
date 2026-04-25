import type * as cheerio from "cheerio";

import type { Pagination } from "../models/common.ts";
import { cleanText } from "./text.ts";

/**
 * Parses the standard KACR pagination widget.
 */
export function parsePagination(
    $: cheerio.CheerioAPI,
    root = ".pagination",
): Pagination | undefined {
    const pagination = $(root).first();
    if (pagination.length === 0) {
        return undefined;
    }

    const currentPage = Number(
        cleanText(pagination.find(".current").first().text()) ?? "1",
    );
    const pageLinks = pagination
        .find("a")
        .toArray()
        .map((element) => Number(cleanText($(element).text())))
        .filter((value) => Number.isFinite(value));

    const previousPage =
        pagination.find(".prev_page[href]").length > 0
            ? currentPage - 1
            : undefined;
    const nextPage =
        pagination.find(".next_page[href]").length > 0
            ? currentPage + 1
            : undefined;
    const highestLinkedPage =
        pageLinks.length > 0 ? Math.max(...pageLinks) : currentPage;

    return {
        currentPage,
        totalPages: Math.max(highestLinkedPage, currentPage),
        nextPage,
        previousPage,
    };
}
