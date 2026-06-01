import type { OpenFoodFactsProduct } from "@/lib/openfoodfacts/types";

export type NormalizedFood = {
  externalId: string;
  name: string;
  brand: string | null;
  caloriesKcal: number;
  sugarsG: number;
  proteinsG: number;
  fiberG: number;
  saturatedFatG: number;
  fatG: number;
  imageUrl: string | null;
};

function toSafeNumber(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return value;
}

export function normalizeOffProduct(product: OpenFoodFactsProduct): NormalizedFood {
  const nutriments = product.nutriments ?? {};

  return {
    externalId: product.code ?? "unknown",
    name: product.product_name?.trim() || "Produit sans nom",
    brand: product.brands?.trim() || null,
    caloriesKcal: toSafeNumber(nutriments["energy-kcal_100g"]),
    sugarsG: toSafeNumber(nutriments.sugars_100g),
    proteinsG: toSafeNumber(nutriments.proteins_100g),
    fiberG: toSafeNumber(nutriments.fiber_100g),
    saturatedFatG: toSafeNumber(nutriments["saturated-fat_100g"]),
    fatG: toSafeNumber(nutriments.fat_100g),
    imageUrl: product.image_front_small_url ?? null,
  };
}
