// frontend/js/register.js
import { register, setToken } from "./api.js";

const form = document.getElementById("registerForm");
const notice = document.getElementById("notice");

if (!form) console.error("registerForm introuvable dans register.html");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  notice.textContent = "";
  notice.className = "notice";

  const email = form.email.value.trim();
  const password = form.password.value;
  const name = form.name.value.trim();

  try {
    const { token } = await register({ email, password, name });
    setToken(token);
    window.location.href = "./dashboard.html";
  } catch (err) {
    notice.textContent = err.message || "Échec d'inscription";
    notice.classList.add("err");
  }
});
