"use server";

import { requireAuthUser } from "@/lib/auth/session";
import { addWeightEntry, deleteWeightEntry } from "@/lib/weight/service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addWeightSchema = z.object({
  measuredAt: z.string().date(),
  weightKg: z.coerce.number().min(20).max(400),
  note: z.string().trim().max(200).optional(),
});

export async function addWeightAction(formData: FormData) {
  const user = await requireAuthUser();

  const parsed = addWeightSchema.safeParse({
    measuredAt: formData.get("measuredAt"),
    weightKg: formData.get("weightKg"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    throw new Error("Formulaire poids invalide");
  }

  await addWeightEntry({
    userId: user.id,
    measuredAt: parsed.data.measuredAt,
    weightKg: parsed.data.weightKg,
    note: parsed.data.note,
  });

  revalidatePath("/weight");
  revalidatePath("/dashboard");
}

export async function deleteWeightAction(formData: FormData) {
  const user = await requireAuthUser();
  const id = z.string().uuid().parse(formData.get("id"));

  await deleteWeightEntry({ userId: user.id, id });

  revalidatePath("/weight");
  revalidatePath("/dashboard");
}
