// frontend/js/dashboard.js
import { requireAuthOrRedirect, setupLogout } from "./auth.js";
import { listItems, deleteItem, updateItem } from "./api.js"; // plus de createItem ici

requireAuthOrRedirect();
setupLogout();

const tableBody = document.getElementById("tableBody");
const counter = document.getElementById("counter");

function daysUntil(dateStr) {
  const today = new Date();
  const d = new Date(dateStr + "T00:00:00");
  const diff = Math.ceil((d - new Date(today.toISOString().slice(0,10))) / (1000*60*60*24));
  return diff;
}
function statusBadge(dateStr) {
  const d = daysUntil(dateStr);
  if (d < 0) return `<span class="badge due">❌ Expiré</span>`;
  if (d <= 7) return `<span class="badge warn">⚠️ Bientôt (J-${d})</span>`;
  return `<span class="badge ok">✅ Valide</span>`;
}

async function refresh() {
  tableBody.innerHTML = `<tr><td colspan="5">Chargement...</td></tr>`;
  try {
    const items = await listItems();
    if (counter) counter.textContent = `${items.length} élément(s)`;
    if (!items.length) {
      tableBody.innerHTML = `<tr><td colspan="5">Aucun document pour le moment. Utilisez “+ Ajouter une date d’expiration”.</td></tr>`;
      return;
    }
    tableBody.innerHTML = items.map(it => `
      <tr data-id="${it.id}">
        <td>${it.name}</td>
        <td>${it.category || "-"}</td>
        <td>${it.expiration_date}</td>
        <td>${statusBadge(it.expiration_date)}</td>
        <td class="actions">
          <button class="pill" data-action="edit">Modifier</button>
          <button class="pill danger" data-action="delete">Supprimer</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="5"><div class="notice err">${err.message}</div></td></tr>`;
  }
}

tableBody?.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const tr = btn.closest("tr");
  const id = Number(tr.dataset.id);
  const action = btn.dataset.action;

  if (action === "delete") {
    if (!confirm("Supprimer ce document ?")) return;
    try { await deleteItem(id); await refresh(); }
    catch (err) { alert(err.message); }
  }

  if (action === "edit") {
    const name = prompt("Nom :", tr.children[0].textContent.trim());
    if (name === null) return;
    const category = prompt("Catégorie :", tr.children[1].textContent.trim());
    const expiration_date = prompt("Date d'expiration (YYYY-MM-DD) :", tr.children[2].textContent.trim());
    if (!name || !expiration_date) return alert("Nom et date requis.");
    try { await updateItem(id, { name, category, expiration_date }); await refresh(); }
    catch (err) { alert(err.message); }
  }
});

refresh();
