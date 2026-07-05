import { PartsCatalog, DetailCoefficients, AdditionalExpense } from "./calculatorData";
import { PriceRow } from "./calculatorState";

// Строим карту цен для быстрого поиска: detail -> operation -> price
export function buildPriceMap(priceData: PriceRow[]): Record<string, Record<string, number>> {
  const map: Record<string, Record<string, number>> = {};
  for (const row of priceData) {
    const detail = (row.detail || "").trim();
    const op = (row.operation || "").trim();
    const p = parseFloat(String(row.price || "").replace(",", "."));
    
    if (!map[detail]) map[detail] = {};
    map[detail][op] = isNaN(p) ? 0 : p;
  }
  return map;
}

// Перевод из BYN в USD
export function toUSD(byn: number, rate: number): number {
  return rate ? byn / rate : 0;
}

// Красивое форматирование даты на русском языке
export function fmtDate(d: Date): string {
  const MONTHS_RU_GEN = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабре"
  ];
  return `${d.getDate()} ${MONTHS_RU_GEN[d.getMonth()]} ${d.getFullYear()}`;
}

// Интерфейсы для структуры секций сметы
export interface OpRow {
  op: string;
  byn: number;
  note: string;
}

export interface CatSection {
  category: string;
  coefficient: number;
  catBYN: number;
  opRows: OpRow[];
}

export interface PartSection {
  part: string;
  partBYN: number;
  cats: CatSection[];
}

// Главная функция, которая просчитывает всю структуру сметы по деталям
export function computeSections(
  selectedParts: string[],
  partsCatalog: PartsCatalog,
  detailCoefficients: DetailCoefficients,
  globalCoefficient: number,
  priceMap: Record<string, Record<string, number>>,
  operationNotes: Record<string, Record<string, Record<string, string>>>
): PartSection[] {
  return selectedParts.map((part) => {
    const rows = partsCatalog[part] || [];
    const detailCoeff = detailCoefficients[part] || 1;
    let partBYN = 0;

    const cats: CatSection[] = rows.map((row, ri) => {
      let catBYN = 0;
      const opRows: OpRow[] = row.operations.map((op) => {
        const basePrice = (priceMap[part] && priceMap[part][op]) || 0;
        // Формула расчета: Базовая цена * Коэффициент строки * Коэффициент детали * Общий коэффициент
        const byn = basePrice * row.coefficient * detailCoeff * globalCoefficient;
        catBYN += byn;

        const note = (operationNotes[part] && operationNotes[part][String(ri)] && operationNotes[part][String(ri)][op]) || "";
        return { op, byn, note };
      });

      partBYN += catBYN;
      return {
        category: row.category,
        coefficient: row.coefficient,
        catBYN,
        opRows
      };
    });

    return { part, partBYN, cats };
  });
}