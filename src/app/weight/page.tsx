import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addWeightAction, deleteWeightAction } from "@/app/weight/actions";
import { requireAuthUser } from "@/lib/auth/session";
import { getWeightOverview } from "@/lib/weight/service";

export const dynamic = "force-dynamic";

function buildWeightChartPoints(entries: Array<{ measuredAt: string; weightKg: number }>) {
  const chartEntries = [...entries].reverse().slice(-30);
  if (chartEntries.length === 0) {
    return null;
  }

  const width = 640;
  const height = 220;
  const padX = 20;
  const padY = 20;

  const values = chartEntries.map((entry) => entry.weightKg);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const spread = Math.max(0.4, maxValue - minValue);
  const low = minValue - spread * 0.15;
  const high = maxValue + spread * 0.15;

  const points = chartEntries.map((entry, index) => {
    const xRange = width - padX * 2;
    const yRange = height - padY * 2;
    const x = chartEntries.length === 1 ? width / 2 : padX + (index * xRange) / (chartEntries.length - 1);
    const ratio = (entry.weightKg - low) / (high - low);
    const y = height - padY - ratio * yRange;

    return {
      x,
      y,
      label: entry.measuredAt,
      value: entry.weightKg,
    };
  });

  return {
    width,
    height,
    points,
    min: minValue,
    max: maxValue,
  };
}

export default async function WeightPage() {
  const user = await requireAuthUser();
  const { entries, stats } = await getWeightOverview(user.id);
  const chart = buildWeightChartPoints(entries);

  const latestWeight = stats.latest?.weightKg ?? null;
  const totalDelta = stats.deltaTotal;
  const avg7d = stats.avg7d;
  const last7dDelta = stats.last7dDelta;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 md:px-10">
      <header className="space-y-2">
        <Badge className="rounded-full" variant="secondary">
          Poids
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Suivi du poids</h1>
        <p className="text-muted-foreground">
          Ajoute tes mesures pour suivre ta progression. L&apos;historique est enregistre en base.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dernier poids</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {latestWeight !== null ? `${latestWeight.toFixed(1)} kg` : "-"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Variation totale</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-amber-700">
            {totalDelta !== null ? `${totalDelta > 0 ? "+" : ""}${totalDelta.toFixed(1)} kg` : "-"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Moyenne 7 jours</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-foreground">
            {avg7d !== null ? `${avg7d.toFixed(1)} kg` : "-"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Variation 7 jours</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-700">
            {last7dDelta !== null
              ? `${last7dDelta > 0 ? "+" : ""}${last7dDelta.toFixed(1)} kg`
              : "-"}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Courbe (30 dernieres mesures)</CardTitle>
        </CardHeader>
        <CardContent>
          {!chart ? (
            <p className="text-sm text-muted-foreground">Ajoute une premiere mesure pour afficher la courbe.</p>
          ) : (
            <div className="space-y-3">
              <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="w-full rounded-lg border bg-muted/20">
                <line
                  x1="20"
                  y1={chart.height - 20}
                  x2={chart.width - 20}
                  y2={chart.height - 20}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-border"
                />
                <line
                  x1="20"
                  y1="20"
                  x2="20"
                  y2={chart.height - 20}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-border"
                />
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="text-emerald-600"
                  points={chart.points.map((p) => `${p.x},${p.y}`).join(" ")}
                />
                {chart.points.map((point) => (
                  <circle
                    key={`${point.label}-${point.value}`}
                    cx={point.x}
                    cy={point.y}
                    r="3.5"
                    fill="currentColor"
                    className="text-emerald-700"
                  >
                    <title>{`${point.label}: ${point.value.toFixed(1)} kg`}</title>
                  </circle>
                ))}
              </svg>

              <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                <span>Min: {chart.min.toFixed(1)} kg</span>
                <span>Max: {chart.max.toFixed(1)} kg</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ajouter une mesure</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addWeightAction} className="grid gap-3 md:grid-cols-4">
            <Input name="measuredAt" type="date" defaultValue={stats.defaultDate} required />
            <Input name="weightKg" type="number" step="0.1" min={20} max={400} placeholder="Poids (kg)" required />
            <Input name="note" placeholder="Note optionnelle" maxLength={200} />
            <Button type="submit">Enregistrer</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {entries.length === 0 ? (
            <p>Aucune mesure pour le moment.</p>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">{entry.measuredAt} - {entry.weightKg.toFixed(1)} kg</p>
                  {entry.note ? <p>{entry.note}</p> : null}
                </div>
                <form action={deleteWeightAction}>
                  <input type="hidden" name="id" value={entry.id} />
                  <Button type="submit" variant="outline">Supprimer</Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
