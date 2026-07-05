import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Settings, FolderOpen, RefreshCw, Loader2 } from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";

import { useCalculatorState, computeTotalBYN, buildSnapshot, getPriceList } from "../utils/calculatorState";
import { buildPriceMap } from "../utils/estimateHelpers";

import StepHeader from "./ui/StepHeader";
import ClientStep from "./ui/ClientStep";
import PartsStep from "./ui/PartsStep";
import OperationsStep from "./ui/OperationsStep";
import EstimateStep from "./ui/EstimateStep";

export default function CalculatorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const estimateId = searchParams.get("id"); // Проверяем, открыли ли мы старую смету

  const state = useCalculatorState();
  const [activeStep, setActiveStep] = useState(0);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedLabel, setSavedLabel] = useState<string | null>(null);

  // 1. Загрузка цен и восстановление сметы при старте
  useEffect(() => {
    async function initPage() {
      try {
        const prices = await getPriceList();
        setPriceData(prices);

        if (estimateId) {
          const docRef = doc(db, "estimates", estimateId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            state.applySnapshot(docSnap.data() as any);
            setActiveStep(3); // Мгновенно перебрасываем на шаг готовой сметы
            setSavedLabel("Документ открыт из облака");
          }
        }
      } catch (err) {
        console.error("Ошибка инициализации приложения:", err);
      } finally {
        setLoading(false);
      }
    }
    initPage();
  }, [estimateId]);

  // 2. Функция сохранения/обновления сметы в Firebase Cloud
  const handleSaveToCloud = async (): Promise<boolean> => {
    setSaving(true);
    try {
      const snap = buildSnapshot(state);
      // Если смета уже существует — обновляем её, если новая — генерируем ID
      const targetId = estimateId || doc(collection(db, "estimates")).id;
      
      await setDoc(doc(db, "estimates", targetId), snap);
      
      if (!estimateId) {
        // Меняем адресную строку без перезагрузки, чтобы смета превратилась в «редактируемую»
        navigate(`/?id=${targetId}`, { replace: true });
      }
      setSavedLabel("Изменения сохранены в облаке");
      return true;
    } catch (err) {
      console.error("Ошибка сохранения в Firebase:", err);
      alert("Не удалось сохранить смету. Проверьте сеть.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // 3. Сброс калькулятора (Очистить всё)
  const handleReset = () => {
    if (!confirm("Очистить все поля и сбросить текущий расчет сметы?")) return;
    window.location.href = window.location.pathname; // Чистая перезагрузка без ID
  };

  // Считаем сумму мастера на лету
  const totalBYN = computeTotalBYN(state, priceData);

  if (loading) {
    return (
      <div class="min-h-screen flex flex-col items-center justify-center bg-background gap-2">
        <Loader2 class="w-8 h-8 animate-spin text-[#013AD1]" />
        <span class="text-sm font-medium text-muted-foreground">Запуск калькулятора ВоронаКар...</span>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-background flex flex-col">
      {/* ГЛАВНАЯ СИСТЕМНАЯ ШАПКА ПРИЛОЖЕНИЯ (Прячется при печати) */}
      <header class="h-14 border-b bg-card px-4 flex items-center justify-between shadow-sm sticky top-0 z-40 no-print">
        <div class="flex items-center gap-6">
          {/* Фирменный логотип */}
          <div onClick={() => navigate("/")} class="text-lg font-black tracking-wider cursor-pointer select-none">
            <span class="text-foreground">ВОРОНА</span><span class="text-[#013AD1]">КАР</span>
          </div>
          
          {/* Навигатор по шагам */}
          <StepHeader activeStep={activeStep} onStepChange={setActiveStep} />
        </div>

        {/* Служебные утилиты справа */}
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            class="flex items-center gap-1 h-8 text-xs font-medium px-2.5 rounded-md border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-white cursor-pointer"
            title="Очистить и создать новую смету"
          >
            <RefreshCw class="w-3.5 h-3.5" /> Сбросить
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/saved")}
            class="flex items-center gap-1 h-8 text-xs font-medium px-2.5 rounded-md border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-white cursor-pointer"
          >
            <FolderOpen class="w-3.5 h-3.5 text-amber-500" /> Архив смет
          </button>
          
          <button
            type="button"
            onClick={() => navigate("/settings")}
            class="flex items-center gap-1 h-8 text-xs font-medium px-2.5 rounded-md border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-white cursor-pointer"
          >
            <Settings class="w-3.5 h-3.5 text-slate-500" /> База цен
          </button>
        </div>
      </header>

      {/* ОСНОВНОЙ КОНТЕНТ ТЕКУЩЕГО ШАГА */}
      <main class="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6">
        {activeStep === 0 && (
          <ClientStep
            clientName={state.clientName} setClientName={state.setClientName}
            clientPhone={state.clientPhone} setClientPhone={state.setClientPhone}
            carInfo={state.carInfo} setCarInfo={state.setCarInfo}
            selectedDate={state.selectedDate} setSelectedDate={state.setSelectedDate}
            exchangeRate={state.exchangeRate} setExchangeRate={state.setExchangeRate}
            clientCoefficient={state.clientCoefficient} setClientCoefficient={state.setClientCoefficient}
            onNext={() => setActiveStep(1)}
          />
        )}

        {activeStep === 1 && (
          <PartsStep
            selectedParts={state.selectedParts} setSelectedParts={state.setSelectedParts}
            partsCatalog={state.partsCatalog} setPartsCatalog={state.setPartsCatalog}
            detailCoefficients={state.detailCoefficients} setDetailCoefficients={state.setDetailCoefficients}
            globalCoefficient={state.globalCoefficient} setGlobalCoefficient={state.setGlobalCoefficient}
            exchangeRate={state.exchangeRate} clientCoefficient={state.clientCoefficient}
            totalBYN={totalBYN}
            onNext={() => setActiveStep(2)}
          />
        )}

        {activeStep === 2 && (
          <OperationsStep
            selectedParts={state.selectedParts}
            partsCatalog={state.partsCatalog} setPartsCatalog={state.setPartsCatalog}
            onBack={() => setActiveStep(1)}
            onNext={() => setActiveStep(3)}
          />
        )}

        {activeStep === 3 && (
          <EstimateStep
            clientName={state.clientName} clientPhone={state.clientPhone} carInfo={state.carInfo}
            selectedDate={state.selectedDate} exchangeRate={state.exchangeRate} clientCoefficient={state.clientCoefficient}
            selectedParts={state.selectedParts} partsCatalog={state.partsCatalog} detailCoefficients={state.detailCoefficients}
            globalCoefficient={state.globalCoefficient} priceData={priceData}
            additionalExpenses={state.additionalExpenses} setAdditionalExpenses={state.setAdditionalExpenses}
            operationNotes={state.operationNotes} setOperationNotes={state.setOperationNotes}
            categoryNotes={state.categoryNotes} setCategoryNotes={state.setCategoryNotes}
            estimateNote={state.estimateNote} setEstimateNote={state.setEstimateNote}
            onBack={() => setActiveStep(2)}
            onSave={handleSaveToCloud}
            saving={saving}
            isUpdate={!!estimateId}
            savedLabel={savedLabel}
          />
        )}
      </main>
    </div>
  );
}