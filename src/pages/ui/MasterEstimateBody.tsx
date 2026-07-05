import { Plus, Trash2 } from "lucide-react";
import { PartsCatalog, DetailCoefficients, AdditionalExpense, OperationNotes, CategoryNotes } from "../../utils/calculatorData";
import { PriceRow } from "../../utils/calculatorState";
import { buildPriceMap, computeSections, toUSD } from "../../utils/estimateHelpers";
import NoteInput from "./NoteInput";

interface Props {
  selectedParts: string[];
  partsCatalog: PartsCatalog;
  detailCoefficients: DetailCoefficients;
  globalCoefficient: number;
  exchangeRate: number;
  clientCoefficient: number;
  priceData: PriceRow[];
  showTotal: boolean;
  showClientPrice: boolean;
  briefMode: boolean;
  operationNotes: OperationNotes;
  setOperationNotes: (v: OperationNotes) => void;
  categoryNotes: CategoryNotes;
  setCategoryNotes: (v: CategoryNotes) => void;
  additionalExpenses: AdditionalExpense[];
  setAdditionalExpenses: (v: AdditionalExpense[]) => void;
}

// Служебный мини-компонент для ровного отображения ячеек стоимости
function PriceCells({ byn, cByn, rate, showTotal, showClientPrice, strong }: { byn: number; cByn: number; rate: number; showTotal: boolean; showClientPrice: boolean; strong?: boolean }) {
  const weight = strong ? "font-bold text-foreground" : "font-medium text-muted-foreground";
  return (
    <>
      {showTotal && (
        <>
          <span class={`self-center text-right tabular-nums text-xs ${weight}`}>{byn.toFixed(2)}</span>
          <span class="self-center text-right text-muted-foreground tabular-nums text-[10px] opacity-70">/{toUSD(byn, rate).toFixed(2)}$</span>
        </>
      )}
      {showClientPrice && (
        <>
          <span class="self-center text-right text-[#013AD1] font-semibold tabular-nums text-xs bg-[#A2D0FE]/20 rounded px-1">{cByn.toFixed(2)}</span>
          <span class="self-center text-right text-muted-foreground tabular-nums text-[10px] opacity-70">/{toUSD(cByn, rate).toFixed(2)}$</span>
        </>
      )}
    </>
  );
}

export default function MasterEstimateBody({
  selectedParts, partsCatalog, detailCoefficients, globalCoefficient,
  exchangeRate, clientCoefficient, priceData, showTotal, showClientPrice, briefMode,
  operationNotes, setOperationNotes, categoryNotes, setCategoryNotes,
  additionalExpenses, setAdditionalExpenses
}: Props) {
  const priceMap = buildPriceMap(priceData);
  const sections = computeSections(selectedParts, partsCatalog, detailCoefficients, globalCoefficient, priceMap, operationNotes);

  const setOpNote = (part: string, ri: number, op: string, note: string) => {
    setOperationNotes({
      ...operationNotes,
      [part]: {
        ...operationNotes[part],
        [String(ri)]: {
          ...(operationNotes[part]?.[String(ri)] || {}),
          [op]: note
        }
      }
    });
  };

  const setCatNote = (part: string, ri: number, note: string) => {
    setCategoryNotes({
      ...categoryNotes,
      [part]: {
        ...categoryNotes[part],
        [String(ri)]: note
      }
    });
  };

  const addExpense = () => {
    setAdditionalExpenses([
      ...additionalExpenses,
      { id: String(Date.now()), description: "", price: 0, includeInTotal: true }
    ]);
  };

  const updateExpense = (id: string, patch: Partial<AdditionalExpense>) => {
    setAdditionalExpenses(additionalExpenses.map((ee) => (ee.id === id ? { ...ee, ...patch } : ee)));
  };

  const removeExpense = (id: string) => {
    setAdditionalExpenses(additionalExpenses.filter((ee) => ee.id !== id));
  };

  const grandBYN = sections.reduce((sum, p) => sum + p.partBYN, 0);
  const extraBYN = additionalExpenses.filter((ee) => ee.includeInTotal).reduce((sum, ee) => sum + ee.price, 0);
  
  const totalWithExtras = grandBYN + extraBYN;
  const clientTotalWithExtras = (grandBYN * clientCoefficient) + extraBYN;

  // Настройка колонок сетки в зависимости от включенных чекбоксов цен
  const gridTemplate = `minmax(140px, 1.5fr) ${showTotal ? "5.5rem 3.5rem" : ""} ${showClientPrice ? "5.5rem 3.5rem" : ""} minmax(100px, 1fr)`;

  return (
    <div class="space-y-4 text-sm">
      {/* Шапка таблицы */}
      <div class="grid gap-x-3 items-center border-b pb-1.5 font-bold text-xs text-muted-foreground select-none" style={{ gridTemplateColumns: gridTemplate }}>
        <span>Деталь / Операция</span>
        {showTotal && <span class="text-right">Мастер (BYN/$)</span>}
        {showClientPrice && <span class="text-right text-[#013AD1]">Клиент (BYN/$)</span>}
        <span class="pl-2">Заметка</span>
      </div>

      {/* Отрисовка деталей и категорий */}
      <div class="space-y-3">
        {sections.map(({ part, partBYN, cats }) => (
          <div key={part} class="border border-border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Строка детали */}
            <div class="grid gap-x-3 items-center bg-muted/40 px-3 py-2 border-b" style={{ gridTemplateColumns: gridTemplate }}>
              <span class="font-bold text-foreground truncate">{part}</span>
              <PriceCells byn={partBYN} cByn={partBYN * clientCoefficient} rate={exchangeRate} showTotal={showTotal} showClientPrice={showClientPrice} strong />
              <div />
            </div>

            <div class="divide-y divide-border/50">
              {cats.map((cat, ri) => {
                const cCatBYN = cat.catBYN * clientCoefficient;
                const catNote = categoryNotes[part]?.[String(ri)] || "";

                if (briefMode) {
                  return (
                    <div key={ri} class="grid gap-x-3 items-center px-3 py-2" style={{ gridTemplateColumns: gridTemplate }}>
                      <span class="font-medium text-xs text-foreground/80 pl-2">{cat.category}</span>
                      <PriceCells byn={cat.catBYN} cByn={cCatBYN} rate={exchangeRate} showTotal={showTotal} showClientPrice={showClientPrice} />
                      <div class="pl-2 flex items-center">
                        <NoteInput value={catNote} onChange={(v) => setCatNote(part, ri, v)} />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={ri} class="p-2.5 bg-muted/5 space-y-1">
                    <div class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">{cat.category}</div>
                    
                    {/* Строки подуслуг */}
                    <div class="space-y-1">
                      {cat.opRows.map(({ op, byn, note }) => (
                        <div key={op} class="grid gap-x-3 items-center px-2 py-0.5 hover:bg-muted/30 rounded" style={{ gridTemplateColumns: gridTemplate }}>
                          <span class="text-xs text-foreground/70 pl-2">{op}</span>
                          <PriceCells byn={byn} cByn={byn * clientCoefficient} rate={exchangeRate} showTotal={showTotal} showClientPrice={showClientPrice} />
                          <div class="pl-2 flex items-center">
                            <NoteInput value={note} onChange={(v) => setOpNote(part, ri, op, v)} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Подсумма по категории */}
                    <div class="grid gap-x-3 items-center px-2 pt-1 border-t border-dashed border-muted/50 font-medium text-[11px]" style={{ gridTemplateColumns: gridTemplate }}>
                      <span class="text-muted-foreground italic pl-2">Итого {cat.category}:</span>
                      <PriceCells byn={cat.catBYN} cByn={cCatBYN} rate={exchangeRate} showTotal={showTotal} showClientPrice={showClientPrice} />
                      <div />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Блок дополнительных расходов */}
      <div class="border border-dashed border-[#A2D0FE] rounded-lg p-3 space-y-2 bg-white no-print">
        <div class="flex items-center justify-between border-b pb-1.5">
          <span class="text-xs font-bold text-foreground">Дополнительные расходы</span>
          <button
            type="button"
            onClick={addExpense}
            class="h-6 text-[11px] gap-1 px-2 border border-[#013AD1] text-[#013AD1] hover:bg-[#A2D0FE]/20 rounded flex items-center transition-colors font-medium cursor-pointer"
          >
            <Plus class="w-3 h-3" /> Добавить
          </button>
        </div>

        {additionalExpenses.length > 0 ? (
          <div class="space-y-2">
            {additionalExpenses.map((exp) => (
              <div key={exp.id} class="flex flex-wrap items-center gap-2 bg-muted/20 p-2 rounded border">
                <input
                  type="text"
                  placeholder="Описание расхода..."
                  value={exp.description}
                  onChange={(e) => updateExpense(exp.id, { description: e.target.value })}
                  class="flex-1 min-w-[160px] h-7 rounded border border-input bg-white px-2 text-xs focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="0.00"
                  value={exp.price || ""}
                  onChange={(e) => updateExpense(exp.id, { price: parseFloat(e.target.value) || 0 })}
                  class="w-20 h-7 rounded border border-input bg-white px-2 text-xs text-right font-mono"
                />
                <span class="text-xs text-muted-foreground font-mono">BYN</span>
                
                <label class="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none ml-2">
                  <input
                    type="checkbox"
                    checked={exp.includeInTotal}
                    onChange={(e) => updateExpense(exp.id, { includeInTotal: e.target.checked })}
                    class="rounded border-input text-[#013AD1] focus:ring-[#013AD1]"
                  />
                  в итог
                </label>

                <button
                  type="button"
                  onClick={() => removeExpense(exp.id)}
                  class="text-muted-foreground hover:text-destructive transition-colors ml-auto p-1"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p class="text-xs text-muted-foreground italic text-center py-2">Нет дополнительных расходов</p>
        )}
      </div>

      {/* Большой яркий синий блок Общих Итогов */}
      <div id="estimate-print-area" class="rounded-lg bg-[#013AD1] text-white p-4 space-y-2 shadow-retool-md">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 pb-2">
          <span class="text-sm font-bold uppercase tracking-wide">Общий итог работ</span>
          <div class="flex flex-wrap gap-5">
            {showTotal && (
              <div class="text-right">
                <span class="text-[10px] opacity-75 block">База (Мастер):</span>
                <span class="text-base font-bold font-mono">{grandBYN.toFixed(2)} BYN</span>
                <span class="text-xs opacity-75 ml-1.5 font-mono">/ {toUSD(grandBYN, exchangeRate).toFixed(2)}$</span>
              </div>
            )}
            {showClientPrice && (
              <div class="text-right border-l border-white/20 pl-4">
                <span class="text-[10px] opacity-90 block text-[#A2D0FE] font-semibold">Для клиента:</span>
                <span class="text-lg font-extrabold font-mono text-[#99FFF6]">{(grandBYN * clientCoefficient).toFixed(2)} BYN</span>
                <span class="text-xs opacity-80 ml-1.5 font-mono">/ {toUSD(grandBYN * clientCoefficient, exchangeRate).toFixed(2)}$</span>
              </div>
            )}
          </div>
        </div>

        {/* Финальный итог с доп. расходами */}
        {extraBYN > 0 && (
          <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span class="text-xs font-bold uppercase tracking-wide text-[#99FFF6]">Итого с доп. расходами:</span>
            <div class="flex flex-wrap gap-5">
              {showTotal && (
                <div class="text-right">
                  <span class="text-base font-bold font-mono">{totalWithExtras.toFixed(2)} BYN</span>
                  <span class="text-xs opacity-75 ml-1 font-mono">({toUSD(totalWithExtras, exchangeRate).toFixed(2)}$)</span>
                </div>
              )}
              {showClientPrice && (
                <div class="text-right">
                  <span class="text-base font-extrabold font-mono text-[#99FFF6]">{clientTotalWithExtras.toFixed(2)} BYN</span>
                  <span class="text-xs opacity-80 ml-1 font-mono">({toUSD(clientTotalWithExtras, exchangeRate).toFixed(2)}$)</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}