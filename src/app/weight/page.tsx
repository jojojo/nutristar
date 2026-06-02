import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addWeightAction, deleteWeightAction } from "@/app/weight/actions";
import { requireAuthUser } from "@/lib/auth/session";
import { getWeightOverview } from "@/lib/weight/service";

export const dynamic = "force-dynamic";

export default async function WeightPage() {
  const user = await requireAuthUser();
  const { entries, stats } = await getWeightOverview(user.id);

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
