// ../../server/aigv/frontend/src/adData/materialPerformanceDateRange.ts
var DAY_MS = 864e5;
var sourceDay = (now) => new Date(now.getTime() + 8 * 36e5).toISOString().slice(0, 10);
function dateRangeForPreset(preset, now = /* @__PURE__ */ new Date()) {
  const date_to = sourceDay(now);
  const start = (/* @__PURE__ */ new Date(`${date_to}T00:00:00Z`)).getTime() - (Number(preset.slice(0, -1)) - 1) * DAY_MS;
  return { date_from: new Date(start).toISOString().slice(0, 10), date_to };
}

// ../../server/aigv/frontend/src/adData/materialPerformanceDemoMetrics.ts
function createDemoFacts(impressions, clicks, conversions, spendCents) {
  const count = (base, fraction) => Math.floor(base * fraction);
  const downloads = count(clicks, 0.38);
  const completed = count(downloads, 0.82);
  const installs = count(completed, 0.88);
  const activations = count(installs, 0.76);
  const firstPayments = count(activations, 0.12);
  const payments = firstPayments + count(firstPayments, 0.3);
  const plays = count(impressions, 0.72);
  return {
    spendCents,
    impressions,
    clicks,
    conversions,
    billing_time_conversions: count(conversions, 0.94),
    android_download_starts: downloads,
    android_download_completions: completed,
    android_install_completions: installs,
    activations,
    registrations: count(activations, 0.7),
    next_day_retention_events: count(activations, 0.32),
    first_payment_events: firstPayments,
    payment_events: payments,
    paymentAmountCents: payments * 2990,
    download_starts: downloads + count(clicks, 0.08),
    shop_redirects: count(clicks, 0.24),
    profile_visits: count(clicks, 0.18),
    video_plays: plays,
    video_plays_3s: count(plays, 0.68),
    valid_video_plays: count(plays, 0.54),
    video_plays_25_percent: count(plays, 0.61),
    video_plays_50_percent: count(plays, 0.43),
    video_plays_75_percent: count(plays, 0.28),
    video_plays_99_percent: count(plays, 0.17),
    likes: count(plays, 0.035),
    comments: count(plays, 4e-3),
    shares: count(plays, 7e-3),
    dislikes: count(plays, 1e-3),
    reports: count(plays, 2e-4),
    follows: count(clicks, 0.06)
  };
}
var sumDemoFacts = (items) => items.reduce((total, item) => {
  for (const [key, number] of Object.entries(item)) total[key] = (total[key] || 0) + number;
  return total;
}, {});
var ratios = {
  click_through_rate: ["clicks", "impressions", 100],
  cost_per_mille: ["spend", "impressions", 1e3],
  cost_per_click: ["spend", "clicks"],
  cost_per_conversion: ["spend", "conversions"],
  conversion_rate: ["conversions", "clicks", 100],
  cost_per_billing_time_conversion: ["spend", "billing_time_conversions"],
  billing_time_conversion_rate: ["billing_time_conversions", "clicks", 100],
  cost_per_android_download_start: ["spend", "android_download_starts"],
  android_download_start_rate: ["android_download_starts", "clicks", 100],
  cost_per_android_download_completion: ["spend", "android_download_completions"],
  android_download_completion_rate: ["android_download_completions", "android_download_starts", 100],
  cost_per_android_install_completion: ["spend", "android_install_completions"],
  android_install_completion_rate: ["android_install_completions", "android_download_completions", 100],
  cost_per_activation: ["spend", "activations"],
  activation_rate: ["activations", "clicks", 100],
  cost_per_registration: ["spend", "registrations"],
  registration_rate: ["registrations", "activations", 100],
  cost_per_first_payment_event: ["spend", "first_payment_events"],
  first_payment_rate: ["first_payment_events", "activations", 100],
  cost_per_payment_event: ["spend", "payment_events"],
  reported_payment_roi: ["reported_payment_amount", "spend"],
  cost_per_valid_video_play: ["spend", "valid_video_plays"],
  video_play_rate_3s: ["video_plays_3s", "video_plays", 100]
};
var value = (number) => ({ value: number, unavailable_reason: null });
function demoMetricsFor(facts) {
  const values = { ...createDemoFacts(0, 0, 0, 0), ...facts };
  const { spendCents, paymentAmountCents, ...events } = values;
  const numbers = { ...events, spend: spendCents / 100, reported_payment_amount: paymentAmountCents / 100 };
  const metrics = Object.fromEntries(Object.entries(numbers).map(([key, number]) => [key, value(number)]));
  for (const [key, [numerator, denominator, scale = 1]] of Object.entries(ratios)) {
    metrics[key] = numbers[denominator] ? value(Number((numbers[numerator] / numbers[denominator] * scale).toFixed(2))) : { value: null, unavailable_reason: "zero_denominator" };
  }
  return metrics;
}

// ../../server/aigv/frontend/src/adData/materialPerformanceDemo.ts
var metric = (key, label, unit, description, index) => ({
  catalog_item_id: `demo_${key}`,
  metric_key: key,
  label,
  capability_state: "enabled",
  disabled_reason: null,
  business_group: "demo",
  short_description: description,
  formula_label: null,
  time_basis_label: "\u5317\u4EAC\u65F6\u95F4\u81EA\u7136\u65E5",
  applicability_summary: null,
  official_description: null,
  review_priority_bundle: null,
  sort_order: index,
  value_type: unit === "count" ? "integer" : unit === "percent" ? "percent" : "currency",
  unit,
  format: unit === "percent" ? "percentage_2" : "number_2",
  aggregation: unit === "percent" || key === "cost_per_conversion" ? "ratio_of_sums" : "sum",
  supported_surfaces: ["kpi", "trend", "table"],
  default_surfaces: ["kpi", "trend", "table"]
});
var MATERIAL_DEMO_METRICS = [
  metric("spend", "\u6D88\u8017", "platform_currency", "\u6240\u9009\u793A\u4F8B\u7D20\u6750\u5728\u8FD1 7 \u5929\u7684\u6A21\u62DF\u6D88\u8017\uFF0C\u5355\u4F4D\uFF1A\u5143\u3002", 0),
  metric("impressions", "\u5C55\u793A\u6B21\u6570", "count", "\u6240\u9009\u793A\u4F8B\u7D20\u6750\u7684\u6A21\u62DF\u5C55\u793A\u603B\u6B21\u6570\u3002", 1),
  metric("clicks", "\u70B9\u51FB\u6B21\u6570", "count", "\u6240\u9009\u793A\u4F8B\u7D20\u6750\u7684\u6A21\u62DF\u70B9\u51FB\u603B\u6B21\u6570\u3002", 2),
  metric("conversions", "\u8F6C\u5316\u6B21\u6570", "count", "\u6240\u9009\u793A\u4F8B\u7D20\u6750\u7684\u6A21\u62DF\u8F6C\u5316\u603B\u6B21\u6570\u3002", 3),
  metric("click_through_rate", "\u70B9\u51FB\u7387", "percent", "\u70B9\u51FB\u6B21\u6570 \xF7 \u5C55\u793A\u6B21\u6570 \xD7 100%\u3002", 4),
  metric("cost_per_conversion", "\u8F6C\u5316\u6210\u672C", "platform_currency_per_event", "\u6D88\u8017 \xF7 \u8F6C\u5316\u6B21\u6570\uFF0C\u5355\u4F4D\uFF1A\u5143\u3002", 5)
];
var MATERIAL_DEMO_CATALOG = {
  contract_version: "material-performance.demo.v1",
  catalog_version: "demo.v1",
  groups: [{ group_key: "demo", label: "\u6A21\u62DF\u6307\u6807", sort_order: 0, total_count: 6, enabled_count: 6, pending_count: 0, unavailable_count: 0 }],
  items: MATERIAL_DEMO_METRICS,
  defaults: {
    kpi_metric_keys: ["spend", "impressions", "clicks", "conversions"],
    trend_metric_keys: ["spend", "clicks", "conversions"],
    table_metric_keys: MATERIAL_DEMO_METRICS.map((item) => item.metric_key)
  }
};
var PLATFORM_EXAMPLES = {
  marketing: {
    label: "\u5DE8\u91CF AD",
    prefix: "AD",
    titles: ["\u65B0\u54C1\u4EAE\u70B9 \xB7 \u5F00\u7BB1\u5B9E\u6D4B", "\u573A\u666F\u79CD\u8349 \xB7 \u8F7B\u677E\u51FA\u884C", "\u597D\u7269\u63A8\u8350 \xB7 \u7EC6\u8282\u7279\u5199", "\u7528\u6237\u53E3\u7891 \xB7 \u771F\u5B9E\u4F53\u9A8C", "\u4E0A\u65B0\u9884\u544A \xB7 \u8D28\u611F\u5927\u7247", "\u9650\u65F6\u6D3B\u52A8 \xB7 \u798F\u5229\u4ECB\u7ECD"],
    captions: ["\u65B0\u54C1\u5F00\u7BB1", "\u8F7B\u677E\u51FA\u884C", "\u597D\u7269\u63A8\u8350", "\u771F\u5B9E\u4F53\u9A8C", "\u8D28\u611F\u4E0A\u65B0", "\u9650\u65F6\u798F\u5229"]
  },
  local: {
    label: "\u5DE8\u91CF\u672C\u5730\u63A8",
    prefix: "LOCAL",
    titles: ["\u95E8\u5E97\u63A2\u8BBF \xB7 \u5468\u672B\u597D\u53BB\u5904", "\u62DB\u724C\u63A8\u8350 \xB7 \u4EBA\u6C14\u5957\u9910", "\u5230\u5E97\u4F53\u9A8C \xB7 \u73AF\u5883\u5C55\u793A", "\u5E97\u957F\u4ECB\u7ECD \xB7 \u54C1\u8D28\u670D\u52A1", "\u5468\u8FB9\u751F\u6D3B \xB7 \u4E00\u8D77\u6253\u5361", "\u56E2\u8D2D\u798F\u5229 \xB7 \u9650\u65F6\u4E0A\u65B0"],
    captions: ["\u5468\u672B\u63A2\u5E97", "\u4EBA\u6C14\u5957\u9910", "\u5230\u5E97\u4F53\u9A8C", "\u54C1\u8D28\u670D\u52A1", "\u4E00\u8D77\u6253\u5361", "\u56E2\u8D2D\u798F\u5229"]
  },
  qianchuan: {
    label: "\u5DE8\u91CF\u5343\u5DDD",
    prefix: "QC",
    titles: ["\u76F4\u64AD\u9884\u544A \xB7 \u4ECA\u65E5\u597D\u7269", "\u4EA7\u54C1\u8BB2\u89E3 \xB7 \u6838\u5FC3\u5356\u70B9", "\u8FBE\u4EBA\u79CD\u8349 \xB7 \u4E0A\u8EAB\u4F53\u9A8C", "\u4F7F\u7528\u573A\u666F \xB7 \u751F\u6D3B\u65E5\u5E38", "\u7206\u6B3E\u63A8\u8350 \xB7 \u7EC6\u8282\u5C55\u793A", "\u76F4\u64AD\u798F\u5229 \xB7 \u9650\u65F6\u4F18\u60E0"],
    captions: ["\u4ECA\u65E5\u597D\u7269", "\u4EA7\u54C1\u8BB2\u89E3", "\u8FBE\u4EBA\u79CD\u8349", "\u751F\u6D3B\u65E5\u5E38", "\u7206\u6B3E\u63A8\u8350", "\u76F4\u64AD\u798F\u5229"]
  }
};
var THEMES = ["blue", "green", "violet", "orange", "rose", "teal"];
function createMaterialDemo(platform, now = /* @__PURE__ */ new Date()) {
  const example = PLATFORM_EXAMPLES[platform];
  const range = dateRangeForPreset("7d", now);
  const start = Date.parse(`${range.date_from}T00:00:00Z`);
  const dates = Array.from({ length: 7 }, (_, index) => new Date(start + index * 864e5).toISOString().slice(0, 10));
  const platformSeed = ["marketing", "local", "qianchuan"].indexOf(platform);
  const materials = example.titles.map((name, index) => {
    const daily = dates.map((date, day) => {
      const volume = 8 + (day * 3 + index * 2 + platformSeed) % 9;
      const impressions = (2100 + index * 370 + platformSeed * 260) * volume;
      const clicks = Math.floor(impressions * (19 + index * 3 + day % 3) / 1e3);
      const conversions = Math.floor(clicks * (42 + index * 6) / 1e3);
      return { date, facts: createDemoFacts(impressions, clicks, conversions, clicks * (65 + index * 7 + platformSeed * 9)) };
    });
    return {
      id: `DEMO-${example.prefix}-${String(index + 1).padStart(3, "0")}`,
      name,
      type: index === 2 || index === 4 ? "\u56FE\u7247" : "\u89C6\u9891",
      theme: THEMES[index],
      caption: example.captions[index],
      daily,
      metrics: demoMetricsFor(sumDemoFacts(daily.map((item) => item.facts)))
    };
  });
  return summarizeMaterialDemo({ platformLabel: example.label, dateRange: { from: range.date_from, to: range.date_to }, materials });
}
function summarizeMaterialDemo(source) {
  const start = Date.parse(`${source.dateRange.from}T00:00:00Z`);
  const trend = Array.from({ length: 7 }, (_, day) => {
    const date = new Date(start + day * 864e5).toISOString().slice(0, 10);
    return { date, metrics: demoMetricsFor(sumDemoFacts(source.materials.flatMap((item) => item.daily.filter((row) => row.date === date).map((row) => row.facts)))) };
  });
  return { ...source, overview: demoMetricsFor(sumDemoFacts(source.materials.flatMap((item) => item.daily.map((row) => row.facts)))), trend, materialCount: source.materials.length };
}
function filterMaterialDemo(source, keyword) {
  const query = keyword.trim().toLocaleLowerCase("zh-CN");
  return summarizeMaterialDemo({ ...source, materials: source.materials.filter((item) => !query || `${item.name} ${item.id}`.toLocaleLowerCase("zh-CN").includes(query)) });
}
export {
  MATERIAL_DEMO_CATALOG,
  MATERIAL_DEMO_METRICS,
  createMaterialDemo,
  filterMaterialDemo
};
