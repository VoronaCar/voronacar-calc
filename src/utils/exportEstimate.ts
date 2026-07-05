import { EstimateExportState } from "./exportEstimate";
import { buildPriceMap, computeSections } from "./estimateHelpers";

export type EstimateExportState = any;

export async function downloadExcel(s: EstimateExportState) {
  const XLSX = await import("xlsx-js-style"); // Подгружаем визуальный Excel-плагин
  const isMaster = s.mode === "master";
  const showT = isMaster && s.showTotal;
  const showC = s.showClientPrice;

  const ws: Record<string, any> = {};
  const merges: any[] = [];
  let row = 0;

  // Функция для быстрой генерации стилизованных ячеек
  const cell = (v: any, style: any = {}) => ({
    v,
    t: typeof v === "number" ? "n" : "s",
    s: {
      border: {
        top: { style: "thin", color: { rgb: "CBD4E1" } },
        bottom: { style: "thin", color: { rgb: "CBD4E1" } },
        left: { style: "thin", color: { rgb: "CBD4E1" } },
        right: { style: "thin", color: { rgb: "CBD4E1" } }
      },
      font: { size: 10, name: "Arial" },
      ...style
    }
  });

  // 1. Шапка-баннер компании
  const bannerStyle1 = {
    font: { bold: true, size: 14, color: { rgb: "FFFFFF" } },
    fill: { patternType: "solid", fgColor: { rgb: "0028CC" } },
    alignment: { horizontal: "center", vertical: "center" }
  };
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = cell("ВоронаКар | Кузовной ремонт: +375 33 307-70-56", bannerStyle1);
  merges.push({ s: { r: row, c: 0 }, e: { r: row, c: isMaster ? 5 : 3 } });
  
  row++;
  const bannerStyle2 = {
    font: { size: 10, color: { rgb: "FFFFFF" }, italic: true },
    fill: { patternType: "solid", fgColor: { rgb: "1A3FCC" } },
    alignment: { horizontal: "center", vertical: "center" }
  };
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = cell("п. Привольный, ул. Озерная, 10 • voronacar.by", bannerStyle2);
  merges.push({ s: { r: row, c: 0 }, e: { r: row, c: isMaster ? 5 : 3 } });

  row += 2;

  // 2. Название документа
  const titleStyle = {
    font: { bold: true, size: 12, color: { rgb: "FFFFFF" } },
    fill: { patternType: "solid", fgColor: { rgb: "013AD1" } },
    alignment: { horizontal: "center", vertical: "center" }
  };
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = cell(isMaster ? "СМЕТА РАСЧЁТА (ДЛЯ МАСТЕРА)" : "СМЕТА РАСЧЁТА КЛИЕНТА", titleStyle);
  merges.push({ s: { r: row, c: 0 }, e: { r: row, c: isMaster ? 5 : 3 } });

  row += 2;

  // 3. Блок информации
  const lblStyle = { font: { bold: true }, fill: { patternType: "solid", fgColor: { rgb: "F0F4FF" } } };
  ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = cell("Дата:", lblStyle);
  ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = cell(new Date(s.selectedDate).toLocaleDateString("ru-RU"));
  ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = cell("Клиент:", lblStyle);
  ws[XLSX.utils.encode_cell({ r: row, c: 3 })] = cell(s.clientName || "—");

  if (isMaster) {
    ws[XLSX.utils.encode_cell({ r: row, c: 4 })] = cell("Авто:", lblStyle);
    ws[XLSX.utils.encode_cell({ r: row, c: 5 })] = cell(s.carInfo || "—");
  }

  row += 2;

  // 4. Заголовки таблицы
  const hdrStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { patternType: "solid", fgColor: { rgb: "013AD1" } },
    alignment: { horizontal: "center" }
  };

  const headers = isMaster 
    ? ["Деталь", "Категория", "Операция", "Мастер (BYN)", "Клиент (BYN)", "Заметки"]
    : ["Деталь", "Категория работы", "Сумма (BYN)", "Примечания"];

  headers.forEach((h, idx) => {
    ws[XLSX.utils.encode_cell({ r: row, c: idx })] = cell(h, hdrStyle);
  });

  row++;

  // 5. Заполнение строк данными
  const priceMap = buildPriceMap(s.priceData);
  const sections = computeSections(s.selectedParts, s.partsCatalog, s.detailCoefficients, s.globalCoefficient, priceMap, s.operationNotes);

  sections.forEach((partSec) => {
    // Строка детали
    const partHdrStyle = { font: { bold: true, size: 11 }, fill: { patternType: "solid", fgColor: { rgb: "E2EBFc" } } };
    ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = cell(partSec.part, partHdrStyle);
    merges.push({ s: { r: row, c: 0 }, e: { r: row, c: isMaster ? 5 : 3 } });
    row++;

    partSec.cats.forEach((cat) => {
      if (s.briefMode || !isMaster) {
        // Краткий вид
        ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = cell("");
        ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = cell(cat.category);
        ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = cell(cat.catBYN * (isMaster ? 1 : s.clientCoefficient), { alignment: { horizontal: "right" } });
        ws[XLSX.utils.encode_cell({ r: row, c: isMaster ? 5 : 3 })] = cell(s.categoryNotes[partSec.part]?.[cat.category] || "");
        row++;
      } else {
        // Полный вид со всеми мелкими операциями
        cat.opRows.forEach((opRow) => {
          ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = cell("");
          ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = cell(cat.category);
          ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = cell(opRow.op);
          ws[XLSX.utils.encode_cell({ r: row, c: 3 })] = cell(opRow.byn, { alignment: { horizontal: "right" } });
          ws[XLSX.utils.encode_cell({ r: row, c: 4 })] = cell(opRow.byn * s.clientCoefficient, { alignment: { horizontal: "right" } });
          ws[XLSX.utils.encode_cell({ r: row, c: 5 })] = cell(opRow.note);
          row++;
        });
      }
    });
  });

  // 6. Сборка книги Excel
  ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row, c: isMaster ? 5 : 3 } });
  ws["!merges"] = merges;
  ws["!cols"] = isMaster 
    ? [{ wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 20 }]
    : [{ wch: 22 }, { wch: 20 }, { wch: 14 }, { wch: 25 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Смета");
  XLSX.writeFile(wb, `smeta_${isMaster ? "master" : "client"}_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// Заглушка для совместимости выгрузки базы
export async function downloadPriceDb(data: any) {
  const XLSX = await import("xlsx-js-style");
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "База цен");
  XLSX.writeFile(wb, `baza_cen_${new Date().toISOString().slice(0,10)}.xlsx`);
}