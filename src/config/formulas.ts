export type FormulaPricingMode = "fixed" | "supplement";

export interface FormulaChoice {
  label: string;
  options: string[];
}

export interface Formula {
  id: string;
  name: string;
  pricingMode: FormulaPricingMode;
  price: number;
  eligibleCategoryNames: string[];
  includedNames: string[];
  choices: FormulaChoice[];
  extraSizeReference?: "M" | "L";
}

// Miroir de src/config/formulas.ts côté backend — à garder synchronisé.
// Le backend reste seul maître du prix : il revalide tout à la création.
export const FORMULAS: Formula[] = [
  {
    id: "menu_kids",
    name: "Menu Kids",
    pricingMode: "fixed",
    price: 500,
    eligibleCategoryNames: [
      "Pizzas",
      "Burgers",
      "Burgers Signature",
      "Tacos Classique",
      "Tacos Signature",
    ],
    includedNames: ["Frites", "Jus Rouiba"],
    choices: [],
    extraSizeReference: "M",
  },
  {
    id: "menu_burger",
    name: "Menu",
    pricingMode: "supplement",
    price: 250,
    eligibleCategoryNames: ["Burgers", "Burgers Signature"],
    includedNames: ["Frites"],
    choices: [
      {
        label: "Boisson",
        options: ["Coca", "Fanta", "Sprite", "Hamoud Boualem", "Eau minérale"],
      },
    ],
  },
];
