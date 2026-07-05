import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Trash2, ExternalLink, Calendar, Loader2 } from "lucide-react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { computeTotalBYN, PriceRow } from "../utils/calculatorState";
import { getPriceList } from "../utils/calculatorState"; // Функция заготовки под прайс-лист

interface SavedItem {
  id: string;
  clientName: string;
  clientPhone: string;
  carInfo: string;
  selectedDate: string;
  exchangeRate: number;
  clientCoefficient: number;
  selectedParts: string[];
  partsCatalog: any;
  detailCoefficients: any;
  globalCoefficient: number;
}

export default function SavedEstimatesPage() {
  const navigate = useNavigate();
  const [estimates, setEstimates] = useState<SavedItem[]>([]);
  const [priceData, setPriceData] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Подгружаем архив из Firestore Cloud и попутно прайс для расчета сумм
  useEffect(() => {
    async function loadData() {
      try {
        const prices = await getPriceList();
        setPriceData(prices);

        const q = query(collection(db, "estimates"), orderBy("selectedDate", "desc"));
        const snap = await getDocs(q);
        const list: SavedItem[] = [];
        snap.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as SavedItem);
        });
        setEstimates(list);
      } catch (err) {
        console.error("Ошибка архива:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Удаление сметы из облака
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Чтобы не сработало открытие сметы при клике на корзину
    if (!confirm("Вы уверены, что хотите удалить эту смету безвозвратно?")) return;
    
    try {
      await deleteDoc(doc(db, "estimates", id));
      setEstimates(estimates.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Ошибка удаления:", err);
    }
  };

  // Фильтр по ключевым словам
  const filtered = estimates.filter((item) => {
    const q = search.toLowerCase();
    return (
      (item.clientName || "").toLowerCase().includes(q) ||
      (item.clientPhone || "").toLowerCase().includes(q) ||
      (item.carInfo || "").toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div class="min-h-screen flex flex-col items-center justify-center bg-background gap-2">
        <Loader2 class="w-8 h-8 animate-spin text-[#013AD1]" />
        <span class="text-sm font-medium text-muted-foreground">Загрузка архива смет...</span>
      </div>
    );
  }

  return (
    <div class="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Шапка */}
      <div class="flex items-center gap-3 border-b pb-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          class="p-2 rounded-md border bg-white hover:bg-accent transition-colors cursor-pointer"
        >
          <ArrowLeft class="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 class="text-xl font-black tracking-tight text-foreground">Архив сохранённых смет</h1>
          <p class="text-xs text-muted-foreground font-medium">История расчётов кузовной станции ВоронаКар</p>
        </div>
      </div>

      {/* Поиск по архиву */}
      <div class="max-w-sm relative flex items-center">
        <Search class="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Поиск по клиенту, телефону или авто..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          class="w-full h-9 rounded-md border border-input bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#013AD1]"
        />
      </div>

      {/* Список сохраненных карточек */}
      {filtered.length > 0 ? (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            // Считаем суммы на лету на основе сохраненного состояния
            const baseBYN = computeTotalBYN(item as any, priceData);
            const clientBYN = baseBYN * (item.clientCoefficient || 1);
            const formattedDate = new Date(item.selectedDate).toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "short",
              year: "numeric"
            });

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/?id=${item.id}`)}
                class="border rounded-lg bg-card p-4 space-y-3 hover:border-[#013AD1] hover:shadow-retool-sm transition-all cursor-pointer group relative"
              >
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <h3 class="font-bold text-sm text-foreground group-hover:text-[#013AD1] transition-colors">
                      {item.clientName || "Без имени"}
                    </h3>
                    {item.clientPhone && (
                      <p class="text-xs text-muted-foreground font-mono mt-0.5">{item.clientPhone}</p>
                    )}
                  </div>
                  <div class="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded">
                    <Calendar class="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                <div class="text-xs text-foreground/80 bg-muted/30 px-2 py-1.5 rounded border border-dashed">
                  <span class="text-muted-foreground">Авто:</span> <span class="font-semibold">{item.carInfo || "—"}</span>
                </div>

                <div class="flex items-center justify-between pt-1 border-t text-xs">
                  <div class="flex gap-4">
                    <div>
                      <span class="text-[10px] text-muted-foreground block uppercase font-bold">Мастер</span>
                      <span class="font-bold font-mono text-foreground">{baseBYN.toFixed(1)} р.</span>
                    </div>
                    <div>
                      <span class="text-[10px] text-[#013AD1] block uppercase font-bold">Клиент</span>
                      <span class="font-extrabold font-mono text-[#013AD1]">{clientBYN.toFixed(1)} р.</span>
                    </div>
                  </div>

                  {/* Кнопки управления на карточке */}
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      class="p-1.5 text-muted-foreground hover:text-destructive rounded hover:bg-muted transition-colors cursor-pointer"
                      title="Удалить расчет"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                    <div class="p-1.5 text-[#013AD1] rounded bg-[#A2D0FE]/10 group-hover:bg-[#013AD1] group-hover:text-white transition-colors">
                      <ExternalLink class="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div class="py-12 text-center text-muted-foreground text-sm border border-dashed rounded-lg bg-muted/10">
          Архив пуст или совпадений не найдено
        </div>
      )}
    </div>
  );
}