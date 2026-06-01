import type { OpenFoodFactsSearchResponse } from "@/lib/openfoodfacts/types";

const baseUrl = process.env.OPENFOODFACTS_BASE_URL ?? "https://world.openfoodfacts.org";

const defaultUserAgent =
  process.env.OPENFOODFACTS_USER_AGENT ?? "nutristar-web/0.1 (contact@example.com)";

export class OpenFoodFactsError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message ?? `OpenFoodFacts request failed: ${status}`);
    this.name = "OpenFoodFactsError";
    this.status = status;
  }
}

function isRetryableStatus(status: number) {
  return status === 408 || status === 425 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function offFetch<T>(path: string): Promise<T> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        "User-Agent": defaultUserAgent,
      },
      next: { revalidate: 60 * 15 },
    });

    if (response.ok) {
      return (await response.json()) as T;
    }

    const canRetry = isRetryableStatus(response.status) && attempt < maxAttempts;
    if (canRetry) {
      await wait(attempt * 300);
      continue;
    }

    throw new OpenFoodFactsError(response.status);
  }

  throw new OpenFoodFactsError(503);
}

export async function searchProductsByName(query: string): Promise<OpenFoodFactsSearchResponse> {
  const q = encodeURIComponent(query);
  return offFetch<OpenFoodFactsSearchResponse>(
    `/cgi/search.pl?search_terms=${q}&search_simple=1&action=process&json=1&page_size=15`
  );
}

export async function getProductByBarcode(barcode: string) {
  const code = encodeURIComponent(barcode);
  return offFetch(`/api/v2/product/${code}.json`);
}
