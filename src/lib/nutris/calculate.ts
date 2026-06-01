import { ACTIVE_NUTRI_RULE } from "@/lib/nutris/rules";

export type NutritionInput = {
  caloriesKcal: number;
  saturatedFatG: number;
  sugarG: number;
  proteinG: number;
  fiberG: number;
};

export function calculateNutris(input: NutritionInput): number {
  const { caloriesWeight, saturatedFatWeight, sugarWeight, proteinWeight, fiberWeight } =
    ACTIVE_NUTRI_RULE.formula;

  const rawScore =
    input.caloriesKcal * caloriesWeight +
    input.saturatedFatG * saturatedFatWeight +
    input.sugarG * sugarWeight -
    input.proteinG * proteinWeight -
    input.fiberG * fiberWeight;

  return Math.max(0, Math.round(rawScore));
}

export function scaleNutritionPerServing(base100g: NutritionInput, grams: number): NutritionInput {
  const ratio = grams / 100;

  return {
    caloriesKcal: base100g.caloriesKcal * ratio,
    saturatedFatG: base100g.saturatedFatG * ratio,
    sugarG: base100g.sugarG * ratio,
    proteinG: base100g.proteinG * ratio,
    fiberG: base100g.fiberG * ratio,
  };
}
