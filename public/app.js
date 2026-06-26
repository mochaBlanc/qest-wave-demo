const elements = {
  status: document.querySelector("#status"),
  content: document.querySelector("#content"),
  details: document.querySelector("#details"),
  refresh: document.querySelector("#refresh-button"),
  brand: document.querySelector("#brand-label"),
  title: document.querySelector("#board-title"),
  updated: document.querySelector("#updated-at"),
  summary: document.querySelector("#today-summary"),
  beginnerStars: document.querySelector("#beginner-stars"),
  expertStars: document.querySelector("#expert-stars"),
  recommendedTypes: document.querySelector("#recommended-types"),
  beginnerMessage: document.querySelector("#beginner-message"),
  advancedMessage: document.querySelector("#advanced-message"),
  beginnerBest: document.querySelector("#beginner-best"),
  advancedBest: document.querySelector("#advanced-best"),
  trendSection: document.querySelector("#trend-section"),
  trendGrid: document.querySelector("#trend-grid"),
  tagSelector: document.querySelector("#home-tag-selector"),
  slots: document.querySelector("#slot-grid"),
  localNote: document.querySelector("#local-note"),
  waterNoteCard: document.querySelector("#water-note-card"),
  waterNoteSummary: document.querySelector("#water-note-summary"),
  wetsuitNoteSummary: document.querySelector("#wetsuit-note-summary"),
  notice: document.querySelector("#notice"),
};

const metricTabGroups = [
  [
    { label: "総合", key: "general_index" },
    { label: "レッスン", key: "lesson_index" },
    { label: "初心者", key: "beginner_index" },
    { label: "経験者", key: "experienced_index" },
  ],
  [
    { label: "ロング", key: "longboard_index" },
    { label: "ミッドレングス", key: "midlength_index" },
    { label: "ショート", key: "shortboard_index" },
  ],
];

const metricTabs = metricTabGroups.flat();

const state = {
  board: null,
  slots: [],
  selectedMetric: "general_index",
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
    elements.details.hidden = false;
  } catch (error) {
    console.error("Failed to load today's board", error);
    elements.status.classList.add("error");
    elements.status.textContent = "データを読み込めませんでした。時間をおいてもう一度お試しください。";
  } finally {
    elements.refresh.disabled = false;
  }
}

function renderBoard(board) {
  state.board = board;
  state.slots = Array.isArray(board.slots) ? board.slots : [];
  elements.brand.textContent = text(board.brand);
  elements.title.textContent = text(board.title);
  elements.updated.textContent = `更新（JST）：${text(board.updated_at)}`;
  elements.summary.textContent = text(board.today_summary);
  elements.beginnerStars.innerHTML = stars(board.overall_beginner_index);
  const expert = expertRecommendation(board);
  elements.expertStars.innerHTML = stars(expert.score);
  renderRecommendedTypes(expert.types);
  elements.beginnerMessage.textContent = text(board.beginner_main_message);
  elements.advancedMessage.textContent = expert.message;
  elements.beginnerBest.textContent = availableBestTime(state.slots, "beginner_index", board.best_beginner_time);
  elements.advancedBest.textContent = availableBestTime(state.slots, "experienced_index", board.best_advanced_time);
  elements.localNote.textContent = text(board.local_note);
  renderWaterNote(board);
  elements.notice.textContent = text(board.notice);
  renderTags();
  renderTrend(board.trend);
  renderSlots();
}

function renderTags() {
  elements.tagSelector.replaceChildren(...metricTabGroups.map((group) => {
    const row = document.createElement("div");
    row.className = "tag-row";
    row.replaceChildren(...group.map((tab) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `tab-button${tab.key === state.selectedMetric ? " active" : ""}`;
      button.textContent = tab.label;
      button.addEventListener("click", () => {
        state.selectedMetric = tab.key;
        renderTags();
        renderSlots();
      });
      return button;
    }));
    return row;
  }));
}

function renderSlots() {
  elements.slots.replaceChildren(...state.slots.map(slotCard));
}

function slotCard(slot) {
  const tab = selectedTab();
  const ended = isPastSlot(slot);
  const article = document.createElement("article");
  article.className = `slot-card${ended ? " past" : ""}`;
  article.innerHTML = `
    <header class="slot-header">
      <div><h3 class="slot-title">${escapeHtml(slot.label)}</h3><p class="slot-time">${escapeHtml(slot.time_range)}</p></div>
      <span class="status-chip">${escapeHtml(ended ? "終了" : slot.status)}</span>
    </header>
    <div class="slot-selected-score">
      <span>${escapeHtml(metricGuideLabel(tab.label))}</span>
      <strong>${plainStars(scoreForSlot(slot, tab.key))}</strong>
    </div>
    <p class="slot-message">${escapeHtml(slot.message)}</p>
    ${slot.caution ? `<p class="caution">${escapeHtml(slot.caution)}</p>` : ""}
  `;
  return article;
}

function expertRecommendation(board) {
  const types = Array.isArray(board.recommended_board_types)
    ? board.recommended_board_types.filter((type) => typeof type === "string")
    : [];
  return {
    score: scoreValue(board.overall_experienced_index ?? board.overall_longboard_index),
    types: types.length ? types : ["ロング", "ミッドレングス"],
    message: text(board.board_main_message || board.experienced_main_message || board.advanced_main_message),
  };
}

function renderRecommendedTypes(types) {
  elements.recommendedTypes.replaceChildren(...types.map((type) => {
    const chip = document.createElement("span");
    chip.textContent = type;
    return chip;
  }));
}

function renderWaterNote(board) {
  const water = typeof board.water_temp_summary === "string" && board.water_temp_summary.trim() ? board.water_temp_summary : "";
  const wetsuit = typeof board.wetsuit_summary === "string" && board.wetsuit_summary.trim() ? board.wetsuit_summary : "";
  elements.waterNoteCard.hidden = !water && !wetsuit;
  elements.waterNoteSummary.hidden = !water;
  elements.wetsuitNoteSummary.hidden = !wetsuit;
  elements.waterNoteSummary.textContent = water;
  elements.wetsuitNoteSummary.textContent = wetsuit;
}

function availableBestTime(slots, key, fallback) {
  const available = slots.filter((slot) => !isPastSlot(slot));
  if (!available.length) return "本日は終了";
  const best = [...available].sort((a, b) => {
    const byScore = scoreForSlot(b, key) - scoreForSlot(a, key);
    if (byScore !== 0) return byScore;
    return slotRank(a.label) - slotRank(b.label);
  })[0];
  return best ? best.time_range : text(fallback);
}

function renderTrend(trend) {
  const rows = [
    waveTrendRow(trend),
    windTrendRow(trend),
    rainTrendRow(trend),
    waterTrendRow(trend),
  ].filter(Boolean);
  elements.trendSection.hidden = rows.length === 0;
  elements.trendGrid.replaceChildren(...rows);
}

function waveTrendRow(trend) {
  const labels = trendLabels(trend);
  const values = numericSeries(trend?.wave_height_m, labels.length);
  if (!hasValues(values)) return null;
  return visualTrendRow("波サイズ", `
    <div class="trend-wave-chart" aria-label="波サイズ推移">
      ${sparklineSvg(values)}
      <div class="trend-values">
        ${values.map((value, index) => trendValue(labels[index], formatMeters(value))).join("")}
      </div>
    </div>
  `);
}

function windTrendRow(trend) {
  const labels = trendLabels(trend);
  const speeds = numericSeries(trend?.wind_speed_ms, labels.length);
  const directions = numericSeries(trend?.wind_direction_deg, labels.length);
  if (!hasValues(speeds) && !hasValues(directions)) return null;
  return visualTrendRow("風", `
    <div class="wind-strip">
      ${labels.map((label, index) => windChip(label, speeds[index], directions[index])).join("")}
    </div>
  `);
}

function rainTrendRow(trend) {
  const labels = trendLabels(trend);
  const values = numericSeries(trend?.rain_mm, labels.length);
  if (!hasValues(values)) return null;
  const max = Math.max(...values.filter((value) => value !== null), 1);
  return visualTrendRow("雨", `
    <div class="rain-strip">
      ${values.map((value, index) => rainBar(labels[index], value, max)).join("")}
    </div>
  `);
}

function waterTrendRow(trend) {
  const labels = trendLabels(trend);
  const values = numericSeries(trend?.water_temp_c, labels.length);
  if (!hasValues(values)) return null;
  const first = values.find((value) => value !== null);
  const last = [...values].reverse().find((value) => value !== null);
  const summary = first !== undefined && last !== undefined
    ? `${formatTemp(first)} → ${formatTemp(last)}`
    : "";
  return visualTrendRow("水温", `
    <div class="water-strip">
      <strong>${escapeHtml(summary)}</strong>
      <div class="water-chips">
        ${values.map((value, index) => trendValue(labels[index], formatTemp(value))).join("")}
      </div>
    </div>
  `);
}

function visualTrendRow(label, bodyHtml) {
  const section = document.createElement("section");
  section.className = "trend-visual-row";
  section.innerHTML = `
    <p class="trend-label">${escapeHtml(label)}</p>
    <div class="trend-visual">${bodyHtml}</div>
  `;
  return section;
}

function sparklineSvg(values) {
  const width = 360;
  const height = 72;
  const paddingX = 14;
  const paddingY = 12;
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;
  const numeric = values.filter((value) => value !== null);
  const min = Math.min(...numeric);
  const max = Math.max(...numeric);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = paddingX + (usableWidth * index) / Math.max(values.length - 1, 1);
    const safeValue = value ?? min;
    const y = paddingY + usableHeight - ((safeValue - min) / range) * usableHeight;
    return { x, y, missing: value === null };
  });
  const linePoints = points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const areaPoints = `${paddingX},${height - paddingY} ${linePoints} ${width - paddingX},${height - paddingY}`;
  return `
    <svg class="trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-hidden="true" focusable="false">
      <polygon points="${areaPoints}" />
      <polyline points="${linePoints}" />
      ${points.map((point) => `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${point.missing ? 2 : 3.5}" />`).join("")}
    </svg>
  `;
}

function windChip(label, speed, direction) {
  const strongClass = speed !== null && speed >= 7 ? " strong" : speed !== null && speed >= 5 ? " medium" : "";
  const rotation = direction !== null ? ` style="transform: rotate(${direction}deg)"` : "";
  return `
    <div class="wind-chip${strongClass}">
      <span>${escapeHtml(label)}</span>
      <i${rotation}>↑</i>
      <strong>${escapeHtml(formatSpeed(speed))}</strong>
    </div>
  `;
}

function rainBar(label, value, max) {
  const ratio = value === null ? 0 : Math.max(0.06, Math.min(1, value / max));
  const height = Math.round(8 + ratio * 38);
  const heavyClass = value !== null && value >= 10 ? " heavy" : value !== null && value >= 1 ? " wet" : "";
  return `
    <div class="rain-item${heavyClass}">
      <span>${escapeHtml(label)}</span>
      <i style="height: ${height}px"></i>
      <strong>${escapeHtml(formatRain(value))}</strong>
    </div>
  `;
}

function trendValue(label, value) {
  return `
    <span>
      <em>${escapeHtml(label)}</em>
      <strong>${escapeHtml(value)}</strong>
    </span>
  `;
}

function trendLabels(trend) {
  const labels = Array.isArray(trend?.labels) && trend.labels.length
    ? trend.labels
    : ["早朝", "午前", "午後", "夕方"];
  return labels.slice(0, 4).map((label) => text(label));
}

function numericSeries(values, length) {
  return Array.from({ length }, (_, index) => {
    const value = Number(Array.isArray(values) ? values[index] : null);
    return Number.isFinite(value) ? value : null;
  });
}

function hasValues(values) {
  return values.some((value) => value !== null);
}

function formatMeters(value) {
  return value === null ? "—" : `${value.toFixed(1)}m`;
}

function formatSpeed(value) {
  return value === null ? "—" : `${value.toFixed(1)}m/s`;
}

function formatRain(value) {
  if (value === null) return "—";
  return value >= 10 ? `${value.toFixed(0)}mm` : `${value.toFixed(1)}mm`;
}

function formatTemp(value) {
  return value === null ? "—" : `${value.toFixed(1)}℃`;
}

function selectedTab() {
  return metricTabs.find((tab) => tab.key === state.selectedMetric) ?? metricTabs[0];
}

function scoreForSlot(slot, key) {
  const direct = Number(slot?.[key]);
  if (Number.isFinite(direct)) return scoreValue(direct);

  const beginner = scoreValue(slot?.beginner_index);
  const longboard = scoreValue(slot?.longboard_index);
  if (key === "beginner_index" || key === "lesson_index") return beginner;
  if (key === "longboard_index" || key === "advanced_index" || key === "experienced_index" || key === "midlength_index") return longboard;
  if (key === "shortboard_index") return conservativeShortboardScore(longboard);
  return scoreValue((beginner + longboard) / 2);
}

function conservativeShortboardScore(value) {
  return Math.max(1, Math.min(3, scoreValue(value) - 1));
}

function metricGuideLabel(label) {
  return `${label}目安`;
}

function stars(value) {
  const score = scoreValue(value);
  return `<span class="score-number">${score} / 5</span><span class="score-stars">${"★".repeat(score)}<span class="empty">${"★".repeat(5 - score)}</span></span>`;
}

function plainStars(value) {
  const score = scoreValue(value);
  return `${"★".repeat(score)}${"☆".repeat(5 - score)}`;
}

function scoreValue(value) {
  return Math.max(1, Math.min(5, Math.round(Number(value) || 1)));
}

function isPastSlot(slot) {
  return currentJstMinutes() >= slotEndMinutes(slot?.time_range);
}

function currentJstDate() {
  const parts = jstParts();
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function currentJstMinutes() {
  const parts = jstParts();
  return Number(parts.hour) * 60 + Number(parts.minute);
}

function jstParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

function slotEndMinutes(timeRange) {
  const match = String(timeRange ?? "").match(/(\d{1,2}):(\d{2})\s*[〜~-]\s*(\d{1,2}):(\d{2})/);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number(match[3]) * 60 + Number(match[4]);
}

function slotRank(label) {
  const rank = ["早朝", "午前", "午後", "夕方"].indexOf(label);
  return rank === -1 ? 99 : rank;
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
