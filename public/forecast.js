const metricTabs = [
  { label: "総合", key: "general_wave_index" },
  { label: "レッスン", key: "lesson_index" },
  { label: "初心者", key: "beginner_index" },
  { label: "ロング", key: "longboard_index" },
  { label: "ミッドレングス", key: "midlength_index" },
  { label: "ショート", key: "shortboard_index" },
  { label: "経験者", key: "advanced_index" },
];

const forecastElements = {
  status: document.querySelector("#forecast-status"),
  content: document.querySelector("#forecast-content"),
  brand: document.querySelector("#forecast-brand"),
  title: document.querySelector("#forecast-title"),
  meta: document.querySelector("#forecast-meta"),
  area: document.querySelector("#forecast-area"),
  tags: document.querySelector("#tag-selector"),
  days: document.querySelector("#day-selector"),
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
    forecastState.dayIndex = 0;
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
  forecastElements.title.textContent = text(board.title);
  forecastElements.meta.textContent = `更新（JST）：${text(board.updated_at)}`;
  forecastElements.area.textContent = text(board.area);
  forecastElements.notice.textContent = text(board.notice);

  renderTags();
  renderDays();
  renderRecommendations();
  renderHeatmap();

  if (!forecastState.selected) {
    forecastState.selected = firstRecommendation() || firstCell(day);
  }
  renderDetail();
}

function renderTags() {
  forecastElements.tags.replaceChildren(...metricTabs.map((tab) => {
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
}

function renderDays() {
  const days = Array.isArray(forecastState.board.days) ? forecastState.board.days : [];
  forecastElements.days.replaceChildren(...days.map((day, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `day-button${index === forecastState.dayIndex ? " active" : ""}`;
    button.innerHTML = `
      <span>${escapeHtml(shortDate(day.date))}</span>
      <strong>${escapeHtml(day.weekday)}</strong>
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
  const recommendations = topRecommendations();
  if (!recommendations.length) {
    forecastElements.recommendations.textContent = "おすすめ候補がまだありません。";
    return;
  }

  forecastElements.recommendations.replaceChildren(...recommendations.map((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recommendation-card";
    button.innerHTML = `
      <span>${escapeHtml(item.spot.spot_name)}</span>
      <strong>${escapeHtml(item.slot.label)} / ${escapeHtml(item.slot.time_range)}</strong>
      <em>${score(item.slot)} / 5</em>
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
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = `heat-cell heat-${value}${isSelected(spot, slot) ? " active" : ""}`;
      cell.innerHTML = `
        <span class="heat-label">${escapeHtml(slot.label)}</span>
        <strong>${value}</strong>
        <span>${escapeHtml(slot.status)}</span>
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
  forecastElements.detail.innerHTML = `
    <div class="detail-head">
      <div>
        <p>${escapeHtml(selected.spot.area)}</p>
        <h3>${escapeHtml(selected.spot.spot_name)}</h3>
      </div>
      <strong>${score(selected.slot)} / 5</strong>
    </div>
    <dl class="detail-list">
      <div><dt>時間帯</dt><dd>${escapeHtml(selected.slot.label)} ${escapeHtml(selected.slot.time_range)}</dd></div>
      <div><dt>表示指数</dt><dd>${escapeHtml(tab.label)}</dd></div>
      <div><dt>ステータス</dt><dd>${escapeHtml(selected.slot.status)}</dd></div>
      <div><dt>信頼度</dt><dd>${escapeHtml(selected.slot.confidence)}</dd></div>
    </dl>
    <p class="detail-message">${escapeHtml(selected.slot.message)}</p>
    ${selected.slot.caution ? `<p class="caution">${escapeHtml(selected.slot.caution)}</p>` : ""}
  `;
}

function topRecommendations() {
  const day = selectedDay();
  const items = (Array.isArray(day?.spots) ? day.spots : []).flatMap((spot) =>
    (Array.isArray(spot.slots) ? spot.slots : []).map((slot) => ({ spot, slot })),
  );
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
