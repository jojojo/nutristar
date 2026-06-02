"use server";

import { createCatalogMealEntry } from "@/lib/journal/service";
import { requireAuthUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const mealTypeSchema = z.enum(["petit_dejeuner", "dejeuner", "diner", "collation"]);

const addOffEntrySchema = z.object({
  source: z.enum(["openfoodfacts", "custom"]),
  mealType: mealTypeSchema,
  name: z.string().trim().min(2).max(255),
  brand: z.string().trim().max(255).optional(),
  sourceExternalId: z.string().trim().min(1).max(255),
  quantityG: z.coerce.number().min(1).max(2000),
  caloriesKcal100g: z.coerce.number().min(0).max(1000),
  sugarG100g: z.coerce.number().min(0).max(200),
  proteinG100g: z.coerce.number().min(0).max(200),
  fiberG100g: z.coerce.number().min(0).max(200),
  fatG100g: z.coerce.number().min(0).max(200),
});

export async function addFromOpenFoodFactsAction(formData: FormData) {
  const user = await requireAuthUser();

  const parsed = addOffEntrySchema.safeParse({
    source: formData.get("source"),
    mealType: formData.get("mealType"),
    name: formData.get("name"),
    brand: formData.get("brand"),
    sourceExternalId: formData.get("sourceExternalId"),
    quantityG: formData.get("quantityG"),
    caloriesKcal100g: formData.get("caloriesKcal100g"),
    sugarG100g: formData.get("sugarG100g"),
    proteinG100g: formData.get("proteinG100g"),
    fiberG100g: formData.get("fiberG100g"),
    fatG100g: formData.get("fatG100g"),
  });

  if (!parsed.success) {
    throw new Error("Formulaire OpenFoodFacts invalide");
  }

  await createCatalogMealEntry({
    userId: user.id,
    ...parsed.data,
  });

  revalidatePath("/foods");
  revalidatePath("/journal");
  revalidatePath("/dashboard");
}
