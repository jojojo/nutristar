import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-[radial-gradient(circle_at_top_left,#f3f8f3_0%,#f9f6ed_42%,#fff_100%)]">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10 md:px-10">
        <section className="space-y-4">
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">
            MVP en cours de construction
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Nutristar, ton suivi quotidien en points Nutris.
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            Base technique en place: Next.js, Drizzle, PostgreSQL, shadcn/ui et
            OpenFoodFacts. Les ecrans journalier et suivi poids arrivent ensuite.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Fondations</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Auth, base de donnees, regles Nutris versionnees et cache aliments.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Suivi journalier</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Ajout repas, calcul points instantane, budget restant de la journee.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Evolution poids</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Historique, courbe de progression et tendances hebdomadaires.
            </CardContent>
          </Card>
        </div>

        <Separator />

        <section className="flex flex-wrap gap-3">
          <Link href="/login">
            <Button>Connexion</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline">Inscription</Button>
          </Link>
          <Link href="/api/foods/search?q=yaourt">
            <Button variant="outline">Tester OpenFoodFacts API</Button>
          </Link>
          <Link href="/foods">
            <Button variant="outline">Recherche aliments</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard Nutris</Button>
          </Link>
          <Link href="/journal">
            <Button variant="outline">Journal repas</Button>
          </Link>
          <Link href="/weight">
            <Button variant="outline">Suivi poids</Button>
          </Link>
          <Link href="https://world.openfoodfacts.org/" target="_blank">
            <Button variant="outline">OpenFoodFacts</Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
