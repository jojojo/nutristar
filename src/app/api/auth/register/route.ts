import { getDb } from "@/db/client";
import { userProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().trim().min(2).max(120).optional(),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json({ error: "Donnees invalides" }, { status: 400 });
  }

  const db = getDb();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (existing.length > 0) {
    return Response.json({ error: "Email deja utilise" }, { status: 409 });
  }

  const hash = await bcrypt.hash(parsed.data.password, 12);

  const [createdUser] = await db
    .insert(users)
    .values({
      email: parsed.data.email,
      passwordHash: hash,
    })
    .returning({ id: users.id });

  await db.insert(userProfiles).values({
    userId: createdUser.id,
    displayName: parsed.data.displayName ?? null,
    dailyNutriBudget: 30,
  });

  return Response.json({ ok: true }, { status: 201 });
}
