// frontend/js/login.js
import { login, setToken } from "./api.js";

const form = document.getElementById("loginForm");
const notice = document.getElementById("notice");

if (!form) console.error("loginForm introuvable dans login.html");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  notice.textContent = "";
  notice.className = "notice";

  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    const { token } = await login({ email, password });
    setToken(token);
    window.location.href = "./dashboard.html";
  } catch (err) {
    notice.textContent = err.message || "Échec de connexion";
    notice.classList.add("err");
  }
});
