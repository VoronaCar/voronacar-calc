import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; // Файл стилей, который мы создадим следующим шагом

// Настройка для красивого отображения ошибок в процессе разработки
const rootOptions = {
  onCaughtError: (error: unknown, info: { componentStack?: string }) => {
    console.error(" Caught Error:", error, info.componentStack);
  },
  onUncaughtError: (error: unknown, info: { componentStack?: string }) => {
    console.error(" Uncaught Error:", error, info.componentStack);
  }
};

// Находим наше окно <div id="root"> из файла index.html
const rootElement = document.getElementById("root");

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement, rootOptions);
  
  root.render(
    <React.StrictMode>
      {/* BrowserRouter помогает приложению понимать, на какой вкладке (странице) мы сейчас находимся */}
      <BrowserRouter base="/voronacar-calc/">
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}