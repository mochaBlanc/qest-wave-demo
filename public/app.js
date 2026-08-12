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
  renderTrend(board.trend, state.slots);
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

function renderTrend(trend, slots) {
  const labels = trendLabels(trend);
  const waves = numericSeries(trend?.wave_height_m, labels.length);
  const speeds = numericSeries(trend?.wind_speed_ms, labels.length);
  const directions = numericSeries(trend?.wind_direction_deg, labels.length);
  const rain = numericSeries(trend?.rain_mm, labels.length);
  const water = waterTempSeries(trend, slots, labels);
  const tides = tideHeightSeries(trend, slots, labels);
  const tideTrends = tideDirectionLabels(tides);
  const rows = [
    hasValues(waves) ? trendStripRow("波高（m）", `
      <div class="trend-cell-grid trend-meter-grid">${waves.map((value) => verticalMeterCell(value, waves, (item) => formatNumber(item, 1), "wave")).join("")}</div>
    `) : "",
    hasValues(speeds) || hasValues(directions) ? trendStripRow("風速（m/s）", `
      <div class="trend-cell-grid">${labels.map((_, index) => windMeterCell(speeds[index], directions[index], speeds)).join("")}</div>
    `) : "",
    hasValues(rain) ? trendStripRow("雨（mm）", `
      <div class="trend-cell-grid trend-meter-grid">${rain.map((value) => verticalMeterCell(value, rain, (item) => formatNumber(item, 1), "rain")).join("")}</div>
    `) : "",
    hasValues(water) ? trendStripRow("水温（℃）", `
      <div class="trend-cell-grid">${water.map((value) => trendMetric(formatNumber(value, 1))).join("")}</div>
    `) : "",
    hasValues(tides) ? trendStripRow("潮位（m）", tideTrendChart(tides, tideTrends)) : "",
  ].filter(Boolean);

  elements.trendSection.hidden = rows.length === 0;
  if (!rows.length) {
    elements.trendGrid.replaceChildren();
    return;
  }

  const card = document.createElement("article");
  card.className = "trend-strip-card";
  const minimumWidth = Math.max(680, 108 + labels.length * 58);
  card.innerHTML = `
    <div class="trend-scroll" tabindex="0" aria-label="00時から23時までの海況推移。横にスクロールできます">
      <div class="trend-strip-inner" style="--trend-columns: ${labels.length}; min-width: ${minimumWidth}px">
        <div class="trend-time-row">
          <span>時刻</span>
          ${labels.map((label) => `<strong${isCurrentTrendHour(label) ? ' class="current"' : ""}>${escapeHtml(label)}</strong>`).join("")}
        </div>
        ${rows.join("")}
      </div>
    </div>
  `;
  elements.trendGrid.replaceChildren(card);
}

function trendStripRow(label, bodyHtml) {
  return `
    <div class="trend-strip-row">
      <p class="trend-label">${escapeHtml(label)}</p>
      ${bodyHtml}
    </div>
  `;
}

function verticalMeterCell(value, series, formatter, tone) {
  const height = proportionalPercent(value, series, 12);
  return `
    <span class="meter-cell">
      <span class="vertical-meter ${tone}"><span class="meter-fill" style="height: ${height}%"></span></span>
      <strong>${escapeHtml(formatter(value))}</strong>
    </span>
  `;
}

function windMeterCell(speed, direction, series) {
  const strength = proportionalPercent(speed, series, 28);
  const angle = direction === null ? 0 : ((direction % 360) + 360) % 360;
  return `
    <span class="wind-meter-cell">
      ${direction === null ? '<span class="wind-vane unavailable">—</span>' : `
        <svg class="wind-vane" viewBox="0 0 24 24" aria-hidden="true" style="transform: rotate(${angle}deg); opacity: ${strength / 100}">
          <path d="M12 2 L17 10 L13.5 9 L13.5 21 L10.5 21 L10.5 9 L7 10 Z"></path>
        </svg>
      `}
      <strong>${escapeHtml(formatNumber(speed, 1))}</strong>
      ${direction !== null ? `<em>${escapeHtml(directionLabel(direction))}</em>` : ""}
    </span>
  `;
}

function trendMetric(value) {
  return `<span class="trend-metric">${escapeHtml(value)}</span>`;
}

function tideTrendChart(tides, trends) {
  const valid = tides.filter((value) => value !== null);
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = Math.max(max - min, 0.1);
  const lines = tidePolylineSegments(tides, min, range)
    .map((points) => `<polyline points="${points}" vector-effect="non-scaling-stroke"></polyline>`)
    .join("");
  return `
    <div class="trend-tide-chart">
      <svg viewBox="0 0 100 58" preserveAspectRatio="none" aria-hidden="true">
        ${lines}
      </svg>
      <div class="trend-tide-values">
        ${tides.map((value, index) => `
          <span>
            <strong>${escapeHtml(value === null ? "—" : value.toFixed(2))}</strong>
            ${trends[index] ? `<em>${escapeHtml(trends[index])}</em>` : ""}
          </span>
        `).join("")}
      </div>
    </div>
  `;
}

function tidePolylineSegments(tides, min, range) {
  const segments = [];
  let current = [];
  tides.forEach((value, index) => {
    if (value === null) {
      if (current.length > 1) segments.push(current.join(" "));
      current = [];
      return;
    }
    const x = ((index + 0.5) / tides.length) * 100;
    const y = 48 - ((value - min) / range) * 34;
    current.push(`${x},${y}`);
  });
  if (current.length > 1) segments.push(current.join(" "));
  return segments;
}

function tideHeightSeries(trend, slots, labels) {
  const trendValues = numericSeries(trend?.tide_height_m, labels.length);
  if (hasValues(trendValues)) return trendValues;
  if (labels.length > 4) return Array.from({ length: labels.length }, () => null);
  return labels.map((label) => {
    const slot = Array.isArray(slots) ? slots.find((item) => item.label === label) : null;
    if (slot?.tide_height_m === null || slot?.tide_height_m === undefined || slot?.tide_height_m === "") return null;
    const value = Number(slot?.tide_height_m);
    return Number.isFinite(value) ? value : null;
  });
}

function tideDirectionLabels(tides) {
  return tides.map((value, index) => {
    if (value === null) return "";
    const before = tides[index - 1];
    const after = tides[index + 1];
    if (before !== null && after !== null && value >= before && value >= after) return "満潮前後";
    if (before !== null && after !== null && value <= before && value <= after) return "干潮前後";
    const comparison = after !== null && after !== undefined ? after - value : before !== null && before !== undefined ? value - before : 0;
    return comparison > 0.005 ? "上げ" : comparison < -0.005 ? "下げ" : "";
  });
}

function trendLabels(trend) {
  const labels = Array.isArray(trend?.labels) && trend.labels.length
    ? trend.labels
    : ["早朝", "午前", "午後", "夕方"];
  return labels.slice(0, 24).map((label) => text(label));
}

function isCurrentTrendHour(label) {
  return /^\d{2}$/.test(label) && Number(label) === Number(jstParts().hour);
}

function numericSeries(values, length) {
  return Array.from({ length }, (_, index) => {
    const raw = Array.isArray(values) ? values[index] : null;
    if (raw === null || raw === undefined || raw === "") return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  });
}

function hasValues(values) {
  return values.some((value) => value !== null);
}

function proportionalPercent(value, series, minimum) {
  if (value === null) return 0;
  const max = Math.max(...series.filter((item) => item !== null), 0);
  if (max <= 0) return minimum;
  return Math.max(minimum, Math.min(100, Math.round((value / max) * 100)));
}

function waterTempSeries(trend, slots, labels) {
  const trendValues = numericSeries(trend?.water_temp_c, labels.length).map(validWaterTemp);
  if (hasValues(trendValues)) return trendValues;
  const slotValues = labels.map((label) => {
    const slot = Array.isArray(slots) ? slots.find((item) => item.label === label) : null;
    return validWaterTemp(slot?.water_temp_c);
  });
  return hasValues(slotValues) ? slotValues : Array.from({ length: labels.length }, () => null);
}

function validWaterTemp(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 && number < 40 ? number : null;
}

function formatNumber(value, digits) {
  return value === null ? "—" : value.toFixed(digits);
}

function directionLabel(degrees) {
  if (degrees === null) return "";
  const directions = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"];
  const index = Math.round((((degrees % 360) + 360) % 360) / 45) % directions.length;
  return directions[index];
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

function initLiveStreams() {
  document.querySelectorAll("video[data-hls-src]").forEach((video) => {
    const source = video.dataset.hlsSrc;
    const status = video.closest(".live-check-camera")?.querySelector(".live-check-status");
    if (!source) return;

    if (window.Hls?.isSupported()) {
      const hls = new window.Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        if (status) status.textContent = "再生ボタンを押してライブ映像を確認";
      });
      hls.on(window.Hls.Events.ERROR, (_event, data) => {
        if (data?.fatal && status) status.textContent = "映像を読み込めません。配信元リンクをご利用ください。";
      });
      window.addEventListener("pagehide", () => hls.destroy(), { once: true });
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    if (status) status.textContent = "このブラウザでは再生できません。配信元リンクをご利用ください。";
  });
}

elements.refresh.addEventListener("click", loadBoard);
initLiveStreams();
loadBoard();
