import {
  createMaterialDemo,
  filterMaterialDemo,
  MATERIAL_DEMO_METRICS,
} from "./employee-demo-data.mjs";
import {
  readState,
  watchState,
  effectiveFeatures,
} from "./employee-state.mjs";
import {
  materialScope,
  canCreateRule,
  SAMPLE_NOW,
} from "./reminder-rules.mjs?v=rules18";
import { createUI } from "./employee-ui.mjs?v=rules18";
import {
  V as runtimeRouter,
  Y as runtimeRoute,
  ac as runtimeWatch,
  z as onMounted,
  ad as onUnmounted,
} from "../commercial-platform/runtime/assets-blue3/index-oddxqlpg.js";

export function createEmployeeReport({
  h,
  ref,
  computed,
  useRouter = runtimeRouter,
  useRoute = runtimeRoute,
  watch = runtimeWatch,
}) {
  const { el, input, button, check, select, table, tag, drawer } = createUI(h);
  let helpId = 0;
  const help = (text, label = '指标口径说明') => {
    const id = `performance-help-${++helpId}`;
    return el('span', 'rm-help-wrap', [el('button', 'rm-help', '?', { type: 'button', 'aria-label': label, 'aria-describedby': id }), el('span', 'rm-tooltip', text, { id, role: 'tooltip' })]);
  };
  const labelNames = { first_publish: '首发', high_quality: '优质', low_quality: '低质', inefficient: '低效', carry_risk: '搬运风险' };
  const labelClass = key => `material-label material-label-${key}`;
  const format = (metric, values) => {
    const n = values[metric.metric_key]?.value;
    return n == null
      ? "—"
      : (metric.unit.startsWith("platform_currency") ? "¥" : "") +
          Number(n).toLocaleString("zh-CN", { maximumFractionDigits: 2 }) +
          (metric.unit === "percent" ? "%" : "");
  };
  return {
    name: "EmployeeSampleReport",
    props: { platform: String },
    setup(props, { expose }) {
      const router = useRouter(), route = useRoute(),
        query = ref(typeof route.query.material === 'string' ? route.query.material : ""),
        settings = ref(false),
        metricKeys = ref(["spend", "impressions", "clicks", "conversions"]),
        trendKey = ref("spend"),
        labelFilters = ref([]),
        selected = ref([]),
        company = ref('all'),
        advertiser = ref('all'),
        project = ref('all'),
        materialType = ref('all'),
        detail = ref(null);
      const employee = ref(readState()),
        hasAccess = computed(() =>
          effectiveFeatures(employee.value).includes("material_performance"),
        ),
        mayCreateRule = computed(() => canCreateRule(employee.value));
      let stop;
      onMounted(() => {
        stop = watchState((next) => {
          employee.value = next;
          selected.value = [];
        });
      });
      onUnmounted(() => stop?.());
      watch(() => route.query.material, value => {
        if (typeof value === 'string' && value) query.value = value;
      });
      const source = computed(() => {
        const data = createMaterialDemo(
          props.platform || "marketing",
          SAMPLE_NOW,
        );
        const assigned = materialScope(employee.value);
        data.materials = data.materials.map((material, index) => {
          const scope = assigned.find(row => row.id === material.id) || assigned[index] || {};
          return ({
          ...material,
          advertiserId: scope.advertiserId || `ADVERTISER-${index + 1}`,
          advertiser: scope.advertiser || '巨量广告主',
          account: scope.account || '创作平台演示账户',
          company: scope.company || (index < 3 ? '示例企业' : '品牌事业部'),
          project: scope.project || `投放项目 ${index + 1}`,
          labels: [
            ['first_publish', 'high_quality'],
            ['high_quality'],
            ['first_publish'],
            ['low_quality'],
            ['first_publish', 'high_quality'],
            ['inefficient'],
          ][index] || [],
        });
        });
        if (hasAccess.value && props.platform === "marketing") {
          const ids = new Set(materialScope(employee.value).map((m) => m.id));
          data.materials = data.materials.filter((m) => ids.has(m.id));
        }
        return data;
      });
      const snapshot = computed(() => filterMaterialDemo({
        ...source.value,
        materials: source.value.materials.filter(row => {
          const selected = new Set(labelFilters.value), evaluations = labelFilters.value.filter(label => label !== 'first_publish');
          return (company.value === 'all' || row.company === company.value)
            && (advertiser.value === 'all' || row.advertiserId === advertiser.value)
            && (project.value === 'all' || row.project === project.value)
            && (materialType.value === 'all' || row.type === materialType.value)
            && (!selected.has('first_publish') || row.labels.includes('first_publish'))
            && (!evaluations.length || evaluations.some(label => row.labels.includes(label)));
        }),
      }, query.value));
      const sourceOptions = computed(() => ({
        companies: [...new Set(source.value.materials.map(row => row.company))],
        advertisers: [...new Map(source.value.materials.map(row => [row.advertiserId, `${row.account} · ${row.advertiser}`])).entries()],
        projects: [...new Set(source.value.materials.map(row => row.project))],
      }));
      const labelSummary = computed(() => {
        if (!labelFilters.value.length) return '全部标签';
        const first = labelFilters.value.includes('first_publish') ? '首发' : '';
        const evaluations = labelFilters.value.filter(label => label !== 'first_publish').map(label => labelNames[label]);
        return first && evaluations.length ? `${first}，且（${evaluations.join('或')}）` : first || evaluations.join('或');
      });
      const metrics = computed(() =>
        MATERIAL_DEMO_METRICS.filter((m) =>
          metricKeys.value.includes(m.metric_key),
        ),
      );
      expose({ openMetricSettings: () => (settings.value = true) });
      const choose = (id) => {
        selected.value = selected.value.includes(id)
          ? selected.value.filter((x) => x !== id)
          : [...selected.value, id];
      };
      const go = (query) => {
        if (!hasAccess.value) return;
        router.push({
          path: "/media-management",
          query: {
            tab: "rules",
            materials: selected.value.join(","),
            ...query,
          },
        });
      };
      function openAction(ids) {
        selected.value = [...new Set(ids)];
        go({ action: "new-rule" });
      }
      function chart() {
        const points = snapshot.value.trend,
          values = points.map((p) => p.metrics[trendKey.value]?.value || 0),
          maximum = Math.max(...values, 1),
          path = values
            .map(
              (value, i) =>
                (i ? "L" : "M") +
                (40 + i * 140) +
                "," +
                (180 - (value / maximum) * 140),
            )
            .join(" ");
        return h(
          "svg",
          {
            viewBox: "0 0 920 230",
            role: "img",
            "aria-label": "近七天示例趋势",
            class: "employee-report-chart",
          },
          [
            h("path", { d: "M40 20V180H900", fill: "none", stroke: "#dfe6f2" }),
            h("path", {
              d: path,
              fill: "none",
              stroke: "#165dff",
              "stroke-width": "2.5",
            }),
            ...points.map((p, i) =>
              h("g", { key: p.date }, [
                h("circle", {
                  cx: 40 + i * 140,
                  cy: 180 - (values[i] / maximum) * 140,
                  r: 4,
                  fill: "#165dff",
                }),
                h(
                  "text",
                  {
                    x: 40 + i * 140,
                    y: 208,
                    "text-anchor": "middle",
                    fill: "#65728c",
                    "font-size": 12,
                  },
                  p.date.slice(5),
                ),
              ]),
            ),
          ],
        );
      }
      return () =>
        el("section", "employee-report", [
          el("form", "employee-report-query production", [
            el('div', 'employee-filter-row primary', [
              el('label', 'employee-filter-field date', [el('span', '', '日期范围'), el('div', 'employee-date-range', [input(snapshot.value.dateRange.from, () => {}, '', { type: 'date', readonly: true, 'aria-label': '开始日期' }), el('span', '', '至'), input(snapshot.value.dateRange.to, () => {}, '', { type: 'date', readonly: true, 'aria-label': '结束日期' })])]),
              el('label', 'employee-filter-field', [el('span', '', '公司'), select(company.value, value => company.value = value, [['all','全部公司'], ...sourceOptions.value.companies.map(value => [value,value])], '公司')]),
              el('label', 'employee-filter-field advertiser', [el('span', '', '广告主'), select(advertiser.value, value => advertiser.value = value, [['all','全部广告主'], ...sourceOptions.value.advertisers], '广告主')]),
            ]),
            el('div', 'employee-filter-row dimensions', [
              el('label', 'employee-filter-field search', [el('span', '', '素材 ID'), input(query.value, value => query.value = value, '输入素材 ID')]),
              el('label', 'employee-filter-field', [el('span', '', '项目'), select(project.value, value => project.value = value, [['all','全部项目'], ...sourceOptions.value.projects.map(value => [value,value])], '项目')]),
              el('label', 'employee-filter-field', [el('span', '', '素材类型'), select(materialType.value, value => materialType.value = value, [['all','全部类型'],['视频','视频'],['图片','图片']], '素材类型')]),
              el('label', 'employee-filter-field labels', [el('span', '', '素材标签'), el('details', 'material-label-filter', [el('summary', '', labelSummary.value), el('div', 'material-label-filter-menu', Object.entries(labelNames).map(([key, label]) => check(label, labelFilters.value.includes(key), () => { labelFilters.value = labelFilters.value.includes(key) ? labelFilters.value.filter(item => item !== key) : [...labelFilters.value, key]; }))) ])]),
              el('div', 'employee-filter-actions', [button('重置', () => { query.value = ''; company.value = 'all'; advertiser.value = 'all'; project.value = 'all'; materialType.value = 'all'; labelFilters.value = []; }), button('查询', () => {}, 'primary')]),
            ]),
          ], { onSubmit: event => event.preventDefault() }),
          el(
            "div",
            "employee-report-kpis",
            metrics.value.map((metric) =>
              el("article", "employee-report-kpi", [
                el("span", "employee-kpi-label", [el('span', '', metric.label), help(metric.short_description, `${metric.label}口径说明`)]),
                el("strong", "", format(metric, snapshot.value.overview)),
                el("small", "em-muted", "近 7 天汇总"),
              ]),
            ),
          ),
          el("section", "em-card employee-report-panel", [
            el("header", "employee-report-heading", [el('div', '', [el("h2", "", "表现趋势"), el('p', 'em-muted', '按北京时间自然日展示 · 最多对比 6 项指标')]), el('span', 'em-muted', `${snapshot.value.dateRange.from} 至 ${snapshot.value.dateRange.to}`)]),
            el(
              "div",
              "em-actions",
              [
                ["spend", "消耗"],
                ["conversions", "转化次数"],
              ].map(([key, label]) =>
                button(
                  label,
                  () => (trendKey.value = key),
                  trendKey.value === key ? "selected" : "",
                ),
              ),
            ),
            chart(),
          ]),
          el("section", "em-card", [
            el("header", "employee-report-heading", [el('div', '', [el("h2", "", "平台素材明细"), el('p', 'em-muted', '按素材与日期汇总展示')]), el('div', 'em-actions', [tag(snapshot.value.materialCount + " 条明细", "muted"), button('设置表格列', () => settings.value = true)])]),
            selected.value.length && hasAccess.value
              ? el("div", "material-reminder-bar", [
                  el("strong", "", "已选 " + selected.value.length + " 个素材"),
                  el("div", "em-actions", [
                    mayCreateRule.value ? button("设置提醒", () => openAction(selected.value), "primary") : button("查看新建权限", () => router.push({ path: "/media-management", query: { tab: "grants" } })),
                    button("取消选择", () => (selected.value = []), "text"),
                  ]),
                ])
              : null,
            table(
              [
                h("label", { class: "em-check" }, [
                  h("input", {
                    type: "checkbox",
                    checked:
                      snapshot.value.materials.length > 0 &&
                      snapshot.value.materials.every((row) =>
                        selected.value.includes(row.id),
                      ),
                    onChange: () => {
                      const ids = snapshot.value.materials.map((row) => row.id);
                      selected.value = ids.every((id) =>
                        selected.value.includes(id),
                      )
                        ? selected.value.filter((id) => !ids.includes(id))
                        : [...new Set([...selected.value, ...ids])];
                    },
                  }),
                  "全选",
                ]),
                "素材与项目",
                "投放属性",
                ...metrics.value.map((m) => m.label),
                "操作",
              ],
              snapshot.value.materials.map((row) =>
                h("tr", { key: row.id, class: route.query.material === row.id ? 'material-target-row' : '' }, [
                  h("td", null, [
                    check("", selected.value.includes(row.id), () =>
                      choose(row.id),
                    ),
                  ]),
                  h("td", null, [
                    el("strong", "", row.name),
                    el("small", "em-sub", row.id),
                    el('small', 'em-sub', `项目 ${row.project} · 广告主 ${row.advertiser}`),
                    row.labels?.length ? el("div", "material-labels", row.labels.map(key => el("span", labelClass(key), labelNames[key]))) : null,
                  ]),
                  h("td", null, [tag(row.type, 'muted'), tag(snapshot.value.platformLabel, '')]),
                  ...metrics.value.map((m) =>
                    h("td", null, format(m, row.metrics)),
                  ),
                  h("td", null, [
                    button('查看详情', () => detail.value = row, 'text'),
                    mayCreateRule.value ? button("设置提醒", () => openAction([row.id]), "text") : button("查看权限", () => router.push({ path: "/media-management", query: { tab: "grants" } }), "text"),
                  ]),
                ]),
              ),
            ),
          ]),
          detail.value ? drawer('素材详情', [el('section', 'employee-material-detail', [el('h2', '', detail.value.name), el('p', 'em-muted', `${detail.value.id} · ${detail.value.project} · ${detail.value.account}`), el('div', 'employee-detail-metrics', metrics.value.map(metric => el('article', '', [el('span', 'em-muted', metric.label), el('strong', '', format(metric, detail.value.metrics))])) )])], [], () => detail.value = null) : null,
          settings.value
            ? drawer(
                "示例指标设置",
                [
                  el("p", "em-muted", "选择概览与表格展示的指标。"),
                  ...MATERIAL_DEMO_METRICS.map((m) =>
                    check(
                      m.label,
                      metricKeys.value.includes(m.metric_key),
                      () => {
                        metricKeys.value = metricKeys.value.includes(
                          m.metric_key,
                        )
                          ? metricKeys.value.filter(
                              (key) => key !== m.metric_key,
                            )
                          : [...metricKeys.value, m.metric_key];
                      },
                    ),
                  ),
                ],
                [button("完成", () => (settings.value = false), "primary")],
                () => (settings.value = false),
              )
            : null,
        ]);
    },
  };
}
