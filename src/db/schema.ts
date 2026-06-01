import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const activityLevelEnum = pgEnum("activity_level", [
  "sedentaire",
  "leger",
  "modere",
  "actif",
  "tres_actif",
]);

export const mealTypeEnum = pgEnum("meal_type", [
  "petit_dejeuner",
  "dejeuner",
  "diner",
  "collation",
]);

export const foodSourceEnum = pgEnum("food_source", ["openfoodfacts", "manual", "custom"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 120 }),
  heightCm: integer("height_cm"),
  currentWeightKg: numeric("current_weight_kg", { precision: 5, scale: 2 }),
  targetWeightKg: numeric("target_weight_kg", { precision: 5, scale: 2 }),
  age: integer("age"),
  sex: varchar("sex", { length: 16 }),
  activityLevel: activityLevelEnum("activity_level").default("modere"),
  dailyNutriBudget: integer("daily_nutri_budget").notNull().default(30),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const weights = pgTable("weights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  measuredAt: date("measured_at").notNull(),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const foods = pgTable("foods", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: foodSourceEnum("source").notNull(),
  sourceExternalId: varchar("source_external_id", { length: 255 }),
  barcode: varchar("barcode", { length: 64 }),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 255 }),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const foodNutrients = pgTable("food_nutrients", {
  foodId: uuid("food_id")
    .primaryKey()
    .references(() => foods.id, { onDelete: "cascade" }),
  servingReference: varchar("serving_reference", { length: 24 }).default("100g").notNull(),
  caloriesKcal: numeric("calories_kcal", { precision: 8, scale: 2 }).notNull().default("0"),
  proteinG: numeric("protein_g", { precision: 8, scale: 2 }).notNull().default("0"),
  carbsG: numeric("carbs_g", { precision: 8, scale: 2 }).notNull().default("0"),
  sugarG: numeric("sugar_g", { precision: 8, scale: 2 }).notNull().default("0"),
  fatG: numeric("fat_g", { precision: 8, scale: 2 }).notNull().default("0"),
  fiberG: numeric("fiber_g", { precision: 8, scale: 2 }).notNull().default("0"),
  sodiumMg: numeric("sodium_mg", { precision: 10, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const foodCache = pgTable("food_cache", {
  id: uuid("id").defaultRandom().primaryKey(),
  cacheKey: varchar("cache_key", { length: 255 }).notNull().unique(),
  payload: text("payload").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const nutriRuleVersions = pgTable("nutri_rule_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  version: integer("version").notNull().unique(),
  label: varchar("label", { length: 120 }).notNull(),
  description: text("description").notNull(),
  formulaJson: text("formula_json").notNull(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const dailyLogs = pgTable("daily_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  logDate: date("log_date").notNull(),
  budgetNutris: integer("budget_nutris").notNull(),
  consumedNutris: integer("consumed_nutris").notNull().default(0),
  exerciseNutris: integer("exercise_nutris").notNull().default(0),
  remainingNutris: integer("remaining_nutris").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const mealEntries = pgTable("meal_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  foodId: uuid("food_id")
    .notNull()
    .references(() => foods.id, { onDelete: "restrict" }),
  dailyLogId: uuid("daily_log_id")
    .notNull()
    .references(() => dailyLogs.id, { onDelete: "cascade" }),
  mealType: mealTypeEnum("meal_type").notNull(),
  quantity: numeric("quantity", { precision: 8, scale: 2 }).notNull().default("100"),
  unit: varchar("unit", { length: 32 }).notNull().default("g"),
  consumedAt: timestamp("consumed_at", { withTimezone: true }).defaultNow().notNull(),
  calculatedNutris: integer("calculated_nutris").notNull(),
  ruleVersion: integer("rule_version").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const nutriEvents = pgTable("nutri_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 60 }).notNull(),
  entityId: uuid("entity_id"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
