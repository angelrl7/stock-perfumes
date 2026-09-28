import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sileo";
import App from "./App";
import "./tailwind.css";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster position="top-right" />
    <App />
  </React.StrictMode>
);
