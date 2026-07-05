import { useState, useMemo } from "react";
import { Download, ArrowUpDown } from "lucide-react";
import { PartsCatalog, CATEGORY_COLORS, OPERATION_COLORS } from "../../utils/calculatorData";

interface FlatRow {
  part: string;
  category: string;
  operations: string[];
  coefficient: number;
  rowIndex: number; // индекс строки внутри массива в partsCatalog[part]
}

interface Props {
  selectedParts: string[];
  partsCatalog: PartsCatalog;
  setPartsCatalog: (v: PartsCatalog) => void;
  onBack: () => void;
  onNext: () => void;
}

// Превращаем древовидный каталог деталей в один плоский список строк для таблицы
function deriveFlatRows(selectedParts: string[], partsCatalog: PartsCatalog): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const part of selectedParts) {
    const catalogRows = partsCatalog[part] || [];
    catalogRows.forEach((row, idx) => {
      rows.push({
        part,
        category: row.category,
        operations: row.operations,
        coefficient: row.coefficient,
        rowIndex: idx
      });
    });
  }
  return rows;
}

// Функция для выгрузки отфильтрованных строк в Excel (CSV)
function downloadCSV(rows: FlatRow[]) {
  const header = ["Деталь", "Категория", "Что делаем", "Коэффициент"];
  const csvRows = rows.map((r) => [
    r.part,
    r.category,
    r.operations.join(" / "),
    String(r.coefficient)
  ]);

  const lines = [header, ...csvRows].map((cols) =>
    cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")
  );

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `operations_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OperationsStep({
  selectedParts,
  partsCatalog,
  setPartsCatalog,
  onBack,
  onNext
}: Props) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof FlatRow; direction: "asc" | "desc" } | null>(null);

  // Получаем и кэшируем плоские строки данных
  const rawData = useMemo(() => deriveFlatRows(selectedParts, partsCatalog), [selectedParts, partsCatalog]);

  // Изменение коэффициента прямо внутри таблицы
  const handleCoefficientChange = (part: string, rowIndex: number, value: number) => {
    const updated = { ...partsCatalog };
    if (updated[part] && updated[part][rowIndex]) {
      updated[part] = updated[part].map((row, idx) => 
        idx === rowIndex ? { ...row, coefficient: value } : row
      );
      setPartsCatalog(updated);
    }
  };

  // Логика сортировки колонок
  const handleSort = (key: keyof FlatRow) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Фильтрация и сортировка данных
  const processedRows = useMemo(() => {
    let rows = [...rawData];

    // Применяем текстовый фильтр поиска
    if (globalFilter) {
      const q = globalFilter.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.part.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q)
      );
    }

    // Применяем сортировку
    if (sortConfig) {
      const { key, direction } = sortConfig;
      rows.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];

        if (Array.isArray(valA)) valA = valA.join(", ");
        if (Array.isArray(valB)) valB = valB.join(", ");

        if (valA < valB) return direction === "asc" ? -1 : 1;
        if (valA > valB) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return rows;
  }, [rawData, globalFilter, sortConfig]);

  return (
    <div class="space-y-4">
      {/* Верхний тулбар: Поиск + Экспорт */}
      <div class="flex items-center gap-3 no-print">
        <input
          type="text"
          placeholder="Фильтр по детали или категории..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          class="max-w-xs h-8 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#013AD1]"
        />
        
        <button
          type="button"
          onClick={() => downloadCSV(processedRows)}
          class="flex items-center gap-1.5 h-8 border border-[#013AD1] text-[#013AD1] hover:bg-[#A2D0FE]/30 text-xs font-medium px-3 rounded-md transition-colors cursor-pointer"
        >
          <Download class="w-3.5 h-3.5" />
          Скачать CSV
        </button>

        <span class="ml-auto text-xs text-muted-foreground font-medium">
          Найдено строк: {processedRows.length}
        </span>
      </div>

      {/* Сама таблица TanStack-стиля */}
      {processedRows.length > 0 ? (
        <div class="rounded-md border overflow-x-auto bg-white shadow-retool-sm">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-muted/50 border-b text-muted-foreground font-semibold">
                <th class="p-2.5">
                  <button type="button" onClick={() => handleSort("part")} class="flex items-center gap-1 text-xs font-semibold hover:text-foreground cursor-pointer">
                    Деталь <ArrowUpDown class="w-3 h-3" />
                  </button>
                </th>
                <th class="p-2.5">
                  <button type="button" onClick={() => handleSort("category")} class="flex items-center gap-1 text-xs font-semibold hover:text-foreground cursor-pointer">
                    Категория <ArrowUpDown class="w-3 h-3" />
                  </button>
                </th>
                <th class="p-2.5 font-semibold">Что делаем?</th>
                <th class="p-2.5 w-24 text-right">
                  <button type="button" onClick={() => handleSort("coefficient")} class="flex items-center gap-1 text-xs font-semibold hover:text-foreground ml-auto cursor-pointer">
                    Коэффициент <ArrowUpDown class="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border text-foreground">
              {processedRows.map((row, idx) => {
                // Магия красивого объединения одинаковых названий деталей (group header style)
                const isFirstForPart = idx === 0 || processedRows[idx - 1].part !== row.part;

                return (
                  <tr key={idx} class="hover:bg-muted/10 transition-colors">
                    <td class="p-2.5 font-medium">
                      {isFirstForPart ? (
                        <span class="font-bold text-sm text-foreground">{row.part}</span>
                      ) : (
                        <span class="text-muted-foreground/30 font-mono text-[10px]">» то же самое</span>
                      )}
                    </td>
                    <td class="p-2.5">
                      <span
                        style={{ backgroundColor: CATEGORY_COLORS[row.category] || "#E5E7EB" }}
                        class="inline-block px-2 py-0.5 rounded text-[11px] font-medium text-gray-800"
                      >
                        {row.category}
                      </span>
                    </td>
                    <td class="p-2.5">
                      <div class="flex flex-wrap gap-1">
                        {row.operations.map((op) => (
                          <span
                            key={op}
                            style={{ backgroundColor: OPERATION_COLORS[op] || "#E5E7EB" }}
                            class="inline-block px-2 py-0.5 rounded text-[10px] font-medium text-gray-800"
                          >
                            {op}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td class="p-2.5 text-right">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={row.coefficient}
                        onChange={(e) => handleCoefficientChange(row.part, row.rowIndex, parseFloat(e.target.value) || 0)}
                        class="w-20 h-7 text-xs text-center border rounded border-input focus:outline-none focus:ring-1 focus:ring-[#013AD1] bg-background"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div class="py-12 text-center text-muted-foreground text-sm border border-dashed rounded-lg bg-muted/10">
          {selectedParts.length === 0 ? "Не выбрано ни одной детали" : "Нет строк, соответствующих вашему фильтру"}
        </div>
      )}

      {/* Кнопки Навигации Внизу */}
      <div class="flex gap-2 pt-2 no-print">
        <button
          type="button"
          onClick={onBack}
          class="h-9 border border-[#013AD1] text-[#013AD1] hover:bg-[#A2D0FE]/30 text-sm font-medium px-4 rounded-md transition-colors cursor-pointer"
        >
          Назад
        </button>
        <button
          type="button"
          onClick={onNext}
          class="ml-auto h-9 bg-[#013AD1] hover:bg-[#013AD1]/90 text-white text-sm font-medium px-6 rounded-md transition-colors cursor-pointer"
        >
          Сформировать смету
        </button>
      </div>
    </div>
  );
}