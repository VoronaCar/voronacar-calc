import { useState } from "react";
import { Trash2, ChevronDown, Plus } from "lucide-react";
import { CatalogRow, CATEGORY_OPS, OPERATION_COLORS } from "../../utils/calculatorData";

interface Props {
  partName: string;
  catalogRows: CatalogRow[];
  detailCoefficient: number;
  onCatalogChange: (rows: CatalogRow[]) => void;
  onDetailCoefficientChange: (k: number) => void;
}

export default function PartCard({
  partName,
  catalogRows,
  detailCoefficient,
  onCatalogChange,
  onDetailCoefficientChange
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const categories = Object.keys(CATEGORY_OPS);

  const addCategory = (cat: string) => {
    const ops = CATEGORY_OPS[cat] || [];
    const newRow: CatalogRow = {
      category: cat,
      operations: [...ops],
      coefficient: 1
    };
    onCatalogChange([...catalogRows, newRow]);
    setDropdownOpen(false);
  };

  const removeRow = (idx: number) => {
    onCatalogChange(catalogRows.filter((_, i) => i !== idx));
  };

  const updateRowCoeff = (idx: number, val: number) => {
    onCatalogChange(
      catalogRows.map((row, i) => (i === idx ? { ...row, coefficient: val } : row))
    );
  };

  const removeOperation = (rowIdx: number, op: string) => {
    const updated = catalogRows.map((row, i) => {
      if (i !== rowIdx) return row;
      return {
        ...row,
        operations: row.operations.filter((o) => o !== op)
      };
    }).filter((row) => row.operations.length > 0);
    onCatalogChange(updated);
  };

  const addOperation = (rowIdx: number, op: string) => {
    onCatalogChange(
      catalogRows.map((row, i) => {
        if (i !== rowIdx) return row;
        const allOps = CATEGORY_OPS[row.category] || [];
        const merged = allOps.filter((o) => row.operations.includes(o) || o === op);
        return { ...row, operations: merged };
      })
    );
  };

  return (
    <div class="border border-border rounded-lg overflow-hidden bg-card shadow-retool-sm p-4 space-y-3">
      {/* Шапка карточки */}
      <div class="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
        <h4 class="font-bold text-sm text-foreground truncate max-w-[180px]" title={partName}>
          {partName}
        </h4>
        
        <div class="flex items-center gap-2">
          {/* Коэффициент детали */}
          <div class="flex items-center gap-1">
            <span class="text-[11px] text-muted-foreground whitespace-nowrap">Коэфф:</span>
            <input
              type="number"
              step="0.1"
              min="0"
              value={detailCoefficient || 1}
              onChange={(e) => onDetailCoefficientChange(parseFloat(e.target.value) || 0)}
              class="w-12 h-7 rounded border border-input text-center text-xs focus:outline-none focus:ring-1 focus:ring-[#013AD1]"
            />
          </div>

          {/* Выпадающее меню добавления работ */}
          <div class="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              class="h-7 text-xs gap-1 px-2 border border-[#013AD1] text-[#013AD1] hover:bg-[#A2D0FE]/30 rounded flex items-center transition-colors font-medium cursor-pointer"
            >
              Добавить <ChevronDown class="w-3 h-3" />
            </button>
            
            {dropdownOpen && (
              <div class="absolute right-0 top-full mt-1 w-48 bg-white border rounded-md shadow-lg z-50 py-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => addCategory(cat)}
                    class="w-full text-left px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Таблица операций внутри детали */}
      {catalogRows.length > 0 ? (
        <div class="rounded-md border border-border overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-muted/40 border-b text-[11px] text-muted-foreground font-semibold">
                <th class="p-1.5 w-7 text-center"></th>
                <th class="p-1.5 w-12 text-center">Коэф.</th>
                <th class="p-1.5 w-24">Категория</th>
                <th class="p-1.5">Операции</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border text-xs">
              {catalogRows.map((row, rowIdx) => {
                const defaultOps = CATEGORY_OPS[row.category] || [];
                const removedOps = defaultOps.filter((o) => !row.operations.includes(o));

                return (
                  <tr key={rowIdx} class="hover:bg-muted/20">
                    <td class="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(rowIdx)}
                        class="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td class="p-1.5 text-center">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={row.coefficient}
                        onChange={(e) => updateRowCoeff(rowIdx, parseFloat(e.target.value) || 0)}
                        class="w-12 h-6 text-center border rounded border-input focus:outline-none focus:ring-1 focus:ring-[#013AD1]"
                      />
                    </td>
                    <td class="p-1.5 font-medium text-foreground whitespace-nowrap">{row.category}</td>
                    <td class="p-1.5">
                      <div class="flex flex-wrap gap-1 items-center">
                        {/* Активные теги операций */}
                        {row.operations.map((op) => (
                          <span
                            key={op}
                            style={{ backgroundColor: OPERATION_COLORS[op] || "#E0E0E0" }}
                            class="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded text-gray-800 font-medium whitespace-nowrap"
                          >
                            {op}
                            <button
                              type="button"
                              onClick={() => removeOperation(rowIdx, op)}
                              class="text-gray-500 hover:text-gray-900 transition-colors ml-0.5 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}

                        {/* Приглушенные теги удаленных операций — для возврата обратно в клик */}
                        {removedOps.map((op) => (
                          <button
                            key={op}
                            type="button"
                            onClick={() => addOperation(rowIdx, op)}
                            style={{ backgroundColor: OPERATION_COLORS[op] || "#E0E0E0" }}
                            class="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap opacity-35 hover:opacity-80 transition-opacity text-gray-800 cursor-pointer"
                          >
                            <Plus class="w-2.5 h-2.5" /> {op}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p class="text-xs text-muted-foreground italic text-center py-4">Нет операций, нажмите «Добавить»</p>
      )}
    </div>
  );
}