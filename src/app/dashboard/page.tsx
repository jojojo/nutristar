import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireAuthUser } from "@/lib/auth/session";
import { getJournalForToday } from "@/lib/journal/service";
import { getWeightOverview } from "@/lib/weight/service";
import {
  Activity,
  ChartLine,
  House,
  NotebookPen,
  Scale,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuthUser();
  const { dailyLog, entries } = await getJournalForToday(user.id);
  const { stats: weightStats } = await getWeightOverview(user.id);

  const budgetPct = dailyLog.budgetNutris > 0
    ? Math.min(100, Math.round((dailyLog.consumedNutris / dailyLog.budgetNutris) * 100))
    : 0;

  const weightLabel = weightStats.latest
    ? `${weightStats.latest.weightKg.toFixed(1)} kg`
    : "Aucune mesure";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: House, active: true },
    { href: "/foods", label: "Aliments", icon: UtensilsCrossed, active: false },
    { href: "/journal", label: "Journal", icon: NotebookPen, active: false },
    { href: "/weight", label: "Poids", icon: Scale, active: false },
  ];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f8f8_0%,#f7f7f3_100%)]">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[250px_1fr] lg:px-6">
        <aside className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="space-y-3">
            <Badge className="rounded-full" variant="secondary">
              Nutristar Admin
            </Badge>
            <p className="text-sm font-medium text-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">Suivi quotidien et performance nutritionnelle.</p>
          </div>

          <nav className="mt-5 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  item.active
                    ? "bg-emerald-100 text-emerald-900"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 rounded-xl border bg-muted/40 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Poids actuel</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{weightLabel}</p>
            <p className="text-xs text-muted-foreground">
              {weightStats.deltaTotal !== null
                ? `Variation totale: ${weightStats.deltaTotal > 0 ? "+" : ""}${weightStats.deltaTotal.toFixed(1)} kg`
                : "Ajoute des mesures pour suivre ta tendance"}
            </p>
          </div>

          <div className="mt-4">
            <LogoutButton />
          </div>
        </aside>

        <section className="space-y-4">
          <header className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard du jour</h1>
                <p className="text-sm text-muted-foreground">
                  Vue operationnelle de ta journee: budget Nutris, journal repas et progression poids.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href="/foods">
                  <Button>Ajouter un aliment</Button>
                </Link>
                <Link href="/journal">
                  <Button variant="outline">Voir le journal</Button>
                </Link>
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Budget</CardTitle>
                <ChartLine className="h-4 w-4 text-emerald-700" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-emerald-900">{dailyLog.budgetNutris}</p>
                <p className="text-xs text-emerald-800/80">points planifies aujourd&apos;hui</p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Consommes</CardTitle>
                <Activity className="h-4 w-4 text-amber-700" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-amber-900">{dailyLog.consumedNutris}</p>
                <p className="text-xs text-amber-800/80">{budgetPct}% du budget utilise</p>
              </CardContent>
            </Card>

            <Card className="border-sky-200 bg-sky-50/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Restants</CardTitle>
                <NotebookPen className="h-4 w-4 text-sky-700" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-sky-900">{dailyLog.remainingNutris}</p>
                <p className="text-xs text-sky-800/80">points disponibles ce soir</p>
              </CardContent>
            </Card>

            <Card className="border-violet-200 bg-violet-50/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Repas logges</CardTitle>
                <UtensilsCrossed className="h-4 w-4 text-violet-700" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-violet-900">{entries.length}</p>
                <p className="text-xs text-violet-800/80">entrees journalieres</p>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Consommation du budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${budgetPct}%` }}
                  />
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <p>Budget: <span className="font-medium text-foreground">{dailyLog.budgetNutris}</span></p>
                  <p>Consommes: <span className="font-medium text-foreground">{dailyLog.consumedNutris}</span></p>
                  <p>Restants: <span className="font-medium text-foreground">{dailyLog.remainingNutris}</span></p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Poids et tendance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Derniere mesure: <span className="font-medium text-foreground">{weightLabel}</span>
                </p>
                <p>
                  Moyenne 7 jours: <span className="font-medium text-foreground">
                    {weightStats.avg7d !== null ? `${weightStats.avg7d.toFixed(1)} kg` : "-"}
                  </span>
                </p>
                <p>
                  Variation 7 jours: <span className="font-medium text-foreground">
                    {weightStats.last7dDelta !== null
                      ? `${weightStats.last7dDelta > 0 ? "+" : ""}${weightStats.last7dDelta.toFixed(1)} kg`
                      : "-"}
                  </span>
                </p>
                <Link href="/weight" className="inline-flex pt-2 text-sm font-medium text-emerald-700 hover:underline">
                  Ouvrir le suivi poids
                </Link>
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dernieres entrees journal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {entries.length === 0 ? (
                <p>Aucune entree aujourd&apos;hui. Commence dans la section aliments.</p>
              ) : (
                entries.slice(0, 6).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/20 px-3 py-2"
                  >
                    <p className="font-medium text-foreground">{entry.foodName}</p>
                    <p>
                      {entry.mealType} · {entry.calculatedNutris} nutris
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
