export type NutriFormula = {
  caloriesWeight: number;
  saturatedFatWeight: number;
  sugarWeight: number;
  proteinWeight: number;
  fiberWeight: number;
};

export type NutriRuleVersion = {
  version: number;
  label: string;
  description: string;
  formula: NutriFormula;
};

// Inspired by point-based diet systems while intentionally using distinct weights.
export const NUTRI_RULE_V1: NutriRuleVersion = {
  version: 1,
  label: "Nutris V1",
  description:
    "Formule Nutris v1 inspiree des approches points avec bonus proteines/fibres et penalite sucre/gras satures.",
  formula: {
    caloriesWeight: 0.038,
    saturatedFatWeight: 0.82,
    sugarWeight: 0.12,
    proteinWeight: 0.23,
    fiberWeight: 0.35,
  },
};

export const ACTIVE_NUTRI_RULE = NUTRI_RULE_V1;
