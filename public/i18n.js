(() => {
  const STORAGE_KEY = "big-wave-language";
  const SUPPORTED = new Set(["ja", "en", "zh"]);
  const textSources = new WeakMap();
  const attributeSources = new WeakMap();
  let language = readLanguage();

  const exact = {
    en: {
      "鵠沼サーフィン指数": "Kugenuma Surf Index",
      "鵠沼・明日のサーフィン予測": "Kugenuma Surf Forecast for Tomorrow",
      "明日の予測を見る": "Tomorrow's forecast",
      "今日の指数へ戻る": "Back to today's index",
      "更新": "Refresh",
      "更新（JST）：—": "Updated (JST): —",
      "更新（JST）：デモデータ（未更新）": "Updated (JST): demo data (not refreshed)",
      "海況データを読み込んでいます…": "Loading ocean conditions…",
      "近程予測を読み込んでいます…": "Loading the near-term forecast…",
      "データを読み込めませんでした。時間をおいてもう一度お試しください。": "Could not load the data. Please try again shortly.",
      "近程予測を読み込めませんでした。時間をおいてもう一度お試しください。": "Could not load the forecast. Please try again shortly.",
      "初心者指数": "Beginner index",
      "おすすめ板種": "Recommended boards",
      "経験者向けおすすめ指数": "Experienced surfer index",
      "初心者おすすめ": "Best for beginners",
      "経験者おすすめ": "Best for experienced surfers",
      "詳細": "Details",
      "本日の概要": "Today's summary",
      "メイン指数": "Main indexes",
      "おすすめ時間": "Recommended times",
      "今日の海況トレンド": "Today's condition trend",
      "時刻": "Time",
      "時間帯別": "By time slot",
      "コンディション": "Conditions",
      "表示指数切り替え": "Select index",
      "鵠沼ローカルメモ": "Kugenuma local note",
      "水温・ウェット目安": "Water temperature & wetsuit guide",
      "表示レイヤー": "Map layer",
      "波高": "Waves",
      "波高（m）": "Wave height (m)",
      "風速（m/s）": "Wind speed (m/s)",
      "雨（mm）": "Rain (mm)",
      "水温（℃）": "Water temperature (°C)",
      "潮位（m）": "Tide (m)",
      "風": "Wind",
      "候補": "Top picks",
      "ヒートマップ": "Heatmap",
      "指数切り替え": "Select index",
      "日付切り替え": "Select date",
      "表示言語": "Display language",
      "今日 / 当日データ": "Today / current data",
      "予測": "Forecast",
      "終了": "Ended",
      "参考": "Reference",
      "おすすめ": "Recommended",
      "まずまず": "Fair",
      "慎重": "Use caution",
      "注意": "Caution",
      "非推奨": "Not recommended",
      "経験者向け": "Experienced surfers",
      "レッスン": "Lesson",
      "初心者": "Beginner",
      "初心者練習": "Beginner practice",
      "ロング": "Longboard",
      "ミッドレングス": "Mid-length",
      "ショート": "Shortboard",
      "早朝": "Early morning",
      "午前": "Morning",
      "午後": "Afternoon",
      "夕方": "Evening",
      "時間帯": "Time slot",
      "表示指数": "Selected index",
      "ステータス": "Status",
      "信頼度": "Confidence",
      "水温": "Water temperature",
      "ウェット": "Wetsuit",
      "潮位目安": "Tide estimate",
      "上げ": "Rising",
      "下げ": "Falling",
      "満潮前後": "Around high tide",
      "干潮前後": "Around low tide",
      "北": "N",
      "北東": "NE",
      "東": "E",
      "南東": "SE",
      "南": "S",
      "南西": "SW",
      "西": "W",
      "北西": "NW",
      "高": "High",
      "中": "Medium",
      "低": "Low",
      "配信元で開く": "Open source stream",
      "YouTubeで開く": "Open on YouTube",
      "なみある？提供": "Provided by Namiaru?",
      "藤沢市鵠沼海岸・ライブ動画・": "Fujisawa City, Kugenuma Beach · Live video ·",
      "藤沢市鵠沼海岸・YouTubeライブ動画・NAMIARUMOVIE提供": "Fujisawa City, Kugenuma Beach · YouTube live video · Provided by NAMIARUMOVIE",
      "ライブを再生": "Play live stream",
      "再生ボタンを押して映像を確認": "Press play to view the live feed",
      "「ライブを再生」を押して映像を確認": "Press “Play live stream” to view",
      "河口側の波・混雑・ピーク位置を確認": "Check waves, crowding and peak position near the river mouth",
      "白波・混雑・面の乱れを確認": "Check whitewater, crowding and surface chop",
      "水族館前から銅像前の波・混雑を別角度で確認": "Check waves and crowding from the aquarium to the statue from another angle",
      "鵠沼⑦ 引地川河口 ライブカメラ": "Kugenuma ⑦ Hikiji River Mouth live camera",
      "鵠沼③ 水族館前〜銅像前 ライブカメラ": "Kugenuma ③ Aquarium–Statue live camera",
      "鵠沼④ 水族館前〜銅像前 ライブカメラ": "Kugenuma ④ Aquarium–Statue live camera",
      "位置関係の目安（正確な撮影範囲・方角とは異なる場合があります）": "Approximate locations; actual camera range and direction may differ.",
      "鵠沼海岸ライブカメラ位置関係": "Kugenuma Beach live camera locations",
      "西側の引地川河口から、銅像前、新江ノ島水族館までの海岸線と、鵠沼7、3、4のカメラ位置を示す概略図です。": "A simple map of cameras ⑦, ③ and ④ from the Hikiji River mouth to the statue and Enoshima Aquarium.",
      "00時から23時までの海況推移。横にスクロールできます": "Ocean conditions from 00:00 to 23:00. Scroll horizontally.",
      "Windy 鵠沼メイン 波・風チャート": "Windy Kugenuma Main wave and wind chart",
      "Windyで全画面表示": "Open full screen on Windy",
      "Windy.com 提供": "Provided by Windy.com",
      "外部の波情報を見る": "More surf information",
      "鵠沼の波情報・ライブカメラ": "Kugenuma surf report & live cameras",
      "波浪 Best Match + JMA近程気象。前日夜と当日朝に再確認してください。": "Wave Best Match + near-term JMA weather. Recheck the night before and the morning of your session.",
      "予測機能 Powered by Dify": "Forecast powered by Dify",
      "今日の時間帯はすでに終了しています。明日以降の予測を参考にしてください。": "Today's surf slots have ended. Please use the forecast for tomorrow and later.",
      "今日の残り時間帯におすすめ候補がありません。": "No recommended slots remain today.",
      "おすすめ候補がまだありません。": "No recommendation is available yet.",
      "ヒートマップの枠を選択してください。": "Select a heatmap cell.",
      "本日は終了": "Finished for today",
      "条件次第": "Depends on conditions",
      "江の島寄りは少し穏やかに見える場合があります。": "Conditions near Enoshima may appear slightly calmer.",
      "この指数はAIと気象・海況データによる参考情報です。海の状況は急に変わることがあります。実際に海に入るかどうかは、現地の状況を確認して判断してください。": "This index is guidance based on AI, weather and ocean data. Conditions can change quickly; always check the beach before entering the water.",
      "—": "—"
    },
    zh: {
      "鵠沼サーフィン指数": "鹄沼冲浪指数",
      "鵠沼・明日のサーフィン予測": "鹄沼明日冲浪预测",
      "明日の予測を見る": "查看明日预测",
      "今日の指数へ戻る": "返回今日指数",
      "更新": "刷新",
      "更新（JST）：—": "更新（日本时间）：—",
      "更新（JST）：デモデータ（未更新）": "更新（日本时间）：演示数据（尚未刷新）",
      "海況データを読み込んでいます…": "正在加载海况数据…",
      "近程予測を読み込んでいます…": "正在加载近期预测…",
      "データを読み込めませんでした。時間をおいてもう一度お試しください。": "无法加载数据，请稍后重试。",
      "近程予測を読み込めませんでした。時間をおいてもう一度お試しください。": "无法加载近期预测，请稍后重试。",
      "初心者指数": "新手指数",
      "おすすめ板種": "推荐板型",
      "経験者向けおすすめ指数": "经验者推荐指数",
      "初心者おすすめ": "新手推荐",
      "経験者おすすめ": "经验者推荐",
      "詳細": "详细",
      "本日の概要": "今日概要",
      "メイン指数": "主要指数",
      "おすすめ時間": "推荐时段",
      "今日の海況トレンド": "今日海况趋势",
      "時刻": "时间",
      "時間帯別": "分时段",
      "コンディション": "海况",
      "表示指数切り替え": "切换显示指数",
      "鵠沼ローカルメモ": "鹄沼本地提示",
      "水温・ウェット目安": "水温与防寒服建议",
      "表示レイヤー": "地图图层",
      "波高": "浪高",
      "波高（m）": "浪高（m）",
      "風速（m/s）": "风速（m/s）",
      "雨（mm）": "降雨（mm）",
      "水温（℃）": "水温（℃）",
      "潮位（m）": "潮位（m）",
      "風": "风",
      "候補": "推荐",
      "ヒートマップ": "热力图",
      "指数切り替え": "切换指数",
      "日付切り替え": "切换日期",
      "表示言語": "显示语言",
      "今日 / 当日データ": "今日 / 当日数据",
      "予測": "预测",
      "終了": "已结束",
      "参考": "仅供参考",
      "おすすめ": "推荐",
      "まずまず": "尚可",
      "慎重": "谨慎",
      "注意": "注意",
      "非推奨": "不推荐",
      "経験者向け": "适合经验者",
      "レッスン": "课程",
      "初心者": "新手",
      "初心者練習": "新手练习",
      "ロング": "长板",
      "ミッドレングス": "中长板",
      "ショート": "短板",
      "早朝": "清晨",
      "午前": "上午",
      "午後": "下午",
      "夕方": "傍晚",
      "時間帯": "时段",
      "表示指数": "当前指数",
      "ステータス": "状态",
      "信頼度": "可信度",
      "水温": "水温",
      "ウェット": "防寒服",
      "潮位目安": "潮位参考",
      "上げ": "涨潮",
      "下げ": "退潮",
      "満潮前後": "满潮前后",
      "干潮前後": "低潮前后",
      "北": "北",
      "北東": "东北",
      "東": "东",
      "南東": "东南",
      "南": "南",
      "南西": "西南",
      "西": "西",
      "北西": "西北",
      "高": "高",
      "中": "中",
      "低": "低",
      "high": "高",
      "medium": "中",
      "low": "低",
      "Mon": "周一",
      "Tue": "周二",
      "Wed": "周三",
      "Thu": "周四",
      "Fri": "周五",
      "Sat": "周六",
      "Sun": "周日",
      "配信元で開く": "打开直播源",
      "YouTubeで開く": "在 YouTube 打开",
      "なみある？提供": "Namiaru? 提供",
      "藤沢市鵠沼海岸・ライブ動画・": "藤泽市鹄沼海岸・直播视频・",
      "藤沢市鵠沼海岸・YouTubeライブ動画・NAMIARUMOVIE提供": "藤泽市鹄沼海岸・YouTube 直播视频・NAMIARUMOVIE 提供",
      "ライブを再生": "播放直播",
      "再生ボタンを押して映像を確認": "点击播放查看实时画面",
      "「ライブを再生」を押して映像を確認": "点击“播放直播”查看画面",
      "河口側の波・混雑・ピーク位置を確認": "查看河口侧浪况、人流和浪峰位置",
      "白波・混雑・面の乱れを確認": "查看白浪、人流和水面凌乱程度",
      "水族館前から銅像前の波・混雑を別角度で確認": "从另一角度查看水族馆前至铜像前的浪况和人流",
      "鵠沼⑦ 引地川河口 ライブカメラ": "鹄沼⑦ 引地川河口实时摄像头",
      "鵠沼③ 水族館前〜銅像前 ライブカメラ": "鹄沼③ 水族馆前至铜像前实时摄像头",
      "鵠沼④ 水族館前〜銅像前 ライブカメラ": "鹄沼④ 水族馆前至铜像前实时摄像头",
      "位置関係の目安（正確な撮影範囲・方角とは異なる場合があります）": "位置仅供参考，实际拍摄范围和方向可能不同。",
      "鵠沼海岸ライブカメラ位置関係": "鹄沼海岸实时摄像头位置",
      "西側の引地川河口から、銅像前、新江ノ島水族館までの海岸線と、鵠沼7、3、4のカメラ位置を示す概略図です。": "示意图展示从西侧引地川河口到铜像前、新江之岛水族馆，以及⑦、③、④摄像头的位置。",
      "00時から23時までの海況推移。横にスクロールできます": "00:00 至 23:00 的海况变化，可横向滚动查看。",
      "Windy 鵠沼メイン 波・風チャート": "Windy 鹄沼主区浪高与风况图",
      "Windyで全画面表示": "在 Windy 中全屏查看",
      "Windy.com 提供": "Windy.com 提供",
      "外部の波情報を見る": "查看更多海浪信息",
      "鵠沼の波情報・ライブカメラ": "鹄沼浪况与实时摄像头",
      "波浪 Best Match + JMA近程気象。前日夜と当日朝に再確認してください。": "海浪 Best Match + JMA 近期气象，请在前一晚和当天早晨再次确认。",
      "予測機能 Powered by Dify": "预测功能 Powered by Dify",
      "今日の時間帯はすでに終了しています。明日以降の予測を参考にしてください。": "今天的冲浪时段已经结束，请参考明天及之后的预测。",
      "今日の残り時間帯におすすめ候補がありません。": "今天剩余时段暂无推荐。",
      "おすすめ候補がまだありません。": "暂时没有推荐候选。",
      "ヒートマップの枠を選択してください。": "请选择一个热力图格子。",
      "本日は終了": "今日已结束",
      "条件次第": "视条件而定",
      "江の島寄りは少し穏やかに見える場合があります。": "靠近江之岛一侧看起来可能稍微平稳一些。",
      "この指数はAIと気象・海況データによる参考情報です。海の状況は急に変わることがあります。実際に海に入るかどうかは、現地の状況を確認して判断してください。": "本指数基于 AI、气象和海况数据，仅供参考。海况可能快速变化，下水前请务必现场确认。",
      "—": "—"
    }
  };

  const phrases = {
    en: [
      ["片瀬東浜・腰越", "Katase Higashihama / Koshigoe"],
      ["片瀬西浜・水族館前", "Katase Nishihama / Aquarium Front"],
      ["水族館前〜銅像前", "Aquarium–Statue"],
      ["YouTubeライブ動画", "YouTube live video"],
      ["ライブ動画", "live video"],
      ["藤沢市", "Fujisawa City"],
      ["なみある？", "Namiaru?"],
      ["提供", "provided by"],
      ["引地川河口", "Hikiji River Mouth"],
      ["引地川", "Hikiji River"],
      ["鵠沼メイン", "Kugenuma Main"],
      ["鵠沼海岸", "Kugenuma Beach"],
      ["鵠沼", "Kugenuma"],
      ["江の島・鎌倉側", "Enoshima / Kamakura side"],
      ["江の島寄り", "Near Enoshima"],
      ["新江ノ島水族館", "Enoshima Aquarium"],
      ["銅像前", "Statue Front"],
      ["相模湾", "Sagami Bay"],
      ["辻堂方面", "Tsujido"],
      ["江の島方面", "Enoshima"],
      ["別角度", "Alternate angle"],
      ["風速", "Wind speed"],
      ["雨", "Rain"],
      ["潮位", "Tide"],
      ["満潮前後", "Around high tide"],
      ["干潮前後", "Around low tide"],
      ["上げ", "Rising"],
      ["下げ", "Falling"],
      ["水温", "Water temperature"],
      ["タッパー", "Wetsuit top"],
      ["スプリング", "Shorty"],
      ["目安", "guide"],
      ["レッスン目安", "Lesson guide"],
      ["初心者目安", "Beginner guide"],
      ["ロング目安", "Longboard guide"],
      ["ミッドレングス目安", "Mid-length guide"],
      ["ショート目安", "Shortboard guide"],
      ["信頼度 高", "Confidence High"],
      ["信頼度 中", "Confidence Medium"],
      ["信頼度 低", "Confidence Low"],
      ["信頼度", "Confidence"],
      ["更新", "Updated"],
      ["明日", "Tomorrow"],
      ["今日", "Today"],
      ["早朝", "Early morning"],
      ["午前", "Morning"],
      ["午後", "Afternoon"],
      ["夕方", "Evening"],
      ["おすすめ", "Recommended"],
      ["慎重", "Use caution"],
      ["（終了）", " (ended)"],
      ["(月)", "(Mon)"], ["(火)", "(Tue)"], ["(水)", "(Wed)"], ["(木)", "(Thu)"], ["(金)", "(Fri)"], ["(土)", "(Sat)"], ["(日)", "(Sun)"],
      ["（月）", "(Mon)"], ["（火）", "(Tue)"], ["（水）", "(Wed)"], ["（木）", "(Thu)"], ["（金）", "(Fri)"], ["（土）", "(Sat)"], ["（日）", "(Sun)"]
    ],
    zh: [
      ["片瀬東浜・腰越", "片濑东滨・腰越"],
      ["片瀬西浜・水族館前", "片濑西滨・水族馆前"],
      ["水族館前〜銅像前", "水族馆前至铜像前"],
      ["YouTubeライブ動画", "YouTube 直播视频"],
      ["ライブ動画", "直播视频"],
      ["藤沢市", "藤泽市"],
      ["なみある？", "Namiaru?"],
      ["提供", "提供"],
      ["引地川河口", "引地川河口"],
      ["引地川", "引地川"],
      ["鵠沼メイン", "鹄沼主区"],
      ["鵠沼海岸", "鹄沼海岸"],
      ["鵠沼", "鹄沼"],
      ["江の島・鎌倉側", "江之岛・镰仓侧"],
      ["江の島寄り", "靠江之岛侧"],
      ["新江ノ島水族館", "新江之岛水族馆"],
      ["銅像前", "铜像前"],
      ["相模湾", "相模湾"],
      ["辻堂方面", "辻堂方向"],
      ["江の島方面", "江之岛方向"],
      ["別角度", "其他角度"],
      ["風速", "风速"],
      ["雨", "降雨"],
      ["潮位", "潮位"],
      ["満潮前後", "满潮前后"],
      ["干潮前後", "低潮前后"],
      ["上げ", "涨潮"],
      ["下げ", "退潮"],
      ["水温", "水温"],
      ["タッパー", "防寒上衣"],
      ["スプリング", "短袖短裤防寒服"],
      ["目安", "参考"],
      ["レッスン目安", "课程参考"],
      ["初心者目安", "新手参考"],
      ["ロング目安", "长板参考"],
      ["ミッドレングス目安", "中长板参考"],
      ["ショート目安", "短板参考"],
      ["信頼度 高", "可信度 高"],
      ["信頼度 中", "可信度 中"],
      ["信頼度 低", "可信度 低"],
      ["信頼度", "可信度"],
      ["更新", "更新"],
      ["明日", "明天"],
      ["今日", "今天"],
      ["早朝", "清晨"],
      ["午前", "上午"],
      ["午後", "下午"],
      ["夕方", "傍晚"],
      ["おすすめ", "推荐"],
      ["慎重", "谨慎"],
      ["（終了）", "（已结束）"],
      ["(月)", "(周一)"], ["(火)", "(周二)"], ["(水)", "(周三)"], ["(木)", "(周四)"], ["(金)", "(周五)"], ["(土)", "(周六)"], ["(日)", "(周日)"],
      ["（月）", "（周一）"], ["（火）", "（周二）"], ["（水）", "（周三）"], ["（木）", "（周四）"], ["（金）", "（周五）"], ["（土）", "（周六）"], ["（日）", "（周日）"]
    ]
  };

  function readLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED.has(saved)) return saved;
    } catch (_) {
      // Storage can be disabled; Japanese remains the safe default.
    }
    return "ja";
  }

  function hasJapanese(value, target) {
    return target === "zh"
      ? /[ぁ-んァ-ヶ]/.test(value)
      : /[ぁ-んァ-ヶ一-龠々]/.test(value);
  }

  function coarseNarrative(source, target) {
    const english = [];
    const chinese = [];
    const add = (en, zh) => {
      if (!english.includes(en)) english.push(en);
      if (!chinese.includes(zh)) chinese.push(zh);
    };
    if (/小さ|小波|穏やか/.test(source)) add("Small, manageable waves", "浪较小、较平稳");
    if (/サイズ|波が高|大き|上向き/.test(source)) add("Wave size may increase", "浪高可能上升");
    if (/風が弱|弱い風|風は弱/.test(source)) add("Light winds", "风较弱");
    if (/風が強|強風/.test(source)) add("Strong winds", "风较强");
    if (/オンショア/.test(source)) add("Onshore wind may affect surface quality", "向岸风可能影响浪面");
    if (/面が整|クリーン/.test(source)) add("Cleaner surface conditions", "浪面较整齐");
    if (/面が乱|ざわつ|荒れ/.test(source)) add("Choppy or unsettled surface", "浪面较乱");
    if (/雨/.test(source)) add("Rain may reduce comfort and visibility", "降雨可能影响体感和视线");
    if (/初心者|レッスン|練習/.test(source)) add("Check locally before beginner lessons or practice", "新手课程或练习前请现场确认");
    if (/ロング|ミッドレングス/.test(source)) add("Longboard and mid-length may suit the conditions", "长板和中长板可能更合适");
    if (/ショート/.test(source)) add("Shortboard suitability depends on wave power", "短板是否合适取决于浪的力量");
    if (/混雑/.test(source)) add("Check crowd levels", "请确认拥挤程度");
    if (/流れ|カレント/.test(source)) add("Check currents", "请注意水流");
    if (/潮|浅/.test(source)) add("Check tide and shallow areas", "请确认潮位和浅水区域");
    if (/水温|ウェット|冷え/.test(source)) add("Choose wetsuit protection for personal comfort", "请按个人体感选择防寒服");
    if (/注意|確認|慎重|急に変わ/.test(source)) add("Confirm actual conditions at the beach", "请在海边确认实际情况");
    if (!english.length) add("Surf guidance based on the latest Kugenuma forecast", "基于最新鹄沼预测的冲浪参考");
    const list = target === "en" ? english : chinese;
    return `${list.join(target === "en" ? ". " : "；")}${target === "en" ? "." : "。"}`;
  }

  function translateText(source, target = language) {
    if (target === "ja" || !source) return source;
    const trimmed = source.trim();
    if (!trimmed) return source;
    const direct = exact[target]?.[trimmed];
    if (direct) return source.replace(trimmed, direct);

    let translated = trimmed;
    for (const [from, to] of phrases[target] || []) translated = translated.split(from).join(to);
    if (hasJapanese(translated, target)) translated = coarseNarrative(trimmed, target);
    return source.replace(trimmed, translated);
  }

  function translateNode(node) {
    if (!node?.parentElement || node.parentElement.closest(".language-switcher, script, style")) return;
    if (!textSources.has(node)) textSources.set(node, node.nodeValue || "");
    const source = textSources.get(node);
    const translated = translateText(source);
    if (node.nodeValue !== translated) node.nodeValue = translated;
  }

  function translateAttributes(element) {
    if (!(element instanceof Element) || element.closest(".language-switcher")) return;
    const names = ["aria-label", "title", "alt"];
    if (!attributeSources.has(element)) attributeSources.set(element, {});
    const sources = attributeSources.get(element);
    for (const name of names) {
      if (!element.hasAttribute(name)) continue;
      if (!(name in sources)) sources[name] = element.getAttribute(name) || "";
      const translated = translateText(sources[name]);
      if (element.getAttribute(name) !== translated) element.setAttribute(name, translated);
    }
  }

  function translateTree(root = document.body) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE) translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) translateNode(node);
      else translateAttributes(node);
      node = walker.nextNode();
    }
  }

  function updatePageMetadata() {
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
    const forecastPage = location.pathname.startsWith("/forecast");
    document.title = language === "ja"
      ? (forecastPage ? "鵠沼・明日のサーフィン予測" : "鵠沼サーフィン指数")
      : language === "en"
        ? (forecastPage ? "Kugenuma Surf Forecast for Tomorrow" : "Kugenuma Surf Index")
        : (forecastPage ? "鹄沼明日冲浪预测" : "鹄沼冲浪指数");
  }

  function updateButtons() {
    document.querySelectorAll("[data-language]").forEach((button) => {
      const active = button.dataset.language === language;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function setLanguage(next) {
    if (!SUPPORTED.has(next)) return;
    language = next;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (_) {
      // The switch still works for the current page without storage.
    }
    updatePageMetadata();
    updateButtons();
    translateTree();
  }

  function init() {
    document.querySelectorAll("[data-language]").forEach((button) => {
      button.addEventListener("click", () => setLanguage(button.dataset.language));
    });
    updatePageMetadata();
    updateButtons();
    translateTree();
    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") translateNode(mutation.target);
        mutation.addedNodes.forEach(translateTree);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  window.BIG_WAVE_I18N = { getLanguage: () => language, setLanguage, translateText };
  init();
})();
