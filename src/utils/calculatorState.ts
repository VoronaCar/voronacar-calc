import { useState } from "react";
import { PartsCatalog, DetailCoefficients, AdditionalExpense, OperationNotes, CategoryNotes, DEFAULT_PARTS_CATALOG } from "./calculatorData";

// Описываем, как выглядит одна строка сырых данных из базы цен
export interface PriceRow {
  detail: string;
  operation: string;
  price: string;
  category?: string;
  color?: string;
}

// Описываем структуру "снимка" (снапшота) для сохранения в базу данных
export interface EstimateSnapshot {
  clientName: string;
  clientPhone: string;
  carInfo: string;
  selectedDate: string;
  exchangeRate: number;
  clientCoefficient: number;
  selectedParts: string[];
  globalCoefficient: number;
  partsCatalog: PartsCatalog;
  detailCoefficients: DetailCoefficients;
  additionalExpenses: AdditionalExpense[];
  operationNotes: OperationNotes;
  categoryNotes: CategoryNotes;
  estimateNote: string;
}

// Интерфейс для всего состояния нашего приложения
export interface CalculatorState {
  clientName: string;
  setClientName: (v: string) => void;
  clientPhone: string;
  setClientPhone: (v: string) => void;
  carInfo: string;
  setCarInfo: (v: string) => void;
  selectedDate: Date;
  setSelectedDate: (v: Date) => void;
  exchangeRate: number;
  setExchangeRate: (v: number) => void;
  clientCoefficient: number;
  setClientCoefficient: (v: number) => void;
  selectedParts: string[];
  setSelectedParts: (v: string[]) => void;
  globalCoefficient: number;
  setGlobalCoefficient: (v: number) => void;
  partsCatalog: PartsCatalog;
  setPartsCatalog: (v: PartsCatalog) => void;
  detailCoefficients: DetailCoefficients;
  setDetailCoefficients: (v: DetailCoefficients) => void;
  additionalExpenses: AdditionalExpense[];
  setAdditionalExpenses: (v: AdditionalExpense[]) => void;
  operationNotes: OperationNotes;
  setOperationNotes: (v: OperationNotes) => void;
  categoryNotes: CategoryNotes;
  setCategoryNotes: (v: CategoryNotes) => void;
  estimateNote: string;
  setEstimateNote: (v: string) => void;
  applySnapshot: (snap: EstimateSnapshot) => void;
}

// Функция подсчета базовой стоимости (чистый BYN без доп. расходов)
export function computeTotalBYN(
  state: Pick<CalculatorState, "selectedParts" | "partsCatalog" | "detailCoefficients" | "globalCoefficient">,
  priceData: PriceRow[]
): number {
  // Строим быструю карту для поиска цен
  const priceMap: Record<string, Record<string, number>> = {};
  for (const row of priceData) {
    const detail = (row.detail || "").trim();
    const operation = (row.operation || "").trim();
    const price = parseFloat(String(row.price || "").replace(",", "."));
    if (!priceMap[detail]) priceMap[detail] = {};
    priceMap[detail][operation] = isNaN(price) ? 0 : price;
  }

  let total = 0;
  for (const part of state.selectedParts) {
    const rows = state.partsCatalog[part] || [];
    const detailCoeff = state.detailCoefficients[part] || 1;
    
    for (const row of rows) {
      const rowCoeff = row.coefficient || 1;
      for (const op of row.operations) {
        const basePrice = (priceMap[part] && priceMap[part][op]) || 0;
        // Математика калькулятора: цена операции * коэфф. строки * коэфф. детали * общий коэфф.
        total += basePrice * rowCoeff * detailCoeff * state.globalCoefficient;
      }
    }
  }
  return total;
}

// Главный хук, управляющий всей памятью форм калькулятора
export function useCalculatorState(): CalculatorState {
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [carInfo, setCarInfo] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [exchangeRate, setExchangeRate] = useState(3.2); // Дефолтный курс доллара
  const [clientCoefficient, setClientCoefficient] = useState(1.2); // Дефолтный коэфф. клиента
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [globalCoefficient, setGlobalCoefficient] = useState(1.0);
  const [partsCatalog, setPartsCatalog] = useState<PartsCatalog>(DEFAULT_PARTS_CATALOG);
  const [detailCoefficients, setDetailCoefficients] = useState<DetailCoefficients>({});
  const [additionalExpenses, setAdditionalExpenses] = useState<AdditionalExpense[]>([]);
  const [operationNotes, setOperationNotes] = useState<OperationNotes>({});
  const [categoryNotes, setCategoryNotes] = useState<CategoryNotes>({});
  const [estimateNote, setEstimateNote] = useState("");

  // Функция для мгновенного восстановления калькулятора из сохраненного снапшота
  const applySnapshot = (snap: EstimateSnapshot) => {
    if (!snap) return;
    setClientName(snap.clientName || "");
    setClientPhone(snap.clientPhone || "");
    setCarInfo(snap.carInfo || "");
    const parsedDate = new Date(snap.selectedDate);
    setSelectedDate(isNaN(parsedDate.getTime()) ? new Date() : parsedDate);
    setExchangeRate(snap.exchangeRate ?? 3.2);
    setClientCoefficient(snap.clientCoefficient ?? 1.2);
    setSelectedParts(snap.selectedParts || []);
    setGlobalCoefficient(snap.globalCoefficient ?? 1.0);
    setPartsCatalog(snap.partsCatalog || DEFAULT_PARTS_CATALOG);
    setDetailCoefficients(snap.detailCoefficients || {});
    setAdditionalExpenses(snap.additionalExpenses || []);
    setOperationNotes(snap.operationNotes || {});
    setCategoryNotes(snap.categoryNotes || {});
    setEstimateNote(snap.estimateNote || "");
  };

  return {
    clientName, setClientName,
    clientPhone, setClientPhone,
    carInfo, setCarInfo,
    selectedDate, setSelectedDate,
    exchangeRate, setExchangeRate,
    clientCoefficient, setClientCoefficient,
    selectedParts, setSelectedParts,
    globalCoefficient, setGlobalCoefficient,
    partsCatalog, setPartsCatalog,
    detailCoefficients, setDetailCoefficients,
    additionalExpenses, setAdditionalExpenses,
    operationNotes, setOperationNotes,
    categoryNotes, setCategoryNotes,
    estimateNote, setEstimateNote,
    applySnapshot
  };
}

// Помощник для сборки текущего состояния перед отправкой в базу данных Firebase
export function buildSnapshot(state: CalculatorState): EstimateSnapshot {
  return {
    clientName: state.clientName,
    clientPhone: state.clientPhone,
    carInfo: state.carInfo,
    selectedDate: state.selectedDate.toISOString(),
    exchangeRate: state.exchangeRate,
    clientCoefficient: state.clientCoefficient,
    selectedParts: state.selectedParts,
    globalCoefficient: state.globalCoefficient,
    partsCatalog: state.partsCatalog,
    detailCoefficients: state.detailCoefficients,
    additionalExpenses: state.additionalExpenses,
    operationNotes: state.operationNotes,
    categoryNotes: state.categoryNotes,
    estimateNote: state.estimateNote
  };
}