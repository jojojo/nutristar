import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { requireAuthUser } from "@/lib/auth/session";
import { getJournalForToday } from "@/lib/journal/service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuthUser();
  const { dailyLog, entries } = await getJournalForToday(user.id);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 md:px-10">
      <header className="space-y-2">
        <Badge className="rounded-full" variant="secondary">
          Dashboard du jour
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Ton suivi Nutris</h1>
        <p className="text-muted-foreground">
          Connecte en tant que {user.email}. Utilise le journal pour ajouter des entrees persistantes.
        </p>
        <LogoutButton />
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Budget</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{dailyLog.budgetNutris}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Consommes</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-amber-700">
            {dailyLog.consumedNutris}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Restants</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-700">
            {dailyLog.remainingNutris}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Repas logges</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{entries.length}</CardContent>
        </Card>
      </section>
    </main>
  );
}
