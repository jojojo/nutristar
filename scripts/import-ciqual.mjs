import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const ROOT = process.cwd();
const CIQUAL_DIR = path.join(ROOT, "src", "data", "ciqual");

const ALIM_FILE = path.join(CIQUAL_DIR, "alim_2025_11_03.xml");
const COMPO_FILE = path.join(CIQUAL_DIR, "compo_2025_11_03.xml");

const NUTRIENT_CODES = {
  caloriesKcal: ["328", "333"],
  proteinG: ["25000", "25003"],
  carbsG: ["31000"],
  sugarG: ["32000"],
  fatG: ["40000"],
  fiberG: ["34100"],
  sodiumMg: ["10110"],
};

function textInTag(block, tag) {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(regex);
  return match?.[1]?.trim() ?? null;
}

function parseCiqualNumber(raw) {
  if (!raw) return null;
  const value = raw.trim();
  if (value === "-" || value === "traces" || value === "tr") {
    return null;
  }

  const normalized = value.replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
}

function parseAliments(fileContent) {
  const alimBlocks = fileContent.match(/<ALIM>[\s\S]*?<\/ALIM>/g) ?? [];

  const items = [];
  for (const block of alimBlocks) {
    const code = textInTag(block, "alim_code")?.replace(/\s+/g, "");
    const name = textInTag(block, "alim_nom_fr");

    if (!code || !name) {
      continue;
    }

    items.push({ code, name });
  }

  return items;
}

function resolveNutrientKey(constCode) {
  for (const [key, codes] of Object.entries(NUTRIENT_CODES)) {
    if (codes.includes(constCode)) {
      return key;
    }
  }
  return null;
}

function parseCompositions(fileContent) {
  const compoBlocks = fileContent.match(/<COMPO>[\s\S]*?<\/COMPO>/g) ?? [];
  const byAlimCode = new Map();

  for (const block of compoBlocks) {
    const alimCode = textInTag(block, "alim_code")?.replace(/\s+/g, "");
    const constCode = textInTag(block, "const_code")?.replace(/\s+/g, "");
    const teneurRaw = textInTag(block, "teneur");

    if (!alimCode || !constCode) {
      continue;
    }

    const nutrientKey = resolveNutrientKey(constCode);
    if (!nutrientKey) {
      continue;
    }

    const value = parseCiqualNumber(teneurRaw);
    if (value === null) {
      continue;
    }

    const current = byAlimCode.get(alimCode) ?? {
      caloriesKcal: 0,
      proteinG: 0,
      carbsG: 0,
      sugarG: 0,
      fatG: 0,
      fiberG: 0,
      sodiumMg: 0,
    };

    // Keep first available value for priority code ordering.
    if (current[nutrientKey] === 0) {
      current[nutrientKey] = value;
    }

    byAlimCode.set(alimCode, current);
  }

  return byAlimCode;
}

function toDecimal(value) {
  return Number.isFinite(value) ? value.toFixed(2) : "0.00";
}

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const alimXml = fs.readFileSync(ALIM_FILE, "utf8");
  const compoXml = fs.readFileSync(COMPO_FILE, "utf8");

  const aliments = parseAliments(alimXml);
  const compositions = parseCompositions(compoXml);

  const sql = postgres(databaseUrl, { prepare: false, max: 1 });

  try {
    await sql.begin(async (tx) => {
      await tx`
        delete from foods
        where source = 'custom'
          and source_external_id like 'ciqual:%'
      `;

      const foodRows = aliments.map((item) => [
        "custom",
        `ciqual:${item.code}`,
        null,
        item.name,
        "CIQUAL",
        true,
      ]);

      const insertedFoods = await tx`
        insert into foods (source, source_external_id, barcode, name, brand, is_verified)
        values ${tx(foodRows)}
        returning id, source_external_id
      `;

      const idByExternalId = new Map(
        insertedFoods.map((row) => [String(row.source_external_id), String(row.id)])
      );

      const nutrientRows = [];
      for (const item of aliments) {
        const externalId = `ciqual:${item.code}`;
        const foodId = idByExternalId.get(externalId);
        if (!foodId) {
          continue;
        }

        const nutrients = compositions.get(item.code) ?? {
          caloriesKcal: 0,
          proteinG: 0,
          carbsG: 0,
          sugarG: 0,
          fatG: 0,
          fiberG: 0,
          sodiumMg: 0,
        };

        nutrientRows.push([
          foodId,
          "100g",
          toDecimal(nutrients.caloriesKcal),
          toDecimal(nutrients.proteinG),
          toDecimal(nutrients.carbsG),
          toDecimal(nutrients.sugarG),
          toDecimal(nutrients.fatG),
          toDecimal(nutrients.fiberG),
          toDecimal(nutrients.sodiumMg),
        ]);
      }

      if (nutrientRows.length > 0) {
        await tx`
          insert into food_nutrients
            (food_id, serving_reference, calories_kcal, protein_g, carbs_g, sugar_g, fat_g, fiber_g, sodium_mg)
          values ${tx(nutrientRows)}
        `;
      }
    });

    console.log(`CIQUAL import completed: ${aliments.length} foods synchronized.`);
  } finally {
    await sql.end();
  }
}

run().catch((error) => {
  console.error("CIQUAL import failed:", error);
  process.exit(1);
});
