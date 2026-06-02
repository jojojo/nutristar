import { getDb } from "@/db/client";
import { foodNutrients, foods } from "@/db/schema";
import { and, asc, eq, ilike, like, sql } from "drizzle-orm";

export type LocalSearchItem = {
  source: "custom";
  externalId: string;
  name: string;
  brand: string | null;
  caloriesKcal: number;
  sugarsG: number;
  proteinsG: number;
  fiberG: number;
  saturatedFatG: number;
  fatG: number;
  imageUrl: string | null;
};

export async function searchLocalFoodsByName(query: string, limit = 20): Promise<LocalSearchItem[]> {
  const db = getDb();
  const term = `%${query}%`;
  const normalizedQuery = query.trim().toLowerCase();

  const rankExpression = sql<number>`
    case
      when lower(${foods.name}) = ${normalizedQuery} then 0
      when lower(${foods.name}) like (${normalizedQuery} || ' sans précision%') then 1
      when lower(${foods.name}) like (${normalizedQuery} || ' %, crue%') then 2
      when lower(${foods.name}) like (${normalizedQuery} || ' %') then 3
      when lower(${foods.name}) like ('%' || ${normalizedQuery} || '%, crue%') then 4
      when lower(${foods.name}) like ('%' || ${normalizedQuery} || '%') then 5
      else 9
    end
  `;

  const rows = await db
    .select({
      source: foods.source,
      sourceExternalId: foods.sourceExternalId,
      name: foods.name,
      brand: foods.brand,
      caloriesKcal: foodNutrients.caloriesKcal,
      sugarG: foodNutrients.sugarG,
      proteinG: foodNutrients.proteinG,
      fiberG: foodNutrients.fiberG,
      fatG: foodNutrients.fatG,
    })
    .from(foods)
    .innerJoin(foodNutrients, eq(foodNutrients.foodId, foods.id))
    .where(
      and(
        eq(foods.source, "custom"),
        like(foods.sourceExternalId, "ciqual:%"),
        ilike(foods.name, term)
      )
    )
    .orderBy(rankExpression, asc(foods.name))
    .limit(limit);

  return rows.map((row) => {
    const fat = Number(row.fatG ?? 0);

    return {
      source: "custom",
      externalId: row.sourceExternalId ?? "ciqual:unknown",
      name: row.name,
      brand: row.brand,
      caloriesKcal: Number(row.caloriesKcal ?? 0),
      sugarsG: Number(row.sugarG ?? 0),
      proteinsG: Number(row.proteinG ?? 0),
      fiberG: Number(row.fiberG ?? 0),
      fatG: fat,
      saturatedFatG: fat * 0.3,
      imageUrl: null,
    };
  });
}
