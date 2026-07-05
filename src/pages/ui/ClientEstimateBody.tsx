import { PartsCatalog, CategoryNotes, AdditionalExpense, CATEGORY_COLORS } from "../../utils/calculatorData";
import { PriceRow } from "../../utils/calculatorState";
import { buildPriceMap, computeSections } from "../../utils/estimateHelpers";

interface Props {
  selectedParts: string[];
  partsCatalog: PartsCatalog;
  clientCoefficient: number;
  priceData: PriceRow[];
  categoryNotes: CategoryNotes;
  additionalExpenses: AdditionalExpense[];
}

export default function ClientEstimateBody({
  selectedParts, partsCatalog, clientCoefficient, priceData, categoryNotes, additionalExpenses
}: Props) {
  const priceMap = buildPriceMap(priceData);
  // Передаем пустые заметки операций, так как клиент видит только общие строки категорий
  const sections = computeSections(selectedParts, partsCatalog, {}, 1.0, priceMap, {});

  const grandClientBYN = sections.reduce((sum, p) => sum + p.partBYN, 0) * clientCoefficient;
  const extraBYN = additionalExpenses.filter((ee) => ee.includeInTotal).reduce((sum, ee) => sum + ee.price, 0);
  const totalWithExtras = grandClientBYN + extraBYN;

  return (
    <div class="space-y-4 text-sm">
      {/* Список кузовных элементов и услуг */}
      <div class="space-y-3">
        {sections.map(({ part, partBYN, cats }) => {
          const clientPartBYN = partBYN * clientCoefficient;

          return (
            <div key={part} class="border border-border rounded-lg overflow-hidden bg-white shadow-sm">
              {/* Шапка детали для клиента */}
              <div class="bg-muted/30 px-3 py-2 border-b flex justify-between items-center font-bold">
                <span class="text-foreground">{part}</span>
                <span class="text-[#013AD1] font-mono text-sm">{clientPartBYN.toFixed(2)} BYN</span>
              </div>

              {/* Категории работ по детали */}
              <div class="divide-y divide-border/40 text-xs">
                {cats.map((cat, ri) => {
                  const clientCatBYN = cat.catBYN * clientCoefficient;
                  const note = categoryNotes[part]?.[String(ri)] || "";

                  return (
                    <div key={ri} class="flex flex-col sm:flex-row sm:items-center gap-2 px-3 py-2 hover:bg-muted/10">
                      <div class="w-32 shrink-0">
                        <span
                          style={{ backgroundColor: CATEGORY_COLORS[cat.category] || "#E5E7EB" }}
                          class="inline-block px-2 py-0.5 rounded text-[11px] font-medium text-gray-800"
                        >
                          {cat.category}
                        </span>
                      </div>
                      <div class="w-24 shrink-0 font-semibold text-[#013AD1] font-mono">{clientCatBYN.toFixed(2)} BYN</div>
                      {note && <div class="text-muted-foreground italic truncate pl-2 border-l">Заметка: {note}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Дополнительные расходы для клиента (если они включены в итог) */}
      {additionalExpenses.some((e) => e.includeInTotal) && (
        <div class="border border-dashed border-[#A2D0FE] rounded-lg p-3 bg-white space-y-1.5">
          <div class="text-xs font-bold text-foreground border-b pb-1 mb-1">Дополнительные услуги и материалы</div>
          {additionalExpenses.filter((e) => e.includeInTotal).map((exp) => (
            <div key={exp.id} class="flex justify-between items-center text-xs text-foreground/80 py-0.5">
              <span>• {exp.description || "Дополнительный расход"}</span>
              <span class="font-semibold font-mono">{exp.price.toFixed(2)} BYN</span>
            </div>
          ))}
        </div>
      )}

      {/* Компактный чистый блок тотала для клиента */}
      <div id="estimate-print-area" class="rounded-lg bg-[#013AD1] text-white p-4 shadow-md flex justify-between items-center">
        <span class="text-sm font-bold uppercase tracking-wide">Итого к оплате:</span>
        <div class="text-right">
          <span class="text-xl font-black font-mono text-[#99FFF6]">{totalWithExtras.toFixed(2)} BYN</span>
        </div>
      </div>
    </div>
  );
}