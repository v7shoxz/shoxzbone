const API_BASE = `${location.origin}/api/v2`;
const ADMIN_BASE = `${location.origin}/admin`;

// Pega a key da URL e salva no localStorage (persiste entre sessões)
const _urlKey = new URLSearchParams(location.search).get("key");
if (_urlKey) {
  localStorage.setItem("dashKey", _urlKey);
  history.replaceState({}, "", "/dashboard/");
}
const DASH_KEY = localStorage.getItem("dashKey") || "";

// Token Discord
const _urlToken = new URLSearchParams(location.search).get("token");
if (_urlToken) {
  localStorage.setItem("dashToken", _urlToken);
  history.replaceState({}, "", "/dashboard/");
}
const DASH_TOKEN = localStorage.getItem("dashToken") || "";

const HEADERS = {
  "Content-Type": "application/json",
  "backbone_app_id": "8561191D-03B7-423E-B779-D2F6E77A3A45",
  "x-unity-version": "2021.3.0f1",
  "access_token": "dashboard-public",
};

const STATUS = {
  "-1": { label: "Desconhecido", cls: "badge-unknown" },
  "0":  { label: "Não Iniciado", cls: "badge-notstarted" },
  "1":  { label: "Aberto",       cls: "badge-open" },
  "2":  { label: "Fechado",      cls: "badge-notstarted" },
  "3":  { label: "Finalizado",   cls: "badge-finished" },
  "4":  { label: "Cancelado",    cls: "badge-canceled" },
  "5":  { label: "Ao Vivo",      cls: "badge-live" },
};

// ── State ────────────────────────────────────────────────────────────────────
let allTournaments = [];
let adminTournaments = [];
let currentFilter = "all";
let currentPage = 1;
let totalCount = 0;
let searchQuery = "";
let adminKey = null;
let woTournamentId = null;
let realtimeInterval = null;

// ── Auth ─────────────────────────────────────────────────────────────────────
function toggleAdminPanel() {
  if (adminKey) {
    document.getElementById("admin-panel").classList.toggle("hidden");
  } else {
    document.getElementById("admin-login").classList.remove("hidden");
    document.getElementById("admin-key-input").focus();
  }
}

async function loginAdmin() {
  const key = document.getElementById("admin-key-input").value.trim();
  if (!key) return;

  // Testa a chave fazendo uma requisição real
  try {
    const res = await fetch(`${ADMIN_BASE}/tournaments?limit=1`, {
      headers: { "x-admin-key": key },
    });
    if (!res.ok) throw new Error();
    adminKey = key;
    document.getElementById("admin-login").classList.add("hidden");
    document.getElementById("admin-panel").classList.remove("hidden");
    document.getElementById("admin-login-err").classList.add("hidden");

    // Atualiza sidebar
    const box = document.getElementById("admin-status-box");
    box.classList.add("unlocked");
    document.getElementById("admin-status-title").textContent = "Acesso liberado";
    document.getElementById("admin-status-desc").textContent = "Painel admin ativo. Você pode criar, editar e gerenciar torneios.";

    loadAdminTournaments();
    startRealtime();
    renderManageList();
  } catch {
    document.getElementById("admin-login-err").classList.remove("hidden");
  }
}

function logoutAdmin() {
  adminKey = null;
  document.getElementById("admin-panel").classList.add("hidden");
  stopRealtime();
  const box = document.getElementById("admin-status-box");
  box.classList.remove("unlocked");
  document.getElementById("admin-status-title").textContent = "Acesso restrito";
  document.getElementById("admin-status-desc").textContent = "Clique em \"Admin\" no topo para autenticar.";
}

// ── Realtime ─────────────────────────────────────────────────────────────────
function startRealtime() {
  stopRealtime();
  realtimeInterval = setInterval(() => {
    load(currentPage, true);
    if (adminKey) loadAdminTournaments(true);
  }, 15000);
}

function stopRealtime() {
  if (realtimeInterval) clearInterval(realtimeInterval);
}

// ── Public API ────────────────────────────────────────────────────────────────
async function fetchTournaments(page = 1) {
  const now = new Date();
  const since = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const until = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  const res = await fetch(`${API_BASE}/tournamentGetList`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ sinceDate: since.toISOString(), untilDate: until.toISOString(), maxResults: 20, page, accessToken: "dashboard-public" }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Admin API ─────────────────────────────────────────────────────────────────
function adminHeaders() {
  return { "Content-Type": "application/json", "x-admin-key": adminKey };
}

async function loadAdminTournaments(silent = false) {
  if (!adminKey) return;
  try {
    const res = await fetch(`${ADMIN_BASE}/tournaments?limit=100`, { headers: adminHeaders() });
    const data = await res.json();
    adminTournaments = data.tournaments || [];
    if (!silent) renderManageList();
  } catch {}
}

async function createTournament() {
  const name = document.getElementById("f-name").value.trim();
  const id = document.getElementById("f-id").value.trim();
  if (!name || !id) return showResult("create-result", "Nome e ID são obrigatórios.", false);

  const start = new Date(document.getElementById("f-start").value);
  const signup = new Date(document.getElementById("f-signup").value);
  const phaseType = parseInt(document.getElementById("f-phase").value);
  const rounds = parseInt(document.getElementById("f-rounds").value);
  const maxTeams = parseInt(document.getElementById("f-maxteams").value);

  const body = {
    TournamentId: id,
    TournamentName: name,
    TournamentImage: document.getElementById("f-image").value.trim() || undefined,
    TournamentColor: document.getElementById("f-color").value,
    StartTime: start,
    SignupStart: signup,
    MaxInvites: parseInt(document.getElementById("f-maxinvites").value),
    CurrentInvites: 0,
    PartySize: parseInt(document.getElementById("f-partysize").value),
    MinPlayersPerMatch: parseInt(document.getElementById("f-minplayers").value),
    MaxPlayersPerMatch: parseInt(document.getElementById("f-maxplayers").value),
    EntryFee: 0,
    PrizepoolId: Date.now().toString(),
    Status: 0,
    TournamentType: parseInt(document.getElementById("f-type").value),
    Region: document.getElementById("f-region").value,
    RoundCount: rounds,
    CurrentPhaseId: 0,
    Phases: [{ PhaseType: phaseType, IsPhase: false, RoundCount: rounds, MaxTeams: maxTeams, Maps: [] }],
    Properties: {
      IsInvitationOnly: false,
      InvitedIds: [],
      DisabledEmotes: [],
      AdminIds: [],
      StreamURL: document.getElementById("f-stream").value.trim(),
    },
  };

  try {
    const res = await fetch(`${ADMIN_BASE}/tournaments`, {
      method: "POST", headers: adminHeaders(), body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.ok) {
      showResult("create-result", `Torneio "${name}" criado com sucesso!`, true);
      loadAdminTournaments();
      load(1);
    } else {
      showResult("create-result", data.error || "Erro ao criar.", false);
    }
  } catch (e) {
    showResult("create-result", e.message, false);
  }
}

async function deleteTournament(id, name) {
  if (!confirm(`Apagar "${name}"? Isso remove o torneio e todos os matches.`)) return;
  try {
    const res = await fetch(`${ADMIN_BASE}/tournaments/${id}`, { method: "DELETE", headers: adminHeaders() });
    const data = await res.json();
    if (data.ok) { loadAdminTournaments(); load(currentPage); }
    else alert(data.error);
  } catch (e) { alert(e.message); }
}

async function updateSlots(id, inputEl) {
  const val = parseInt(inputEl.value);
  if (isNaN(val) || val < 1) return;
  try {
    const res = await fetch(`${ADMIN_BASE}/tournaments/${id}/slots`, {
      method: "PATCH", headers: adminHeaders(), body: JSON.stringify({ maxInvites: val }),
    });
    const data = await res.json();
    if (data.ok) { loadAdminTournaments(true); load(currentPage, true); }
    else alert(data.error);
  } catch (e) { alert(e.message); }
}

async function updateStatus(id, status) {
  try {
    const res = await fetch(`${ADMIN_BASE}/tournaments/${id}/status`, {
      method: "PATCH", headers: adminHeaders(), body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.ok) { loadAdminTournaments(); load(currentPage); }
    else alert(data.error);
  } catch (e) { alert(e.message); }
}

// ── WO ────────────────────────────────────────────────────────────────────────
async function openWO(id, name) {
  woTournamentId = id;
  document.getElementById("wo-tour-name").textContent = name;
  document.getElementById("wo-userid-input").value = "";
  document.getElementById("wo-result").classList.add("hidden");
  document.getElementById("wo-overlay").classList.remove("hidden");

  const list = document.getElementById("wo-players-list");
  list.innerHTML = '<div class="loading">Carregando jogadores...</div>';

  try {
    const res = await fetch(`${ADMIN_BASE}/tournaments/${id}/players`, { headers: adminHeaders() });
    const data = await res.json();
    if (!data.players?.length) {
      list.innerHTML = '<div class="empty-msg">Nenhum inscrito.</div>';
      return;
    }
    list.innerHTML = data.players.map((p) => `
      <div class="wo-player">
        <div><strong>${p.username || "—"}</strong><span style="margin-left:8px">#${p.userId}</span></div>
        <button class="btn btn-danger btn-sm" onclick="selectWOPlayer('${p.userId}')">Selecionar</button>
      </div>`).join("");
  } catch {
    list.innerHTML = '<div class="error-msg">Erro ao carregar jogadores.</div>';
  }
}

function selectWOPlayer(userId) {
  document.getElementById("wo-userid-input").value = userId;
}

async function applyWO() {
  const userId = document.getElementById("wo-userid-input").value.trim();
  if (!userId) return;
  try {
    const res = await fetch(`${ADMIN_BASE}/tournaments/${woTournamentId}/wo`, {
      method: "POST", headers: adminHeaders(), body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.ok) {
      showResult("wo-result", data.message, true);
      openWO(woTournamentId, document.getElementById("wo-tour-name").textContent);
      load(currentPage, true);
    } else {
      showResult("wo-result", data.error, false);
    }
  } catch (e) { showResult("wo-result", e.message, false); }
}

function closeWO() { document.getElementById("wo-overlay").classList.add("hidden"); }

// ── Render ────────────────────────────────────────────────────────────────────
function getStatusInfo(s) { return STATUS[String(s)] || STATUS["-1"]; }

function filterTournaments(list) {
  let f = list;
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    f = f.filter((t) => t.name?.toLowerCase().includes(q) || String(t.id).includes(q));
  }
  if (currentFilter !== "all") {
    f = f.filter((t) => {
      if (currentFilter === "live")       return t.status === 5;
      if (currentFilter === "open")       return t.status === 1;
      if (currentFilter === "notstarted") return t.status === 0 || t.status === 2;
      if (currentFilter === "finished")   return t.status === 3;
      if (currentFilter === "canceled")   return t.status === 4;
      return true;
    });
  }
  return f;
}

function renderList() {
  const container = document.getElementById("tournament-list");
  const filtered = filterTournaments(allTournaments);
  if (!filtered.length) { container.innerHTML = '<div class="empty-msg">Nenhum torneio encontrado.</div>'; renderPagination(0); return; }

  container.innerHTML = filtered.map((t) => {
    const { label, cls } = getStatusInfo(t.status);
    const date = t.tournamenttime ? new Date(t.tournamenttime).toLocaleString("pt-BR") : "—";
    const thumb = t.icon
      ? `<img class="tour-thumb" src="${t.icon}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="tour-thumb-placeholder" style="display:none">🏆</div>`
      : `<div class="tour-thumb-placeholder">🏆</div>`;
    return `
      <div class="tour-card" onclick="openModal(${JSON.stringify(t).replace(/"/g, "&quot;")})">
        ${thumb}
        <div class="tour-info">
          <div class="tour-name">${t.name || "Sem nome"}</div>
          <div class="tour-meta">${date} · ID: ${t.id}</div>
        </div>
        <div class="tour-right">
          <span class="badge ${cls}">${label}</span>
          <span class="tour-slots">${t.currentinvites ?? 0}/${t.maxinvites ?? 0} vagas</span>
        </div>
      </div>`;
  }).join("");
}

function renderManageList() {
  const container = document.getElementById("manage-list");
  const q = (document.getElementById("manage-search")?.value || "").toLowerCase();
  const list = q
    ? adminTournaments.filter((t) => t.TournamentName?.toLowerCase().includes(q) || String(t.TournamentId).includes(q))
    : adminTournaments;

  if (!list.length) { container.innerHTML = '<div class="empty-msg">Nenhum torneio.</div>'; return; }

  container.innerHTML = list.map((t) => {
    const { label, cls } = getStatusInfo(t.Status);
    const signed = t.currentInvitesReal ?? t.CurrentInvites ?? 0;
    return `
      <div class="manage-card">
        <div class="manage-card-info">
          <div class="manage-card-name">${t.TournamentName}</div>
          <div class="manage-card-meta">
            <span class="badge ${cls}" style="margin-right:6px">${label}</span>
            ${signed}/${t.MaxInvites} vagas · ID: ${t.TournamentId}
          </div>
        </div>
        <div class="manage-card-actions">
          <input class="slots-input" type="number" value="${t.MaxInvites}" min="1"
            onchange="updateSlots('${t.TournamentId}', this)" title="Alterar vagas máximas" />
          <button class="btn-icon" onclick="updateStatus('${t.TournamentId}', 4)" title="Cancelar">🚫</button>
          <button class="btn-icon" onclick="openWO('${t.TournamentId}', '${t.TournamentName.replace(/'/g, "\\'")}')" title="W.O">⚡ W.O</button>
          <button class="btn-icon danger" onclick="deleteTournament('${t.TournamentId}', '${t.TournamentName.replace(/'/g, "\\'")}')" title="Apagar">🗑️</button>
        </div>
      </div>`;
  }).join("");
}

function renderPagination(total) {
  const pages = Math.ceil(total / 20);
  const container = document.getElementById("pagination");
  if (pages <= 1) { container.innerHTML = ""; return; }
  let html = "";
  if (currentPage > 1) html += `<button class="page-btn" onclick="goPage(${currentPage - 1})">‹</button>`;
  for (let i = 1; i <= pages; i++)
    html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="goPage(${i})">${i}</button>`;
  if (currentPage < pages) html += `<button class="page-btn" onclick="goPage(${currentPage + 1})">›</button>`;
  container.innerHTML = html;
}

function updateStats(list) {
  const live     = list.filter((t) => t.status === 5).length;
  const open     = list.filter((t) => t.status === 1).length;
  const finished = list.filter((t) => t.status === 3).length;
  const canceled = list.filter((t) => t.status === 4).length;
  const totalSlots  = list.reduce((a, t) => a + (t.maxinvites || 0), 0);
  const filledSlots = list.reduce((a, t) => a + (t.currentinvites || 0), 0);
  const avgFormat = list.length ? Math.round(totalSlots / list.length) : 0;
  const nextTour = list.filter((t) => t.status === 0 || t.status === 1).sort((a, b) => new Date(a.tournamenttime) - new Date(b.tournamenttime))[0];

  document.getElementById("stat-total").textContent = totalCount || list.length;
  document.getElementById("stat-open").textContent  = open;
  document.getElementById("stat-live").textContent  = live;
  document.getElementById("stat-slots").textContent = `${filledSlots}/${totalSlots}`;

  document.getElementById("qc-next").textContent     = nextTour ? new Date(nextTour.tournamenttime).toLocaleDateString("pt-BR") : "—";
  document.getElementById("qc-invites").textContent  = filledSlots;
  document.getElementById("qc-format").textContent   = avgFormat || "—";
  document.getElementById("qc-finished").textContent = finished;

  document.getElementById("s-total").textContent    = totalCount || list.length;
  document.getElementById("s-live").textContent     = live;
  document.getElementById("s-open").textContent     = open;
  document.getElementById("s-finished").textContent = finished;
  document.getElementById("s-canceled").textContent = canceled;
  document.getElementById("s-slots").textContent    = totalSlots;
  document.getElementById("s-filled").textContent   = filledSlots;
  document.getElementById("s-updated").textContent  = new Date().toLocaleTimeString("pt-BR");
}

// ── Load ──────────────────────────────────────────────────────────────────────
async function load(page = 1, silent = false) {
  if (!silent) document.getElementById("tournament-list").innerHTML = '<div class="loading">Carregando...</div>';
  try {
    const data = await fetchTournaments(page);
    allTournaments = data.tournaments || [];
    totalCount = data.pagination?.totalResultCount || allTournaments.length;
    currentPage = page;
    renderList();
    renderPagination(totalCount);
    updateStats(allTournaments);
  } catch (err) {
    if (!silent) document.getElementById("tournament-list").innerHTML = `<div class="error-msg">Erro ao carregar: ${err.message}</div>`;
  }
}

// ── Controls ──────────────────────────────────────────────────────────────────
function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");
  renderList();
}

function goPage(page) { load(page); window.scrollTo({ top: 0, behavior: "smooth" }); }

function handleSearch() {
  searchQuery = document.getElementById("search-input").value.trim();
  renderList();
}

function switchAdminTab(tab, btn) {
  document.querySelectorAll(".atab").forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("atab-manage").classList.toggle("hidden", tab !== "manage");
  document.getElementById("atab-pending").classList.toggle("hidden", tab !== "pending");
  if (tab === "manage") renderManageList();
  if (tab === "pending") loadPending();
}

async function loadPending() {
  if (!adminKey) return;
  const container = document.getElementById("pending-list");
  try {
    const res = await fetch(`/auth/pending`, { headers: { "x-admin-key": adminKey } });
    const data = await res.json();
    const sessions = data.sessions || [];

    // Atualiza badge
    const badge = document.getElementById("pending-badge");
    if (sessions.length > 0) { badge.textContent = sessions.length; badge.style.display = "inline-flex"; }
    else badge.style.display = "none";

    if (!sessions.length) { container.innerHTML = '<div class="empty-msg">Nenhuma solicitação pendente.</div>'; return; }

    container.innerHTML = sessions.map((s) => `
      <div class="pending-card" id="pc-${s.sessionToken}">
        <img class="pending-avatar" src="${s.discordAvatar}" alt="" />
        <div class="pending-info">
          <div class="pending-name">${s.discordUsername}</div>
          <div class="pending-id">ID: ${s.discordId} · ${new Date(s.createdAt).toLocaleString("pt-BR")}</div>
        </div>
        <div class="pending-actions">
          <button class="btn btn-primary btn-sm" onclick="approveUser('${s.sessionToken}')">✓ Aprovar</button>
          <button class="btn btn-danger btn-sm" onclick="denyUser('${s.sessionToken}')">✕ Negar</button>
        </div>
      </div>`).join("");
  } catch {
    container.innerHTML = '<div class="error-msg">Erro ao carregar.</div>';
  }
}

async function approveUser(token) {
  const res = await fetch(`/auth/approve/${token}`, { method: "POST", headers: { "x-admin-key": adminKey } });
  const data = await res.json();
  if (data.ok) {
    document.getElementById(`pc-${token}`)?.remove();
    loadPending();
  }
}

async function denyUser(token) {
  const res = await fetch(`/auth/deny/${token}`, { method: "POST", headers: { "x-admin-key": adminKey } });
  const data = await res.json();
  if (data.ok) {
    document.getElementById(`pc-${token}`)?.remove();
    loadPending();
  }
}

function showResult(id, msg, ok) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `result-msg ${ok ? "ok" : "fail"}`;
  el.classList.remove("hidden");
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openModal(t) {
  const { label, cls } = getStatusInfo(t.status);
  const date   = t.tournamenttime ? new Date(t.tournamenttime).toLocaleString("pt-BR") : "—";
  const opens  = t.invitationopens ? new Date(t.invitationopens).toLocaleString("pt-BR") : "—";
  const closes = t.invitationcloses ? new Date(t.invitationcloses).toLocaleString("pt-BR") : "—";
  const thumb  = t.icon
    ? `<img class="modal-thumb" src="${t.icon}" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="modal-thumb-placeholder" style="display:none">🏆</div>`
    : `<div class="modal-thumb-placeholder">🏆</div>`;
  const stream = t.data?.["tournament-data"]?.["stream-data"]?.[0]?.["@stream-link"];

  document.getElementById("modal-content").innerHTML = `
    <div class="modal-header">
      ${thumb}
      <div>
        <div class="modal-title">${t.name || "Sem nome"}</div>
        <div class="modal-id">ID: ${t.id}</div>
        <span class="badge ${cls}" style="margin-top:6px;display:inline-block">${label}</span>
      </div>
    </div>
    ${t["theme-color"] ? `<div style="height:3px;border-radius:4px;background:${t["theme-color"]};margin-bottom:14px"></div>` : ""}
    <div class="modal-grid">
      <div class="modal-field"><div class="modal-field-label">Início</div><div class="modal-field-value">${date}</div></div>
      <div class="modal-field"><div class="modal-field-label">Vagas</div><div class="modal-field-value">${t.currentinvites ?? 0} / ${t.maxinvites ?? 0}</div></div>
      <div class="modal-field"><div class="modal-field-label">Inscrições abrem</div><div class="modal-field-value">${opens}</div></div>
      <div class="modal-field"><div class="modal-field-label">Inscrições fecham</div><div class="modal-field-value">${closes}</div></div>
      <div class="modal-field"><div class="modal-field-label">Tamanho do time</div><div class="modal-field-value">${t.partysize ?? 1}v${t.partysize ?? 1}</div></div>
      <div class="modal-field"><div class="modal-field-label">Fases</div><div class="modal-field-value">${t.phasecount || "—"}</div></div>
      <div class="modal-field"><div class="modal-field-label">Rodadas</div><div class="modal-field-value">${t.roundcount ?? "—"}</div></div>
      <div class="modal-field"><div class="modal-field-label">Fase atual</div><div class="modal-field-value">${t.currentphaseid || 0}</div></div>
    </div>
    ${stream ? `<div class="modal-field" style="margin-bottom:8px"><div class="modal-field-label">Stream</div><div class="modal-field-value"><a href="${stream}" target="_blank" style="color:var(--blue-light)">${stream}</a></div></div>` : ""}
    ${Array.isArray(t.winners) && t.winners.length ? `<div style="margin-top:8px"><div class="modal-field-label" style="margin-bottom:6px">Vencedores</div>${t.winners.map((w) => `<div class="modal-field" style="margin-bottom:6px;display:flex;justify-content:space-between"><span>${w.nick}</span><span style="color:var(--blue-light)">🏆 #${w.userId}</span></div>`).join("")}</div>` : ""}
  `;
  document.getElementById("modal-overlay").classList.remove("hidden");
}

function closeModal() { document.getElementById("modal-overlay").classList.add("hidden"); }
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); closeWO(); } });
document.getElementById("admin-key-input").addEventListener("keydown", (e) => { if (e.key === "Enter") loginAdmin(); });

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  // Verifica se tem token Discord aprovado
  if (DASH_TOKEN && !DASH_KEY) {
    try {
      const res = await fetch(`/auth/me?token=${DASH_TOKEN}`);
      if (!res.ok) { location.href = "/dashboard/login.html"; return; }
      const me = await res.json();
      showUserInfo(me.discordUsername, me.discordAvatar);
    } catch {
      location.href = "/dashboard/login.html";
      return;
    }
  } else if (!DASH_KEY && !DASH_TOKEN) {
    location.href = "/dashboard/login.html";
    return;
  }

  // Se veio com key da URL, já autentica como admin automaticamente
  if (DASH_KEY) {
    adminKey = DASH_KEY;
    const box = document.getElementById("admin-status-box");
    box.classList.add("unlocked");
    document.getElementById("admin-status-title").textContent = "Acesso liberado";
    document.getElementById("admin-status-desc").textContent = "Painel admin ativo. Você pode editar e gerenciar torneios.";
    document.getElementById("admin-panel").classList.remove("hidden");
    loadAdminTournaments();
    loadPending();
  }

  // Mostra avatar do localStorage se veio do Discord
  const savedAvatar = localStorage.getItem("discordAvatar") || sessionStorage.getItem("discordAvatar");
  const savedName   = localStorage.getItem("discordUsername") || sessionStorage.getItem("discordUsername");
  if (savedAvatar && savedName) showUserInfo(savedName, savedAvatar);

  load(1);
  startRealtime();
}

function showUserInfo(name, avatar) {
  document.getElementById("user-name").textContent = name;
  document.getElementById("user-avatar").src = avatar;
  document.getElementById("user-info").style.display = "flex";
}

init();
