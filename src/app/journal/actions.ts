"use server";

import { deleteMealEntry, createManualMealEntry } from "@/lib/journal/service";
import { requireAuthUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const mealTypeSchema = z.enum(["petit_dejeuner", "dejeuner", "diner", "collation"]);

const createEntrySchema = z.object({
  mealType: mealTypeSchema,
  name: z.string().trim().min(2).max(255),
  quantityG: z.coerce.number().min(1).max(2000),
  caloriesKcal100g: z.coerce.number().min(0).max(1000),
  sugarG100g: z.coerce.number().min(0).max(200),
  proteinG100g: z.coerce.number().min(0).max(200),
  fiberG100g: z.coerce.number().min(0).max(200),
  fatG100g: z.coerce.number().min(0).max(200),
});

export async function addJournalEntryAction(formData: FormData) {
  const user = await requireAuthUser();

  const parsed = createEntrySchema.safeParse({
    mealType: formData.get("mealType"),
    name: formData.get("name"),
    quantityG: formData.get("quantityG"),
    caloriesKcal100g: formData.get("caloriesKcal100g"),
    sugarG100g: formData.get("sugarG100g"),
    proteinG100g: formData.get("proteinG100g"),
    fiberG100g: formData.get("fiberG100g"),
    fatG100g: formData.get("fatG100g"),
  });

  if (!parsed.success) {
    throw new Error("Formulaire invalide");
  }

  await createManualMealEntry({
    userId: user.id,
    ...parsed.data,
  });

  revalidatePath("/journal");
  revalidatePath("/dashboard");
}

export async function deleteJournalEntryAction(formData: FormData) {
  const user = await requireAuthUser();
  const entryId = z.string().uuid().parse(formData.get("entryId"));

  await deleteMealEntry(user.id, entryId);

  revalidatePath("/journal");
  revalidatePath("/dashboard");
}
