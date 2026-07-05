import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import CalculatorPage from "./pages/CalculatorPage";
import SettingsPage from "./pages/SettingsPage";
import SavedEstimatesPage from "./pages/SavedEstimatesPage";

// Специальный хук, который гарантирует, что калькулятор всегда будет в светлых тонах
// Это критически важно для чистой печати документов А4 без черных фонов
function useForceLightTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const enforceLight = () => {
      if (root.classList.contains("dark")) {
        root.classList.remove("dark");
      }
    };
    
    enforceLight();

    // Следим, чтобы никакие системные настройки телефона или компьютера не переключили тему в процессе
    const observer = new MutationObserver(() => enforceLight());
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    
    return () => observer.disconnect();
  }, []);
}

export default function App() {
  // Включаем принудительный светлый режим для смет
  useForceLightTheme();

  return (
    // Настраиваем систему вкладок и путей нашего приложения
    <Routes>
      {/* Главная страница — сам калькулятор */}
      <Route path="/" element={<CalculatorPage />} />
      
      {/* Страница со списком всех сохраненных ранее расчетов */}
      <Route path="/saved" element={<SavedEstimatesPage />} />
      
      {/* Страница управления базой цен и операций */}
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}