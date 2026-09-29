import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sileo";
import App from "./App";
import "./tailwind.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* En Sileo "light" es el tema de toasts oscuros (pensado para páginas claras). */}
    <Toaster position="top-center" theme="light" />
    <App />
  </React.StrictMode>
);
