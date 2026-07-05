import { useState } from "react";
import { cn } from "../../lib/shadcn/utils";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { fmtDate } from "../../utils/estimateHelpers";

// Константы для нашего календаря
const MONTHS_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];
const DAYS_RU = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

interface CalendarProps {
  value: Date;
  onChange: (d: Date) => void;
}

// Компактный встроенный календарь
function MiniCalendar({ value, onChange }: CalendarProps) {
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const firstDay = new Date(viewYear, viewMonth, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const isSelected = (day: number) =>
    value.getFullYear() === viewYear &&
    value.getMonth() === viewMonth &&
    value.getDate() === day;

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  return (
    <div class="p-3 w-64 select-none bg-white border rounded-md shadow-md">
      <div class="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth} class="p-1 rounded hover:bg-accent transition-colors">
          <ChevronLeft class="w-4 h-4" />
        </button>
        <span class="text-sm font-semibold">{MONTHS_RU[viewMonth]} {viewYear}</span>
        <button type="button" onClick={nextMonth} class="p-1 rounded hover:bg-accent transition-colors">
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
      <div class="grid grid-cols-7 mb-1">
        {DAYS_RU.map((d) => (
          <div key={d} class="text-center text-xs text-muted-foreground font-medium py-1">{d}</div>
        ))}
      </div>
      <div class="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => (
          <div key={idx} class="flex justify-center">
            {day !== null ? (
              <button
                type="button"
                onClick={() => onChange(new Date(viewYear, viewMonth, day))}
                class={cn(
                  "w-8 h-8 rounded-full text-sm transition-colors",
                  isSelected(day) && "bg-[#013AD1] text-white font-semibold",
                  isToday(day) && !isSelected(day) && "border border-[#013AD1] text-[#013AD1]",
                  !isSelected(day) && "hover:bg-accent text-foreground"
                )}
              >
                {day}
              </button>
            ) : (
              <div class="w-8 h-8" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props {
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
  onNext: () => void;
}

export default function ClientStep({
  clientName, setClientName,
  clientPhone, setClientPhone,
  carInfo, setCarInfo,
  selectedDate, setSelectedDate,
  exchangeRate, setExchangeRate,
  clientCoefficient, setClientCoefficient,
  onNext
}: Props) {
  const [calOpen, setCalOpen] = useState(false);

  return (
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-2xl mx-auto py-4">
      <div class="space-y-4">
        {/* Имя клиента */}
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-muted-foreground">Имя клиента</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Введите имя..."
            class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#013AD1]"
          />
        </div>

        {/* Телефон */}
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-muted-foreground">Телефон клиента</label>
          <input
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="+375 (XX) XXX-XX-XX"
            class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#013AD1]"
          />
        </div>

        {/* Автомобиль */}
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-muted-foreground">Автомобиль</label>
          <input
            type="text"
            value={carInfo}
            onChange={(e) => setCarInfo(e.target.value)}
            placeholder="Марка и госномер..."
            class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#013AD1]"
          />
        </div>
      </div>

      <div class="space-y-4">
        {/* Выбор даты */}
        <div class="space-y-1.5 relative">
          <label class="text-xs font-semibold text-muted-foreground">Дата расчёта</label>
          <button
            type="button"
            onClick={() => setCalOpen(!calOpen)}
            class="w-full h-9 flex items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm hover:bg-accent/50 transition-colors"
          >
            <span>{fmtDate(selectedDate)}</span>
            <CalendarIcon class="w-4 h-4 text-muted-foreground" />
          </button>
          
          {calOpen && (
            <div class="absolute z-50 top-full left-0 mt-1">
              <MiniCalendar
                value={selectedDate}
                onChange={(d) => {
                  setSelectedDate(d);
                  setCalOpen(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Курсы и Коэффициенты */}
        <div class="flex gap-4">
          <div class="space-y-1.5 flex-1">
            <label class="text-xs font-semibold text-muted-foreground">Курс USD (BYN)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={exchangeRate || ""}
              onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
              class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#013AD1]"
            />
          </div>

          <div class="space-y-1.5 flex-1">
            <label class="text-xs font-semibold text-muted-foreground">Коэфф. клиента</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={clientCoefficient || ""}
              onChange={(e) => setClientCoefficient(parseFloat(e.target.value) || 0)}
              class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#013AD1]"
            />
          </div>
        </div>

        {/* Кнопка "Дальше" */}
        <div class="pt-2">
          <button
            type="button"
            onClick={onNext}
            class="w-full h-9 bg-[#013AD1] hover:bg-[#013AD1]/90 text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
          >
            Дальше
          </button>
        </div>
      </div>
    </div>
  );
}