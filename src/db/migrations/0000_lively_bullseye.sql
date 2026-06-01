CREATE TYPE "public"."activity_level" AS ENUM('sedentaire', 'leger', 'modere', 'actif', 'tres_actif');--> statement-breakpoint
CREATE TYPE "public"."food_source" AS ENUM('openfoodfacts', 'manual', 'custom');--> statement-breakpoint
CREATE TYPE "public"."meal_type" AS ENUM('petit_dejeuner', 'dejeuner', 'diner', 'collation');--> statement-breakpoint
CREATE TABLE "daily_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"log_date" date NOT NULL,
	"budget_nutris" integer NOT NULL,
	"consumed_nutris" integer DEFAULT 0 NOT NULL,
	"exercise_nutris" integer DEFAULT 0 NOT NULL,
	"remaining_nutris" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cache_key" varchar(255) NOT NULL,
	"payload" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "food_cache_cache_key_unique" UNIQUE("cache_key")
);
--> statement-breakpoint
CREATE TABLE "food_nutrients" (
	"food_id" uuid PRIMARY KEY NOT NULL,
	"serving_reference" varchar(24) DEFAULT '100g' NOT NULL,
	"calories_kcal" numeric(8, 2) DEFAULT '0' NOT NULL,
	"protein_g" numeric(8, 2) DEFAULT '0' NOT NULL,
	"carbs_g" numeric(8, 2) DEFAULT '0' NOT NULL,
	"sugar_g" numeric(8, 2) DEFAULT '0' NOT NULL,
	"fat_g" numeric(8, 2) DEFAULT '0' NOT NULL,
	"fiber_g" numeric(8, 2) DEFAULT '0' NOT NULL,
	"sodium_mg" numeric(10, 2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "food_source" NOT NULL,
	"source_external_id" varchar(255),
	"barcode" varchar(64),
	"name" varchar(255) NOT NULL,
	"brand" varchar(255),
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"food_id" uuid NOT NULL,
	"daily_log_id" uuid NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"quantity" numeric(8, 2) DEFAULT '100' NOT NULL,
	"unit" varchar(32) DEFAULT 'g' NOT NULL,
	"consumed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"calculated_nutris" integer NOT NULL,
	"rule_version" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutri_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" varchar(60) NOT NULL,
	"entity_id" uuid,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutri_rule_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"version" integer NOT NULL,
	"label" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"formula_json" text NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "nutri_rule_versions_version_unique" UNIQUE("version")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"display_name" varchar(120),
	"height_cm" integer,
	"current_weight_kg" numeric(5, 2),
	"target_weight_kg" numeric(5, 2),
	"age" integer,
	"sex" varchar(16),
	"activity_level" "activity_level" DEFAULT 'modere',
	"daily_nutri_budget" integer DEFAULT 30 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "weights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"measured_at" date NOT NULL,
	"weight_kg" numeric(5, 2) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_nutrients" ADD CONSTRAINT "food_nutrients_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_entries" ADD CONSTRAINT "meal_entries_daily_log_id_daily_logs_id_fk" FOREIGN KEY ("daily_log_id") REFERENCES "public"."daily_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutri_events" ADD CONSTRAINT "nutri_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weights" ADD CONSTRAINT "weights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;