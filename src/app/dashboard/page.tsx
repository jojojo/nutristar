import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const todayOverview = {
  budget: 30,
  consumed: 12,
  remaining: 18,
  meals: 2,
};

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 md:px-10">
      <header className="space-y-2">
        <Badge className="rounded-full" variant="secondary">
          Dashboard du jour
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Ton suivi Nutris</h1>
        <p className="text-muted-foreground">
          Version MVP: donnees mockees pour le moment, branchement DB en prochaine etape.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Budget</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{todayOverview.budget}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Consommes</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-amber-700">
            {todayOverview.consumed}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Restants</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-700">
            {todayOverview.remaining}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Repas logges</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{todayOverview.meals}</CardContent>
        </Card>
      </section>
    </main>
  );
}
