// frontend/js/auth.js
import { getToken, clearToken } from "./api.js";

export function requireAuthOrRedirect() {
  const token = getToken();
  if (!token) window.location.href = "./login.html";
}

export function setupLogout(btnId = "btnLogout") {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener("click", () => {
    clearToken();
    window.location.href = "./login.html";
  });
}
