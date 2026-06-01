import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { requireAuthUser } from "@/lib/auth/session";
import { calculateNutris } from "@/lib/nutris/calculate";
import { normalizeOffProduct } from "@/lib/openfoodfacts/normalize";
import { searchProductsByName } from "@/lib/openfoodfacts/client";

type FoodsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function FoodsPage({ searchParams }: FoodsPageProps) {
  await requireAuthUser();

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const products =
    query.length >= 2
      ? (await searchProductsByName(query)).products
          ?.slice(0, 8)
          .map((product) => {
            const normalized = normalizeOffProduct(product);

            return {
              ...normalized,
              nutris: calculateNutris({
                caloriesKcal: normalized.caloriesKcal,
                saturatedFatG: normalized.saturatedFatG,
                sugarG: normalized.sugarsG,
                proteinG: normalized.proteinsG,
                fiberG: normalized.fiberG,
              }),
            };
          })
      : [];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 md:px-10">
      <header className="space-y-2">
        <Badge className="rounded-full" variant="secondary">
          OpenFoodFacts
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

      <section className="grid gap-4 md:grid-cols-2">
        {(products ?? []).map((item) => (
          <Card key={`${item.externalId}-${item.name}`}>
            <CardHeader>
              <CardTitle className="text-base">{item.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{item.brand ?? "Marque inconnue"}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Nutris (100g): {item.nutris}</p>
              <p>Calories: {item.caloriesKcal.toFixed(0)} kcal</p>
              <p>Sucres: {item.sugarsG.toFixed(1)} g</p>
              <p>Proteines: {item.proteinsG.toFixed(1)} g</p>
              <p>Fibres: {item.fiberG.toFixed(1)} g</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
