const number = value => Number.isFinite(Number(value)) ? Number(value) : null;
const metricValue = (material, flatKey, demoKey = flatKey) => {
  const flat = number(material?.[flatKey]);
  if (flat !== null) return flat;
  return number(material?.metrics?.[demoKey]?.value);
};
const format = (value, style = 'number') => {
  if (value === null) return '—';
  if (style === 'money') return `¥${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}`;
  if (style === 'percent') return `${value.toLocaleString('zh-CN', { maximumFractionDigits: 2 })}%`;
  return value.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
};

const trendRows = material => {
  if (Array.isArray(material?.dailyFacts) && material.dailyFacts.length) return material.dailyFacts;
  if (Array.isArray(material?.daily) && material.daily.length) return material.daily.map(row => ({ date: row.date, ...row.facts }));
  if (Array.isArray(material?.hourly) && material.hourly.length) return material.hourly.map((spend, index) => ({ date: `${String(index * 2 + 2).padStart(2, '0')}:00`, spend }));
  return [];
};

const trendValue = row => number(row?.spend) ?? number(row?.metrics?.spend?.value) ?? 0;

const trendChart = (el, material) => {
  const rows = trendRows(material);
  const values = rows.map(trendValue);
  const maximum = Math.max(...values, 1);
  const width = 720, height = 218, left = 44, right = 18, top = 18, bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const points = rows.map((row, index) => ({
    x: left + (rows.length === 1 ? plotWidth / 2 : index * plotWidth / (rows.length - 1)),
    y: top + plotHeight - trendValue(row) / maximum * plotHeight,
    label: String(row.date || index + 1).slice(5) || String(row.date || index + 1),
  }));
  const line = points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
  return el('svg', 'material-trend-chart', [
    ...[0, .5, 1].map(ratio => el('line', '', '', { x1: left, y1: top + plotHeight * ratio, x2: width - right, y2: top + plotHeight * ratio, stroke: '#e7ebf2', 'stroke-dasharray': ratio === 1 ? '0' : '4 5' })),
    line ? el('path', '', '', { d: line, fill: 'none', stroke: '#165dff', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }) : null,
    ...points.map(point => el('circle', '', '', { cx: point.x, cy: point.y, r: 4, fill: '#fff', stroke: '#165dff', 'stroke-width': 2 })),
    ...points.map((point, index) => index % Math.max(1, Math.ceil(points.length / 6)) === 0 || index === points.length - 1 ? el('text', '', point.label, { x: point.x, y: height - 9, fill: '#778399', 'font-size': 11, 'text-anchor': 'middle' }) : null),
  ], { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': '素材消耗趋势' });
};

export function materialActions({ button, router, material, current = false, onDetail = () => {} }) {
  const query = { material: material.id };
  return [
    button('查看详情', onDetail, `material-action detail${current ? ' current' : ''}`, { disabled: current, 'aria-current': current ? 'page' : undefined }),
    button('生成灵感', () => router.push({ path: '/inspiration/agent', query }), 'material-action inspiration'),
    button('复刻爆款', () => router.push({ path: '/viral-factory', query }), 'material-action replicate'),
    button('加入资产', () => router.push({ path: '/resource', query }), 'material-action asset'),
  ];
}

export function materialDetailBody({ el, button, router, material, platformLabel, sampleDate }) {
  const metrics = [
    ['消耗', format(metricValue(material, 'spend'), 'money')],
    ['展示数', format(metricValue(material, 'show', 'impressions'))],
    ['点击数', format(metricValue(material, 'click', 'clicks'))],
    ['点击率', format(metricValue(material, 'ctr', 'click_through_rate'), 'percent')],
    ['转化数（计费时间）', format(metricValue(material, 'attributionConversions', 'billing_time_conversions'))],
    ['转化成本（计费时间）', format(metricValue(material, 'attributionCpa', 'cost_per_billing_time_conversion'), 'money')],
  ];
  const type = material.materialTypeLabel || material.type || '素材';
  const deliveryMode = material.deliveryMode || '自动投放';
  const billingMode = material.billingMode || (String(platformLabel || material.platform).includes('千川') ? '成交计费' : 'oCPM');
  const projectId = material.projectId || material.project || '—';
  const title = material.caption || material.name;
  const actionRail = el('aside', 'material-detail-action-rail', [
    el('strong', '', '操作'),
    el('div', '', materialActions({ button, router, material, current: true })),
  ], { 'aria-label': '素材操作' });
  return [el('div', 'material-performance-detail', [
    el('aside', 'material-detail-profile', [
      el('div', 'material-detail-profile-grid', [
        el('article', '', [el('span', '', '选中项目 ID'), el('strong', '', projectId)]),
        el('article', '', [el('span', '', '素材类型'), el('strong', '', type)]),
        el('article', '', [el('span', '', '投放方式'), el('strong', '', deliveryMode)]),
        el('article', '', [el('span', '', '计费方式'), el('strong', '', billingMode)]),
      ]),
      el('section', 'material-detail-copy', [el('span', '', '素材名称'), el('strong', '', material.name), el('small', '', `素材 ID ${material.id}`)]),
      el('section', 'material-detail-copy', [el('span', '', '广告标题'), el('strong', '', title)]),
      el('dl', 'material-detail-side-facts', [
        el('dt', '', '媒介平台'), el('dd', '', platformLabel || material.platform || '—'),
        el('dt', '', '广告主账户'), el('dd', '', material.account || material.advertiser || '—'),
        el('dt', '', '公司'), el('dd', '', material.company || '—'),
        el('dt', '', '创作人'), el('dd', '', material.creator || '—'),
      ]),
    ]),
    el('main', 'material-detail-content', [
      el('header', 'material-detail-content-head', [
        el('div', '', [el('span', 'material-detail-platform', platformLabel || material.platform || '素材表现'), el('h2', '', material.name)]),
        el('div', 'material-date-strip', [el('strong', '', '统计时间'), el('span', '', sampleDate || '近 7 天')]),
      ]),
      el('section', 'material-detail-metrics', metrics.map(([label, value]) => el('article', '', [el('span', '', label), el('strong', '', value), el('small', '', '投放统计时间')]))),
      el('section', 'material-trend-section', [
        el('header', '', [el('div', '', [el('h3', '', '素材趋势'), el('p', 'em-muted', '按北京时间自然日展示；缺失时段不补零')]), el('div', 'material-trend-granularity', [button('按小时', () => {}), button('按日', () => {}, 'selected')])]),
        el('div', 'material-trend-tools', [button('叠加对比', () => {}, 'selected'), button('分指标查看', () => {})]),
        el('div', 'material-trend-focus', [
          el('article', '', [el('span', '', '消耗'), el('strong', '', metrics[0][1])]),
          el('article', '', [el('span', '', '转化数（计费时间）'), el('strong', '', metrics[4][1])]),
        ]),
        trendRows(material).length ? trendChart(el, material) : el('div', 'material-trend-empty', [el('strong', '', '暂无分时趋势'), el('p', 'em-muted', '当前素材只有汇总指标。')]),
      ]),
    ]),
    actionRail,
  ])];
}
