import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "../../lib/shadcn/utils";
import { PART_LIST, PartsCatalog, DetailCoefficients, DEFAULT_PARTS_CATALOG } from "../../utils/calculatorData";
import PartCard from "./PartCard";

interface Props {
  selectedParts: string[];
  setSelectedParts: (v: string[]) => void;
  partsCatalog: PartsCatalog;
  setPartsCatalog: (v: PartsCatalog) => void;
  detailCoefficients: DetailCoefficients;
  setDetailCoefficients: (v: DetailCoefficients) => void;
  globalCoefficient: number;
  setGlobalCoefficient: (v: number) => void;
  exchangeRate: number;
  clientCoefficient: number;
  totalBYN: number;
  onNext: () => void;
}

export default function PartsStep({
  selectedParts, setSelectedParts,
  partsCatalog, setPartsCatalog,
  detailCoefficients, setDetailCoefficients,
  globalCoefficient, setGlobalCoefficient,
  exchangeRate, clientCoefficient,
  totalBYN, onNext
}: Props) {
  const [comboOpen, setComboOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const totalUSD = exchangeRate ? totalBYN / exchangeRate : 0;
  const clientBYN = totalBYN * clientCoefficient;
  const clientUSD = exchangeRate ? clientBYN / exchangeRate : 0;

  const togglePart = (part: string) => {
    if (selectedParts.includes(part)) {
      setSelectedParts(selectedParts.filter((p) => p !== part));
    } else {
      setSelectedParts([...selectedParts, part]);
      if (!partsCatalog[part]) {
        const seed = DEFAULT_PARTS_CATALOG[part] || [];
        setPartsCatalog({
          ...partsCatalog,
          [part]: seed.map((r) => ({ ...r, operations: [...r.operations] }))
        });
      }
    }
  };

  const filteredParts = PART_LIST.filter((p) =>
    p.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div class="space-y-5">
      {/* Сетка статистических карточек со стоимостью */}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="border border-[#A2D0FE] bg-white rounded-lg p-3 shadow-retool-sm">
          <p class="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Мастер (BYN)</p>
          <p class="text-base font-bold text-[#013AD1] font-mono">{totalBYN.toFixed(2)}</p>
        </div>
        <div class="border border-[#A2D0FE] bg-white rounded-lg p-3 shadow-retool-sm">
          <p class="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Мастер (USD)</p>
          <p class="text-base font-bold text-[#013AD1] font-mono">{totalUSD.toFixed(2)}</p>
        </div>
        <div class="border border-[#A2D0FE] bg-[#A2D0FE]/15 rounded-lg p-3 shadow-retool-sm">
          <p class="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Клиент (BYN)</p>
          <p class="text-base font-bold text-[#013AD1] font-mono">{clientBYN.toFixed(2)}</p>
        </div>
        <div class="border border-[#A2D0FE] bg-[#A2D0FE]/15 rounded-lg p-3 shadow-retool-sm">
          <p class="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Клиент (USD)</p>
          <p class="text-base font-bold text-[#013AD1] font-mono">{clientUSD.toFixed(2)}</p>
        </div>
      </div>

      {/* Панель управления: выбор деталей и общий коэффициент */}
      <div class="flex flex-wrap items-end gap-4 bg-muted/30 p-3 rounded-lg border border-border">
        {/* Поисковый мультиселект выпадающий список */}
        <div class="flex-1 min-w-[240px] space-y-1.5 relative">
          <label class="text-xs font-semibold text-foreground">Выберите детали автомобиля</label>
          <button
            type="button"
            onClick={() => setComboOpen(!comboOpen)}
            class="w-full h-9 flex items-center justify-between rounded-md border border-input bg-white px-3 py-1 text-sm font-normal shadow-sm hover:bg-accent/50 transition-colors cursor-pointer"
          >
            <span class="truncate">
              {selectedParts.length > 0 ? `Выбрано: ${selectedParts.length} деталей` : "Выберите детали..."}
            </span>
            <ChevronsUpDown class="w-4 h-4 text-muted-foreground opacity-50" />
          </button>

          {comboOpen && (
            <div class="absolute left-0 top-full mt-1 w-full max-h-60 bg-white border rounded-md shadow-lg z-50 flex flex-col overflow-hidden">
              <input
                type="text"
                placeholder="Поиск детали..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                class="w-full h-8 px-3 border-b text-xs focus:outline-none"
              />
              <div class="overflow-y-auto flex-1 py-1 divide-y divide-muted/50">
                {filteredParts.length > 0 ? (
                  filteredParts.map((part) => {
                    const isIncluded = selectedParts.includes(part);
                    return (
                      <button
                        key={part}
                        type="button"
                        onClick={() => togglePart(part)}
                        class="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors flex items-center justify-between"
                      >
                        <span>{part}</span>
                        {isIncluded && <Check class="w-3.5 h-3.5 text-[#013AD1]" />}
                      </button>
                    );
                  })
                ) : (
                  <p class="text-xs text-muted-foreground text-center py-2">Ничего не найдено</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Общий коэффициент сметы */}
        <div class="w-36 space-y-1.5">
          <label class="text-xs font-semibold text-foreground">Общий коэфф.</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={globalCoefficient || ""}
            onChange={(e) => setGlobalCoefficient(parseFloat(e.target.value) || 1.0)}
            class="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#013AD1]"
          />
        </div>
      </div>

      {/* Горизонтальная лента быстрых "чипсов" для мгновенного удаления детали */}
      {selectedParts.length > 0 && (
        <div class="flex flex-wrap gap-1.5">
          {selectedParts.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => togglePart(p)}
              style={{ background: "rgba(162, 208, 254, 0.15)" }}
              class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full text-[#013AD1] border border-[#A2D0FE] hover:bg-[#013AD1] hover:text-white transition-all cursor-pointer"
            >
              <span>{p}</span>
              <span class="opacity-60 text-[11px] font-bold">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Сетка карточек деталей */}
      {selectedParts.length > 0 ? (
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectedParts.map((part) => (
            <PartCard
              key={part}
              partName={part}
              catalogRows={partsCatalog[part] || []}
              detailCoefficient={detailCoefficients[part] || 1.0}
              onCatalogChange={(rows) => setPartsCatalog({ ...partsCatalog, [part]: rows })}
              onDetailCoefficientChange={(k) => setDetailCoefficients({ ...detailCoefficients, [part]: k })}
            />
          ))}
        </div>
      ) : (
        <div class="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/10">
          <p class="text-xs font-medium">Выберите детали выше для настройки технологических операций</p>
        </div>
      )}

      {/* Кнопка навигации дальше */}
      <div class="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          class="w-full sm:w-auto h-9 bg-[#013AD1] hover:bg-[#013AD1]/90 text-white text-sm font-medium px-6 rounded-md transition-colors cursor-pointer"
        >
          Дальше
        </button>
      </div>
    </div>
  );
}