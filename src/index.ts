interface Env {
  QEST_KV: KVNamespace;
  ASSETS: Fetcher;
  DIFY_API_KEY: string;
  DIFY_FORECAST_API_KEY?: string;
  REFRESH_SECRET: string;
}

type WindType = "オフショア寄り" | "オンショア" | "サイド寄り";

interface HourlyData {
  time: string[];
  [key: string]: string[] | number[];
}

interface OpenMeteoResponse {
  hourly?: HourlyData;
}

interface SlotDefinition {
  label: string;
  time_range: string;
  startMinutes: number;
  endMinutes: number;
}

interface SlotData {
  label: string;
  time_range: string;
  wave_height_m: number;
  swell_height_m: number;
  swell_period_s: number;
  swell_direction_deg: number;
  wind_speed_ms: number;
  wind_direction_deg: number;
  wind_type: WindType;
  rain_mm: number;
  weather: string;
  warnings: string[];
  rule_beginner_score: number;
  rule_longboard_score: number;
}

interface ForecastCondition extends SlotData {
  water_temp_c: number;
  air_temp_c: number;
}

interface TodayWaterFields {
  water_temp_c: number | null;
  wetsuit_label: string | null;
  wetsuit_thickness: string | null;
  wetsuit_note: string | null;
}

interface TodayIndexFields {
  beginner_index: number;
  longboard_index: number;
  general_index: number;
  lesson_index: number;
  experienced_index: number;
  midlength_index: number;
  shortboard_index: number;
}

type ConditionSlotData = SlotData & TodayWaterFields & TodayIndexFields;
type TodayWaterSlot = TodayWaterFields & Pick<ForecastSlot, "label" | "time_range">;

interface DisplaySlot {
  label: string;
  time_range: string;
  general_index: number;
  lesson_index: number;
  beginner_index: number;
  experienced_index: number;
  longboard_index: number;
  midlength_index: number;
  shortboard_index: number;
  status: string;
  message: string;
  caution: string | null;
  water_temp_c: number | null;
  wetsuit_label: string | null;
  wetsuit_thickness: string | null;
  wetsuit_note: string | null;
}

interface TodayBestTimes {
  beginner: string;
  lesson: string;
  experienced: string;
  longboard: string;
  midlength: string;
  shortboard: string;
  [key: string]: string;
}

interface ConditionBestTimes {
  general: string | null;
  lesson: string | null;
  beginner: string | null;
  experienced: string | null;
  longboard: string | null;
  midlength: string | null;
  shortboard: string | null;
}

interface TodayTrend {
  labels: string[];
  time_ranges: string[];
  wave_height_m?: Array<number | null>;
  wind_speed_ms?: Array<number | null>;
  wind_direction_deg?: Array<number | null>;
  rain_mm?: Array<number | null>;
  water_temp_c?: Array<number | null>;
}

interface ConditionData {
  mode: "today_board";
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  generated_at: string;
  updated_at: string;
  overall_general_index: number;
  overall_lesson_index: number;
  overall_beginner_index: number;
  overall_experienced_index: number;
  overall_longboard_index: number;
  overall_midlength_index: number;
  overall_shortboard_index: number;
  best_times: ConditionBestTimes;
  water_temp_summary: string | null;
  wetsuit_summary: string | null;
  trend: TodayTrend;
  slots: ConditionSlotData[];
}

interface TodayBoard {
  updated_at: string;
  spot: string;
  brand: string;
  title: string;
  today_summary: string;
  overall_general_index: number;
  overall_lesson_index: number;
  overall_beginner_index: number;
  overall_experienced_index: number;
  overall_longboard_index: number;
  overall_midlength_index: number;
  overall_shortboard_index: number;
  best_times: TodayBestTimes;
  best_beginner_time: string;
  best_advanced_time: string;
  safety_level: string;
  beginner_main_message: string;
  experienced_main_message: string;
  advanced_main_message: string;
  board_main_message: string;
  recommended_board_types: string[];
  trend: TodayTrend;
  slots: DisplaySlot[];
  local_note: string;
  water_temp_summary: string | null;
  wetsuit_summary: string | null;
  ai_comment_status: string;
  notice: string;
}

type ForecastConfidence = "high" | "medium" | "low";

interface ForecastSlot {
  label: string;
  time_range: string;
  general_wave_index: number;
  lesson_index: number;
  beginner_index: number;
  longboard_index: number;
  midlength_index: number;
  shortboard_index: number;
  advanced_index: number;
  status: string;
  message: string;
  caution: string | null;
  confidence: ForecastConfidence;
  water_temp_c: number;
  wetsuit_label: string;
  wetsuit_thickness: string;
  wetsuit_note: string;
}

interface ForecastSpot {
  spot_id: string;
  spot_name: string;
  area: string;
  slots: ForecastSlot[];
}

interface ForecastDay {
  date: string;
  weekday: string;
  confidence: ForecastConfidence;
  summary: string;
  spots: ForecastSpot[];
}

interface ForecastAnalystRecommendations {
  lesson: unknown[];
  beginner: unknown[];
  experienced: unknown[];
}

interface ForecastAnalystBoardRecommendations {
  longboard: unknown[];
  midlength: unknown[];
  shortboard: unknown[];
}

interface ForecastAnalyst {
  ai_comment_status: "ok" | "fallback";
  weekly_summary: string | null;
  lesson_summary: string | null;
  practice_summary: string | null;
  recommendations: ForecastAnalystRecommendations;
  board_recommendations: ForecastAnalystBoardRecommendations;
  wetsuit_summary: string | null;
  confidence_notes: unknown[];
  notice: string;
}

interface ForecastBoard {
  updated_at: string;
  brand: "BIG WAVE";
  title: "湘南7日サーフィン予測";
  area: "鵠沼・江の島・鎌倉側";
  default_metric: "general_wave_index";
  tags: string[];
  days: ForecastDay[];
  wetsuit_notice: string;
  analyst: ForecastAnalyst;
  notice: string;
}

type ForecastWithoutAnalyst = Omit<ForecastBoard, "analyst">;

interface RawForecastData {
  marine: HourlyData;
  weather: HourlyData;
}

interface SpotDefinition {
  spot_id: string;
  spot_name: string;
  area: string;
  waveFactor: number;
  lessonBonus: number;
  beginnerBonus: number;
  longboardBonus: number;
  midlengthBonus: number;
  shortboardBonus: number;
  advancedBonus: number;
}

interface DifyOutputs {
  result?: unknown;
  text?: unknown;
  answer?: unknown;
  textString?: unknown;
}

interface DifyResponse {
  data?: {
    outputs?: DifyOutputs;
  };
}

const BOARD_KEY = "qest_today_board";
const FORECAST_KEY = "surf:forecast:v1";
const JSON_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

const SLOT_DEFINITIONS: SlotDefinition[] = [
  { label: "早朝", time_range: "06:00-09:00", startMinutes: 360, endMinutes: 540 },
  { label: "午前", time_range: "09:00-11:30", startMinutes: 540, endMinutes: 690 },
  { label: "午後", time_range: "13:30-16:00", startMinutes: 810, endMinutes: 960 },
  { label: "夕方", time_range: "16:00-18:30", startMinutes: 960, endMinutes: 1110 },
];

const FORECAST_SPOTS: SpotDefinition[] = [
  {
    spot_id: "kugenuma_main",
    spot_name: "鵠沼メイン",
    area: "鵠沼",
    waveFactor: 1,
    lessonBonus: 0,
    beginnerBonus: 0,
    longboardBonus: 0,
    midlengthBonus: 0,
    shortboardBonus: 0,
    advancedBonus: 0,
  },
  {
    spot_id: "katase_nishihama",
    spot_name: "片瀬西浜・水族館前",
    area: "江の島寄り",
    waveFactor: 0.88,
    lessonBonus: 0.4,
    beginnerBonus: 0.3,
    longboardBonus: 0.2,
    midlengthBonus: 0,
    shortboardBonus: -0.2,
    advancedBonus: -0.1,
  },
  {
    spot_id: "katase_higashihama_koshigoe",
    spot_name: "片瀬東浜・腰越",
    area: "江の島・鎌倉側",
    waveFactor: 0.68,
    lessonBonus: 0.2,
    beginnerBonus: 0.3,
    longboardBonus: 0,
    midlengthBonus: -0.2,
    shortboardBonus: -1,
    advancedBonus: -0.4,
  },
];

const FALLBACK_SLOTS: SlotData[] = [
  demoSlot("早朝", "06:00-09:00", 0.45, 0.35, 8, 165, 2.2, 340, 0, "晴れ", 5, 5),
  demoSlot("午前", "09:00-11:30", 0.55, 0.4, 8, 170, 3.4, 110, 0, "晴れ時々くもり", 5, 5),
  demoSlot("午後", "13:30-16:00", 0.7, 0.5, 7, 175, 5.8, 180, 0.2, "くもり", 3, 3, ["オンショアで面が乱れる可能性があります"]),
  demoSlot("夕方", "16:00-18:30", 0.6, 0.45, 7, 180, 4.6, 210, 0, "くもり", 4, 4),
];

const FALLBACK_BOARD: TodayBoard = {
  updated_at: "デモデータ（未更新）",
  spot: "鵠沼海岸",
  brand: "BIG WAVE",
  title: "鵠沼サーフィン指数",
  today_summary: "早朝は風が弱く、初心者とロングボードの練習に比較的合わせやすい見込みです。",
  overall_general_index: 4,
  overall_lesson_index: 4,
  overall_beginner_index: 4,
  overall_experienced_index: 4,
  overall_longboard_index: 4,
  overall_midlength_index: 3,
  overall_shortboard_index: 2,
  best_times: {
    beginner: "06:00〜09:00",
    lesson: "06:00〜09:00",
    experienced: "06:00〜09:00",
    longboard: "06:00〜09:00",
    midlength: "06:00〜09:00",
    shortboard: "条件次第",
  },
  best_beginner_time: "06:00〜09:00",
  best_advanced_time: "06:00〜09:00",
  safety_level: "safe",
  beginner_main_message: "風が弱い早朝が、初心者には比較的合わせやすい見込みです。",
  experienced_main_message: "ロング・ミッドレングス中心に早めの時間帯が狙いやすい見込みです。",
  advanced_main_message: "ロングボード経験者も、早めの時間帯が狙いやすい見込みです。",
  board_main_message: "ロング・ミッドレングス中心。ショートは条件次第です。",
  recommended_board_types: ["ロング", "ミッドレングス"],
  trend: buildTodayTrend(FALLBACK_SLOTS.map(enrichConditionSlot)),
  slots: FALLBACK_SLOTS.map(displaySlotFromCondition),
  local_note: "江の島寄りは少し穏やかに見える場合があります。",
  water_temp_summary: null,
  wetsuit_summary: null,
  ai_comment_status: "fallback",
  notice:
    "この指数はAIと気象・海況データによる参考情報です。海の状況は急に変わることがあります。実際に海に入るかどうかは、現地の状況を確認して判断してください。",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }

    if (request.method === "GET" && url.pathname === "/api/today") {
      const cached = await env.QEST_KV.get<unknown>(BOARD_KEY, "json");
      return json(isRecord(cached) ? normalizeStoredBoard(cached) : FALLBACK_BOARD);
    }

    if (request.method === "GET" && url.pathname === "/api/forecast") {
      const cached = await env.QEST_KV.get<unknown>(FORECAST_KEY, "json");
      if (isRecord(cached) && forecastHasWetsuitData(cached)) {
        const normalized = normalizeStoredForecast(cached);
        if (normalized.analyst.ai_comment_status === "ok" || !env.DIFY_FORECAST_API_KEY) return json(normalized);
        console.warn("Cached forecast analyst fallback; refresh attempted");
        try {
          return json(await refreshForecast(env));
        } catch (error) {
          console.error("Forecast analyst refresh from cached fallback failed", error);
          return json(normalized);
        }
      }

      try {
        return json(await refreshForecast(env));
      } catch (error) {
        console.error("Forecast refresh failed", error);
        return json({ error: "Forecast unavailable" }, 502);
      }
    }

    if (request.method === "GET" && url.pathname === "/api/refresh") {
      const secret = url.searchParams.get("secret");
      if (!env.REFRESH_SECRET || secret !== env.REFRESH_SECRET) {
        return json({ error: "Unauthorized" }, 401);
      }

      try {
        const board = await refreshBoard(env);
        try {
          await refreshForecast(env);
        } catch (error) {
          console.error("Forecast refresh failed during manual refresh; today board was preserved", error);
        }
        return json(board);
      } catch (error) {
        console.error("Manual refresh failed", error);
        return json({ error: "Refresh failed; the previous KV value was preserved." }, 502);
      }
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "Not found" }, 404);
    }

    if (request.method === "GET" && url.pathname === "/forecast") {
      const assetUrl = new URL(request.url);
      assetUrl.pathname = "/forecast.html";
      return env.ASSETS.fetch(new Request(assetUrl, request));
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      refreshBoard(env).catch((error: unknown) => {
        console.error("Scheduled refresh failed; existing KV data was preserved", error);
      }),
    );
    ctx.waitUntil(
      refreshForecast(env).catch((error: unknown) => {
        console.error("Scheduled forecast refresh failed; existing KV forecast was preserved", error);
      }),
    );
  },
} satisfies ExportedHandler<Env>;

async function refreshBoard(env: Env): Promise<TodayBoard> {
  const condition = await fetchConditions(env);
  const board = await runDify(env.DIFY_API_KEY, condition);
  await env.QEST_KV.put(BOARD_KEY, JSON.stringify(board));
  return board;
}

async function refreshForecast(env: Env): Promise<ForecastBoard> {
  const raw = await fetchRawForecastData(7);
  const forecastBase = buildForecastBoard(raw);
  const analyst = await runDifyForecastAnalyst(env, forecastBase);
  const forecast: ForecastBoard = { ...forecastBase, analyst };
  await env.QEST_KV.put(FORECAST_KEY, JSON.stringify(forecast));
  return forecast;
}

async function fetchConditions(env: Env): Promise<ConditionData> {
  const { marine, weather } = await fetchRawForecastData(1);
  const forecastDate = String(marine.time[0] ?? weather.time[0] ?? "").slice(0, 10);
  if (!forecastDate) throw new Error("Open-Meteo returned no forecast date");

  const slots = SLOT_DEFINITIONS.map((definition) => enrichConditionSlot(aggregateSlot(definition, forecastDate, marine, weather)));
  const updatedAt = formatJapanDateTime();
  const overall = conditionOverallIndices(slots);
  const bestTimes = conditionBestTimes(slots);
  const condition: ConditionData = {
    mode: "today_board",
    location: "鵠沼海岸",
    latitude: 35.317,
    longitude: 139.472,
    date: `${forecastDate} 00:00`,
    generated_at: updatedAt,
    updated_at: updatedAt,
    ...overall,
    best_times: bestTimes,
    water_temp_summary: null,
    wetsuit_summary: null,
    trend: buildTodayTrend(slots),
    slots,
  };
  console.log("Today condition index enrichment", {
    indicesAdded: slots.every(hasConditionIndices),
    timeRangeNormalized: slots.every((slot) => !slot.time_range.includes("-")),
    shortboardBestTimeNull: bestTimes.shortboard === null,
  });
  return enrichTodayConditionWithWater(env, condition, { marine, weather }, forecastDate);
}

function enrichConditionSlot(slot: SlotData): ConditionSlotData {
  const indices = conditionSlotIndices(slot);
  return {
    ...slot,
    time_range: displayTimeRange(slot.time_range),
    ...indices,
    water_temp_c: null,
    wetsuit_label: null,
    wetsuit_thickness: null,
    wetsuit_note: null,
  };
}

function conditionSlotIndices(slot: SlotData): TodayIndexFields {
  const beginner = asScore(slot.rule_beginner_score, 1);
  const longboard = asScore(slot.rule_longboard_score, 1);
  const highCaution = slot.wave_height_m >= 1.1 || slot.wind_speed_ms >= 7 || slot.warnings.length >= 2;
  const strongOnshore = slot.wind_type === "オンショア" && slot.wind_speed_ms >= 5;
  const rainy = slot.rain_mm > 1;
  const weakSmall = slot.wave_height_m < 0.35;

  const lessonPenalty = (slot.wind_speed_ms >= 6 ? 1 : 0) + (rainy ? 1 : 0) + (highCaution ? 1 : 0);
  const lesson = clampScore(beginner - lessonPenalty);

  const experiencedPenalty = (strongOnshore ? 1 : 0) + (rainy ? 1 : 0) + (highCaution ? 1 : 0);
  const experienced = clampScore(longboard - experiencedPenalty);

  const midlengthPenalty = weakSmall ? 1 : slot.wave_height_m < 0.5 && slot.swell_period_s < 7 ? 1 : 0;
  const midlength = clampScore(longboard - midlengthPenalty);

  const shortboard = conditionShortboardScore(slot);
  const generalPenalty = highCaution || strongOnshore || rainy ? 1 : 0;
  const general = clampScore(Math.round((lesson * 0.4 + beginner * 0.25 + experienced * 0.35) - generalPenalty * 0.35));

  return {
    beginner_index: beginner,
    longboard_index: longboard,
    general_index: general,
    lesson_index: lesson,
    experienced_index: experienced,
    midlength_index: midlength,
    shortboard_index: shortboard,
  };
}

function conditionShortboardScore(slot: SlotData): number {
  const size = slot.wave_height_m;
  const period = slot.swell_period_s;
  const cleanEnough = !(slot.wind_type === "オンショア" && slot.wind_speed_ms >= 5) && slot.wind_speed_ms <= 5 && slot.rain_mm <= 1;
  const messy = slot.wind_speed_ms >= 7 || (slot.wind_type === "オンショア" && slot.wind_speed_ms >= 5) || slot.rain_mm > 1 || slot.warnings.length >= 2;

  let score = 1;
  if (size >= 0.9 && period >= 8 && cleanEnough) score = 5;
  else if (size >= 0.7 && period >= 7 && cleanEnough) score = 4;
  else if (size >= 0.55 && period >= 7) score = 3;
  else if (size >= 0.4 && !messy) score = 2;

  if (messy) score -= 1;
  if (size < 0.35 || (size < 0.45 && period < 7)) score = Math.min(score, 1);
  if (score >= 4 && !cleanEnough) score = 3;
  return clampScore(score);
}

function conditionOverallIndices(slots: ConditionSlotData[]): Pick<
  ConditionData,
  | "overall_general_index"
  | "overall_lesson_index"
  | "overall_beginner_index"
  | "overall_experienced_index"
  | "overall_longboard_index"
  | "overall_midlength_index"
  | "overall_shortboard_index"
> {
  return {
    overall_general_index: bestConditionIndex(slots, "general_index"),
    overall_lesson_index: bestConditionIndex(slots, "lesson_index"),
    overall_beginner_index: bestConditionIndex(slots, "beginner_index"),
    overall_experienced_index: bestConditionIndex(slots, "experienced_index"),
    overall_longboard_index: bestConditionIndex(slots, "longboard_index"),
    overall_midlength_index: bestConditionIndex(slots, "midlength_index"),
    overall_shortboard_index: bestConditionIndex(slots, "shortboard_index"),
  };
}

function conditionBestTimes(slots: ConditionSlotData[]): ConditionBestTimes {
  return {
    general: bestConditionTime(slots, "general_index", 3),
    lesson: bestConditionTime(slots, "lesson_index", 3),
    beginner: bestConditionTime(slots, "beginner_index", 3),
    experienced: bestConditionTime(slots, "experienced_index", 3),
    longboard: bestConditionTime(slots, "longboard_index", 3),
    midlength: bestConditionTime(slots, "midlength_index", 3),
    shortboard: bestConditionTime(slots, "shortboard_index", 4),
  };
}

function bestConditionIndex(slots: ConditionSlotData[], key: keyof TodayIndexFields): number {
  return Math.max(...slots.map((slot) => slot[key]));
}

function bestConditionTime(slots: ConditionSlotData[], key: keyof TodayIndexFields, minimumScore: number): string | null {
  const best = [...slots]
    .filter((slot) => slot[key] >= minimumScore)
    .sort((a, b) => {
      const scoreDiff = b[key] - a[key];
      if (scoreDiff !== 0) return scoreDiff;
      return slotDefinitionRank(a.label) - slotDefinitionRank(b.label);
    })[0];
  return best?.time_range ?? null;
}

function hasConditionIndices(slot: ConditionSlotData): boolean {
  return [
    slot.general_index,
    slot.lesson_index,
    slot.beginner_index,
    slot.experienced_index,
    slot.longboard_index,
    slot.midlength_index,
    slot.shortboard_index,
  ].every(Number.isFinite);
}

function slotDefinitionRank(label: string): number {
  const index = SLOT_DEFINITIONS.findIndex((definition) => definition.label === label);
  return index === -1 ? 99 : index;
}

async function enrichTodayConditionWithWater(
  env: Env,
  condition: ConditionData,
  raw: RawForecastData,
  forecastDate: string,
): Promise<ConditionData> {
  const cached = await env.QEST_KV.get<unknown>(FORECAST_KEY, "json");
  const cachedSlots = isRecord(cached) && forecastHasWetsuitData(cached) && isFreshForecastForToday(cached)
    ? todayKugenumaForecastSlots(cached, forecastDate)
    : [];

  if (cachedSlots.length) {
    const enriched = applyWaterFieldsToCondition(condition, cachedSlots, "forecast cache");
    if (enriched.enrichedCount > 0) {
      console.log("Today water data injection", {
        injected: true,
        source: "forecast cache",
        enrichedSlots: enriched.enrichedCount,
      });
      return enriched.condition;
    }
  }

  const freshSlots = buildTodayWaterSlotsFromRaw(raw, forecastDate);
  const enriched = applyWaterFieldsToCondition(condition, freshSlots, "fresh fetch");
  console.log("Today water data injection", {
    injected: enriched.enrichedCount > 0,
    source: "fresh fetch",
    enrichedSlots: enriched.enrichedCount,
  });
  return enriched.condition;
}

function isFreshForecastForToday(value: Record<string, unknown>): boolean {
  return asString(value.updated_at, "").startsWith(currentJapanDate());
}

function todayKugenumaForecastSlots(value: Record<string, unknown>, forecastDate: string): TodayWaterSlot[] {
  const days = Array.isArray(value.days) ? value.days : [];
  const day = days.find((candidate) => isRecord(candidate) && candidate.date === forecastDate);
  if (!isRecord(day) || !Array.isArray(day.spots)) return [];
  const spot = day.spots.find((candidate) => isRecord(candidate) && candidate.spot_id === "kugenuma_main") ?? day.spots[0];
  if (!isRecord(spot) || !Array.isArray(spot.slots)) return [];
  return spot.slots.filter(isWaterSlot);
}

function buildTodayWaterSlotsFromRaw(raw: RawForecastData, forecastDate: string): TodayWaterSlot[] {
  return SLOT_DEFINITIONS.map((definition) => {
    const marineIndices = indicesForSlot(raw.marine.time, forecastDate, definition);
    const weatherIndices = indicesForSlot(raw.weather.time, forecastDate, definition);
    const waterTemp = optionalAverageAt(raw.marine.sea_surface_temperature, marineIndices);
    if (waterTemp === null) {
      return {
        label: definition.label,
        time_range: displayTimeRange(definition.time_range),
        water_temp_c: null,
        wetsuit_label: null,
        wetsuit_thickness: null,
        wetsuit_note: null,
      };
    }
    const wind = optionalAverageAt(raw.weather.wind_speed_10m, weatherIndices) ?? 0;
    const rain = sumAt(raw.weather.precipitation, weatherIndices);
    const weatherCode = modeAt(raw.weather.weather_code, weatherIndices);
    const airTemp = optionalAverageAt(raw.weather.temperature_2m, weatherIndices) ?? waterTemp;
    const wetsuit = wetsuitRecommendation(round(waterTemp, 1), {
      airTemp,
      wind,
      rain,
      weather: weatherLabel(weatherCode),
    });
    return {
      label: definition.label,
      time_range: displayTimeRange(definition.time_range),
      water_temp_c: round(waterTemp, 1),
      wetsuit_label: wetsuit.label,
      wetsuit_thickness: wetsuit.thickness,
      wetsuit_note: wetsuit.note,
    };
  });
}

function applyWaterFieldsToCondition(
  condition: ConditionData,
  waterSlots: TodayWaterSlot[],
  _source: "forecast cache" | "fresh fetch",
): { condition: ConditionData; enrichedCount: number } {
  let enrichedCount = 0;
  const slots = condition.slots.map((slot) => {
    const match = waterSlots.find((candidate) =>
      candidate.label === slot.label || displayTimeRange(candidate.time_range) === displayTimeRange(slot.time_range),
    );
    if (!match || match.water_temp_c === null) return slot;
    enrichedCount += 1;
    return {
      ...slot,
      water_temp_c: match.water_temp_c,
      wetsuit_label: match.wetsuit_label,
      wetsuit_thickness: match.wetsuit_thickness,
      wetsuit_note: match.wetsuit_note,
    };
  });
  return {
    condition: {
      ...condition,
      water_temp_summary: waterTempSummary(slots),
      wetsuit_summary: wetsuitSummary(slots),
      trend: buildTodayTrend(slots, true),
      slots,
    },
    enrichedCount,
  };
}

function isWaterSlot(value: unknown): value is TodayWaterSlot {
  return (
    isRecord(value) &&
    typeof value.label === "string" &&
    typeof value.time_range === "string" &&
    typeof value.water_temp_c === "number" &&
    typeof value.wetsuit_label === "string" &&
    typeof value.wetsuit_thickness === "string" &&
    typeof value.wetsuit_note === "string"
  );
}

function waterTempSummary(slots: ConditionSlotData[]): string | null {
  const values = slots.map((slot) => slot.water_temp_c).filter((value): value is number => typeof value === "number");
  if (!values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return min === max ? `水温はおおむね${min.toFixed(1)}℃です。` : `水温はおおむね${min.toFixed(1)}〜${max.toFixed(1)}℃です。`;
}

function wetsuitSummary(slots: ConditionSlotData[]): string | null {
  const labels = [...new Set(slots.map((slot) => slot.wetsuit_label).filter((value): value is string => typeof value === "string"))];
  const thicknesses = [...new Set(slots.map((slot) => slot.wetsuit_thickness).filter((value): value is string => typeof value === "string"))];
  if (!labels.length && !thicknesses.length) return null;
  const label = labels.length === 1 ? labels[0] : labels.join(" / ");
  const thickness = thicknesses.length === 1 ? thicknesses[0] : thicknesses.join(" / ");
  return `${label}（${thickness}）を目安にしてください。`;
}

function buildTodayTrend(slots: Array<SlotData & Partial<TodayWaterFields>>, logDiagnostics = false): TodayTrend {
  const ordered = SLOT_DEFINITIONS.map((definition) =>
    slots.find((slot) => slot.label === definition.label || displayTimeRange(slot.time_range) === displayTimeRange(definition.time_range)),
  );
  const trend: TodayTrend = {
    labels: SLOT_DEFINITIONS.map((definition) => definition.label),
    time_ranges: SLOT_DEFINITIONS.map((definition) => displayTimeRange(definition.time_range)),
    wave_height_m: ordered.map((slot) => optionalRounded(slot?.wave_height_m, 2)),
    wind_speed_ms: ordered.map((slot) => optionalRounded(slot?.wind_speed_ms, 1)),
    wind_direction_deg: ordered.map((slot) => optionalRounded(slot?.wind_direction_deg, 0)),
    rain_mm: ordered.map((slot) => optionalRounded(slot?.rain_mm, 1)),
  };
  const water = ordered.map((slot) => optionalRounded(slot?.water_temp_c, 1));
  if (water.some((value) => value !== null)) trend.water_temp_c = water;
  if (logDiagnostics) {
    console.log("Today trend built", {
      built: true,
      points: trend.labels.length,
      hasWaterTemp: Boolean(trend.water_temp_c),
    });
  }
  return trend;
}

async function fetchRawForecastData(forecastDays: number): Promise<RawForecastData> {
  const common = `latitude=35.317&longitude=139.472&timezone=Asia%2FTokyo&forecast_days=${forecastDays}`;
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?${common}&hourly=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period,sea_surface_temperature`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?${common}&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,weather_code,cloud_cover&wind_speed_unit=ms`;

  const [marineResponse, weatherResponse] = await Promise.all([
    fetchOpenMeteo(marineUrl, "Marine"),
    fetchOpenMeteo(weatherUrl, "Weather"),
  ]);

  if (!marineResponse.hourly || !weatherResponse.hourly) {
    throw new Error("Open-Meteo returned no hourly data");
  }

  return {
    marine: marineResponse.hourly,
    weather: weatherResponse.hourly,
  };
}

function aggregateForecastSlot(
  definition: SlotDefinition,
  date: string,
  marine: HourlyData,
  weather: HourlyData,
): ForecastCondition {
  const slot = aggregateSlot(definition, date, marine, weather);
  const marineIndices = indicesForSlot(marine.time, date, definition);
  const weatherIndices = indicesForSlot(weather.time, date, definition);
  const airTemp = optionalAverageAt(weather.temperature_2m, weatherIndices) ?? 20;
  const waterTemp = optionalAverageAt(marine.sea_surface_temperature, marineIndices) ?? airTemp;

  return {
    ...slot,
    water_temp_c: round(waterTemp, 1),
    air_temp_c: round(airTemp, 1),
  };
}

async function fetchOpenMeteo(url: string, label: string): Promise<OpenMeteoResponse> {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`${label} API failed with ${response.status}`);
  return (await response.json()) as OpenMeteoResponse;
}

function aggregateSlot(
  definition: SlotDefinition,
  date: string,
  marine: HourlyData,
  weather: HourlyData,
): SlotData {
  const marineIndices = indicesForSlot(marine.time, date, definition);
  const weatherIndices = indicesForSlot(weather.time, date, definition);
  if (!marineIndices.length || !weatherIndices.length) {
    throw new Error(`Hourly data missing for ${definition.label}`);
  }

  const waveHeight = averageAt(marine.wave_height, marineIndices);
  const swellHeight = averageAt(marine.swell_wave_height, marineIndices);
  const swellPeriod = averageAt(marine.swell_wave_period, marineIndices);
  const swellDirection = circularAverageAt(marine.swell_wave_direction, marineIndices);
  const windSpeed = averageAt(weather.wind_speed_10m, weatherIndices);
  const windDirection = circularAverageAt(weather.wind_direction_10m, weatherIndices);
  const rain = sumAt(weather.precipitation, weatherIndices);
  const weatherCode = modeAt(weather.weather_code, weatherIndices);
  const windType = classifyWind(windDirection);
  const warnings = buildWarnings(waveHeight, windSpeed, windType, rain);

  return {
    label: definition.label,
    time_range: definition.time_range,
    wave_height_m: round(waveHeight, 2),
    swell_height_m: round(swellHeight, 2),
    swell_period_s: round(swellPeriod, 1),
    swell_direction_deg: Math.round(swellDirection),
    wind_speed_ms: round(windSpeed, 1),
    wind_direction_deg: Math.round(windDirection),
    wind_type: windType,
    rain_mm: round(rain, 1),
    weather: weatherLabel(weatherCode),
    warnings,
    rule_beginner_score: beginnerScore(waveHeight, windSpeed, windType, rain),
    rule_longboard_score: longboardScore(waveHeight, swellPeriod, windSpeed, windType),
  };
}

function buildForecastBoard(raw: RawForecastData): ForecastWithoutAnalyst {
  const dates = uniqueDates(raw.marine.time).slice(0, 7);
  if (!dates.length) throw new Error("Open-Meteo returned no forecast dates");

  const days = dates.map((date, dayIndex) => {
    const baselineSlots = SLOT_DEFINITIONS.map((definition) => aggregateForecastSlot(definition, date, raw.marine, raw.weather));
    const spots = FORECAST_SPOTS.map((spot) => ({
      spot_id: spot.spot_id,
      spot_name: spot.spot_name,
      area: spot.area,
      slots: baselineSlots.map((slot, slotIndex) => forecastSlotForSpot(slot, spot, dayIndex, slotIndex)),
    }));
    const allSlots = spots.flatMap((spot) => spot.slots);
    return {
      date,
      weekday: weekdayLabel(date),
      confidence: reduceConfidence(slotBaseConfidence(dayIndex), allSlots),
      summary: forecastDaySummary(baselineSlots, spots),
      spots,
    };
  });

  return {
    updated_at: formatJapanDateTime(),
    brand: "BIG WAVE",
    title: "湘南7日サーフィン予測",
    area: "鵠沼・江の島・鎌倉側",
    default_metric: "general_wave_index",
    tags: ["general", "lesson", "beginner", "longboard", "midlength", "shortboard", "advanced"],
    days,
    wetsuit_notice:
      "水温・気温・風・体感には個人差があります。寒がりの方やレッスンでは一段暖かめを選ぶと安心です。",
    notice: "この予測は気象・海況データと簡易ルールによる参考情報です。実際の海況は現地で確認してください。",
  };
}

function forecastSlotForSpot(
  baseline: ForecastCondition,
  spot: SpotDefinition,
  dayIndex: number,
  slotIndex: number,
): ForecastSlot {
  const wave = baseline.wave_height_m * spot.waveFactor;
  const wind = baseline.wind_speed_ms;
  const onshore = baseline.wind_type === "オンショア";
  const afternoon = baseline.label === "午後" || baseline.label === "夕方";
  const kugenumaTooBigOrRough =
    baseline.wave_height_m >= 0.95 || wind >= 6 || (baseline.wind_type === "オンショア" && wind >= 5);
  const higashihamaFallbackBoost =
    spot.spot_id === "katase_higashihama_koshigoe" && kugenumaTooBigOrRough ? 1.1 : 0;
  const danger = wave >= 1.35 || baseline.wave_height_m >= 1.5 || wind >= 9;
  const rough = danger || wave >= 1.05 || wind >= 6 || (onshore && wind >= 5) || baseline.rain_mm > 1.5;
  const morningBonus = slotIndex <= 1 ? 0.5 : 0;
  const afternoonPenalty = afternoon && onshore ? 0.8 : afternoon && wind >= 5 ? 0.4 : 0;

  const lesson = scoreLesson(wave, wind, onshore, baseline.rain_mm, morningBonus, afternoonPenalty)
    + spot.lessonBonus
    + higashihamaFallbackBoost;
  const beginner = scoreBeginnerForecast(wave, wind, onshore, baseline.rain_mm, morningBonus, afternoonPenalty)
    + spot.beginnerBonus
    + higashihamaFallbackBoost * 0.7;
  const longboard = scoreLongboardForecast(wave, baseline.swell_period_s, wind, onshore, afternoonPenalty)
    + spot.longboardBonus;
  const midlength = scoreMidlengthForecast(wave, baseline.swell_period_s, wind, onshore, afternoonPenalty)
    + spot.midlengthBonus;
  const shortboard = scoreShortboardForecast(wave, baseline.swell_period_s, wind, onshore, afternoonPenalty)
    + spot.shortboardBonus;
  const advanced = scoreAdvancedForecast(wave, baseline.swell_period_s, wind, onshore, afternoonPenalty)
    + spot.advancedBonus;
  const general = (beginner + longboard + midlength + shortboard + advanced) / 5;
  const confidence = reduceConfidence(slotBaseConfidence(dayIndex), [
    {
      confidence: slotBaseConfidence(dayIndex),
      status: rough ? "慎重" : "まずまず",
      caution: rough ? "風や波の変化に注意してください。" : null,
    },
  ]);
  const wetsuit = wetsuitRecommendation(baseline.water_temp_c, {
    airTemp: baseline.air_temp_c,
    wind,
    rain: baseline.rain_mm,
    weather: baseline.weather,
  });

  return {
    label: baseline.label,
    time_range: displayTimeRange(baseline.time_range),
    general_wave_index: clampScore(Math.round(general)),
    lesson_index: danger ? 1 : clampScore(Math.round(lesson)),
    beginner_index: danger ? 1 : clampScore(Math.round(beginner)),
    longboard_index: clampScore(Math.round(danger ? longboard - 2 : longboard)),
    midlength_index: clampScore(Math.round(danger ? midlength - 1 : midlength)),
    shortboard_index: clampScore(Math.round(danger ? shortboard - 1 : shortboard)),
    advanced_index: clampScore(Math.round(danger ? advanced - 1 : advanced)),
    status: forecastStatus(danger, rough, lesson, general),
    message: forecastMessage(spot, baseline, wave, wind, onshore, higashihamaFallbackBoost > 0),
    caution: forecastCaution(danger, rough, baseline, wave, wind, onshore),
    confidence,
    water_temp_c: baseline.water_temp_c,
    wetsuit_label: wetsuit.label,
    wetsuit_thickness: wetsuit.thickness,
    wetsuit_note: wetsuit.note,
  };
}

function scoreLesson(
  wave: number,
  wind: number,
  onshore: boolean,
  rain: number,
  morningBonus: number,
  afternoonPenalty: number,
): number {
  let score = 3 + morningBonus - afternoonPenalty;
  if (wave >= 0.2 && wave <= 0.55) score += 2;
  else if (wave > 0.55 && wave <= 0.75) score += 1;
  else if (wave < 0.15) score -= 1;
  if (wave >= 0.9) score -= 2;
  if (wave >= 1.1) score -= 2;
  if (wind <= 3) score += 1;
  if (wind >= 5) score -= 1;
  if (onshore && wind >= 5) score -= 1.5;
  if (rain > 1) score -= 1;
  return score;
}

function scoreBeginnerForecast(
  wave: number,
  wind: number,
  onshore: boolean,
  rain: number,
  morningBonus: number,
  afternoonPenalty: number,
): number {
  let score = 3 + morningBonus * 0.6 - afternoonPenalty;
  if (wave >= 0.2 && wave <= 0.65) score += 2;
  else if (wave > 0.65 && wave <= 0.85) score += 1;
  else if (wave < 0.15) score -= 1;
  if (wave >= 1.0) score -= 2;
  if (wind <= 4) score += 1;
  if (onshore && wind >= 5) score -= 1.5;
  if (rain > 1) score -= 1;
  return score;
}

function scoreLongboardForecast(
  wave: number,
  period: number,
  wind: number,
  onshore: boolean,
  afternoonPenalty: number,
): number {
  let score = 3 - afternoonPenalty * 0.8;
  if (wave >= 0.3 && wave <= 0.9) score += 1.5;
  if (wave < 0.2) score -= 1;
  if (wave > 1.2) score -= 1;
  if (period >= 7 && period <= 11) score += 1;
  if (wind <= 4) score += 1;
  if (onshore && wind >= 6) score -= 2;
  return score;
}

function scoreMidlengthForecast(
  wave: number,
  period: number,
  wind: number,
  onshore: boolean,
  afternoonPenalty: number,
): number {
  let score = 3 - afternoonPenalty * 0.7;
  if (wave >= 0.45 && wave <= 1.1) score += 2;
  else if (wave >= 0.3 && wave < 0.45) score += 1;
  if (wave < 0.25) score -= 1;
  if (wave > 1.4) score -= 1;
  if (period >= 7) score += 0.7;
  if (wind <= 5) score += 0.5;
  if (onshore && wind >= 6) score -= 2;
  return score;
}

function scoreShortboardForecast(
  wave: number,
  period: number,
  wind: number,
  onshore: boolean,
  afternoonPenalty: number,
): number {
  let score = 2.5 - afternoonPenalty * 0.6;
  if (wave >= 0.7 && wave <= 1.4) score += 2;
  else if (wave >= 0.5 && wave < 0.7) score += 1;
  if (wave < 0.45) score -= 2;
  if (period >= 8) score += 1;
  if (wind <= 4) score += 0.5;
  if (onshore && wind >= 6) score -= 1.5;
  return score;
}

function scoreAdvancedForecast(
  wave: number,
  period: number,
  wind: number,
  onshore: boolean,
  afternoonPenalty: number,
): number {
  let score = 3 - afternoonPenalty * 0.4;
  if (wave >= 0.6 && wave <= 1.6) score += 2;
  if (wave < 0.35) score -= 1;
  if (wave > 1.8) score -= 1;
  if (period >= 8) score += 1;
  if (wind <= 5) score += 0.8;
  if (onshore && wind >= 7) score -= 2;
  return score;
}

function forecastStatus(danger: boolean, rough: boolean, lesson: number, general: number): string {
  if (danger) return "非推奨";
  if (rough || lesson <= 2) return "慎重";
  if (lesson >= 4 || general >= 4) return "おすすめ";
  return "まずまず";
}

function forecastMessage(
  spot: SpotDefinition,
  slot: SlotData,
  wave: number,
  wind: number,
  onshore: boolean,
  fallbackBoost: boolean,
): string {
  if (fallbackBoost) {
    return "鵠沼が大きめ・荒れ気味の時の初心者レッスン代替候補です。";
  }
  if (spot.spot_id === "katase_nishihama" && wave <= 0.8) {
    return "鵠沼より少し穏やかに使いやすい可能性があります。";
  }
  if (wave < 0.25) return "かなり小さめで、練習はしやすい一方で推進力は弱めです。";
  if (wave <= 0.65 && wind <= 4) return "小さめでまとまりやすく、基礎練習に向きやすい時間帯です。";
  if (onshore && wind >= 5) return "オンショアの影響で面が乱れやすい見込みです。";
  if (slot.wave_height_m >= 1.0) return "サイズが出やすく、経験や現地判断が必要です。";
  return "風と波のバランスを見ながら練習候補にできます。";
}

function forecastCaution(
  danger: boolean,
  rough: boolean,
  slot: SlotData,
  wave: number,
  wind: number,
  onshore: boolean,
): string | null {
  if (danger) return "波・風が強い可能性があります。初心者レッスンは非推奨です。";
  if (wave >= 1.0) return "初心者はサイズと流れを現地で確認してください。";
  if (onshore && wind >= 5) return "オンショアで面が乱れやすく、午後は特に慎重に判断してください。";
  if (wind >= 6) return "風が強めです。移動や待機も含めて余裕を持ってください。";
  if (slot.rain_mm > 1.5) return "雨による視界低下や体温低下に注意してください。";
  return rough ? "コンディション変化に注意してください。" : null;
}

function wetsuitRecommendation(
  waterTemp: number,
  condition: { airTemp: number; wind: number; rain: number; weather: string },
): { label: string; thickness: string; note: string } {
  const base =
    waterTemp >= 24
      ? { label: "タッパー / スプリング目安", thickness: "1〜2mm" }
      : waterTemp >= 21
        ? { label: "スプリング / ロングスプリング目安", thickness: "2mm〜3/2mm" }
        : waterTemp >= 18
          ? { label: "シーガル / 3mmフル目安", thickness: "3/2mm" }
          : waterTemp >= 15
            ? { label: "3mmフル / 4/3mm目安", thickness: "3/2mm〜4/3mm" }
            : waterTemp >= 12
              ? { label: "4/3mmフル + ブーツ検討", thickness: "4/3mm" }
              : { label: "セミドライ + 防寒小物目安", thickness: "5/3mm〜5/4mm" };

  const feelsCold =
    condition.wind >= 6 ||
    condition.rain > 0 ||
    condition.airTemp <= 18 ||
    condition.weather.includes("雨") ||
    condition.weather.includes("雪");

  const note = feelsCold
    ? "風・雨・低めの気温で体感が下がりやすい見込みです。レッスンや初心者練習では待ち時間もあるため、一段暖かめを選ぶと安心です。"
    : "風が弱ければ軽めでも入りやすいですが、レッスンや初心者練習では待ち時間もあるため、冷え対策で一段暖かめが安心です。";

  return { ...base, note };
}

function forecastHasWetsuitData(value: Record<string, unknown>): boolean {
  const days = value.days;
  if (!Array.isArray(days) || !days.length || typeof value.wetsuit_notice !== "string") return false;
  const firstDay = days[0];
  if (!isRecord(firstDay) || !Array.isArray(firstDay.spots)) return false;
  const firstSpot = firstDay.spots[0];
  if (!isRecord(firstSpot) || !Array.isArray(firstSpot.slots)) return false;
  const firstSlot = firstSpot.slots[0];
  return (
    isRecord(firstSlot) &&
    typeof firstSlot.water_temp_c === "number" &&
    typeof firstSlot.wetsuit_label === "string" &&
    typeof firstSlot.wetsuit_thickness === "string" &&
    typeof firstSlot.wetsuit_note === "string"
  );
}

function normalizeStoredForecast(value: Record<string, unknown>): ForecastBoard {
  return {
    updated_at: asString(value.updated_at, formatJapanDateTime()),
    brand: "BIG WAVE",
    title: "湘南7日サーフィン予測",
    area: "鵠沼・江の島・鎌倉側",
    default_metric: "general_wave_index",
    tags: normalizeStringArray(value.tags, ["general", "lesson", "beginner", "longboard", "midlength", "shortboard", "advanced"]),
    days: Array.isArray(value.days) ? (value.days as ForecastDay[]) : [],
    wetsuit_notice: asString(
      value.wetsuit_notice,
      "水温・気温・風・体感には個人差があります。寒がりの方やレッスンでは一段暖かめを選ぶと安心です。",
    ),
    analyst: normalizeStoredForecastAnalyst(value.analyst),
    notice: asString(
      value.notice,
      "この予測は気象・海況データと簡易ルールによる参考情報です。実際の海況は現地で確認してください。",
    ),
  };
}

function normalizeStoredForecastAnalyst(value: unknown): ForecastAnalyst {
  if (!isRecord(value)) return fallbackForecastAnalyst();
  const normalized = normalizeForecastAnalyst(value);
  const status = value.ai_comment_status === "ok" ? "ok" : "fallback";
  return {
    ...normalized,
    ai_comment_status: status,
    confidence_notes:
      status === "ok" || normalized.confidence_notes.length
        ? normalized.confidence_notes
        : fallbackForecastAnalyst().confidence_notes,
  };
}

function uniqueDates(times: string[]): string[] {
  const dates: string[] = [];
  for (const time of times) {
    const date = time.slice(0, 10);
    if (date && !dates.includes(date)) dates.push(date);
  }
  return dates;
}

function weekdayLabel(date: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", weekday: "short" }).format(
    new Date(`${date}T00:00:00+09:00`),
  );
}

function slotBaseConfidence(dayIndex: number): ForecastConfidence {
  if (dayIndex <= 1) return "high";
  if (dayIndex <= 3) return "medium";
  return "low";
}

function reduceConfidence(
  base: ForecastConfidence,
  slots: Array<Pick<ForecastSlot, "confidence" | "status" | "caution">>,
): ForecastConfidence {
  const unstable = slots.some((slot) => slot.status === "非推奨" || slot.status === "慎重" || slot.caution);
  if (!unstable) return base;
  if (base === "high") return "medium";
  return "low";
}

function forecastDaySummary(baselineSlots: SlotData[], spots: ForecastSpot[]): string {
  const bestLesson = spots
    .flatMap((spot) => spot.slots.map((slot) => ({ spot, slot })))
    .sort((a, b) => b.slot.lesson_index - a.slot.lesson_index)[0];
  const maxWave = Math.max(...baselineSlots.map((slot) => slot.wave_height_m));
  if (!bestLesson) return "時間帯ごとの波と風を確認して、無理のない範囲で計画してください。";
  if (maxWave >= 1.1 && bestLesson.spot.spot_id === "katase_higashihama_koshigoe") {
    return "鵠沼が大きめの日は、江の島・鎌倉側の穏やかな時間帯を代替候補にできます。";
  }
  return `${bestLesson.spot.spot_name}の${bestLesson.slot.label}が、レッスン・基礎練習の第一候補です。`;
}

async function callDifyWorkflow(
  apiKey: string,
  body: { inputs: Record<string, unknown>; response_mode: "blocking"; user: string },
  secretName: string,
  diagnosticsLabel?: string,
): Promise<DifyResponse> {
  if (!apiKey) throw new Error(`${secretName} is not configured`);
  const response = await fetch("https://api.dify.ai/v1/workflows/run", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (diagnosticsLabel) {
    console.log(`${diagnosticsLabel} response HTTP status`, response.status);
  }
  if (!response.ok) throw new Error(`Dify API failed with ${response.status}`);
  return (await response.json()) as DifyResponse;
}

async function runDify(apiKey: string, condition: ConditionData): Promise<TodayBoard> {
  const payload = await callDifyWorkflow(
    apiKey,
    {
      inputs: {
        mode: "today_board",
        condition_json: JSON.stringify(condition),
      },
      response_mode: "blocking",
      user: "big-wave-kugenuma",
    },
    "DIFY_API_KEY",
  );
  const result = parseDifyResult(payload.data?.outputs?.result);
  if (!isRecord(result)) throw new Error("Dify result was not an object");
  console.log("Dify today schema", {
    hasNewTopLevel:
      "overall_general_index" in result ||
      "best_times" in result ||
      "recommended_board_types" in result ||
      "board_main_message" in result,
    hasNewSlots: Array.isArray(result.slots) && result.slots.some((slot) => isRecord(slot) && "general_index" in slot),
  });
  return normalizeBoard(result, condition);
}

async function runDifyForecastAnalyst(env: Env, forecast: ForecastWithoutAnalyst): Promise<ForecastAnalyst> {
  const apiKey = env.DIFY_FORECAST_API_KEY;
  console.log("forecast analyst key present", Boolean(apiKey));
  if (!apiKey) {
    console.warn("DIFY_FORECAST_API_KEY missing; analyst fallback used");
    return fallbackForecastAnalyst();
  }

  try {
    console.log("Forecast analyst call started", {
      days: forecast.days.length,
      spots: forecast.days[0]?.spots.length ?? 0,
    });
    const payload = await callDifyWorkflow(
      apiKey,
      {
        inputs: {
          forecast_json: JSON.stringify(forecast),
          mode: "weekly_recommendation",
        },
        response_mode: "blocking",
        user: "big-wave-kugenuma",
      },
      "DIFY_FORECAST_API_KEY",
      "forecast analyst",
    );
    const result = parseDifyForecastResult(payload.data?.outputs);
    if (!isRecord(result)) throw new Error("Forecast analyst result was not an object");
    console.log("Forecast analyst success", {
      parsedKeys: Object.keys(result).slice(0, 12),
    });
    return normalizeForecastAnalyst(result);
  } catch (error) {
    console.error("Forecast analyst parse/fallback reason", error);
    return fallbackForecastAnalyst();
  }
}

function parseDifyForecastResult(outputs: DifyOutputs | undefined): unknown {
  const outputKeys = outputs && isRecord(outputs) ? Object.keys(outputs) : [];
  console.log("Forecast analyst output keys", outputKeys);
  if (!outputs || !isRecord(outputs) || outputs.result === undefined || outputs.result === null || outputs.result === "") {
    console.warn("Forecast analyst fallback reason", { reason: "missing_outputs_result", outputKeys });
    throw new Error("Forecast analyst outputs.result was missing");
  }
  try {
    const parsed = parseDifyResult(outputs.result);
    console.log("Forecast analyst parse success", { resultType: typeof parsed });
    return parsed;
  } catch (error) {
    console.warn("Forecast analyst parse failure", { reason: error instanceof Error ? error.message : "unknown_parse_error" });
    throw error;
  }
}

function parseDifyResult(result: unknown): unknown {
  if (typeof result !== "string") return result;
  const trimmed = result.trim();
  const withoutFence = trimmed.replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/i, "$1").trim();
  const jsonText = extractJsonObjectText(withoutFence);
  try {
    const parsed = JSON.parse(jsonText) as unknown;
    if (typeof parsed === "string") return parseDifyResult(parsed);
    return parsed;
  } catch {
    throw new Error("Dify result was not valid JSON");
  }
}

function extractJsonObjectText(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return trimmed;
  const firstObject = trimmed.indexOf("{");
  const lastObject = trimmed.lastIndexOf("}");
  if (firstObject !== -1 && lastObject > firstObject) return trimmed.slice(firstObject, lastObject + 1);
  const firstArray = trimmed.indexOf("[");
  const lastArray = trimmed.lastIndexOf("]");
  if (firstArray !== -1 && lastArray > firstArray) return trimmed.slice(firstArray, lastArray + 1);
  return trimmed;
}

function fallbackForecastAnalyst(): ForecastAnalyst {
  return {
    ai_comment_status: "fallback",
    weekly_summary: null,
    lesson_summary: null,
    practice_summary: null,
    recommendations: {
      lesson: [],
      beginner: [],
      experienced: [],
    },
    board_recommendations: {
      longboard: [],
      midlength: [],
      shortboard: [],
    },
    wetsuit_summary: null,
    confidence_notes: [
      "AIコメントを取得できませんでした。予報データを参考に、前日夜と当日朝に再確認してください。",
    ],
    notice: "この予測は気象・海況データによる参考情報です。実際の海況は現地で確認してください。",
  };
}

function normalizeForecastAnalyst(value: Record<string, unknown>): ForecastAnalyst {
  return {
    ai_comment_status: "ok",
    weekly_summary: optionalCleanText(value.weekly_summary),
    lesson_summary: optionalCleanText(value.lesson_summary),
    practice_summary: optionalCleanText(value.practice_summary),
    recommendations: normalizeForecastAnalystRecommendations(value.recommendations),
    board_recommendations: normalizeForecastAnalystBoardRecommendations(value.board_recommendations),
    wetsuit_summary: optionalCleanText(value.wetsuit_summary),
    confidence_notes: sanitizeAnalystArray(value.confidence_notes),
    notice: cleanText(
      value.notice,
      "この予測は気象・海況データによる参考情報です。実際の海況は現地で確認してください。",
    ),
  };
}

function normalizeForecastAnalystRecommendations(value: unknown): ForecastAnalystRecommendations {
  const raw = isRecord(value) ? value : {};
  return {
    lesson: sanitizeAnalystArray(raw.lesson),
    beginner: sanitizeAnalystArray(raw.beginner),
    experienced: sanitizeAnalystArray(raw.experienced),
  };
}

function normalizeForecastAnalystBoardRecommendations(value: unknown): ForecastAnalystBoardRecommendations {
  const raw = isRecord(value) ? value : {};
  return {
    longboard: sanitizeAnalystArray(raw.longboard),
    midlength: sanitizeAnalystArray(raw.midlength),
    shortboard: sanitizeAnalystArray(raw.shortboard),
  };
}

function sanitizeAnalystArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value.map(sanitizeAnalystValue).filter((item) => item !== null) : [];
}

function sanitizeAnalystValue(value: unknown): unknown {
  if (typeof value === "string") return cleanMarkdownText(value);
  if (typeof value === "number" || typeof value === "boolean" || value === null) return value;
  if (Array.isArray(value)) return value.map(sanitizeAnalystValue).filter((item) => item !== null);
  if (!isRecord(value)) return null;
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, item]) => [key, sanitizeAnalystValue(item)] as const)
      .filter(([, item]) => item !== null),
  );
}

function optionalCleanText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? cleanMarkdownText(value) : null;
}

function cleanText(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? cleanMarkdownText(value) : fallback;
}

function cleanMarkdownText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/__([^_]*)__/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .trim();
}

function normalizeBoard(result: Record<string, unknown>, condition: ConditionData): TodayBoard {
  const beginnerBest = bestSlot(condition.slots, "rule_beginner_score");
  const longboardBest = bestSlot(condition.slots, "rule_longboard_score");
  const overallBeginner = asScore(result.overall_beginner_index, beginnerBest.rule_beginner_score);
  const overallLongboard = asScore(result.overall_longboard_index, longboardBest.rule_longboard_score);
  const overallGeneral = asScore(result.overall_general_index, averageScore([overallBeginner, overallLongboard]));
  const overallLesson = asScore(result.overall_lesson_index, overallBeginner);
  const overallExperienced = asScore(result.overall_experienced_index, overallLongboard);
  const overallMidlength = asScore(result.overall_midlength_index, conservativeMidlengthScore(overallLongboard));
  const overallShortboard = asScore(result.overall_shortboard_index, conservativeShortboardScore(overallLongboard, condition.slots));
  const bestTimes = normalizeBestTimes(result.best_times, {
    beginner: asString(result.best_beginner_time, displayTimeRange(beginnerBest.time_range)),
    lesson: asString(result.best_beginner_time, displayTimeRange(beginnerBest.time_range)),
    experienced: asString(result.best_advanced_time, displayTimeRange(longboardBest.time_range)),
    longboard: asString(result.best_advanced_time, displayTimeRange(longboardBest.time_range)),
    midlength: asString(result.best_advanced_time, displayTimeRange(longboardBest.time_range)),
    shortboard: overallShortboard >= 4 ? displayTimeRange(longboardBest.time_range) : "条件次第",
  });
  const experiencedMessage = asString(
    result.experienced_main_message,
    asString(
      result.advanced_main_message,
      `${longboardBest.label}の${displayTimeRange(longboardBest.time_range)}が経験者には比較的おすすめです。`,
    ),
  );
  const boardMessage = asString(
    result.board_main_message,
    overallShortboard >= 4 ? "ショートも候補に入ります。" : "ロング・ミッドレングス中心。ショートは条件次第です。",
  );
  const recommendedBoardTypes = normalizeRecommendedBoardTypes(
    result.recommended_board_types,
    overallLongboard,
    overallMidlength,
    overallShortboard,
  );

  return {
    updated_at: condition.updated_at,
    spot: "鵠沼海岸",
    brand: "BIG WAVE",
    title: "鵠沼サーフィン指数",
    today_summary: asString(result.today_summary, "最新の海況予報を時間帯別に整理しました。"),
    overall_general_index: overallGeneral,
    overall_lesson_index: overallLesson,
    overall_beginner_index: overallBeginner,
    overall_experienced_index: overallExperienced,
    overall_longboard_index: overallLongboard,
    overall_midlength_index: overallMidlength,
    overall_shortboard_index: overallShortboard,
    best_times: bestTimes,
    best_beginner_time: bestTimes.beginner,
    best_advanced_time: bestTimes.experienced || bestTimes.longboard,
    safety_level: asString(result.safety_level, inferSafetyStatus(condition.slots)),
    beginner_main_message: asString(
      result.beginner_main_message,
      `${beginnerBest.label}の${displayTimeRange(beginnerBest.time_range)}が初心者には比較的おすすめです。`,
    ),
    experienced_main_message: experiencedMessage,
    advanced_main_message: experiencedMessage,
    board_main_message: boardMessage,
    recommended_board_types: recommendedBoardTypes,
    trend: condition.trend,
    slots: normalizeDisplaySlots(result.slots, condition.slots),
    local_note: asString(result.local_note, "江の島寄りは少し穏やかに見える場合があります。"),
    water_temp_summary: asOptionalString(result.water_temp_summary, condition.water_temp_summary),
    wetsuit_summary: asOptionalString(result.wetsuit_summary, condition.wetsuit_summary),
    ai_comment_status: asString(result.ai_comment_status, "ok"),
    notice: asString(
      result.notice,
      "この指数はAIと気象・海況データによる参考情報です。海の状況は急に変わることがあります。実際に海に入るかどうかは、現地の状況を確認して判断してください。",
    ),
  };
}

function normalizeStoredBoard(value: Record<string, unknown>): TodayBoard {
  const overallBeginner = asScore(value.overall_beginner_index, FALLBACK_BOARD.overall_beginner_index);
  const overallLongboard = asScore(value.overall_longboard_index, FALLBACK_BOARD.overall_longboard_index);
  const overallGeneral = asScore(value.overall_general_index, averageScore([overallBeginner, overallLongboard]));
  const overallLesson = asScore(value.overall_lesson_index, overallBeginner);
  const overallExperienced = asScore(value.overall_experienced_index, overallLongboard);
  const overallMidlength = asScore(value.overall_midlength_index, conservativeMidlengthScore(overallLongboard));
  const overallShortboard = asScore(value.overall_shortboard_index, conservativeShortboardScore(overallLongboard));
  const bestTimes = normalizeBestTimes(value.best_times, {
    beginner: asString(value.best_beginner_time, FALLBACK_BOARD.best_beginner_time),
    lesson: asString(value.best_beginner_time, FALLBACK_BOARD.best_beginner_time),
    experienced: asString(value.best_advanced_time, FALLBACK_BOARD.best_advanced_time),
    longboard: asString(value.best_advanced_time, FALLBACK_BOARD.best_advanced_time),
    midlength: asString(value.best_advanced_time, FALLBACK_BOARD.best_advanced_time),
    shortboard: overallShortboard >= 4 ? asString(value.best_advanced_time, FALLBACK_BOARD.best_advanced_time) : "条件次第",
  });
  const experiencedMessage = asString(
    value.experienced_main_message,
    asString(value.advanced_main_message, FALLBACK_BOARD.experienced_main_message),
  );
  return {
    updated_at: asString(value.updated_at, FALLBACK_BOARD.updated_at),
    spot: "鵠沼海岸",
    brand: "BIG WAVE",
    title: "鵠沼サーフィン指数",
    today_summary: asString(value.today_summary, FALLBACK_BOARD.today_summary),
    overall_general_index: overallGeneral,
    overall_lesson_index: overallLesson,
    overall_beginner_index: overallBeginner,
    overall_experienced_index: overallExperienced,
    overall_longboard_index: overallLongboard,
    overall_midlength_index: overallMidlength,
    overall_shortboard_index: overallShortboard,
    best_times: bestTimes,
    best_beginner_time: bestTimes.beginner,
    best_advanced_time: bestTimes.experienced || bestTimes.longboard,
    safety_level: asString(value.safety_level, FALLBACK_BOARD.safety_level),
    beginner_main_message: asString(value.beginner_main_message, FALLBACK_BOARD.beginner_main_message),
    experienced_main_message: experiencedMessage,
    advanced_main_message: experiencedMessage,
    board_main_message: asString(value.board_main_message, FALLBACK_BOARD.board_main_message),
    recommended_board_types: normalizeRecommendedBoardTypes(
      value.recommended_board_types,
      overallLongboard,
      overallMidlength,
      overallShortboard,
    ),
    trend: normalizeStoredTrend(value.trend, FALLBACK_BOARD.trend),
    slots: normalizeStoredDisplaySlots(value.slots),
    local_note: asString(value.local_note, FALLBACK_BOARD.local_note),
    water_temp_summary: asNullableString(value.water_temp_summary, FALLBACK_BOARD.water_temp_summary),
    wetsuit_summary: asNullableString(value.wetsuit_summary, FALLBACK_BOARD.wetsuit_summary),
    ai_comment_status: asString(value.ai_comment_status, FALLBACK_BOARD.ai_comment_status),
    notice: asString(value.notice, FALLBACK_BOARD.notice),
  };
}

function normalizeDisplaySlots(value: unknown, fallbackSlots: ConditionSlotData[]): DisplaySlot[] {
  const rawSlots = Array.isArray(value) ? value : [];
  return fallbackSlots.map((fallback, index) => {
    const raw = isRecord(rawSlots[index]) ? rawSlots[index] : {};
    const fallbackDisplay = displaySlotFromCondition(fallback);
    const beginner = asScore(raw.beginner_index, fallback.rule_beginner_score);
    const longboard = asScore(raw.longboard_index, fallback.rule_longboard_score);
    const general = asScore(raw.general_index, averageScore([beginner, longboard]));
    const lesson = asScore(raw.lesson_index, beginner);
    const experienced = asScore(raw.experienced_index, longboard);
    const midlength = asScore(raw.midlength_index, conservativeMidlengthScore(longboard));
    const shortboard = asScore(raw.shortboard_index, conservativeShortboardScore(longboard, [fallback]));
    return {
      label: asString(raw.label, fallbackDisplay.label),
      time_range: displayTimeRange(asString(raw.time_range, fallbackDisplay.time_range)),
      general_index: general,
      lesson_index: lesson,
      beginner_index: beginner,
      experienced_index: experienced,
      longboard_index: longboard,
      midlength_index: midlength,
      shortboard_index: shortboard,
      status: asString(raw.status, fallbackDisplay.status),
      message: asString(raw.message, fallbackDisplay.message),
      caution: asNullableString(raw.caution, fallbackDisplay.caution),
      water_temp_c: asOptionalNumber(raw.water_temp_c, fallbackDisplay.water_temp_c),
      wetsuit_label: asOptionalString(raw.wetsuit_label, fallbackDisplay.wetsuit_label),
      wetsuit_thickness: asOptionalString(raw.wetsuit_thickness, fallbackDisplay.wetsuit_thickness),
      wetsuit_note: asOptionalString(raw.wetsuit_note, fallbackDisplay.wetsuit_note),
    };
  });
}

function normalizeStoredDisplaySlots(value: unknown): DisplaySlot[] {
  const rawSlots = Array.isArray(value) ? value : [];
  return FALLBACK_BOARD.slots.map((fallback, index) => {
    const raw = isRecord(rawSlots[index]) ? rawSlots[index] : {};
    const warnings = Array.isArray(raw.warnings)
      ? raw.warnings.filter((item): item is string => typeof item === "string")
      : [];
    const beginner = asScore(raw.beginner_index, asScore(raw.rule_beginner_score, fallback.beginner_index));
    const longboard = asScore(raw.longboard_index, asScore(raw.rule_longboard_score, fallback.longboard_index));
    const general = asScore(raw.general_index, averageScore([beginner, longboard]));
    const lesson = asScore(raw.lesson_index, beginner);
    const experienced = asScore(raw.experienced_index, longboard);
    const midlength = asScore(raw.midlength_index, conservativeMidlengthScore(longboard));
    const shortboard = asScore(raw.shortboard_index, conservativeShortboardScore(longboard));
    return {
      label: asString(raw.label, fallback.label),
      time_range: displayTimeRange(asString(raw.time_range, fallback.time_range)),
      general_index: general,
      lesson_index: lesson,
      beginner_index: beginner,
      experienced_index: experienced,
      longboard_index: longboard,
      midlength_index: midlength,
      shortboard_index: shortboard,
      status: asString(raw.status, fallback.status),
      message: asString(raw.message, fallback.message),
      caution: asNullableString(raw.caution, warnings[0] ?? fallback.caution),
      water_temp_c: asNullableNumber(raw.water_temp_c, fallback.water_temp_c),
      wetsuit_label: asNullableString(raw.wetsuit_label, fallback.wetsuit_label),
      wetsuit_thickness: asNullableString(raw.wetsuit_thickness, fallback.wetsuit_thickness),
      wetsuit_note: asNullableString(raw.wetsuit_note, fallback.wetsuit_note),
    };
  });
}

function normalizeStoredTrend(value: unknown, fallback: TodayTrend): TodayTrend {
  const raw = isRecord(value) ? value : {};
  const labels = normalizeStringArray(raw.labels, fallback.labels);
  const timeRanges = normalizeStringArray(raw.time_ranges, fallback.time_ranges).map(displayTimeRange);
  const trend: TodayTrend = {
    labels: labels.length ? labels : fallback.labels,
    time_ranges: timeRanges.length ? timeRanges : fallback.time_ranges,
  };
  const length = trend.labels.length;
  const wave = normalizeNumberArray(raw.wave_height_m, fallback.wave_height_m, length, 2);
  const wind = normalizeNumberArray(raw.wind_speed_ms, fallback.wind_speed_ms, length, 1);
  const windDirection = normalizeNumberArray(raw.wind_direction_deg, fallback.wind_direction_deg, length, 0);
  const rain = normalizeNumberArray(raw.rain_mm, fallback.rain_mm, length, 1);
  const water = normalizeNumberArray(raw.water_temp_c, fallback.water_temp_c, length, 1);
  if (wave) trend.wave_height_m = wave;
  if (wind) trend.wind_speed_ms = wind;
  if (windDirection) trend.wind_direction_deg = windDirection;
  if (rain) trend.rain_mm = rain;
  if (water?.some((item) => item !== null)) trend.water_temp_c = water;
  return trend;
}

function displaySlotFromCondition(slot: SlotData & Partial<TodayWaterFields>): DisplaySlot {
  const status = slot.rule_beginner_score >= 4 || slot.rule_longboard_score >= 4 ? "おすすめ" : "注意";
  const beginner = slot.rule_beginner_score;
  const longboard = slot.rule_longboard_score;
  const message =
    slot.wind_speed_ms <= 4
      ? "風が弱く、面が整いやすい時間帯です。"
      : slot.wind_type === "オンショア"
        ? "オンショアの影響で面が乱れやすい時間帯です。"
        : "海況を見ながら無理のない範囲で検討してください。";
  return {
    label: slot.label,
    time_range: displayTimeRange(slot.time_range),
    general_index: averageScore([beginner, longboard]),
    lesson_index: beginner,
    beginner_index: beginner,
    experienced_index: longboard,
    longboard_index: longboard,
    midlength_index: conservativeMidlengthScore(longboard),
    shortboard_index: conservativeShortboardScore(longboard, [slot]),
    status,
    message,
    caution: slot.warnings[0] ?? null,
    water_temp_c: asNullableNumber(slot.water_temp_c, null),
    wetsuit_label: asNullableString(slot.wetsuit_label, null),
    wetsuit_thickness: asNullableString(slot.wetsuit_thickness, null),
    wetsuit_note: asNullableString(slot.wetsuit_note, null),
  };
}

function indicesForSlot(times: string[], date: string, slot: SlotDefinition): number[] {
  const indices: number[] = [];
  times.forEach((time, index) => {
    if (!time.startsWith(date)) return;
    const match = time.match(/T(\d{2}):(\d{2})/);
    if (!match) return;
    const minutes = Number(match[1]) * 60 + Number(match[2]);
    if (minutes >= slot.startMinutes && minutes < slot.endMinutes) indices.push(index);
  });
  return indices;
}

function numericValues(values: string[] | number[] | undefined, indices: number[]): number[] {
  if (!values) return [];
  return indices.map((index) => Number(values[index])).filter(Number.isFinite);
}

function averageAt(values: string[] | number[] | undefined, indices: number[]): number {
  const numbers = numericValues(values, indices);
  if (!numbers.length) throw new Error("Required hourly values are missing");
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function optionalAverageAt(values: string[] | number[] | undefined, indices: number[]): number | null {
  const numbers = numericValues(values, indices);
  if (!numbers.length) return null;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function sumAt(values: string[] | number[] | undefined, indices: number[]): number {
  return numericValues(values, indices).reduce((sum, value) => sum + value, 0);
}

function circularAverageAt(values: string[] | number[] | undefined, indices: number[]): number {
  const numbers = numericValues(values, indices);
  if (!numbers.length) throw new Error("Required direction values are missing");
  const vector = numbers.reduce(
    (sum, degree) => {
      const radians = (degree * Math.PI) / 180;
      return { x: sum.x + Math.cos(radians), y: sum.y + Math.sin(radians) };
    },
    { x: 0, y: 0 },
  );
  return (Math.atan2(vector.y, vector.x) * 180) / Math.PI + (vector.y < 0 ? 360 : 0);
}

function modeAt(values: string[] | number[] | undefined, indices: number[]): number {
  const counts = new Map<number, number>();
  for (const value of numericValues(values, indices)) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
}

function classifyWind(direction: number): WindType {
  const normalized = ((direction % 360) + 360) % 360;
  if (normalized >= 315 || normalized <= 45) return "オフショア寄り";
  if (normalized >= 135 && normalized <= 225) return "オンショア";
  return "サイド寄り";
}

function beginnerScore(wave: number, wind: number, windType: WindType, rain: number): number {
  let score = 3;
  if (wave >= 0.2 && wave <= 0.6) score += 2;
  else if (wave >= 0.7 && wave <= 0.8) score += 1;
  if (wave >= 1.1) score -= 2;
  else if (wave >= 0.9) score -= 1;
  if (wind <= 3) score += 1;
  if (wind >= 5 && windType.includes("オンショア")) score -= 1;
  if (rain > 1) score -= 1;
  return clampScore(score);
}

function longboardScore(wave: number, period: number, wind: number, windType: WindType): number {
  let score = 3;
  if (wave >= 0.4 && wave <= 1.0) score += 1;
  if (period >= 7 && period <= 11) score += 1;
  if (wind <= 4) score += 1;
  if (wind >= 6 && windType.includes("オンショア")) score -= 2;
  if (wave < 0.25) score -= 1;
  return clampScore(score);
}

function buildWarnings(wave: number, wind: number, windType: WindType, rain: number): string[] {
  const warnings: string[] = [];
  if (wave >= 1.1) warnings.push("波が高めです。初心者は現地判断を優先してください");
  if (wind >= 6) warnings.push("風が強まる予報です");
  if (wind >= 5 && windType === "オンショア") warnings.push("オンショアで面が乱れる可能性があります");
  if (rain > 1) warnings.push("降雨による視界と体温低下に注意してください");
  return warnings;
}

function weatherLabel(code: number): string {
  if (code === 0) return "快晴";
  if (code <= 2) return "晴れ時々くもり";
  if (code === 3) return "くもり";
  if (code === 45 || code === 48) return "霧";
  if (code >= 51 && code <= 67) return "雨";
  if (code >= 71 && code <= 77) return "雪";
  if (code >= 80 && code <= 82) return "にわか雨";
  if (code >= 95) return "雷雨";
  return "変わりやすい天気";
}

function inferSafetyStatus(slots: SlotData[]): string {
  if (slots.some((slot) => slot.wave_height_m >= 1.1 || slot.wind_speed_ms >= 8)) return "caution";
  if (slots.some((slot) => slot.warnings.length > 0)) return "watch";
  return "safe";
}

function bestSlot(slots: SlotData[], key: "rule_beginner_score" | "rule_longboard_score"): SlotData {
  return slots.reduce((best, slot) => (slot[key] > best[key] ? slot : best), slots[0]);
}

function normalizeBestTimes(value: unknown, fallback: TodayBestTimes): TodayBestTimes {
  const raw = isRecord(value) ? value : {};
  const normalized: TodayBestTimes = {
    beginner: asString(raw.beginner, fallback.beginner),
    lesson: asString(raw.lesson, fallback.lesson),
    experienced: asString(raw.experienced, asString(raw.advanced, fallback.experienced)),
    longboard: asString(raw.longboard, fallback.longboard),
    midlength: asString(raw.midlength, fallback.midlength),
    shortboard: asString(raw.shortboard, fallback.shortboard),
  };
  for (const [key, time] of Object.entries(raw)) {
    if (typeof time === "string" && time.trim()) normalized[key] = time;
  }
  return normalized;
}

function normalizeRecommendedBoardTypes(
  value: unknown,
  longboardScore: number,
  midlengthScore: number,
  shortboardScore: number,
): string[] {
  const raw = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const allowed = new Set(["ロング", "ミッドレングス", "ショート"]);
  const sanitized = raw.filter((item) => allowed.has(item) && (item !== "ショート" || shortboardScore >= 4));
  if (sanitized.length) return [...new Set(sanitized)];

  const fallback: string[] = [];
  if (longboardScore >= 3) fallback.push("ロング");
  if (midlengthScore >= 3) fallback.push("ミッドレングス");
  if (shortboardScore >= 4) fallback.push("ショート");
  return fallback.length ? fallback : ["ロング", "ミッドレングス"];
}

function averageScore(scores: number[]): number {
  const valid = scores.filter(Number.isFinite);
  if (!valid.length) return 1;
  return clampScore(Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length));
}

function conservativeMidlengthScore(longboardScore: number): number {
  return clampScore(longboardScore >= 4 ? longboardScore - 1 : longboardScore);
}

function conservativeShortboardScore(longboardScore: number, slots: SlotData[] = []): number {
  const maxWave = slots.length ? Math.max(...slots.map((slot) => slot.wave_height_m)) : 0;
  const cap = maxWave >= 0.7 ? 4 : maxWave >= 0.45 ? 3 : 2;
  return clampScore(Math.min(cap, longboardScore - 1));
}

function demoSlot(
  label: string,
  timeRange: string,
  wave: number,
  swell: number,
  period: number,
  swellDirection: number,
  wind: number,
  windDirection: number,
  rain: number,
  weather: string,
  beginner: number,
  longboard: number,
  warnings: string[] = [],
): SlotData {
  return {
    label,
    time_range: timeRange,
    wave_height_m: wave,
    swell_height_m: swell,
    swell_period_s: period,
    swell_direction_deg: swellDirection,
    wind_speed_ms: wind,
    wind_direction_deg: windDirection,
    wind_type: classifyWind(windDirection),
    rain_mm: rain,
    weather,
    warnings,
    rule_beginner_score: beginner,
    rule_longboard_score: longboard,
  };
}

function formatJapanDateTime(value: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const byType = new Map(parts.map((part) => [part.type, part.value]));
  const year = byType.get("year");
  const month = byType.get("month");
  const day = byType.get("day");
  const hour = byType.get("hour");
  const minute = byType.get("minute");
  if (!year || !month || !day || !hour || !minute) {
    throw new Error("Failed to format Asia/Tokyo local time");
  }
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function currentJapanDate(value: Date = new Date()): string {
  return formatJapanDateTime(value).slice(0, 10);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNullableString(value: unknown, fallback: string | null): string | null {
  if (value === null) return null;
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asOptionalString(value: unknown, fallback: string | null): string | null {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asNullableNumber(value: unknown, fallback: number | null): number | null {
  if (value === null) return null;
  const number = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) ? round(number, 1) : fallback;
}

function asOptionalNumber(value: unknown, fallback: number | null): number | null {
  const number = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) ? round(number, 1) : fallback;
}

function asScore(value: unknown, fallback: number): number {
  const score = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(score) ? clampScore(Math.round(score)) : fallback;
}

function optionalRounded(value: unknown, digits: number): number | null {
  const number = typeof value === "number" || typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) ? round(number, digits) : null;
}

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  const raw = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  return raw.length ? raw : fallback;
}

function normalizeNumberArray(
  value: unknown,
  fallback: Array<number | null> | undefined,
  length: number,
  digits: number,
): Array<number | null> | undefined {
  const source = Array.isArray(value) ? value : fallback;
  if (!Array.isArray(source)) return undefined;
  return Array.from({ length }, (_, index) => optionalRounded(source[index], digits));
}

function displayTimeRange(timeRange: string): string {
  return timeRange.replace("-", "〜");
}

function clampScore(score: number): number {
  return Math.max(1, Math.min(5, score));
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), { status, headers: JSON_HEADERS });
}
