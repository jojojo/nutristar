import { getDb } from "@/db/client";
import { weights } from "@/db/schema";
import { and, asc, desc, eq, gte } from "drizzle-orm";

export type WeightEntry = {
  id: string;
  measuredAt: string;
  weightKg: number;
  note: string | null;
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export async function addWeightEntry(input: {
  userId: string;
  measuredAt: string;
  weightKg: number;
  note?: string | null;
}) {
  const db = getDb();

  await db.insert(weights).values({
    userId: input.userId,
    measuredAt: input.measuredAt,
    weightKg: input.weightKg.toFixed(2),
    note: input.note ?? null,
  });
}

export async function deleteWeightEntry(input: { userId: string; id: string }) {
  const db = getDb();

  await db
    .delete(weights)
    .where(and(eq(weights.id, input.id), eq(weights.userId, input.userId)));
}

export async function getWeightOverview(userId: string) {
  const db = getDb();

  const rows = await db
    .select({
      id: weights.id,
      measuredAt: weights.measuredAt,
      weightKg: weights.weightKg,
      note: weights.note,
    })
    .from(weights)
    .where(eq(weights.userId, userId))
    .orderBy(desc(weights.measuredAt), desc(weights.createdAt))
    .limit(100);

  const entries: WeightEntry[] = rows.map((row) => ({
    id: row.id,
    measuredAt: row.measuredAt,
    weightKg: Number(row.weightKg),
    note: row.note,
  }));

  const latest = entries[0] ?? null;
  const oldest = entries.at(-1) ?? null;

  const deltaTotal =
    latest && oldest ? Number((latest.weightKg - oldest.weightKg).toFixed(2)) : null;

  const sevenDaysAgo = dateDaysAgo(7);
  const recentRows = await db
    .select({ measuredAt: weights.measuredAt, weightKg: weights.weightKg })
    .from(weights)
    .where(and(eq(weights.userId, userId), gte(weights.measuredAt, sevenDaysAgo)))
    .orderBy(asc(weights.measuredAt));

  const recentWeights = recentRows.map((row) => Number(row.weightKg));
  const avg7d =
    recentWeights.length > 0
      ? Number((recentWeights.reduce((sum, v) => sum + v, 0) / recentWeights.length).toFixed(2))
      : null;

  const last7dDelta =
    recentWeights.length >= 2
      ? Number((recentWeights[recentWeights.length - 1] - recentWeights[0]).toFixed(2))
      : null;

  return {
    entries,
    stats: {
      latest,
      deltaTotal,
      avg7d,
      last7dDelta,
      defaultDate: todayIsoDate(),
    },
  };
}
