import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MMEHub from "./mme-hub.jsx";

/* ── polyfill window.storage using localStorage ── */
if (!window.storage) {
  window.storage = {
    async get(key, _shared) {
      const val = localStorage.getItem(key);
      if (val === null) throw new Error("Key not found");
      return { value: val };
    },
    async set(key, value, _shared) {
      localStorage.setItem(key, value);
    },
    async remove(key, _shared) {
      localStorage.removeItem(key);
    },
  };
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MMEHub />
  </StrictMode>
);
