import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAuthUser } from "@/lib/auth/session";

const mockWeights = [
  { date: "2026-05-26", kg: 82.4 },
  { date: "2026-05-28", kg: 82.0 },
  { date: "2026-05-30", kg: 81.8 },
  { date: "2026-06-01", kg: 81.6 },
];

export const dynamic = "force-dynamic";

export default async function WeightPage() {
  await requireAuthUser();

  const first = mockWeights[0]?.kg ?? 0;
  const last = mockWeights[mockWeights.length - 1]?.kg ?? 0;
  const delta = Number((last - first).toFixed(1));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 md:px-10">
      <header className="space-y-2">
        <Badge className="rounded-full" variant="secondary">
          Poids
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Suivi du poids</h1>
        <p className="text-muted-foreground">
          Vue simplifiee MVP. Une vraie courbe sera ajoutee dans la prochaine iteration.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Evolution recente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {mockWeights.map((entry) => (
            <p key={entry.date}>
              {entry.date}: {entry.kg.toFixed(1)} kg
            </p>
          ))}
          <p className="pt-2 font-medium text-foreground">
            Variation totale: {delta > 0 ? "+" : ""}
            {delta.toFixed(1)} kg
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
