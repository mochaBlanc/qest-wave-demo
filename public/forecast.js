const metricTabGroups = [
  [
    { label: "総合", key: "general_wave_index" },
    { label: "レッスン", key: "lesson_index" },
    { label: "初心者", key: "beginner_index" },
    { label: "経験者", key: "advanced_index" },
  ],
  [
    { label: "ロング", key: "longboard_index" },
    { label: "ミッドレングス", key: "midlength_index" },
    { label: "ショート", key: "shortboard_index" },
  ],
];

const metricTabs = metricTabGroups.flat();

const forecastElements = {
  status: document.querySelector("#forecast-status"),
  content: document.querySelector("#forecast-content"),
  brand: document.querySelector("#forecast-brand"),
  title: document.querySelector("#forecast-title"),
  meta: document.querySelector("#forecast-meta"),
  area: document.querySelector("#forecast-area"),
  todayEndedNote: document.querySelector("#today-ended-note"),
  analystSection: document.querySelector("#analyst-section"),
  analystContent: document.querySelector("#analyst-content"),
  tags: document.querySelector("#tag-selector"),
  days: document.querySelector("#day-selector"),
  recommendationTitle: document.querySelector("#recommendation-title"),
  recommendations: document.querySelector("#recommendations"),
  heatmap: document.querySelector("#heatmap"),
  detail: document.querySelector("#detail-content"),
  notice: document.querySelector("#forecast-notice"),
};

const forecastState = {
  board: null,
  metric: "general_wave_index",
  dayIndex: 0,
  selected: null,
};

async function loadForecast() {
  forecastElements.status.hidden = false;
  forecastElements.status.classList.remove("error");
  forecastElements.status.textContent = "7日予測を読み込んでいます…";

  try {
    const response = await fetch("/api/forecast", { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    forecastState.board = await response.json();
    forecastState.metric = forecastState.board.default_metric || "general_wave_index";
    forecastState.dayIndex = defaultDayIndex();
    renderForecast();
    forecastElements.status.hidden = true;
    forecastElements.content.hidden = false;
  } catch (error) {
    console.error("Failed to load forecast", error);
    forecastElements.status.classList.add("error");
    forecastElements.status.textContent = "7日予測を読み込めませんでした。時間をおいてもう一度お試しください。";
  }
}

function renderForecast() {
  const board = forecastState.board;
  const day = selectedDay();
  forecastElements.brand.textContent = text(board.brand);
  forecastElements.title.textContent = "鵠沼サーフィン指数予想";
  forecastElements.meta.textContent = `更新（JST）：${text(board.updated_at)}`;
  forecastElements.area.textContent = text(board.area);
  forecastElements.notice.textContent = text(board.notice);
  forecastElements.todayEndedNote.hidden = !isTodayFullyEnded();

  renderAnalyst();
  renderTags();
  renderDays();
  renderRecommendations();
  renderHeatmap();

  if (!forecastState.selected) {
    forecastState.selected = firstRecommendation() || firstCell(day);
  }
  renderDetail();
}

function renderAnalyst() {
  const analyst = forecastState.board?.analyst;
  const shouldShow = analyst?.ai_comment_status === "ok";
  forecastElements.analystSection.hidden = !shouldShow;
  forecastElements.analystContent.replaceChildren();
  if (!shouldShow) return;

  const summaries = [
    ["今週の狙い目", analyst.weekly_summary],
    ["レッスン候補", analyst.lesson_summary],
  ].filter(([, value]) => typeof value === "string" && value.trim());

  if (!summaries.length) {
    forecastElements.analystSection.hidden = true;
    return;
  }

  const summaryList = document.createElement("div");
  summaryList.className = "analyst-summary-list";
  summaryList.replaceChildren(...summaries.map(([label, value]) => {
    const row = document.createElement("p");
    row.className = "analyst-summary-row";
    row.innerHTML = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>`;
    return row;
  }));
  forecastElements.analystContent.append(summaryList);
}

function renderTags() {
  forecastElements.tags.replaceChildren(...metricTabGroups.map((group) => {
    const row = document.createElement("div");
    row.className = "tag-row";
    row.replaceChildren(...group.map((tab) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `tab-button${tab.key === forecastState.metric ? " active" : ""}`;
      button.textContent = tab.label;
      button.addEventListener("click", () => {
        forecastState.metric = tab.key;
        forecastState.selected = firstRecommendation() || firstCell(selectedDay());
        renderTags();
        renderRecommendations();
        renderHeatmap();
        renderDetail();
      });
      return button;
    }));
    return row;
  }));
}

function renderDays() {
  const days = Array.isArray(forecastState.board.days) ? forecastState.board.days : [];
  forecastElements.days.replaceChildren(...days.map((day, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `day-button${index === forecastState.dayIndex ? " active" : ""}${isToday(day) ? " today" : ""}`;
    button.innerHTML = `
      <span>${escapeHtml(shortDate(day.date))}</span>
      <strong>${escapeHtml(day.weekday)}</strong>
      <span class="mode-label">${isToday(day) ? "今日 / 当日データ" : "予測"}</span>
      <em>${escapeHtml(day.confidence)}</em>
    `;
    button.addEventListener("click", () => {
      forecastState.dayIndex = index;
      forecastState.selected = firstRecommendation() || firstCell(selectedDay());
      renderDays();
      renderRecommendations();
      renderHeatmap();
      renderDetail();
    });
    return button;
  }));
}

function renderRecommendations() {
  forecastElements.recommendationTitle.textContent = "候補";
  const recommendations = topRecommendations();
  if (!recommendations.length) {
    forecastElements.recommendations.textContent = isToday(selectedDay())
      ? "今日の残り時間帯におすすめ候補がありません。"
      : "おすすめ候補がまだありません。";
    return;
  }

  forecastElements.recommendations.replaceChildren(...recommendations.map((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recommendation-card";
    button.innerHTML = `
      <span>${escapeHtml(item.spot.spot_name)}</span>
      <strong>${escapeHtml(item.slot.label)} / ${escapeHtml(item.slot.time_range)}</strong>
      <em>${stars(score(item.slot))}</em>
    `;
    button.addEventListener("click", () => {
      forecastState.selected = item;
      renderHeatmap();
      renderDetail();
    });
    return button;
  }));
}

function renderHeatmap() {
  const day = selectedDay();
  const spots = Array.isArray(day?.spots) ? day.spots : [];
  const fragment = document.createDocumentFragment();

  for (const spot of spots) {
    const row = document.createElement("section");
    row.className = "heatmap-row";
    const header = document.createElement("div");
    header.className = "heatmap-spot";
    header.innerHTML = `<strong>${escapeHtml(spot.spot_name)}</strong><span>${escapeHtml(spot.area)}</span>`;
    row.append(header);

    const cells = document.createElement("div");
    cells.className = "heatmap-cells";
    for (const slot of Array.isArray(spot.slots) ? spot.slots : []) {
      const value = score(slot);
      const past = isPastSlot(day, slot);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = `heat-cell heat-${value}${past ? " past" : ""}${isSelected(spot, slot) ? " active" : ""}`;
      cell.innerHTML = `
        <span class="heat-label">${escapeHtml(slot.label)}</span>
        <strong>${stars(value)}</strong>
        <span>${escapeHtml(past ? "終了" : slot.status)}</span>
        <em>${escapeHtml(slot.confidence)}</em>
      `;
      cell.addEventListener("click", () => {
        forecastState.selected = { spot, slot };
        renderHeatmap();
        renderDetail();
      });
      cells.append(cell);
    }
    row.append(cells);
    fragment.append(row);
  }

  forecastElements.heatmap.replaceChildren(fragment);
}

function renderDetail() {
  const selected = forecastState.selected;
  if (!selected) {
    forecastElements.detail.textContent = "ヒートマップの枠を選択してください。";
    return;
  }

  const tab = selectedTab();
  const selectedDayData = selectedDay();
  const past = isPastSlot(selectedDayData, selected.slot);
  forecastElements.detail.innerHTML = `
    <div class="detail-head">
      <div>
        <p>${escapeHtml(selected.spot.area)}</p>
        <h3>${escapeHtml(selected.spot.spot_name)}</h3>
      </div>
      <strong>${stars(score(selected.slot))}</strong>
    </div>
    <dl class="detail-list">
      <div><dt>時間帯</dt><dd>${escapeHtml(selected.slot.label)} ${escapeHtml(selected.slot.time_range)}${past ? "（終了）" : ""}</dd></div>
      <div><dt>表示指数</dt><dd>${escapeHtml(tab.label)}</dd></div>
      <div><dt>ステータス</dt><dd>${escapeHtml(selected.slot.status)}</dd></div>
      <div><dt>信頼度</dt><dd>${escapeHtml(selected.slot.confidence)}</dd></div>
      <div><dt>水温</dt><dd>${escapeHtml(formatWaterTemp(selected.slot.water_temp_c))}</dd></div>
      <div><dt>ウェット</dt><dd>${escapeHtml(selected.slot.wetsuit_label)} / ${escapeHtml(selected.slot.wetsuit_thickness)}</dd></div>
      ${hasTide(selected.slot) ? `<div><dt>潮位目安</dt><dd>${escapeHtml(formatTide(selected.slot))}</dd></div>` : ""}
    </dl>
    <p class="detail-message">${escapeHtml(selected.slot.message)}</p>
    ${selected.slot.tide_note ? `<p class="tide-note">${escapeHtml(selected.slot.tide_note)}</p>` : ""}
    ${selected.slot.wetsuit_note ? `<p class="wetsuit-note">${escapeHtml(selected.slot.wetsuit_note)}</p>` : ""}
    ${selected.slot.caution ? `<p class="caution">${escapeHtml(selected.slot.caution)}</p>` : ""}
  `;
}

function topRecommendations() {
  const day = selectedDay();
  const items = (Array.isArray(day?.spots) ? day.spots : []).flatMap((spot) =>
    (Array.isArray(spot.slots) ? spot.slots : []).map((slot) => ({ spot, slot })),
  ).filter((item) => !isPastSlot(day, item.slot));
  const preferMorning = forecastState.metric === "lesson_index" || forecastState.metric === "beginner_index";
  return items
    .sort((a, b) => {
      const byScore = score(b.slot) - score(a.slot);
      if (byScore !== 0) return byScore;
      if (preferMorning) return slotRank(a.slot.label) - slotRank(b.slot.label);
      return slotRank(a.slot.label) - slotRank(b.slot.label);
    })
    .slice(0, 2);
}

function firstRecommendation() {
  return topRecommendations()[0] ?? null;
}

function firstCell(day) {
  const spot = day?.spots?.[0];
  const slot = spot?.slots?.[0];
  return spot && slot ? { spot, slot } : null;
}

function selectedDay() {
  return forecastState.board?.days?.[forecastState.dayIndex] ?? null;
}

function selectedTab() {
  return metricTabs.find((tab) => tab.key === forecastState.metric) ?? metricTabs[0];
}

function score(slot) {
  const value = Number(slot?.[forecastState.metric]);
  return Number.isFinite(value) ? Math.max(1, Math.min(5, Math.round(value))) : 1;
}

function slotRank(label) {
  return ["早朝", "午前", "午後", "夕方"].indexOf(label);
}

function defaultDayIndex() {
  const days = Array.isArray(forecastState.board?.days) ? forecastState.board.days : [];
  if (!days.length) return 0;
  const firstDay = days[0];
  if (isToday(firstDay) && allSlotsEnded(firstDay) && days.length > 1) return 1;
  return 0;
}

function isTodayFullyEnded() {
  const days = Array.isArray(forecastState.board?.days) ? forecastState.board.days : [];
  const today = days.find((day) => isToday(day));
  return today ? allSlotsEnded(today) : false;
}

function allSlotsEnded(day) {
  const slots = (Array.isArray(day?.spots) ? day.spots : []).flatMap((spot) => Array.isArray(spot.slots) ? spot.slots : []);
  return slots.length > 0 && slots.every((slot) => isPastSlot(day, slot));
}

function isPastSlot(day, slot) {
  return isToday(day) && currentJstMinutes() >= slotEndMinutes(slot?.time_range);
}

function isToday(day) {
  return day?.date === currentJstDate();
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

function stars(value) {
  const filled = Math.max(1, Math.min(5, Math.round(Number(value) || 1)));
  return `${"★".repeat(filled)}${"☆".repeat(5 - filled)}`;
}

function formatWaterTemp(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? `${numeric.toFixed(1)}℃` : "—";
}

function hasTide(slot) {
  return Number.isFinite(Number(slot?.tide_height_m)) && typeof slot?.tide_trend === "string" && slot.tide_trend.trim() !== "";
}

function formatTide(slot) {
  const height = Number(slot?.tide_height_m);
  return `${height.toFixed(2)}m / ${slot.tide_trend}`;
}

function isSelected(spot, slot) {
  return forecastState.selected?.spot?.spot_id === spot.spot_id && forecastState.selected?.slot === slot;
}

function shortDate(date) {
  return typeof date === "string" && date.length >= 10 ? `${date.slice(5, 7)}/${date.slice(8, 10)}` : "—";
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

loadForecast();
