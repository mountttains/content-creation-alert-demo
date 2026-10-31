import RuleManager from "./rule-manager.mjs?v=rules34";
import {
  readState,
  watchState,
  actorProfile,
  effectiveFeatures,
  setPreviewActor,
  platforms,
  platformObjects,
  scope,
} from "./employee-state.mjs?v=dataset4";
import { createUI } from "./employee-ui.mjs?v=rules18";
import { volumeFacts } from "../../demo/assets/alert-model.mjs?v=4";
import {
  readRules,
  writeRules,
  watchRules,
  materialScope,
  boardEvents,
  conditionsText,
  conditionText,
  personName,
  metrics,
  kindLabels,
  liveMaterial,
  SAMPLE_TIME,
} from "./reminder-rules.mjs?v=rules34";

export function createAlertWorkspace({
  h,
  ref,
  computed,
  useRouter,
  useRoute,
  watch,
  onMounted,
  onUnmounted,
}) {
  const { el, button, input, field, table, tag, drawer, empty } = createUI(h);
  let helpId = 0;
  const help = (text, label = '说明') => {
    const id = `rd-help-${++helpId}`;
    return el('span', 'rm-help-wrap', [el('button', 'rd-help', '?', { type: 'button', 'aria-label': label, 'aria-describedby': id }), el('span', 'rm-tooltip', text, { id, role: 'tooltip' })]);
  };
  const money = (n) =>
    Number.isFinite(n)
      ? `¥${n.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`
      : "—";
  const format = (field, n) =>
    !Number.isFinite(n)
      ? "—"
      : ["spend", "revenue", "cpa", "cpm", "cpc", "attributionCpa", "deepCpa", "payGmv", "recent", "previous"].includes(field)
        ? money(n)
        : `${Number(n.toFixed(2))}${metrics[field]?.[1] || ""}`;
  return {
    name: "ReminderDashboard",
    setup() {
      const router = useRouter(),
        route = useRoute(),
        employee = ref(readState()),
        store = ref(readRules()),
        selected = ref(null),
        query = ref(""),
        kind = ref("all"),
        handleStatus = ref("all"),
        platformId = ref("all"),
        advertiserId = ref("all"),
        advertiserQuery = ref(""),
        page = ref(1),
        pageSize = ref(10),
        notice = ref(""),
        note = ref(""),
        afterSpend = ref(""),
        afterConversions = ref(""),
        afterRevenue = ref(""),
        afterPeriod = ref(""),
        reviewError = ref("");
      const demo = computed(
        () =>
          !effectiveFeatures(employee.value).includes("material_performance"),
      );
      const viewer = computed(() =>
        demo.value
          ? { ...employee.value, actor: "preview-admin1" }
          : employee.value,
      );
      const current = computed(() => actorProfile(viewer.value));
      const advertiserOptions = computed(() => scope(viewer.value, viewer.value.actor, new Set(), "material_performance").map(account => ({
        id: account.id,
        name: account.name,
        code: account.advertiser_id,
        platform: account.platform,
      })));
      const tab = computed(() => route.query.tab === "rules" ? "rules" : "records");
      const events = computed(() =>
        boardEvents(viewer.value, store.value).filter((e) =>
          (platformId.value === "all" || e.material.platform === platformId.value) &&
          (advertiserId.value === "all" || e.material.advertiserId === advertiserId.value) &&
          `${e.material.name} ${e.material.id} ${e.rule.name}`.includes(query.value.trim()),
        ),
      );
      const volumes = computed(() =>
        materialScope(viewer.value).filter((m) =>
          (platformId.value === "all" || m.platform === platformId.value) &&
          (advertiserId.value === "all" || m.advertiserId === advertiserId.value) &&
          `${m.name} ${m.id} ${m.account}`.includes(query.value.trim()),
        ),
      );
      const handled = row => [...(store.value.observations[row.key] || [])].reverse().find(log => log.status)?.status === "handled";
      const filteredEvents = computed(() => events.value.filter(e =>
        (kind.value === "all" || e.rule.kind === kind.value) &&
        (handleStatus.value === "all" || (handleStatus.value === "handled") === handled(e)),
      ));
      const pageCount = computed(() => Math.max(1, Math.ceil(filteredEvents.value.length / pageSize.value)));
      const pagedEvents = computed(() => filteredEvents.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value));
      let stopEmployee, stopRules, focusBefore;
      const closeAdvertiserOnOutside = event => document.querySelectorAll('.rd-scope-picker[open]').forEach(node => { if (!node.contains(event.target)) node.removeAttribute('open'); });
      onMounted(() => {
        document.addEventListener('pointerdown', closeAdvertiserOnOutside);
        stopEmployee = watchState((next) => {
          employee.value = next;
          selected.value = null;
          if (advertiserId.value !== "all" && !materialScope(next).some(material => material.advertiserId === advertiserId.value)) advertiserId.value = "all";
        });
        stopRules = watchRules((next) => {
          store.value = next;
        });
      });
      onUnmounted(() => {
        document.removeEventListener('pointerdown', closeAdvertiserOnOutside);
        stopEmployee?.();
        stopRules?.();
      });
      watch(
        () => route.query.tab,
        () => {
          selected.value = null;
          query.value = "";
          kind.value = "all";
          handleStatus.value = "all";
          page.value = 1;
        },
      );
      watch(() => [query.value, kind.value, handleStatus.value, platformId.value, advertiserId.value, pageSize.value], () => page.value = 1);
      watch(() => filteredEvents.value.length, () => page.value = Math.min(page.value, pageCount.value));
      const setTab = (value) =>
        router.replace({
          path: "/ad-data",
          query: {
            view: "alerts",
            tab: value === "records" ? undefined : value,
          },
        });
      function chooseAdvertiser(id, event) {
        advertiserId.value = id;
        event.currentTarget.closest("details")?.removeAttribute("open");
      }
      function choosePlatform(id, event) {
        platformId.value = id;
        advertiserId.value = "all";
        advertiserQuery.value = "";
        event.currentTarget.closest("details")?.removeAttribute("open");
      }
      function platformPicker() {
        const visiblePlatforms = Object.keys(platforms).filter(platform => advertiserOptions.value.some(item => item.platform === platform));
        const label = platformId.value === "all" ? "全部媒介平台" : platforms[platformId.value];
        return el("details", "rd-scope-picker rd-platform-picker", [
          el("summary", "", [el("span", "", "媒介平台"), el("strong", "", label)]),
          el("div", "rd-platform-menu", [
            el("button", platformId.value === "all" ? "active" : "", [el("span", "", "全部媒介平台"), el("small", "", `${advertiserOptions.value.length} 个可见账户`), platformId.value === "all" ? el("i", "rd-account-check", "", { "aria-hidden": "true" }) : null], { type: "button", onClick: event => choosePlatform("all", event) }),
            ...visiblePlatforms.map(platform => {
              const count = advertiserOptions.value.filter(item => item.platform === platform).length;
              return el("button", platformId.value === platform ? "active" : "", [el("span", "", platforms[platform]), el("small", "", `${count} 个${platformObjects[platform].account}`), platformId.value === platform ? el("i", "rd-account-check", "", { "aria-hidden": "true" }) : null], { type: "button", onClick: event => choosePlatform(platform, event) });
            }),
          ]),
        ]);
      }
      function advertiserPicker() {
        const selectedAdvertiser = advertiserOptions.value.find(item => item.id === advertiserId.value);
        const platformAccounts = advertiserOptions.value.filter(item => platformId.value === "all" || item.platform === platformId.value);
        const filtered = platformAccounts.filter(item => `${item.name} ${item.code} ${platforms[item.platform]} ${platformObjects[item.platform]?.delivery || ''}`.includes(advertiserQuery.value.trim()));
        const groups = Object.keys(platforms).map(platform => ({ platform, items: filtered.filter(item => item.platform === platform) })).filter(group => group.items.length);
        const platformMarks = { ocean_engine: "AD", qianchuan: "千", local: "本" };
        const allLabel = platformId.value === "all" ? "全部业务账户" : `全部${platforms[platformId.value]}账户`;
        return el("details", "rd-scope-picker rd-advertiser-picker", [
          el("summary", "", [el("span", "", selectedAdvertiser ? platforms[selectedAdvertiser.platform] : platformId.value === "all" ? "业务账户" : platformObjects[platformId.value].account), el("strong", "", selectedAdvertiser ? selectedAdvertiser.name : allLabel)]),
          el("div", "rd-advertiser-menu", [
            input(advertiserQuery.value, value => advertiserQuery.value = value, platformId.value === "all" ? "搜索账户名称、ID 或媒介平台" : `搜索${platformObjects[platformId.value].account}名称或 ID`, { "aria-label": "搜索业务账户" }),
            el("div", "rd-advertiser-options", [
              el("button", advertiserId.value === "all" ? "active" : "", [el("span", "rd-account-mark all", "全"), el("span", "", [el("strong", "", allLabel), el("small", "", `${platformAccounts.length} 个可见账户`)]), advertiserId.value === "all" ? el("i", "rd-account-check", "", { "aria-hidden": "true" }) : null], { type: "button", onClick: event => chooseAdvertiser("all", event) }),
              ...groups.map(group => {
                const labels = platformObjects[group.platform];
                const hierarchy = labels.delivery ? `${labels.account} → ${labels.delivery} → ${labels.material}` : `${labels.account} → ${labels.material}`;
                return el("section", "rd-account-group", [
                  el("header", "", [el("div", "", [el("strong", "", platforms[group.platform]), el("small", "", hierarchy)]), el("span", "", `${group.items.length} 个${labels.account}`)]),
                  ...group.items.map(item => el("button", advertiserId.value === item.id ? "active" : "", [el("span", `rd-account-mark ${item.platform}`, platformMarks[item.platform]), el("span", "", [el("strong", "", item.name), el("small", "", `${labels.account} ID：${item.code} · ${labels.delivery ? `${labels.delivery}维度` : `${labels.material}维度`}`)]), advertiserId.value === item.id ? el("i", "rd-account-check", "", { "aria-hidden": "true" }) : null], { type: "button", onClick: event => chooseAdvertiser(item.id, event) })),
                ]);
              }),
            ]),
          ]),
        ]);
      }
      function open(row) {
        focusBefore = document.activeElement;
        selected.value = row;
        note.value = "";
        afterSpend.value = "";
        afterConversions.value = "";
        afterRevenue.value = "";
        afterPeriod.value = "";
        reviewError.value = "";
      }
      function close() {
        selected.value = null;
        setTimeout(() => focusBefore?.isConnected && focusBefore.focus(), 0);
      }
      function openMaterial(material) {
        close();
        router.push({ path: "/ad-data", query: { view: "performance", material: material.id, ...(material.platform !== "ocean_engine" ? { platform: material.platform } : {}) } });
      }
      function toggleHandled(row) {
        if (!row?.key || demo.value) return;
        const next = JSON.parse(JSON.stringify(store.value));
        const status = handled(row) ? "open" : "handled";
        next.observations[row.key] = [...(next.observations[row.key] || []), {
          by: employee.value.actor,
          at: new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
          status,
        }];
        writeRules(next);
        store.value = next;
        selected.value = { ...row };
      }
      function saveReview(withAfter = false) {
        const row = selected.value;
        if (
          demo.value ||
          !row?.rule.id ||
          !boardEvents(employee.value, store.value).some(
            (e) => e.key === row.key,
          )
        )
          return;
        if (!note.value.trim()) {
          reviewError.value = "请填写观察或调整记录。";
          return;
        }
        if (
          withAfter &&
          (!afterPeriod.value.trim() ||
            [afterSpend.value, afterConversions.value, afterRevenue.value].some(
              (v) => v === "" || !Number.isFinite(Number(v)) || Number(v) < 0,
            ) ||
            !Number.isInteger(Number(afterConversions.value)))
        ) {
          reviewError.value = "请填写可比观察时段及有效的后续指标。";
          return;
        }
        const next = JSON.parse(JSON.stringify(store.value));
        const log = {
          by: employee.value.actor,
          at: new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
          note: note.value.trim(),
          period: afterPeriod.value.trim(),
          baseline: {
            spend: row.material.spend,
            conversions: row.material.conversions,
            revenue: row.material.revenue,
          },
          after: withAfter
            ? {
                spend: Number(afterSpend.value),
                conversions: Number(afterConversions.value),
                revenue: Number(afterRevenue.value),
              }
            : null,
        };
        next.observations[row.key] = [
          ...(next.observations[row.key] || []),
          log,
        ];
        try {
          writeRules(next);
          store.value = next;
          note.value = "";
          reviewError.value = "";
        } catch {
          reviewError.value = "未能保存，请重试。";
        }
      }
      function trend(m) {
        const max = Math.max(...m.hourly.filter(Number.isFinite), 1);
        return h(
          "svg",
          {
            viewBox: "0 0 440 130",
            class: "rd-trend",
            role: "img",
            "aria-label": "示例素材小时消耗趋势",
          },
          m.hourly.map((v, i) =>
            h("g", { key: i }, [
              h("rect", {
                x: 24 + i * 68,
                y: v == null ? 96 : 100 - (v / max) * 75,
                width: 38,
                height: v == null ? 4 : Math.max(1, (v / max) * 75),
                rx: 3,
                fill: v == null ? "#d8dee9" : i >= 4 ? "#165dff" : "#c6d6ff",
              }),
              h(
                "text",
                {
                  x: 43 + i * 68,
                  y: 120,
                  "text-anchor": "middle",
                  fill: "#758097",
                  "font-size": 11,
                },
                `${7 + i}:00`,
              ),
              h(
                "text",
                {
                  x: 43 + i * 68,
                  y: v == null ? 88 : 91 - (v / max) * 75,
                  "text-anchor": "middle",
                  fill: "#45546c",
                  "font-size": 11,
                },
                v == null ? "缺失" : v,
              ),
            ]),
          ),
        );
      }
      function details() {
        const row = selected.value,
          m = row.material,
          rule = row.rule,
          facts = liveMaterial(viewer.value, m)
            ? volumeFacts(m)
            : {
                ready: false,
                state: "数据暂不可判断",
                reason: "当前素材不在生效数据范围内",
              };
        return drawer(
          "提醒详情",
          [
            el("section", "rd-detail-section", [
              el("h2", "", m.name),
              el("p", "em-muted", `${m.id} · ${m.account} · ${platforms[m.platform] || m.platform}`),
              el("div", "rd-detail-status", [
                el("span", `rd-type-badge ${rule.kind || "risk"}`, kindLabels[rule.kind] || "未分类"),
                handled(row) ? tag("已处理", "good") : tag("待处理", "risk"),
              ]),
              el("div", "rd-detail-actions", [
                button("查看素材表现", () => openMaterial(m), "text"),
                rule.id && !demo.value ? button(handled(row) ? "重新打开" : "标记已处理", () => toggleHandled(row), handled(row) ? "" : "primary") : null,
              ]),
            ]),
            rule.id
              ? el("section", "rd-detail-section", [
                  el("h3", "", "为什么触发"),
                  el("p", "", rule.name),
                  ...row.values.map((c) =>
                    el("div", "rd-evidence-row", [
                      el("span", "", conditionText(c)),
                      el("strong", "", `实际：${format(c.field, c.actual)}`),
                    ]),
                  ),
                  el("p", "em-muted", `所有条件同时满足 · ${SAMPLE_TIME}`),
                ])
              : null,
            rule.kind === "volume" ? el("section", "rd-detail-section", [
              el("h3", "", "起量过程"),
              facts.ready ? trend(m) : null,
              el(
                "p",
                "em-muted",
                facts.ready
                  ? `前 2 小时 ${money(facts.previous)} → 近 2 小时 ${money(facts.recent)}；变化 ${facts.delta == null ? "基数为 0，不计算增幅" : `${facts.delta.toFixed(1)}%`}`
                  : facts.reason,
              ),
              el(
                "p",
                "rd-guard",
                "起量是消耗量级变化，不等同于效果改善；需结合成本、回收和可比时段判断。",
              ),
            ]) : null,
            el("section", "rd-detail-section", [
              el("h3", "", "规则与归属"),
              el(
                "p",
                "em-muted",
                `创作平台项目：${m.project} · 创作人：${m.creator}（示例关联）`,
              ),
              el("p", "", `条件：${conditionsText(rule)}`),
              el(
                "p",
                "em-muted",
                `规则创建者：${personName(rule.owner)} · ${rule.sendNotifications === false ? '不发送通知' : '按规则设置发送通知'}`,
              ),
              el(
                "p",
                "em-muted",
                `通知方式：${rule.channels.map((c) => (c === "site" ? "站内提醒" : "企业微信")).join("、")}`,
              ),
              rule.id ? tag("已关联告警规则", "muted") : null,
            ]),
          ],
          [],
          close,
        );
      }
      function records() {
        return el("section", "rd-panel em-card", [
          el("div", "rd-filterbar unified", [
            input(
              query.value,
              (v) => (query.value = v),
              "搜索素材、素材 ID 或规则名称",
            ),
            h("select", { value: kind.value, "aria-label": "提醒类型", onChange: event => kind.value = event.target.value }, [
              h("option", { value: "all" }, "提醒类型：全部"),
              ...Object.entries(kindLabels).map(([key, label]) => h("option", { value: key }, label)),
            ]),
            h("select", { value: handleStatus.value, "aria-label": "处理状态", onChange: event => handleStatus.value = event.target.value }, [
              h("option", { value: "all" }, "处理状态：全部"),
              h("option", { value: "open" }, "待处理"),
              h("option", { value: "handled" }, "已处理"),
            ]),
            el("span", "em-muted", `${filteredEvents.value.length} 条提醒`),
          ]),
          el("p", "rd-definition-hint", [help("起量按规则配置的相邻完整消耗窗口比较消耗变化；它只表示投放量级变化，不代表转化效率或素材质量改善。", "起量定义"), "起量按相邻完整消耗窗口判断。"]),
          filteredEvents.value.length
            ? [table(
                ["提醒类型", "素材", "媒介平台", "触发条件", "实际表现", "处理状态", "时间", "操作"],
                pagedEvents.value.map((e) =>
                    h("tr", { key: e.key }, [
                      el("td", "", [
                        el("span", `rd-type-badge ${e.rule.kind || "risk"}`, kindLabels[e.rule.kind] || "未分类"),
                        el("strong", "rd-rule-link", e.rule.name),
                      ]),
                      el("td", "", [
                        el("strong", "", e.material.name),
                        el(
                          "small",
                          "em-sub",
                          `${e.material.id} · ${e.material.account}`,
                        ),
                      ]),
                      el("td", "", platforms[e.material.platform] || e.material.platform),
                      el("td", "", e.values.map(conditionText).join("；")),
                      el(
                        "td",
                        "",
                        e.values
                          .map((v) => format(v.field, v.actual))
                          .join("；"),
                      ),
                      el("td", "", handled(e) ? tag("已处理", "good") : tag("待处理", "risk")),
                      el("td", "", SAMPLE_TIME),
                      el(
                        "td",
                        "",
                        button("查看详情", () => open(e), "text"),
                      ),
                    ]),
                  ),
              ),
              el("footer", "em-pagination rd-pagination", [
                el("span", "", `共 ${filteredEvents.value.length} 条`),
                el("label", "", [el("span", "", "每页"), h("select", { value: String(pageSize.value), "aria-label": "每页提醒条数", onChange: event => pageSize.value = Number(event.target.value) }, [10, 50, 100, 200].map(size => h("option", { value: String(size) }, `${size} 条`)))]),
                el("span", "", `第 ${page.value} / ${pageCount.value} 页`),
                button("上一页", () => page.value = Math.max(1, page.value - 1), "", { disabled: page.value === 1 }),
                button("下一页", () => page.value = Math.min(pageCount.value, page.value + 1), "", { disabled: page.value === pageCount.value }),
              ])]
            : empty(
                "当前没有命中提醒",
                "规则会按运行设置继续检查；数据缺失、延迟或无权限素材不会被误判为异常。",
              ),
        ]);
      }
      function volume() {
        return el("section", "rd-panel em-card", [
          el("div", "rd-filterbar", [
            input(query.value, (v) => (query.value = v), "搜索素材或广告主"),
            el("span", "em-muted", "相邻完整消耗窗口"),
          ]),
          volumes.value.length
            ? table(
                [
                  "素材",
                  "媒介平台",
                  "广告主",
                  "前 2 小时消耗",
                  "近 2 小时消耗",
                  "变化",
                  "状态",
                  "操作",
                ],
                volumes.value.map((m) => {
                  const f = liveMaterial(viewer.value, m)
                    ? volumeFacts(m)
                    : { ready: false, state: "数据未开放" };
                  return h("tr", { key: m.id }, [
                    el("td", "", [
                      el("strong", "", m.name),
                      el("small", "em-sub", m.id),
                    ]),
                    el("td", "", platforms[m.platform] || m.platform),
                    el("td", "", `${m.account} · ${m.advertiser}`),
                    el("td", "", money(f.previous)),
                    el("td", "", money(f.recent)),
                    el(
                      "td",
                      "",
                      f.delta == null ? "—" : `${f.delta.toFixed(1)}%`,
                    ),
                    el(
                      "td",
                      "",
                      tag(f.state || "待数据", f.ready ? "success" : "muted"),
                    ),
                    el(
                      "td",
                      "",
                      button(
                        "查看趋势",
                        () =>
                          open({
                            material: m,
                            rule: {
                              kind: "volume",
                              name: "素材起量观察",
                              conditions: [
                                { field: "previous", op: "lt", value: 200 },
                                { field: "recent", op: "gte", value: 200 },
                              ],
                              contact: employee.value.actor,
                              owner: employee.value.actor,
                              channels: ["site"],
                            },
                            values: [],
                          }),
                        "text",
                      ),
                    ),
                  ]);
                }),
              )
            : empty("暂无可展示素材", "当前身份没有可用的数据范围。"),
        ]);
      }
      return () =>
        el("div", "rd-workspace", [
          el("header", "rd-heading", [
            el("div", "", [el("h1", "", "投放提醒")]),
            el("div", "rd-scope-pickers", [platformPicker(), advertiserPicker()]),
          ]),
          demo.value
            ? el("div", "em-notice", [
                el("strong", "", "示例看板 · 未分配身份"),
                el(
                  "p",
                  "",
                  "以下内容是只读示例，不代表当前身份拥有素材数据权限。",
                ),
                button(
                  "体验一级管理员",
                  () => setPreviewActor("admin1"),
                  "text",
                ),
              ])
            : null,
          el(
            "nav",
            "rd-tabs",
            [
              ["records", "提醒动态"],
              ["rules", "规则报告"],
            ].map(([key, label]) =>
              button(
                label,
                () => setTab(key),
                tab.value === key ? "active" : "",
                { "aria-current": tab.value === key ? "page" : undefined },
              ),
            ),
            { "aria-label": "投放提醒视图" },
          ),
          tab.value === "records"
            ? records()
            : h(RuleManager, { mode: "report" }),
          selected.value ? details() : null,
          notice.value
            ? el("p", "em-notice", notice.value, { role: "status" })
            : null,
        ]);
    },
  };
}
