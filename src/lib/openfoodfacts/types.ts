export type OpenFoodFactsNutrients = {
  "energy-kcal_100g"?: number;
  sugars_100g?: number;
  proteins_100g?: number;
  fiber_100g?: number;
  "saturated-fat_100g"?: number;
  fat_100g?: number;
};

export type OpenFoodFactsProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  image_front_small_url?: string;
  nutriments?: OpenFoodFactsNutrients;
};

export type OpenFoodFactsSearchResponse = {
  count?: number;
  page?: number;
  page_count?: number;
  products?: OpenFoodFactsProduct[];
};
