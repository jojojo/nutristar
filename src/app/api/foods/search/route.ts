import { calculateNutris } from "@/lib/nutris/calculate";
import { searchProductsByName } from "@/lib/openfoodfacts/client";
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
    const data = await searchProductsByName(parsed.data.q);
    const products = (data.products ?? []).map((product) => {
      const normalized = normalizeOffProduct(product);
      const nutris = calculateNutris({
        caloriesKcal: normalized.caloriesKcal,
        saturatedFatG: normalized.saturatedFatG,
        sugarG: normalized.sugarsG,
        proteinG: normalized.proteinsG,
        fiberG: normalized.fiberG,
      });

      return {
        ...normalized,
        nutris,
      };
    });

    return Response.json({
      total: products.length,
      query: parsed.data.q,
      products,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Impossible de contacter OpenFoodFacts.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}
