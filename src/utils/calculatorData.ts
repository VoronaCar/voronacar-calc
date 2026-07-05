// Типы данных для каталога деталей
export interface CatalogRow {
  category: string;
  operations: string[];
  coefficient: number;
}

export type PartsCatalog = Record<string, CatalogRow[]>;
export type DetailCoefficients = Record<string, number>;

// Список из 46 деталей автомобиля на русском языке
export const PART_LIST: string[] = [
  "бампер передний", "бампер задний",
  "дверь передняя лев.", "дверь передняя пр.",
  "дверь задняя лев.", "дверь задняя пр.",
  "дверь (купе) лев.", "дверь (купе) пр.",
  "капот", "крышка багажника",
  "крыло переднее лев.", "крыло переднее пр.",
  "крыло заднее лев.", "крыло заднее пр.",
  "крыло (купе) заднее лев.", "крыло (купе) заднее пр.",
  "крыша", "порог лев.", "порог пр.",
  "стойка пер. лев.", "стойка пер. пр.",
  "стойка зад. лев.", "стойка зад. пр.",
  "проем двери пер. лев.", "проем двери пер. прав.",
  "проем двери зад. лев.", "проем двери зад. прав.",
  "проем двери (купе) пер. лев.", "проем двери (купе) пер. прав.",
  "подкапотное пространство", "багажник внутри",
  "обшивка потолка", "зеркало лев.", "зеркало пр.",
  "ручка двери пер. лев.", "ручка двери пер. пр.",
  "ручка двери зад. лев.", "ручка двери зад. прав.",
  "фара пер. лев.", "фара пер. прав.",
  "фонарь зад. лев.", "фонарь зад. прав.",
  "подкрылок пер. лев.", "подкрылок пер. пр.",
  "подкрылок зад. лев.", "подкрылок зад. пр."
];

// Категории операций и их внутренние подуслуги
export const CATEGORY_OPS: Record<string, string[]> = {
  "Снятие/установка": ["снятие", "установка"],
  "Разборка/сборка": ["разборка", "сборка"],
  "Подготовка": ["подготовка к грунту"],
  "Грунтование": ["обклейка к грунту", "грунтование", "перетирка грунта"],
  "Покраска": ["обклейка покраске", "покраска снаружи"],
  "Полировка": ["полировка"],
  "Покраска внутри": ["покраска внутри"]
};

// Цвета для конкретных мелких операций
export const OPERATION_COLORS: Record<string, string> = {
  "снятие": "#FFA5A5", "установка": "#FFA5A5",
  "разборка": "#FFD791", "сборка": "#FFD791",
  "подготовка к грунту": "#FFEDA3",
  "обклейка к грунту": "#CAEB87", "грунтование": "#CAEB87", "перетирка грунта": "#CAEB87",
  "обклейка покраске": "#BAEFE2", "покраска снаружи": "#BAEFE2",
  "полировка": "#A2D0FE",
  "покраска внутри": "#C6C2FF"
};

// Цвета фонов для больших категорий
export const CATEGORY_COLORS: Record<string, string> = {
  "Снятие/установка": "#FFE6E7",
  "Разборка/сборка": "#FFEFD4",
  "Подготовка": "#FFFBDD",
  "Грунтование": "#EAFFBF",
  "Покраска": "#99FFF6",
  "Полировка": "#D4EAFF",
  "Покраска внутри": "#E7E5FF"
};

// Сокращения для мастер-правил
const SU = "Снятие/установка";
const DA = "Разборка/сборка";
const PREP = "Подготовка";
const PRIME = "Грунтование";
const PAINT = "Покраска";
const POLISH = "Полировка";
const INSIDE = "Покраска внутри";

// Системные правила: какие работы доступны для каждой из деталей
export const MASTER_RULES: Record<string, string[]> = {
  "бампер передний": [SU, DA, PREP, PRIME, PAINT, POLISH],
  "бампер задний": [SU, DA, PREP, PRIME, PAINT, POLISH],
  "дверь передняя лев.": [SU, DA, PREP, PRIME, PAINT, POLISH, INSIDE],
  "дверь передняя пр.": [SU, DA, PREP, PRIME, PAINT, POLISH, INSIDE],
  "дверь задняя лев.": [SU, DA, PREP, PRIME, PAINT, POLISH, INSIDE],
  "дверь задняя пр.": [SU, DA, PREP, PRIME, PAINT, POLISH, INSIDE],
  "дверь (купе) лев.": [SU, DA, PREP, PRIME, PAINT, POLISH, INSIDE],
  "дверь (купе) пр.": [SU, DA, PREP, PRIME, PAINT, POLISH, INSIDE],
  "капот": [SU, DA, PREP, PRIME, PAINT, POLISH, INSIDE],
  "крышка багажника": [SU, DA, PREP, PRIME, PAINT, POLISH, INSIDE],
  "крыло переднее лев.": [SU, DA, PREP, PRIME, PAINT, POLISH, INSIDE],
  "крыло переднее пр.": [SU, DA, PREP, PRIME, PAINT, POLISH, INSIDE],
  "крыло заднее лев.": [PREP, PRIME, PAINT, POLISH],
  "крыло заднее пр.": [PREP, PRIME, PAINT, POLISH],
  "крыло (купе) заднее лев.": [PREP, PRIME, PAINT, POLISH],
  "крыло (купе) заднее пр.": [PREP, PRIME, PAINT, POLISH],
  "крыша": [PREP, PRIME, PAINT, POLISH],
  "порог лев.": [DA, PREP, PRIME, PAINT, POLISH],
  "порог пр.": [DA, PREP, PRIME, PAINT, POLISH],
  "стойка пер. лев.": [PREP, PRIME, PAINT, POLISH],
  "стойка пер. пр.": [PREP, PRIME, PAINT, POLISH],
  "стойка зад. лев.": [PREP, PRIME, PAINT, POLISH],
  "стойка зад. пр.": [PREP, PRIME, PAINT, POLISH],
  "проем двери пер. лев.": [PREP, PRIME, PAINT, POLISH],
  "проем двери пер. прав.": [PREP, PRIME, PAINT, POLISH],
  "проем двери зад. лев.": [PREP, PRIME, PAINT, POLISH],
  "проем двери зад. прав.": [PREP, PRIME, PAINT, POLISH],
  "proem двери (купе) пер. лев.": [PREP, PRIME, PAINT, POLISH],
  "проем двери (купе) пер. прав.": [PREP, PRIME, PAINT, POLISH],
  "подкапотное пространство": [PREP, PRIME, PAINT, POLISH],
  "багажник внутри": [PREP, PRIME, PAINT, POLISH],
  "обшивка потолка": [SU, DA],
  "зеркало лев.": [SU, DA, PREP, PRIME, PAINT, POLISH],
  "зеркало пр.": [SU, DA, PREP, PRIME, PAINT, POLISH],
  "ручка двери пер. лев.": [SU, PREP, PRIME, PAINT, POLISH],
  "ручка двери пер. пр.": [SU, PREP, PRIME, PAINT, POLISH],
  "ручка двери зад. лев.": [SU, PREP, PRIME, PAINT, POLISH],
  "ручка двери зад. прав.": [SU, PREP, PRIME, PAINT, POLISH],
  "фара пер. лев.": [SU], "фара пер. прав.": [SU],
  "фонарь зад. лев.": [SU], "фонарь зад. прав.": [SU],
  "подкрылок пер. лев.": [SU], "подкрылок пер. пр.": [SU],
  "подкрылок зад. лев.": [SU], "подкрылок зад. пр.": [SU]
};

export interface AdditionalExpense {
  id: string;
  description: string;
  price: number;
  includeInTotal: boolean;
}

export type OperationNotes = Record<string, Record<string, Record<string, string>>>;
export type CategoryNotes = Record<string, Record<string, string>>;

// Функция для генерации дефолтного каталога
function makeCatalog(rules: Record<string, string[]>): PartsCatalog {
  const catalog: PartsCatalog = {};
  for (const part of PART_LIST) {
    const cats = rules[part] || [];
    catalog[part] = cats.map((cat) => ({
      category: cat,
      operations: [...(CATEGORY_OPS[cat] || [])],
      coefficient: 1
    }));
  }
  return catalog;
}

export const DEFAULT_PARTS_CATALOG: PartsCatalog = makeCatalog(MASTER_RULES);