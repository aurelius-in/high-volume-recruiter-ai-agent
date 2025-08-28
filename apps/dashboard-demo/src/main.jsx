import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
const style = document.createElement('style');
style.innerHTML = `body{margin:0;background:#0b0d0b;color:#e0e0e0;font-family:system-ui,-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif}`;
document.head.appendChild(style);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


