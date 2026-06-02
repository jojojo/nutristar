import { getDb } from "@/db/client";
import { dailyLogs, foods, mealEntries } from "@/db/schema";
import { ACTIVE_NUTRI_RULE } from "@/lib/nutris/rules";
import { calculateNutris, scaleNutritionPerServing } from "@/lib/nutris/calculate";
import { and, desc, eq, sql } from "drizzle-orm";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function getOrCreateDailyLog(userId: string) {
  const db = getDb();
  const today = todayIsoDate();

  const [existing] = await db
    .select()
    .from(dailyLogs)
    .where(and(eq(dailyLogs.userId, userId), eq(dailyLogs.logDate, today)))
    .limit(1);

  if (existing) {
    return existing;
  }

  const budget = 30;

  const [created] = await db
    .insert(dailyLogs)
    .values({
      userId,
      logDate: today,
      budgetNutris: budget,
      consumedNutris: 0,
      exerciseNutris: 0,
      remainingNutris: budget,
    })
    .returning();

  return created;
}

export async function recalculateDailyLog(logId: string) {
  const db = getDb();

  const [totals] = await db
    .select({ total: sql<number>`coalesce(sum(${mealEntries.calculatedNutris}), 0)` })
    .from(mealEntries)
    .where(eq(mealEntries.dailyLogId, logId));

  const [log] = await db.select().from(dailyLogs).where(eq(dailyLogs.id, logId)).limit(1);

  if (!log) {
    throw new Error("Daily log introuvable");
  }

  const consumed = Number(totals?.total ?? 0);
  const remaining = log.budgetNutris + log.exerciseNutris - consumed;

  await db
    .update(dailyLogs)
    .set({
      consumedNutris: consumed,
      remainingNutris: remaining,
      updatedAt: new Date(),
    })
    .where(eq(dailyLogs.id, logId));
}

type CreateManualEntryInput = {
  userId: string;
  mealType: "petit_dejeuner" | "dejeuner" | "diner" | "collation";
  name: string;
  brand?: string | null;
  sourceExternalId?: string | null;
  source: "manual" | "openfoodfacts" | "custom";
  quantityG: number;
  caloriesKcal100g: number;
  sugarG100g: number;
  proteinG100g: number;
  fiberG100g: number;
  fatG100g: number;
};

async function createMealEntry(input: CreateManualEntryInput) {
  const db = getDb();
  const dailyLog = await getOrCreateDailyLog(input.userId);

  const scaled = scaleNutritionPerServing(
    {
      caloriesKcal: input.caloriesKcal100g,
      sugarG: input.sugarG100g,
      proteinG: input.proteinG100g,
      fiberG: input.fiberG100g,
      // We store total fat only in v1 schema, use a conservative ratio for sat fat estimate.
      saturatedFatG: input.fatG100g * 0.3,
    },
    input.quantityG
  );

  const calculatedNutris = calculateNutris(scaled);

  const [food] = await db
    .insert(foods)
    .values({
      source: input.source,
      sourceExternalId: input.sourceExternalId ?? null,
      name: input.name,
      brand: input.brand ?? null,
    })
    .returning({ id: foods.id });

  await db.insert(mealEntries).values({
    userId: input.userId,
    foodId: food.id,
    dailyLogId: dailyLog.id,
    mealType: input.mealType,
    quantity: String(input.quantityG),
    unit: "g",
    calculatedNutris,
    ruleVersion: ACTIVE_NUTRI_RULE.version,
  });

  await recalculateDailyLog(dailyLog.id);
}

type BaseEntryInput = Omit<CreateManualEntryInput, "source">;

export async function createManualMealEntry(input: BaseEntryInput) {
  await createMealEntry({
    ...input,
    source: "manual",
  });
}

export async function createOpenFoodFactsMealEntry(input: BaseEntryInput) {
  await createMealEntry({
    ...input,
    source: "openfoodfacts",
  });
}

type CatalogEntryInput = BaseEntryInput & {
  source: "openfoodfacts" | "custom";
};

export async function createCatalogMealEntry(input: CatalogEntryInput) {
  await createMealEntry(input);
}

export async function deleteMealEntry(userId: string, entryId: string) {
  const db = getDb();

  const [entry] = await db
    .select({ id: mealEntries.id, dailyLogId: mealEntries.dailyLogId })
    .from(mealEntries)
    .where(and(eq(mealEntries.id, entryId), eq(mealEntries.userId, userId)))
    .limit(1);

  if (!entry) {
    return;
  }

  await db.delete(mealEntries).where(eq(mealEntries.id, entry.id));
  await recalculateDailyLog(entry.dailyLogId);
}

export async function getJournalForToday(userId: string) {
  const db = getDb();
  const dailyLog = await getOrCreateDailyLog(userId);

  const entries = await db
    .select({
      id: mealEntries.id,
      mealType: mealEntries.mealType,
      quantity: mealEntries.quantity,
      unit: mealEntries.unit,
      calculatedNutris: mealEntries.calculatedNutris,
      consumedAt: mealEntries.consumedAt,
      foodName: foods.name,
    })
    .from(mealEntries)
    .innerJoin(foods, eq(mealEntries.foodId, foods.id))
    .where(eq(mealEntries.dailyLogId, dailyLog.id))
    .orderBy(desc(mealEntries.consumedAt));

  return {
    dailyLog,
    entries,
  };
}
