const elements = {
  status: document.querySelector("#status"),
  content: document.querySelector("#content"),
  refresh: document.querySelector("#refresh-button"),
  safety: document.querySelector("#safety-level"),
  updated: document.querySelector("#updated-at"),
  summary: document.querySelector("#today-summary"),
  beginnerStars: document.querySelector("#beginner-stars"),
  longboardStars: document.querySelector("#longboard-stars"),
  beginnerBest: document.querySelector("#beginner-best"),
  advancedBest: document.querySelector("#advanced-best"),
  slots: document.querySelector("#slot-grid"),
  notice: document.querySelector("#notice"),
};

async function loadBoard() {
  elements.refresh.disabled = true;
  elements.status.hidden = false;
  elements.status.classList.remove("error");
  elements.status.textContent = "海況データを読み込んでいます…";

  try {
    const response = await fetch("/api/today", { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    renderBoard(await response.json());
    elements.status.hidden = true;
    elements.content.hidden = false;
  } catch (error) {
    console.error("Failed to load today's board", error);
    elements.status.classList.add("error");
    elements.status.textContent = "データを読み込めませんでした。時間をおいてもう一度お試しください。";
  } finally {
    elements.refresh.disabled = false;
  }
}

function renderBoard(board) {
  elements.safety.textContent = `安全目安：${text(board.safety_level)}`;
  elements.updated.textContent = `更新（日本時間）：${text(board.updated_at)}`;
  elements.summary.textContent = text(board.today_summary);
  elements.beginnerStars.innerHTML = stars(board.overall_beginner_index);
  elements.longboardStars.innerHTML = stars(board.overall_longboard_index);
  elements.beginnerBest.textContent = `おすすめ：${text(board.best_beginner_time)}`;
  elements.advancedBest.textContent = `おすすめ：${text(board.best_advanced_time)}`;
  elements.notice.textContent = text(board.notice);
  elements.slots.replaceChildren(...(Array.isArray(board.slots) ? board.slots.map(slotCard) : []));
}

function slotCard(slot) {
  const article = document.createElement("article");
  article.className = "slot-card";
  article.innerHTML = `
    <header class="slot-header">
      <div><h3 class="slot-title">${escapeHtml(slot.label)}</h3><p class="slot-time">${escapeHtml(slot.time_range)}</p></div>
      <span class="weather-chip">${escapeHtml(slot.status)}</span>
    </header>
    <div class="slot-scores">
      <div class="mini-score"><span>初心者</span><strong>${plainStars(slot.beginner_index)}</strong></div>
      <div class="mini-score"><span>ロング</span><strong>${plainStars(slot.longboard_index)}</strong></div>
    </div>
    <p class="slot-message">${escapeHtml(slot.message)}</p>
    ${slot.caution ? `<ul class="warnings"><li>${escapeHtml(slot.caution)}</li></ul>` : ""}
  `;
  return article;
}

function metric(label, value) {
  return `<div class="metric"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function warnings(items) {
  if (!Array.isArray(items) || items.length === 0) return "";
  return `<ul class="warnings">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function stars(value) {
  const score = scoreValue(value);
  return `${"★".repeat(score)}<span class="empty">${"★".repeat(5 - score)}</span>`;
}

function plainStars(value) {
  const score = scoreValue(value);
  return `${"★".repeat(score)}${"☆".repeat(5 - score)}`;
}

function scoreValue(value) {
  return Math.max(1, Math.min(5, Math.round(Number(value) || 1)));
}

function number(value, digits = 1) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(digits).replace(/\.0$/, "") : "—";
}

function text(value) {
  return typeof value === "string" && value ? value : "—";
}

function escapeHtml(value) {
  return String(value ?? "—").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]);
}

elements.refresh.addEventListener("click", loadBoard);
loadBoard();
