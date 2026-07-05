import { useState } from "react";
import { FileSpreadsheet, Download, Printer, Save, Check, Loader2 } from "lucide-react";
import { cn } from "../../lib/shadcn/utils";
import { PartsCatalog, DetailCoefficients, AdditionalExpense, OperationNotes, CategoryNotes } from "../../utils/calculatorData";
import { PriceRow } from "../../utils/calculatorState";
import { downloadExcel } from "../../utils/exportEstimate";
import { fmtDate } from "../../utils/estimateHelpers";
import MasterEstimateBody from "./MasterEstimateBody";
import ClientEstimateBody from "./ClientEstimateBody";

interface Props {
  clientName: string;
  clientPhone: string;
  carInfo: string;
  selectedDate: Date;
  exchangeRate: number;
  clientCoefficient: number;
  selectedParts: string[];
  partsCatalog: PartsCatalog;
  detailCoefficients: DetailCoefficients;
  globalCoefficient: number;
  priceData: PriceRow[];
  additionalExpenses: AdditionalExpense[];
  setAdditionalExpenses: (v: AdditionalExpense[]) => void;
  operationNotes: OperationNotes;
  setOperationNotes: (v: OperationNotes) => void;
  categoryNotes: CategoryNotes;
  setCategoryNotes: (v: CategoryNotes) => void;
  estimateNote: string;
  setEstimateNote: (v: string) => void;
  onBack: () => void;
  onSave: () => Promise<boolean>;
  saving: boolean;
  isUpdate: boolean;
  savedLabel: string | null;
}

// Компонент красивой фирменной шапки, которая видна ТОЛЬКО при печати на А4
function PrintBanner() {
  return (
    <div class="print-only-banner bg-gradient-to-r from-[#8020CE] via-[#0030DC] to-[#002588] rounded-lg p-4 text-white flex items-center justify-between shadow-md mb-4">
      <div>
        <div class="text-2xl font-black tracking-wider"><span class="text-white">ВОРОНА</span><span class="text-[#99FFF6]">КАР</span></div>
        <div class="text-[11px] opacity-80 mt-1 font-medium">п. Привольный, ул. Озерная, 10 • voronacar.by</div>
      </div>
      <div class="text-right">
        <div class="text-sm font-black text-[#99FFF6]">+375 33 307 70 56</div>
        <div class="text-[10px] opacity-75 mt-0.5">Кузовной ремонт любой сложности</div>
      </div>
    </div>
  );
}

export default function EstimateStep(props: Props) {
  const [mode, setMode] = useState<"master" | "client">("master");
  const [showTotal, setShowTotal] = useState(true);
  const [showClientPrice, setShowClientPrice] = useState(true);
  const [briefMode, setBriefMode] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSaveClick = async () => {
    const success = await props.onSave();
    if (success) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    }
  };

  const handleExcelExport = () => {
    // Собираем полный стейт для выгрузки в Excel-генератор
    downloadExcel({
      mode,
      showTotal,
      showClientPrice,
      briefMode,
      clientName: props.clientName,
      clientPhone: props.clientPhone,
      carInfo: props.carInfo,
      selectedDate: props.selectedDate,
      exchangeRate: props.exchangeRate,
      clientCoefficient: props.clientCoefficient,
      estimateNote: props.estimateNote,
      selectedParts: props.selectedParts,
      partsCatalog: props.partsCatalog,
      detailCoefficients: props.detailCoefficients,
      globalCoefficient: props.globalCoefficient,
      priceData: props.priceData,
      operationNotes: props.operationNotes,
      categoryNotes: props.categoryNotes,
      additionalExpenses: props.additionalExpenses
    });
  };

  const isMaster = mode === "master";

  return (
    <div class="space-y-4">
      {/* Верхний тулбар управления сметой (Скрывается при печати) */}
      <div class="flex flex-wrap items-center justify-between gap-3 bg-muted/20 p-3 rounded-lg border no-print">
        {/* Переключатель режима: Для мастера / Для клиента */}
        <div class="flex rounded-md border border-border overflow-hidden text-xs font-semibold bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setMode("master")}
            class={cn("px-3 py-1.5 transition-colors cursor-pointer", isMaster ? "bg-[#013AD1] text-white" : "text-muted-foreground hover:bg-muted")}
          >
            Для мастера
          </button>
          <button
            type="button"
            onClick={() => setMode("client")}
            class={cn("px-3 py-1.5 transition-colors cursor-pointer", !isMaster ? "bg-[#013AD1] text-white" : "text-muted-foreground hover:bg-muted")}
          >
            Для клиента
          </button>
        </div>

        {/* Интерактивные кнопки: Excel, Печать/PDF */}
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExcelExport}
            class="flex items-center gap-1 h-8 border border-border text-foreground hover:bg-accent text-xs font-medium px-3 rounded-md transition-colors cursor-pointer bg-white"
          >
            <FileSpreadsheet class="w-3.5 h-3.5 text-emerald-600" /> Excel
          </button>
          
          <button
            type="button"
            onClick={() => window.print()}
            class="flex items-center gap-1 h-8 border border-[#013AD1] text-[#013AD1] hover:bg-[#A2D0FE]/20 text-xs font-medium px-3 rounded-md transition-colors cursor-pointer bg-white"
          >
            <Printer class="w-3.5 h-3.5" /> Печать / PDF
          </button>
        </div>
      </div>

      {/* Панель чекбоксов отображения колонок (Только для Мастера и только на экране) */}
      {isMaster && (
        <div class="flex flex-wrap items-center gap-x-5 gap-y-1.5 bg-muted/10 p-2.5 rounded-md border border-dashed no-print text-xs">
          <label class="flex items-center gap-1.5 cursor-pointer select-none font-medium">
            <input type="checkbox" checked={showTotal} onChange={(e) => setShowTotal(e.target.checked)} class="rounded text-[#013AD1] focus:ring-[#013AD1]" />
            Показывать базовую цену (Мастер)
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer select-none font-medium">
            <input type="checkbox" checked={showClientPrice} onChange={(e) => setShowClientPrice(e.target.checked)} class="rounded text-[#013AD1] focus:ring-[#013AD1]" />
            Показывать цену клиента
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer select-none font-medium">
            <input type="checkbox" checked={briefMode} onChange={(e) => setBriefMode(e.target.checked)} class="rounded text-[#013AD1] focus:ring-[#013AD1]" />
            Краткий вид (только категории)
          </label>
        </div>
      )}

      {/* КАРТОЧКА ИНФОРМАЦИИ О КЛИЕНТЕ И ЗАКАЗЕ */}
      <div class={cn("rounded-lg border p-4 space-y-2 bg-white shadow-sm", isMaster ? "border-[#A2D0FE] bg-[#A2D0FE]/5" : "border-border")}>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-xs">
          <div><span class="text-muted-foreground">Дата:</span> <span class="font-semibold text-foreground">{fmtDate(props.selectedDate)}</span></div>
          <div class="col-span-1"><span class="text-muted-foreground">Клиент:</span> <span class="font-semibold text-foreground">{props.clientName || "—"}</span></div>
          {props.clientPhone && <div><span class="text-muted-foreground">Тел:</span> <span class="font-semibold text-foreground font-mono">{props.clientPhone}</span></div>}
          <div><span class="text-muted-foreground">Авто:</span> <span class="font-semibold text-foreground">{props.carInfo || "—"}</span></div>
          {isMaster && (
            <>
              <div><span class="text-muted-foreground">Курс USD:</span> <span class="font-semibold text-foreground font-mono">{props.exchangeRate} BYN</span></div>
              <div><span class="text-muted-foreground">Коэфф. клиента:</span> <span class="font-semibold text-foreground font-mono">{props.clientCoefficient}</span></div>
            </>
          )}
        </div>

        {/* Поле ввода примечания к смете */}
        <div class="pt-2 border-t flex items-center gap-2">
          <span class="text-xs font-semibold text-muted-foreground shrink-0">Заметка к смете:</span>
          <input
            type="text"
            value={props.estimateNote}
            onChange={(e) => props.setEstimateNote(e.target.value)}
            placeholder="добавить общее примечание к документу..."
            class="flex-1 bg-transparent text-xs border-0 border-b border-dashed border-muted-foreground/30 focus:outline-none focus:border-[#013AD1] py-0.5"
          />
        </div>
      </div>

      {/* ТЕЛО СМЕТЫ (Контент печатной области) */}
      <div id="estimate-print-area" class="space-y-4">
        {/* Фирменный баннер ВОРОНА-КАР (Проявится только на бумаге/в PDF) */}
        <PrintBanner />

        {isMaster ? (
          <MasterEstimateBody
            selectedParts={props.selectedParts}
            partsCatalog={props.partsCatalog}
            detailCoefficients={props.detailCoefficients}
            globalCoefficient={props.globalCoefficient}
            exchangeRate={props.exchangeRate}
            clientCoefficient={props.clientCoefficient}
            priceData={props.priceData}
            showTotal={showTotal}
            showClientPrice={showClientPrice}
            briefMode={briefMode}
            operationNotes={props.operationNotes}
            setOperationNotes={props.setOperationNotes}
            categoryNotes={props.categoryNotes}
            setCategoryNotes={props.setCategoryNotes}
            additionalExpenses={props.additionalExpenses}
            setAdditionalExpenses={props.setAdditionalExpenses}
          />
        ) : (
          <ClientEstimateBody
            selectedParts={props.selectedParts}
            partsCatalog={props.partsCatalog}
            clientCoefficient={props.clientCoefficient}
            priceData={props.priceData}
            categoryNotes={props.categoryNotes}
            additionalExpenses={props.additionalExpenses}
          />
        )}
      </div>

      {/* НИЖНИЙ НАВИГАЦИОННЫЙ БЛОК: Кнопка Назад и Сохранение в Firebase Cloud */}
      <div class="flex items-center justify-between pt-2 border-t no-print">
        <button
          type="button"
          onClick={props.onBack}
          class="h-9 border border-[#013AD1] text-[#013AD1] hover:bg-[#A2D0FE]/30 text-sm font-medium px-4 rounded-md transition-colors cursor-pointer"
        >
          Назад
        </button>

        <div class="flex items-center gap-3">
          {props.savedLabel && !justSaved && (
            <span class="text-xs text-muted-foreground font-medium">{props.savedLabel}</span>
          )}
          {justSaved && (
            <span class="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check class="w-3.5 h-3.5" /> Смета успешно сохранена!
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveClick}
            disabled={props.saving}
            class="h-9 bg-[#013AD1] hover:bg-[#013AD1]/90 disabled:bg-muted text-white text-sm font-medium px-5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {props.saving ? (
              <>
                <Loader2 class="w-4 h-4 anonymity-spin animate-spin" /> Сохранение...
              </>
            ) : (
              <>
                <Save class="w-4 h-4" /> {props.isUpdate ? "Обновить смету" : "Сохранить в облако"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}