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
  beginnerMessage: document.querySelector("#beginner-message"),
  advancedMessage: document.querySelector("#advanced-message"),
  beginnerBest: document.querySelector("#beginner-best"),
  advancedBest: document.querySelector("#advanced-best"),
  trendSection: document.querySelector("#trend-section"),
  trendGrid: document.querySelector("#trend-grid"),
  tagSelector: document.querySelector("#home-tag-selector"),
  slots: document.querySelector("#slot-grid"),
  localNote: document.querySelector("#local-note"),
  notice: document.querySelector("#notice"),
};

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

const state = {
  board: null,
  slots: [],
  selectedMetric: "general_wave_index",
};

async function loadBoard() {
  elements.refresh.disabled = true;
  elements.status.hidden = false;
  elements.status.classList.remove("error");
  elements.status.textContent = "海況データを読み込んでいます…";

  try {
    const response = await fetch("/api/today", { headers: { Accept: "application/json" }, cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const [board, forecast] = await Promise.all([
      response.json(),
      fetchTodayForecast().catch((error) => {
        console.warn("Forecast supplement unavailable", error);
        return null;
      }),
    ]);
    renderBoard(board, forecast);
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

async function fetchTodayForecast() {
  const response = await fetch("/api/forecast", { headers: { Accept: "application/json" }, cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function renderBoard(board, forecast) {
  state.board = board;
  state.slots = mergeTodaySlots(board, forecast);
  elements.brand.textContent = text(board.brand);
  elements.title.textContent = text(board.title);
  elements.updated.textContent = `更新（JST）：${text(board.updated_at)}`;
  elements.summary.textContent = text(board.today_summary);
  elements.beginnerStars.innerHTML = stars(board.overall_beginner_index);
  const expert = expertRecommendation(state.slots, board);
  elements.expertStars.innerHTML = stars(expert.score);
  elements.beginnerMessage.textContent = text(board.beginner_main_message);
  elements.advancedMessage.textContent = expert.message;
  elements.beginnerBest.textContent = availableBestTime(state.slots, "beginner_index", board.best_beginner_time);
  elements.advancedBest.textContent = availableBestTime(state.slots, "advanced_index", board.best_advanced_time);
  elements.localNote.textContent = text(board.local_note);
  elements.notice.textContent = text(board.notice);
  renderTags();
  renderTrend(state.slots);
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
      <span>表示指数：${escapeHtml(tab.label)}</span>
      <strong>${plainStars(scoreForSlot(slot, tab.key))}</strong>
    </div>
    <p class="slot-message">${escapeHtml(slot.message)}</p>
    ${slot.caution ? `<p class="caution">${escapeHtml(slot.caution)}</p>` : ""}
  `;
  return article;
}

function mergeTodaySlots(board, forecast) {
  const slots = Array.isArray(board.slots) ? board.slots : [];
  const forecastSlots = forecastSlotsForToday(forecast);
  return slots.map((slot) => {
    const forecastSlot = forecastSlots.find((candidate) => candidate.label === slot.label);
    return forecastSlot ? { ...slot, ...forecastSlot, status: slot.status, message: slot.message, caution: slot.caution } : slot;
  });
}

function forecastSlotsForToday(forecast) {
  const today = currentJstDate();
  const day = Array.isArray(forecast?.days) ? forecast.days.find((candidate) => candidate.date === today) : null;
  const spot = Array.isArray(day?.spots)
    ? day.spots.find((candidate) => candidate.spot_id === "kugenuma_main") ?? day.spots[0]
    : null;
  return Array.isArray(spot?.slots) ? spot.slots : [];
}

function expertRecommendation(slots, board) {
  const averages = {
    ロング: averageScore(slots, "longboard_index") || scoreValue(board.overall_longboard_index),
    ミッドレングス: averageScore(slots, "midlength_index") || scoreValue(board.overall_longboard_index),
    ショート: averageScore(slots, "shortboard_index") || conservativeShortboardScore(board.overall_longboard_index),
  };
  const best = Object.entries(averages).sort((a, b) => b[1] - a[1])[0] ?? ["ロング", 3];

  if (!slots.some((slot) => Number.isFinite(Number(slot.midlength_index)) || Number.isFinite(Number(slot.shortboard_index)))) {
    return {
      score: scoreValue(board.overall_longboard_index),
      message: "ロング・ミッドレングス中心。ショートは条件次第で、現地の波の力を確認してください。",
    };
  }

  const short = averages.ショート;
  const suffix = short >= 4 ? "ショートも候補に入ります。" : "ショートは波の力が足りる時間帯を選ぶのが安心です。";
  return {
    score: scoreValue(best[1]),
    message: `${best[0]}が今日の第一候補です。${suffix}`,
  };
}

function averageScore(slots, key) {
  const scores = slots.map((slot) => Number(slot[key])).filter(Number.isFinite);
  if (!scores.length) return null;
  return scores.reduce((sum, value) => sum + value, 0) / scores.length;
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

function renderTrend(slots) {
  const rows = trendRows(slots);
  elements.trendSection.hidden = rows.length === 0;
  elements.trendGrid.replaceChildren(...rows.map(trendRow));
}

function trendRows(slots) {
  if (!slots.length) return [];
  const rows = [
    {
      label: "波サイズ",
      points: slots.map((slot) => {
        const score = scoreForSlot(slot, "general_wave_index");
        return { label: slot.label, value: waveTrendLabel(score), level: score };
      }),
    },
    {
      label: "風",
      points: slots.map((slot) => {
        const level = windTrendLevel(slot);
        return { label: slot.label, value: windTrendLabel(level), level };
      }),
    },
  ];
  if (slots.some((slot) => Number.isFinite(Number(slot.water_temp_c)))) {
    rows.push({
      label: "水温",
      points: slots.map((slot) => {
        const water = Number(slot.water_temp_c);
        return {
          label: slot.label,
          value: Number.isFinite(water) ? `${water.toFixed(1)}℃` : "—",
          level: water >= 24 ? 5 : water >= 21 ? 4 : water >= 18 ? 3 : water >= 15 ? 2 : 1,
        };
      }),
    });
  }
  return rows;
}

function trendRow(row) {
  const section = document.createElement("section");
  section.className = "trend-row";
  section.innerHTML = `
    <p class="trend-label">${escapeHtml(row.label)}</p>
    <div class="trend-points">
      ${row.points.map((point) => `
        <div class="trend-point trend-${scoreValue(point.level)}">
          <span>${escapeHtml(point.label)}</span>
          <strong>${escapeHtml(point.value)}</strong>
        </div>
      `).join("")}
    </div>
  `;
  return section;
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
  if (key === "longboard_index" || key === "advanced_index" || key === "midlength_index") return longboard;
  if (key === "shortboard_index") return conservativeShortboardScore(longboard);
  return scoreValue((beginner + longboard) / 2);
}

function conservativeShortboardScore(value) {
  return Math.max(1, Math.min(3, scoreValue(value) - 1));
}

function waveTrendLabel(score) {
  if (score >= 5) return "良い";
  if (score >= 4) return "ほどよい";
  if (score >= 3) return "普通";
  if (score >= 2) return "弱め";
  return "慎重";
}

function windTrendLevel(slot) {
  const status = `${slot.status ?? ""} ${slot.caution ?? ""}`;
  if (status.includes("非推奨")) return 1;
  if (status.includes("慎重") || status.includes("風") || status.includes("オンショア")) return 2;
  if (status.includes("おすすめ")) return 5;
  return 3;
}

function windTrendLabel(level) {
  if (level >= 5) return "穏やか";
  if (level >= 3) return "普通";
  return "注意";
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
