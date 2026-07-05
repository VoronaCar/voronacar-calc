import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, FileSpreadsheet, Check, Loader2 } from "lucide-react";
import { getPriceList, updatePriceList, PriceRow } from "../utils/calculatorState";
import { downloadPriceDb } from "../utils/exportEstimate";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [priceData, setPriceData] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [search, setSearch] = useState("");

  // Подгружаем актуальный прайс-лист из Firebase Cloud при открытии страницы
  useEffect(() => {
    async function loadPrices() {
      try {
        const data = await getPriceList();
        setPriceData(data);
      } catch (err) {
        console.error("Ошибка загрузки цен:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPrices();
  }, []);

  // Изменение цены операции прямо внутри ячейки таблицы
  const handlePriceChange = (id: string, newPrice: number) => {
    setPriceData(priceData.map((row) => (row.id === id ? { ...row, price: newPrice } : row)));
  };

  // Сохранение отредактированного прайс-листа в облако
  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await updatePriceList(priceData);
      if (success) {
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2500);
      }
    } catch (err) {
      console.error("Ошибка сохранения прайса:", err);
    } finally {
      setSaving(false);
    }
  };

  // Фильтрация строк по поисковому запросу
  const filteredData = priceData.filter(
    (r) =>
      r.category.toLowerCase().includes(search.toLowerCase()) ||
      r.operation.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div class="min-h-screen flex flex-col items-center justify-center bg-background gap-2">
        <Loader2 class="w-8 h-8 animate-spin text-[#013AD1]" />
        <span class="text-sm font-medium text-muted-foreground">Загрузка базы цен...</span>
      </div>
    );
  }

  return (
    <div class="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Шапка страницы настроек */}
      <div class="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div class="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            class="p-2 rounded-md border bg-white hover:bg-accent transition-colors cursor-pointer"
          >
            <ArrowLeft class="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 class="text-xl font-black tracking-tight text-foreground">База цен и нормативов</h1>
            <p class="text-xs text-muted-foreground">Редактирование стоимости технологических операций (BYN)</p>
          </div>
        </div>

        {/* Кнопки экспорта и сохранения */}
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={() => downloadPriceDb(priceData)}
            class="flex items-center gap-1.5 h-9 border bg-white text-foreground hover:bg-accent text-xs font-medium px-3 rounded-md transition-colors cursor-pointer"
          >
            <FileSpreadsheet class="w-4 h-4 text-emerald-600" /> Экспорт прайса
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            class="flex items-center gap-1.5 h-9 bg-[#013AD1] hover:bg-[#013AD1]/90 disabled:bg-muted text-white text-xs font-medium px-4 rounded-md transition-colors cursor-pointer"
          >
            {saving ? (
              <Loader2 class="w-3.5 h-3.5 animate-spin" />
            ) : justSaved ? (
              <Check class="w-3.5 h-3.5" />
            ) : (
              <Save class="w-4 h-4" />
            )}
            {saving ? "Сохранение..." : justSaved ? "Сохранено!" : "Сохранить прайс"}
          </button>
        </div>
      </div>

      {/* Поисковая панель */}
      <div class="max-w-sm">
        <input
          type="text"
          placeholder="Быстрый поиск по категории или операции..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          class="w-full h-9 rounded-md border border-input bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#013AD1]"
        />
      </div>

      {/* Таблица цен */}
      <div class="rounded-lg border bg-white overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-muted/60 border-b font-bold text-muted-foreground select-none">
              <th class="p-3 w-1/4">Категория</th>
              <th class="p-3 w-1/2">Технологическая операция</th>
              <th class="p-3 w-32 text-right">Стоимость (BYN)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border text-foreground">
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <tr key={row.id} class="hover:bg-muted/20 transition-colors">
                  <td class="p-3 font-semibold text-muted-foreground">{row.category}</td>
                  <td class="p-3 font-medium">{row.operation}</td>
                  <td class="p-3 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={row.price || ""}
                      onChange={(e) => handlePriceChange(row.id, parseFloat(e.target.value) || 0)}
                      class="w-24 h-7 text-xs text-right font-mono border rounded border-input bg-background px-2 focus:outline-none focus:ring-1 focus:ring-[#013AD1]"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} class="p-8 text-center text-muted-foreground italic">
                  Ничего не найдено по вашему запросу
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}