import { KacrError } from "../errors/KacrError.ts";
import { NotFoundError } from "../errors/NotFoundError.ts";
import { absoluteUrl } from "../utils/urls.ts";

export interface HttpClientOptions {
    baseUrl?: string;
    fetch?: (
        input: string | URL | Request,
        init?: RequestInit,
    ) => Promise<Response>;
    userAgent?: string;
}

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
