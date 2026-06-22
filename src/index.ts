interface Env {
  QEST_KV: KVNamespace;
  ASSETS: Fetcher;
  DIFY_API_KEY: string;
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

interface ConditionData {
  mode: "today_board";
  location: string;
  latitude: number;
  longitude: number;
  date: string;
  generated_at: string;
  slots: SlotData[];
}

interface TodayBoard {
  updated_at: string;
  today_summary: string;
  overall_beginner_index: number;
  overall_longboard_index: number;
  best_beginner_time: string;
  best_advanced_time: string;
  safety_level: string;
  slots: SlotData[];
  notice: string;
}

interface DifyResponse {
  data?: {
    outputs?: {
      result?: unknown;
    };
  };
}

const BOARD_KEY = "qest_today_board";
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

const FALLBACK_SLOTS: SlotData[] = [
  demoSlot("早朝", "06:00-09:00", 0.45, 0.35, 8, 165, 2.2, 340, 0, "晴れ", 5, 5),
  demoSlot("午前", "09:00-11:30", 0.55, 0.4, 8, 170, 3.4, 110, 0, "晴れ時々くもり", 5, 5),
  demoSlot("午後", "13:30-16:00", 0.7, 0.5, 7, 175, 5.8, 180, 0.2, "くもり", 3, 3, ["オンショアで面が乱れる可能性があります"]),
  demoSlot("夕方", "16:00-18:30", 0.6, 0.45, 7, 180, 4.6, 210, 0, "くもり", 4, 4),
];

const FALLBACK_BOARD: TodayBoard = {
  updated_at: "デモデータ（未更新）",
  today_summary: "早朝は風が弱く、初心者スクールとロングボードの練習に比較的合わせやすい見込みです。",
  overall_beginner_index: 4,
  overall_longboard_index: 4,
  best_beginner_time: "早朝 06:00-09:00",
  best_advanced_time: "早朝 06:00-09:00",
  safety_level: "通常注意",
  slots: FALLBACK_SLOTS,
  notice: "これは公開用の非公式デモです。実際の入水前に現地の波、風、混雑、ライフガード情報を必ず確認してください。",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }

    if (request.method === "GET" && url.pathname === "/api/today") {
      const cached = await env.QEST_KV.get<TodayBoard>(BOARD_KEY, "json");
      return json(cached ?? FALLBACK_BOARD);
    }

    if (request.method === "GET" && url.pathname === "/api/refresh") {
      const secret = url.searchParams.get("secret");
      if (!env.REFRESH_SECRET || secret !== env.REFRESH_SECRET) {
        return json({ error: "Unauthorized" }, 401);
      }

      try {
        return json(await refreshBoard(env));
      } catch (error) {
        console.error("Manual refresh failed", error);
        return json({ error: "Refresh failed; the previous KV value was preserved." }, 502);
      }
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "Not found" }, 404);
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      refreshBoard(env).catch((error: unknown) => {
        console.error("Scheduled refresh failed; existing KV data was preserved", error);
      }),
    );
  },
} satisfies ExportedHandler<Env>;

async function refreshBoard(env: Env): Promise<TodayBoard> {
  const condition = await fetchConditions();
  const board = await runDify(env.DIFY_API_KEY, condition);
  await env.QEST_KV.put(BOARD_KEY, JSON.stringify(board));
  return board;
}

async function fetchConditions(): Promise<ConditionData> {
  const common = "latitude=35.317&longitude=139.472&timezone=Asia%2FTokyo&forecast_days=1";
  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?${common}&hourly=wave_height,wave_direction,wave_period,swell_wave_height,swell_wave_direction,swell_wave_period`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?${common}&hourly=wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation,weather_code,cloud_cover&wind_speed_unit=ms`;

  const [marine, weather] = await Promise.all([
    fetchOpenMeteo(marineUrl, "Marine"),
    fetchOpenMeteo(weatherUrl, "Weather"),
  ]);

  if (!marine.hourly || !weather.hourly) {
    throw new Error("Open-Meteo returned no hourly data");
  }

  const date = String(marine.hourly.time[0] ?? weather.hourly.time[0] ?? "").slice(0, 10);
  if (!date) throw new Error("Open-Meteo returned no forecast date");

  const slots = SLOT_DEFINITIONS.map((definition) =>
    aggregateSlot(definition, date, marine.hourly as HourlyData, weather.hourly as HourlyData),
  );

  return {
    mode: "today_board",
    location: "鵠沼海岸",
    latitude: 35.317,
    longitude: 139.472,
    date,
    generated_at: new Date().toISOString(),
    slots,
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

async function runDify(apiKey: string, condition: ConditionData): Promise<TodayBoard> {
  if (!apiKey) throw new Error("DIFY_API_KEY is not configured");
  const response = await fetch("https://api.dify.ai/v1/workflows/run", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: {
        mode: "today_board",
        condition_json: JSON.stringify(condition),
      },
      response_mode: "blocking",
      user: "qest-wave-demo",
    }),
  });

  if (!response.ok) throw new Error(`Dify API failed with ${response.status}`);
  const payload = (await response.json()) as DifyResponse;
  let result = payload.data?.outputs?.result;
  if (typeof result === "string") {
    try {
      result = JSON.parse(result) as unknown;
    } catch {
      throw new Error("Dify result was not valid JSON");
    }
  }
  if (!isRecord(result)) throw new Error("Dify result was not an object");
  return normalizeBoard(result, condition);
}

function normalizeBoard(result: Record<string, unknown>, condition: ConditionData): TodayBoard {
  const beginnerBest = bestSlot(condition.slots, "rule_beginner_score");
  const longboardBest = bestSlot(condition.slots, "rule_longboard_score");
  return {
    updated_at: asString(result.updated_at, formatJapanTime(condition.generated_at)),
    today_summary: asString(result.today_summary, "最新の海況予報を時間帯別に整理しました。"),
    overall_beginner_index: asScore(result.overall_beginner_index, beginnerBest.rule_beginner_score),
    overall_longboard_index: asScore(result.overall_longboard_index, longboardBest.rule_longboard_score),
    best_beginner_time: asString(result.best_beginner_time, `${beginnerBest.label} ${beginnerBest.time_range}`),
    best_advanced_time: asString(result.best_advanced_time, `${longboardBest.label} ${longboardBest.time_range}`),
    safety_level: asString(result.safety_level, inferSafety(condition.slots)),
    slots: Array.isArray(result.slots) ? mergeSlots(result.slots, condition.slots) : condition.slots,
    notice: asString(
      result.notice,
      "予報に基づく非公式デモです。入水前に現地の波・風・混雑と公式の安全情報を確認してください。",
    ),
  };
}

function mergeSlots(rawSlots: unknown[], fallbackSlots: SlotData[]): SlotData[] {
  return fallbackSlots.map((fallback, index) => {
    const raw = isRecord(rawSlots[index]) ? rawSlots[index] : {};
    return {
      ...fallback,
      label: asString(raw.label, fallback.label),
      time_range: asString(raw.time_range, fallback.time_range),
      weather: asString(raw.weather, fallback.weather),
      warnings: Array.isArray(raw.warnings)
        ? raw.warnings.filter((item): item is string => typeof item === "string")
        : fallback.warnings,
    };
  });
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
  if (wave >= 1.1) warnings.push("波が高めです。初心者スクールは現地判断を優先してください");
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

function inferSafety(slots: SlotData[]): string {
  if (slots.some((slot) => slot.wave_height_m >= 1.1 || slot.wind_speed_ms >= 8)) return "要注意";
  if (slots.some((slot) => slot.warnings.length > 0)) return "通常注意";
  return "比較的穏やか";
}

function bestSlot(slots: SlotData[], key: "rule_beginner_score" | "rule_longboard_score"): SlotData {
  return slots.reduce((best, slot) => (slot[key] > best[key] ? slot : best), slots[0]);
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

function formatJapanTime(iso: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asScore(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? clampScore(Math.round(value)) : fallback;
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
