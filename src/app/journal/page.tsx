import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { addJournalEntryAction, deleteJournalEntryAction } from "@/app/journal/actions";
import { getJournalForToday } from "@/lib/journal/service";
import { requireAuthUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const user = await requireAuthUser();
  const { dailyLog, entries } = await getJournalForToday(user.id);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:px-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Journal quotidien</h1>
        <p className="text-muted-foreground">
          Ajoute un aliment manuel, calcule les Nutris, et mets a jour le budget du jour.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
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
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Ajouter une entree</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addJournalEntryAction} className="grid gap-3 md:grid-cols-4">
            <Input name="name" placeholder="Nom de l'aliment" required />
            <Input name="mealType" placeholder="dejeuner" required />
            <Input name="quantityG" placeholder="Quantite (g)" type="number" required />
            <Input
              name="caloriesKcal100g"
              placeholder="Calories / 100g"
              type="number"
              required
            />
            <Input name="sugarG100g" placeholder="Sucres / 100g" type="number" required />
            <Input name="proteinG100g" placeholder="Proteines / 100g" type="number" required />
            <Input name="fiberG100g" placeholder="Fibres / 100g" type="number" required />
            <Input name="fatG100g" placeholder="Lipides / 100g" type="number" required />
            <Button className="md:col-span-4" type="submit">
              Ajouter au journal
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entrees du jour</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune entree pour le moment.</p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-foreground">{entry.foodName}</p>
                  <p className="text-muted-foreground">
                    {entry.mealType} - {String(entry.quantity)} {entry.unit}
                  </p>
                  <p className="text-muted-foreground">Nutris: {entry.calculatedNutris}</p>
                </div>
                <form action={deleteJournalEntryAction}>
                  <input type="hidden" name="entryId" value={entry.id} />
                  <Button type="submit" variant="outline">
                    Supprimer
                  </Button>
                </form>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
