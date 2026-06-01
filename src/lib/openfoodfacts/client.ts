import type { OpenFoodFactsSearchResponse } from "@/lib/openfoodfacts/types";

const baseUrl = process.env.OPENFOODFACTS_BASE_URL ?? "https://world.openfoodfacts.org";

const defaultUserAgent =
  process.env.OPENFOODFACTS_USER_AGENT ?? "nutristar-web/0.1 (contact@example.com)";

async function offFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "User-Agent": defaultUserAgent,
    },
    next: { revalidate: 60 * 15 },
  });

  if (!response.ok) {
    throw new Error(`OpenFoodFacts request failed: ${response.status}`);
  }

  return (await response.json()) as T;
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
