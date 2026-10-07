const API = "";

// Auth helpers
function getToken() { return localStorage.getItem("tx_token"); }
function getUser() { try { return JSON.parse(localStorage.getItem("tx_user") || "null"); } catch { return null; } }
function setAuth(token, user) { localStorage.setItem("tx_token", token); localStorage.setItem("tx_user", JSON.stringify(user)); }
function clearAuth() { localStorage.removeItem("tx_token"); localStorage.removeItem("tx_user"); }

// Toast
function toast(msg, type = "success") {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg; t.className = `toast ${type} show`;
  setTimeout(() => t.className = `toast ${type}`, 3000);
}

// API fetch helper
async function apiFetch(path, opts = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) };
  const res = await fetch(API + path, { ...opts, headers });
  if (res.status === 401) { clearAuth(); window.location.href = "/web/login.html"; return; }
  return res;
}

// Render navbar user area
function renderNav() {
  const area = document.getElementById("userArea");
  if (!area) return;
  const user = getUser();
  if (!user) {
    area.innerHTML = `<a href="/web/login.html" class="btn-signin">Sign In</a>`;
    return;
  }
  area.innerHTML = `
    <div class="credits-pill">💰 <span>${user.credits?.toLocaleString() || 0}</span></div>
    <div class="user-pill" onclick="toggleDropdown()">
      <img src="${user.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}" referrerpolicy="no-referrer" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'" alt="">
      <span>${user.username}</span>
      <span>▾</span>
      <div class="dropdown" id="userDropdown">
        <a href="/web/dashboard.html">📊 Dashboard</a>
        ${user.role === "admin" ? '<a href="/web/admin.html">🛡️ Admin</a>' : ""}
        <div class="divider"></div>
        <button class="danger" onclick="logout()">🚪 Sign Out</button>
      </div>
    </div>`;
}

function toggleDropdown() {
  const d = document.getElementById("userDropdown");
  if (d) d.classList.toggle("open");
}

function toggleMenu() {
  const links = document.getElementById("navLinks");
  if (links) links.style.display = links.style.display === "flex" ? "none" : "flex";
}

function logout() { clearAuth(); window.location.href = "/"; }

// Close dropdown on outside click
document.addEventListener("click", (e) => {
  const pill = e.target.closest(".user-pill");
  if (!pill) { const d = document.getElementById("userDropdown"); if (d) d.classList.remove("open"); }
});

// Format date
function fmtDate(d) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d));
}

const CAT_LABELS = { casual: "Casual", competitive: "Competitivo", creation: "Criação", special: "Evento Especial" };
const CAT_CLASS = { casual: "cat-casual", competitive: "cat-competitive", creation: "cat-creation", special: "cat-special" };
const STATUS_CLASS = { open: "status-open", running: "status-running", closed: "status-closed", finished: "status-closed", canceled: "status-closed" };
const STATUS_LABELS = { open: "Aberto", running: "Ao Vivo", closed: "Fechado", finished: "Finalizado", canceled: "Cancelado" };

renderNav();
