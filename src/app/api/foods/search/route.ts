import { calculateNutris } from "@/lib/nutris/calculate";
import { searchLocalFoodsByName } from "@/lib/foods/local-search";
import { OpenFoodFactsError, searchProductsByName } from "@/lib/openfoodfacts/client";
import { normalizeOffProduct } from "@/lib/openfoodfacts/normalize";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().trim().min(2),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? "",
  });

  if (!parsed.success) {
    return Response.json(
      {
        error: "Parametre 'q' invalide. Minimum 2 caracteres.",
      },
      { status: 400 }
    );
  }

  try {
    const localProducts = (await searchLocalFoodsByName(parsed.data.q, 20)).map((product) => {
      const nutris = calculateNutris({
        caloriesKcal: product.caloriesKcal,
        saturatedFatG: product.saturatedFatG,
        sugarG: product.sugarsG,
        proteinG: product.proteinsG,
        fiberG: product.fiberG,
      });

      return {
        ...product,
        nutris,
      };
    });

    let offProducts: Array<Record<string, unknown>> = [];

    try {
      const data = await searchProductsByName(parsed.data.q);
      offProducts = (data.products ?? []).map((product) => {
        const normalized = normalizeOffProduct(product);
        const nutris = calculateNutris({
          caloriesKcal: normalized.caloriesKcal,
          saturatedFatG: normalized.saturatedFatG,
          sugarG: normalized.sugarsG,
          proteinG: normalized.proteinsG,
          fiberG: normalized.fiberG,
        });

        return {
          source: "openfoodfacts",
          ...normalized,
          nutris,
        };
      });
    } catch (error) {
      if (!(error instanceof OpenFoodFactsError)) {
        throw error;
      }
    }

    const products = [...localProducts, ...offProducts];

    return Response.json({
      total: products.length,
      query: parsed.data.q,
      products,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Impossible de recuperer les aliments.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}
