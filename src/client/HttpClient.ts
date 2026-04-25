import { KacrError } from "../errors/KacrError.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { absoluteUrl } from "../utils/urls.ts";

/**
 * Options for the low-level HTTP client used by {@link KacrClient}.
 *
 * @example
 * ```ts
 * const http = new HttpClient({
 *   userAgent: "my-app/1.0",
 *   fetch: (input, init) => fetch(input, init),
 * });
 * ```
 */
export interface HttpClientOptions {
    baseUrl?: string;
    fetch?: (
        input: string | URL | Request,
        init?: RequestInit,
    ) => Promise<Response>;
    userAgent?: string;
}

/**
 * Small helper around `fetch` for constructing KACR URLs and returning HTML.
 *
 * Most consumers should use {@link KacrClient}. Use `HttpClient` directly only
 * when you want raw HTML plus the resolved response URL.
 *
 * @example
 * ```ts
 * const http = new HttpClient();
 * const { url, html } = await http.getHtml("/competitions/12345");
 * ```
 */
export class HttpClient {
    readonly baseUrl: string;
    readonly fetchImpl: (
        input: string | URL | Request,
        init?: RequestInit,
    ) => Promise<Response>;
    readonly userAgent?: string;

    constructor(options: HttpClientOptions = {}) {
        this.baseUrl = options.baseUrl ?? "https://kacr.info";
        this.fetchImpl = options.fetch ?? fetch;
        this.userAgent = options.userAgent;
    }

    /**
     * Builds an absolute KACR URL from a pathname and optional query object.
     *
     * Empty string values and `undefined` entries are omitted.
     *
     * @example
     * ```ts
     * const http = new HttpClient();
     * const url = http.buildUrl("/competitions/search", { page: 2, type: "future" });
     * ```
     */
    buildUrl(
        pathname: string,
        query?: Record<string, string | number | undefined>,
    ): string {
        const url = new URL(pathname, this.baseUrl);
        if (query) {
            for (const [key, value] of Object.entries(query)) {
                if (value !== undefined && `${value}`.length > 0) {
                    url.searchParams.set(key, String(value));
                }
            }
        }
        return url.toString();
    }

    /**
     * Fetches a public KACR page and returns the final response URL together
     * with the response body.
     *
     * Throws {@link NotFoundError} for `404` responses and {@link KacrError}
     * for other failed or non-public responses.
     *
     * @example
     * ```ts
     * const http = new HttpClient();
     * const { url, html } = await http.getHtml("/runs/67890");
     * ```
     */
    async getHtml(
        pathname: string,
        query?: Record<string, string | number | undefined>,
    ): Promise<{ url: string; html: string }> {
        const url = this.buildUrl(pathname, query);
        const response = await this.fetchImpl(url, {
            headers: this.userAgent
                ? { "user-agent": this.userAgent }
                : undefined,
        });

        if (response.status === 404) {
            throw new NotFoundError(`Resource not found: ${url}`);
        }
        if (!response.ok) {
            throw new KacrError(
                `Request failed with ${response.status} for ${url}`,
            );
        }

        const html = await response.text();
        if (
            /\/login|\/account_registration\/new|\/password_resets\/new/.test(
                response.url,
            )
        ) {
            throw new KacrError(
                `Refusing to parse non-public page: ${response.url}`,
            );
        }

        return { url: response.url || absoluteUrl(url), html };
    }
}
