# Nutristar

Application web perso de suivi nutritionnel inspiree WW, avec systeme de points "Nutris".

## Stack

- Next.js 16 (App Router, TypeScript)
- PostgreSQL 16 (Docker en local)
- Drizzle ORM + Drizzle Kit
- shadcn/ui + Tailwind CSS
- OpenFoodFacts (recherche aliments)

## Ce qui est implemente (iteration 1)

- Socle Next.js + UI shadcn
- Configuration PostgreSQL locale via Docker
- Schema Drizzle initial (utilisateurs, profil, poids, aliments, journal quotidien, entrees repas, versioning regles Nutris)
- Moteur Nutris v1 (inspire WW, formule distincte)
- Endpoint API `GET /api/foods/search?q=...` branche sur OpenFoodFacts avec normalisation et calcul Nutris
- Ecrans MVP initiaux:
	- `/dashboard` (vue budget Nutris du jour, mock)
	- `/foods` (recherche OpenFoodFacts server-side + estimation Nutris)
	- `/weight` (suivi poids simplifie, mock)

## Lancer en local

1. Copier les variables d'environnement:

```bash
cp .env.example .env
```

2. Demarrer PostgreSQL:

```bash
docker compose up -d
```

3. Generer et appliquer les migrations:

```bash
npm run db:generate
npm run db:migrate
```

4. Lancer l'application:

```bash
npm run dev
```

Puis ouvrir `http://localhost:3000`.

## Scripts utiles

- `npm run dev`: mode developpement
- `npm run build`: build production
- `npm run lint`: lint
- `npm run db:generate`: genere une migration SQL depuis le schema
- `npm run db:migrate`: applique les migrations
- `npm run db:push`: pousse le schema direct en base
- `npm run db:studio`: ouvre Drizzle Studio

## Prochaines etapes

- Auth.js (email/mot de passe) et routes protegees
- Ecran `journal` avec ajout/suppression repas et recalcul du restant
- Cache persistant OpenFoodFacts et gestion des portions avancees
- Tests unitaires (moteur Nutris) et integration (flux journal)
