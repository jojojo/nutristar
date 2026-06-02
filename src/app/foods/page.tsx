import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addFromOpenFoodFactsAction } from "@/app/foods/actions";
import { requireAuthUser } from "@/lib/auth/session";
import { calculateNutris } from "@/lib/nutris/calculate";
import { searchLocalFoodsByName } from "@/lib/foods/local-search";
import { normalizeOffProduct } from "@/lib/openfoodfacts/normalize";
import { OpenFoodFactsError, searchProductsByName } from "@/lib/openfoodfacts/client";

type FoodsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function FoodsPage({ searchParams }: FoodsPageProps) {
  await requireAuthUser();

  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  let searchError: string | null = null;
  let products: Array<{
    source: "openfoodfacts" | "custom";
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
    nutris: number;
  }> = [];

  if (query.length >= 2) {
    const localProducts = (await searchLocalFoodsByName(query, 10)).map((item) => ({
      ...item,
      nutris: calculateNutris({
        caloriesKcal: item.caloriesKcal,
        saturatedFatG: item.saturatedFatG,
        sugarG: item.sugarsG,
        proteinG: item.proteinsG,
        fiberG: item.fiberG,
      }),
    }));

    try {
      const offProducts =
        (await searchProductsByName(query)).products
          ?.slice(0, 10)
          .map((product) => {
            const normalized = normalizeOffProduct(product);

            return {
              source: "openfoodfacts" as const,
              ...normalized,
              nutris: calculateNutris({
                caloriesKcal: normalized.caloriesKcal,
                saturatedFatG: normalized.saturatedFatG,
                sugarG: normalized.sugarsG,
                proteinG: normalized.proteinsG,
                fiberG: normalized.fiberG,
              }),
            };
          }) ?? [];

      products = [...localProducts, ...offProducts];
    } catch (error) {
      products = localProducts;

      if (error instanceof OpenFoodFactsError && error.status === 503) {
        searchError =
          localProducts.length > 0
            ? "OpenFoodFacts est temporairement indisponible (503). Resultats CIQUAL affiches."
            : "OpenFoodFacts est temporairement indisponible (503). Reessaie dans quelques secondes.";
      } else {
        searchError =
          localProducts.length > 0
            ? "OpenFoodFacts indisponible pour le moment. Resultats CIQUAL affiches."
            : "Impossible de recuperer les aliments pour le moment.";
      }
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 md:px-10">
      <header className="space-y-2">
        <Badge className="rounded-full" variant="secondary">
          OpenFoodFacts + CIQUAL local
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Recherche aliments</h1>
        <p className="text-muted-foreground">
          Cherche un produit pour estimer ses Nutris et l&apos;ajouter au journal ensuite.
        </p>
      </header>

      <form className="flex gap-3" method="get">
        <Input
          type="search"
          name="q"
          placeholder="Ex: yaourt, skyr, pain complet..."
          defaultValue={query}
        />
      </form>

      {query.length > 0 && query.length < 2 ? (
        <p className="text-sm text-muted-foreground">Saisis au moins 2 caracteres.</p>
      ) : null}
      {searchError ? <p className="text-sm text-destructive">{searchError}</p> : null}

      <section className="grid gap-4 md:grid-cols-2">
        {(products ?? []).map((item) => (
          <Card key={`${item.externalId}-${item.name}`}>
            <CardHeader>
              <CardTitle className="text-base">{item.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {item.brand ?? "Marque inconnue"} · {item.source === "custom" ? "CIQUAL" : "OpenFoodFacts"}
              </p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Nutris (100g): {item.nutris}</p>
              <p>Calories: {item.caloriesKcal.toFixed(0)} kcal</p>
              <p>Sucres: {item.sugarsG.toFixed(1)} g</p>
              <p>Proteines: {item.proteinsG.toFixed(1)} g</p>
              <p>Fibres: {item.fiberG.toFixed(1)} g</p>
              <form action={addFromOpenFoodFactsAction} className="mt-2 space-y-2 rounded-lg border p-2">
                <input type="hidden" name="source" value={item.source} />
                <input type="hidden" name="name" value={item.name} />
                <input type="hidden" name="brand" value={item.brand ?? ""} />
                <input type="hidden" name="sourceExternalId" value={item.externalId} />
                <input type="hidden" name="caloriesKcal100g" value={item.caloriesKcal.toString()} />
                <input type="hidden" name="sugarG100g" value={item.sugarsG.toString()} />
                <input type="hidden" name="proteinG100g" value={item.proteinsG.toString()} />
                <input type="hidden" name="fiberG100g" value={item.fiberG.toString()} />
                <input type="hidden" name="fatG100g" value={item.fatG.toString()} />

                <div className="grid grid-cols-2 gap-2">
                  <select
                    name="mealType"
                    defaultValue="dejeuner"
                    className="h-8 rounded-md border bg-background px-2 text-xs text-foreground"
                  >
                    <option value="petit_dejeuner">Petit-dej</option>
                    <option value="dejeuner">Dejeuner</option>
                    <option value="diner">Diner</option>
                    <option value="collation">Collation</option>
                  </select>
                  <Input
                    name="quantityG"
                    defaultValue="100"
                    type="number"
                    min={1}
                    max={2000}
                    className="h-8 text-xs"
                  />
                </div>

                <Button type="submit" className="h-8 w-full text-xs" variant="outline">
                  Ajouter au journal
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
