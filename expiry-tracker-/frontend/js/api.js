// frontend/js/api.js

const API_BASE = "http://localhost:3000";

function getToken() {
  return localStorage.getItem("jwt") || "";
}
function setToken(t) {
  if (t) localStorage.setItem("jwt", t);
}
function clearToken() {
  localStorage.removeItem("jwt");
}

async function api(path, opts = {}) {
  const headers = opts.headers || {};
  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  headers["Content-Type"] = headers["Content-Type"] || "application/json";

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  let body = null;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) body = await res.json();
  if (!res.ok) {
    const msg = (body && (body.error || body.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

// ---- Auth ----
export async function register({ email, password, name }) {
  return api("/api/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password, name })
  });
}

export async function login({ email, password }) {
  return api("/api/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password })
  });
}

// ---- Items ----
export async function listItems() {
  return api("/api/items", { method: "GET" });
}

export async function createItem(payload) {
  return api("/api/items", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateItem(id, payload) {
  return api(`/api/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function deleteItem(id) {
  return api(`/api/items/${id}`, { method: "DELETE" });
}

// ---- Token helpers ----
export { getToken, setToken, clearToken };
