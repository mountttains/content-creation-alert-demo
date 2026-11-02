import { actorProfile, effectiveFeatures, managedPeople, people, sampleAdvertisers, scope } from './employee-state.mjs?v=dataset5';
import { createMaterialDemo } from './employee-demo-data.mjs';
import { DEMO_DATE, volumeFacts } from '../../demo/assets/alert-model.mjs?v=4';

export const RULE_KEY = 'creation:reminder-rules:v19';
export const RULE_EVENT = 'creation-reminder-rules-change';
export const SAMPLE_TIME = DEMO_DATE + ' 13:05（北京时间）';
export const SAMPLE_NOW = new Date(DEMO_DATE + 'T13:05:00+08:00');
export const ALERT_ESCALATION_HOURS = 24;
export const kindLabels = { risk: '异常', opportunity: '机会', volume: '起量', custom: '自定义' };
export const qianchuanReportTypeOptions = [
  ['universal', '全域素材'],
  ['universal_live', '全域直播间'],
  ['universal_product', '全域商品'],
  ['standard', '标准素材'],
  ['standard_live', '标准直播间画面'],
];
export const qianchuanReportMaterialTypes = {
  universal: [['title', '标题'], ['video', '视频']],
  standard: [['title', '标题'], ['image', '图片'], ['video', '视频']],
};
export const materialTypeOptions = {
  // 与线上素材表现当前筛选口径一致；千川报表类型与素材类型分层选择。
  ocean_engine: [['video', '视频'], ['title', '标题'], ['unknown', '未识别素材类型'], ['vertical_video', '竖版视频']],
  qianchuan: [['title', '标题'], ['image', '图片'], ['video', '视频']],
  local: [['video', '视频'], ['image', '图片']],
};
export const materialTypeLabel = (platform, type) => Object.fromEntries(materialTypeOptions[platform] || [])[type] || type || '未分类';
export const qianchuanReportTypeLabel = type => Object.fromEntries(qianchuanReportTypeOptions)[type] || type || '未分类报表';
export const qianchuanMaterialTypesForReports = reportTypes => {
  const selected = reportTypes?.length ? reportTypes : qianchuanReportTypeOptions.map(([key]) => key);
  return [...new Map(selected.flatMap(type => qianchuanReportMaterialTypes[type] || []).map(option => [option[0], option])).values()];
};
export const periodLabels = { today: '当天', previous3: '过去3天', previous5: '过去5天', previous7: '过去7天', previous7Inclusive: '过去7天（含当天）', rolling: '当前窗口' };
export const metrics = {
  spend: ['消耗', '元'], show: ['展示数', '次'], click: ['点击数', '次'], ctr: ['点击率', '%'],
  cpm: ['平均千次展现费用', '元'], cpc: ['平均点击单价', '元'],
  attributionConversions: ['转化数（计费时间）', '次'], attributionCpa: ['转化成本（计费时间）', '元'],
  deepConversions: ['深度转化数', '次'], deepCpa: ['深度转化成本', '元'],
  payOrders: ['成交订单数（千川）', '单'], payGmv: ['成交金额（千川）', '元'], payRoi: ['支付 ROI（千川）', ''],
  totalPlay: ['播放量', '次'], play3sRate: ['3 秒播放率', '%'], playOverRate: ['完播率', '%'],
  likes: ['点赞数', '次'], comments: ['评论量', '次'], shares: ['分享量', '次'],
  hours: ['回传等待时长（衍生）', '小时'], recent: ['近 2 小时消耗（衍生）', '元'], previous: ['前 2 小时消耗（衍生）', '元'],
  delta: ['近 2 小时消耗变化', '%'], liveHours: ['连续投放时长', '小时'],
};
export const metricPlatforms = { payOrders: ['qianchuan'], payGmv: ['qianchuan'], payRoi: ['qianchuan'] };
export const operators = { gte: '≥', gt: '>', lte: '≤', lt: '<', eq: '=' };
const materialSources = {
  ocean_engine: { demo: createMaterialDemo('marketing', SAMPLE_NOW), prefix: 'AD', projects: ['新品推广', '品牌增长', '线索转化'] },
  qianchuan: { demo: createMaterialDemo('qianchuan', SAMPLE_NOW), prefix: 'QC', projects: ['直播间引流', '商品放量', '店铺成交'] },
  local: { demo: createMaterialDemo('local', SAMPLE_NOW), prefix: 'LOCAL', projects: ['门店到店', '团购推广', '区域获客'] },
};
const hourlyPatterns = [
  [20,30,40,50,130,150], [60,80,100,120,160,160], [200,220,240,260,220,220],
  [400,420,280,260,160,160], [40,60,100,160,260,340], [0,0,0,10,20,50],
  [100,120,160,140,null,null], [80,90,110,120,180,240],
];
const dailyFacts = Object.fromEntries(Object.entries(materialSources).map(([platform, source]) => [platform,
  source.demo.materials.map(row => row.daily.map(day => ({ date: day.date, ...day.facts }))),
]));
const round = (value, digits = 2) => Number(Number(value || 0).toFixed(digits));
const metricValue = (row, key) => row.metrics[key]?.value;
const materialDistribution = {
  ocean_engine: [18, 9, 7, 6],
  qianchuan: [15, 10, 8, 7],
  local: [8, 5, 4, 3],
};
const materialAccounts = sampleAdvertisers();
export const ruleMaterials = Object.entries(materialDistribution).flatMap(([platform, counts]) => counts.flatMap((count, index) => {
  const accountNumber = index + 1;
  const account = materialAccounts.find(item => item.id === `${platform}:demo-${accountNumber}`);
  const accountIndex = materialAccounts.indexOf(account);
  const source = materialSources[account.platform];
  return Array.from({ length: count }, (_, materialIndex) => {
    const number = materialIndex + 1;
    const baseIndex = materialIndex % source.demo.materials.length;
    const row = source.demo.materials[baseIndex];
    const factor = 1 + ((accountIndex + materialIndex) % 9) * 0.07;
    const spend = round(metricValue(row, 'spend') * factor);
    const show = Math.round(metricValue(row, 'impressions') * factor);
    const click = Math.round(metricValue(row, 'clicks') * factor);
    const attributionConversions = number % 17 === 0 ? 0 : Math.round(metricValue(row, 'billing_time_conversions') * factor);
    const payOrders = account.platform === 'qianchuan' ? Math.max(0, Math.round(attributionConversions * (1.1 + number % 4 * 0.1))) : null;
    const payGmv = account.platform === 'qianchuan' ? round(payOrders * (80 + number % 5 * 20)) : null;
    const legacyId = account.platform === 'ocean_engine' && account.id === 'ocean_engine:demo-1' && number <= 6 ? row.id : '';
    return {
      id: legacyId || `DEMO-${source.prefix}-${String(accountNumber).padStart(3, '0')}-${String(number).padStart(3, '0')}`,
      name: number <= 6 ? row.name : `${row.name} · ${String(number).padStart(3, '0')}`,
      type: row.type,
      theme: row.theme,
      caption: row.caption,
      reportType: account.platform === 'qianchuan'
        ? qianchuanReportTypeOptions[materialIndex % qianchuanReportTypeOptions.length][0]
        : '',
      materialType: account.platform === 'qianchuan'
        ? (() => {
            const reportType = qianchuanReportTypeOptions[materialIndex % qianchuanReportTypeOptions.length][0];
            const options = qianchuanReportMaterialTypes[reportType] || [];
            return options.length ? options[materialIndex % options.length][0] : '';
          })()
        : account.platform === 'local'
          ? (number % 3 === 0 ? 'image' : 'video')
          : (number % 7 === 0 ? 'unknown' : number % 5 === 0 ? 'title' : number % 3 === 0 ? 'vertical_video' : 'video'),
      platform: account.platform,
      advertiserId: account.id,
      account: account.name,
      advertiser: account.advertiser_id,
      companyId: account.company_id,
      company: account.company_name,
      project: source.projects[(accountIndex + materialIndex) % source.projects.length],
      creator: `成员 ${String.fromCharCode(65 + (accountIndex + materialIndex) % 6)}`,
      spend,
      show,
      click,
      ctr: show ? round(click / show * 100) : null,
      cpm: show ? round(spend / show * 1000) : null,
      cpc: click ? round(spend / click) : null,
      attributionConversions,
      attributionCpa: attributionConversions ? round(spend / attributionConversions) : null,
      deepConversions: null,
      deepCpa: null,
      payOrders,
      payGmv,
      payRoi: account.platform === 'qianchuan' && spend ? round(payGmv / spend) : null,
      totalPlay: Math.round(metricValue(row, 'video_plays') * factor),
      play3sRate: metricValue(row, 'video_play_rate_3s'),
      playOverRate: null,
      likes: Math.round(metricValue(row, 'likes') * factor),
      comments: Math.round(metricValue(row, 'comments') * factor),
      shares: Math.round(metricValue(row, 'shares') * factor),
      conversions: Math.round(metricValue(row, 'conversions') * factor),
      orders: Math.round(metricValue(row, 'payment_events') * factor),
      revenue: round(metricValue(row, 'reported_payment_amount') * factor),
      hours: 3 + materialIndex % 5,
      liveHours: 6 + materialIndex % 4,
      fresh: materialIndex % 97 !== 96,
      hourly: hourlyPatterns[(accountIndex + materialIndex) % hourlyPatterns.length],
      dailyFacts: dailyFacts[account.platform][baseIndex],
    };
  });
}));
const clone = value => structuredClone(value);
export const personName = id => people.find(person => person.id === id)?.name || (id === 'preview-platform' ? '平台管理员（示例）' : id);
const hasFeature = (state, id = state.actor) => effectiveFeatures(state, id).includes('material_performance');
export function materialScope(state, id = state.actor) {
  if (!hasFeature(state, id)) return [];
  const advertisers = scope(state, id, new Set(), 'material_performance');
  return ruleMaterials.filter(material => advertisers.some(advertiser => advertiser.id === material.advertiserId));
}
export function liveMaterial(state, material, id = state.actor) {
  return scope(state, id, new Set(), 'material_performance').some(advertiser => advertiser.id === material.advertiserId && advertiser.active && advertiser.enabled);
}
const managedIds = state => new Set(managedPeople(state).map(person => person.id));
const actor = state => actorProfile(state);
const isFullAdmin = state => ['platform', 'admin1'].includes(actor(state).role);
export const isBusinessManager = state => ['admin1', 'admin2'].includes(actor(state).role);
export const canCreateRule = state => hasFeature(state) && materialScope(state).length > 0;
export const canReuseRule = state => hasFeature(state) && materialScope(state).length > 0;
export const canCreateDefinition = canCreateRule;
export const canGovernDefinition = (state, definition) => isBusinessManager(state) && definition.owner !== state.actor && managedIds(state).has(definition.owner);
export const canEditDefinition = (state, definition) => definition.owner === state.actor || isFullAdmin(state);
export const canToggleDefinition = (state, definition) => canEditDefinition(state, definition) || (actor(state).role === 'admin2' && canGovernDefinition(state, definition));
export const canDeleteDefinition = (state, definition) => definition.owner === state.actor || isFullAdmin(state);
const definitionPlatforms = definition => definition.platforms?.length ? definition.platforms : ['ocean_engine'];
const metricSupportsPlatform = (field, platform) => !metricPlatforms[field] || metricPlatforms[field].includes(platform);
const definitionSupportsPlatform = (definition, platform) => definition.conditions.every(condition => metricSupportsPlatform(condition.field, platform));
export const canApplyDefinition = (state, definition) => definition.template !== false
  && !definition.deletedAt
  && materialScope(state).some(material => definitionPlatforms(definition).includes(material.platform) && definitionSupportsPlatform(definition, material.platform))
  && definition.enabled !== false
  && (isFullAdmin(state) || definition.owner === state.actor || (definition.publishedTo || []).includes(state.actor));
export const canGovernApplication = (state, application) => isBusinessManager(state) && application.owner !== state.actor && managedIds(state).has(application.owner);
export const canEditApplication = (state, application) => application.owner === state.actor || isFullAdmin(state);
export const canToggleApplication = (state, application) => application.owner === state.actor || isFullAdmin(state) || (actor(state).role === 'admin2' && canGovernApplication(state, application));
export const canDeleteApplication = (state, application) => application.owner === state.actor || isFullAdmin(state);
export function publishCandidates(state) { return isBusinessManager(state) ? managedPeople(state) : []; }
export function resultViewerCandidates(state, materialIds) {
  return isBusinessManager(state) ? managedPeople(state).filter(person => materialScope(state, person.id).some(material => materialIds.includes(material.id))) : [];
}
export function availableDefinitions(state, store, includeGoverned = true) {
  return store.definitions.filter(definition => isFullAdmin(state) || definition.owner === state.actor || definition.publishedTo.includes(state.actor) || (includeGoverned && canGovernDefinition(state, definition)));
}
export function availableApplications(state, store, includeGoverned = true) {
  return store.applications.filter(application => isFullAdmin(state) || application.owner === state.actor || (includeGoverned && canGovernApplication(state, application)));
}
export function applicationRuntimeState(store, application) {
  const deleted = Boolean(application.deletedAt);
  const inDateRange = (!application.start || application.start <= DEMO_DATE) && (!application.end || application.end >= DEMO_DATE);
  const enabled = application.enabled !== false;
  return {
    enabled,
    inDateRange,
    deleted,
    active: !deleted && enabled && inDateRange,
    status: deleted ? 'deleted' : !enabled ? 'paused' : !inDateRange ? 'out-of-range' : 'running',
  };
}
export function visibleMaterials(state, application) {
  const platforms = definitionPlatforms(application);
  const companyIds = application.companyMode === 'specified' ? application.companyIds || [] : [];
  const advertiserIds = application.advertiserMode === 'specified' ? application.advertiserIds || [] : [];
  return materialScope(state).filter(material => platforms.includes(material.platform)
    && (material.platform !== 'qianchuan' || !application.qianchuanReportTypes?.length || application.qianchuanReportTypes.includes(material.reportType))
    && (material.platform === 'qianchuan' && !(qianchuanReportMaterialTypes[material.reportType] || []).length
      || !application.materialTypes?.length
      || application.materialTypes.includes(material.materialType))
    && (!companyIds.length || companyIds.includes(material.companyId))
    && (!advertiserIds.length || advertiserIds.includes(material.advertiserId))
    && (application.scopeMode === 'all' || application.materialIds.includes(material.id)));
}
export function canViewApplicationResults(state, application) {
  return (application.owner === state.actor || canGovernApplication(state, application)) && visibleMaterials(state, application).length > 0;
}
export function blankDefinition(state) {
  return { id: '', template: true, name: '', owner: state.actor, kind: 'risk', customKindName: '', platforms: ['ocean_engine'], qianchuanReportTypes: qianchuanReportTypeOptions.map(([key]) => key), materialTypes: [], conditions: [{ field: 'spend', op: 'gte', value: '' }], publishedTo: [], defaultFrequency: 'hourly', fixedTime: '09:00', defaultQuietHours: 4, defaultChannels: ['site'], webhook: '', wecomId: '', notificationTitle: '【创作平台告警】{规则名称}', notificationBody: '{媒介平台} · {广告主账户} 的 {素材名称} 命中 {提醒类型}，请及时查看。', enabled: true, version: 1, basedOn: '', createdAt: '' };
}
export function basedOnDefinition(state, source) {
  const draft = blankDefinition(state);
  Object.assign(draft, { name: source.name + '（副本）', kind: source.kind, customKindName: source.customKindName || '', platforms: clone(definitionPlatforms(source)), qianchuanReportTypes: clone(source.qianchuanReportTypes || qianchuanReportTypeOptions.map(([key]) => key)), materialTypes: clone(source.materialTypes || []), conditions: clone(source.conditions), defaultFrequency: source.defaultFrequency, fixedTime: source.fixedTime || '09:00', defaultQuietHours: source.defaultQuietHours, defaultChannels: clone(source.defaultChannels), webhook: source.webhook || '', wecomId: source.wecomId || '', basedOn: source.id });
  return draft;
}
export function blankApplication(state, definition, materialIds = []) {
  return { id: '', definitionId: definition.id, definitionVersion: definition.version, sourceOwner: definition.owner, name: definition.name, kind: definition.kind, customKindName: definition.customKindName || '', owner: state.actor, platforms: clone(definitionPlatforms(definition)), qianchuanReportTypes: clone(definition.qianchuanReportTypes || qianchuanReportTypeOptions.map(([key]) => key)), materialTypes: clone(definition.materialTypes || []), conditions: clone(definition.conditions), scopeMode: 'specified', materialIds: materialIds.filter(id => materialScope(state).some(material => material.id === id && definitionPlatforms(definition).includes(material.platform))), viewers: [], recipients: [state.actor], frequency: definition.defaultFrequency, fixedTime: definition.fixedTime || '09:00', start: '', end: '', quietHours: definition.defaultQuietHours, channels: clone(definition.defaultChannels), webhook: definition.webhook || '', wecomId: definition.wecomId || '', notificationTitle: definition.notificationTitle || '【创作平台告警】{规则名称}', notificationBody: definition.notificationBody || '{媒介平台} · {广告主账户} 的 {素材名称} 命中 {提醒类型}，请及时查看。', sendNotifications: true, enabled: true, contact: state.actor, description: '', createdAt: '' };
}
export function conditionText(condition) { const rolling = ['recent','previous','delta'].includes(condition.field); return `${rolling ? '当前窗口' : periodLabels[condition.period || 'today'] || '当天'} ${metrics[condition.field]?.[0] || condition.field} ${operators[condition.op] || condition.op} ${condition.value} ${metrics[condition.field]?.[1] || ''}`; }
export const conditionsText = record => record.conditions.map(conditionText).join(' 且 ');
export const scheduleLabel = application => ({ 'ten-minutes': '每 10 分钟', hourly: '每小时', 'half-hourly': '每半小时', 'two-hourly': '每 2 小时', 'four-hourly': '每 4 小时', daily: '每天', 'fixed-time': `固定时间${application.fixedTime ? ` ${application.fixedTime}` : ''}` }[application.frequency] || application.frequency) + ' · ' + (application.start ? application.start + ' 至 ' + (application.end || '长期') : '长期有效');
function validConditions(conditions) {
  return conditions.length > 0 && conditions.length <= 8 && conditions.every(condition => {
    const rolling = ['recent','previous','delta'].includes(condition.field), period = condition.period || (rolling ? 'rolling' : 'today');
    return Object.hasOwn(periodLabels, period) && (!rolling || period === 'rolling' || period === 'today') && Object.hasOwn(metrics, condition.field) && Object.hasOwn(operators, condition.op) && condition.value !== '' && Number.isFinite(Number(condition.value)) && (condition.field === 'delta' || Number(condition.value) >= 0);
  });
}
export function validateDefinition(state, definition, original = null) {
  if (!canCreateDefinition(state) || (original && !canEditDefinition(state, original))) return '当前身份不能保存规则定义。';
  if (definition.owner !== (original?.owner || state.actor)) return '规则创建者不可修改。';
  if (!definition.name.trim()) return '请填写规则名称。';
  if (definition.name.length > 50) return '规则名称最多 50 个字。';
  if (!Object.hasOwn(kindLabels, definition.kind)) return '请选择提醒分类。';
  if (definition.kind === 'custom' && !String(definition.customKindName || '').trim()) return '请填写自定义提醒类型名称。';
  if (!definition.platforms?.length || definition.platforms.some(platform => !['ocean_engine','qianchuan','local'].includes(platform))) return '请选择当前字段已覆盖的适用媒介平台。';
  if (!validConditions(definition.conditions)) return '请填写有效的条件数值；最多支持 8 个条件。';
  if (definition.conditions.some(condition => definition.platforms.some(platform => !metricSupportsPlatform(condition.field, platform)))) return '当前条件包含所选媒介平台不支持的指标，请调整适用平台或指标。';
  const allowed = new Set(publishCandidates(state).map(person => person.id));
  if (definition.publishedTo.some(id => !allowed.has(id))) return '规则发布范围超出当前人员管理范围。';
  if (!['hourly','half-hourly','fixed-time'].includes(definition.defaultFrequency)) return '请选择有效的默认运行设置。';
  if (definition.defaultFrequency === 'fixed-time' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(definition.fixedTime || '')) return '请选择有效的固定运行时间。';
  if (!definition.defaultChannels.length || definition.defaultChannels.some(channel => !['site','wecom'].includes(channel))) return '请至少选择一种默认通知方式。';
  if (definition.defaultChannels.includes('wecom') && (!String(definition.webhook || '').trim() || !String(definition.wecomId || '').trim())) return '已选择企业微信提醒，请填写 Webhook 地址和企业微信 ID。';
  return '';
}
export function validateApplication(state, application, definition, original = null) {
  if (!definition || (!original && !canApplyDefinition(state, definition))) return '当前身份不能应用这条规则。';
  if (original && !canEditApplication(state, original)) return '当前身份没有编辑该规则的权限。';
  if (application.owner !== (original?.owner || state.actor)) return '应用所有人不可修改。';
  if (!validConditions(application.conditions)) return '请填写有效的条件数值；最多支持 8 个条件。';
  const ids = new Set(materialScope(state).filter(material => definitionPlatforms(definition).includes(material.platform)).map(material => material.id));
  if (!application.materialIds.length || application.materialIds.some(id => !ids.has(id))) return '请选择本人数据权限内的素材。';
  const selectedPlatforms = new Set(materialScope(state).filter(material => application.materialIds.includes(material.id)).map(material => material.platform));
  if (application.conditions.some(condition => [...selectedPlatforms].some(platform => !metricSupportsPlatform(condition.field, platform)))) return '当前条件包含所选素材平台不支持的指标。';
  const viewers = new Set(resultViewerCandidates(state, application.materialIds).map(person => person.id));
  if (application.viewers.some(id => !viewers.has(id))) return '结果可见成员必须在管理范围内，并拥有至少一条生效素材的数据权限。';
  if (application.recipients.some(id => id !== application.owner && !application.viewers.includes(id))) return '通知对象必须是应用所有人或结果可见成员。';
  if (application.contact !== application.owner && !application.viewers.includes(application.contact)) return '业务联系人必须是应用所有人或结果可见成员。';
  if (!application.channels.length || application.channels.some(channel => !['site','wecom'].includes(channel))) return '请至少选择一种通知方式。';
  if (!['hourly','half-hourly','fixed-time'].includes(application.frequency)) return '请选择有效的运行设置。';
  if (application.frequency === 'fixed-time' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(application.fixedTime || '')) return '请选择有效的固定运行时间。';
  if (application.channels.includes('wecom') && (!String(application.webhook || '').trim() || !String(application.wecomId || '').trim())) return '已选择企业微信提醒，请填写 Webhook 地址和企业微信 ID。';
  if ((application.start && !/^\d{4}-\d{2}-\d{2}$/.test(application.start)) || (application.end && (!application.start || application.end < application.start))) return '请检查生效日期，结束日期不能早于开始日期。';
  return '';
}
export function blankPersonalRule(state, materialIds = []) {
  const allowed = materialScope(state), selected = materialIds.filter(id => allowed.some(material => material.id === id));
  const selectedMaterials = allowed.filter(material => selected.includes(material.id));
  const platform = selectedMaterials[0]?.platform || allowed[0]?.platform || 'ocean_engine';
  const platformSelection = selected.filter(id => selectedMaterials.some(material => material.id === id && material.platform === platform));
  return { id: '', definitionId: '', definitionVersion: 1, sourceOwner: state.actor, name: '', kind: 'risk', customKindName: '', owner: state.actor, platforms: [platform], conditions: [{ period: 'today', field: 'spend', op: 'gte', value: '' }], companyMode: selected.length ? 'specified' : 'all', companyIds: [...new Set(selectedMaterials.filter(material => material.platform === platform).map(material => material.companyId))], advertiserMode: selected.length ? 'specified' : 'all', advertiserIds: [...new Set(selectedMaterials.filter(material => material.platform === platform).map(material => material.advertiserId))], scopeMode: selected.length ? 'specified' : 'all', materialIds: platformSelection, qianchuanReportTypes: qianchuanReportTypeOptions.map(([key]) => key), materialTypes: (materialTypeOptions[platform] || []).map(([key]) => key), viewers: [], recipients: [state.actor], frequency: 'hourly', fixedTime: '09:00', start: '', end: '', quietHours: 4, channels: ['site'], webhook: '', wecomId: '', notificationTitle: '【创作平台告警】{规则名称}', notificationBody: '{媒介平台} · {广告主账户} 的 {素材名称} 命中 {提醒类型}，请及时查看。', sendNotifications: true, enabled: true, contact: state.actor, description: '', createdAt: '' };
}
export function validatePersonalRule(state, rule, original = null) {
  if ((!canCreateRule(state) && !(rule.basedOn && canReuseRule(state))) || (original && !canEditApplication(state, original))) return '当前身份未获得“新建告警规则”或“复用管理员规则”权限，或没有可用素材范围。';
  if (rule.owner !== (original?.owner || state.actor)) return '规则创建者不可修改。';
  if (!rule.name.trim()) return '请填写告警规则名称。';
  if (rule.name.length > 50) return '规则名称最多 50 个字。';
  if (!Object.hasOwn(kindLabels, rule.kind)) return '请选择提醒类型。';
  if (rule.kind === 'custom' && !String(rule.customKindName || '').trim()) return '请填写自定义提醒类型名称。';
  if (rule.platforms?.length !== 1 || rule.platforms.some(platform => !['ocean_engine','qianchuan','local'].includes(platform))) return '请选择一个可用媒介平台。';
  if (rule.platforms[0] === 'qianchuan' && (!rule.qianchuanReportTypes?.length || rule.qianchuanReportTypes.some(type => !qianchuanReportTypeOptions.some(([key]) => key === type)))) return '请至少选择一种有效的千川报表类型。';
  if (!validConditions(rule.conditions)) return '请填写有效的条件数值；最多支持 8 个条件。';
  if (rule.conditions.some(condition => rule.platforms.some(platform => !metricSupportsPlatform(condition.field, platform)))) return '当前条件包含素材平台不支持的指标。';
  const allowedIds = new Set(materialScope(state).filter(material => rule.platforms.includes(material.platform)).map(material => material.id));
  const allowedAdvertisers = new Set(scope(state, state.actor, new Set(), 'material_performance').filter(account => rule.platforms.includes(account.platform)).map(account => account.id));
  const allowedCompanies = new Set(scope(state, state.actor, new Set(), 'material_performance').filter(account => rule.platforms.includes(account.platform)).map(account => account.company_id));
  if (!['all','specified'].includes(rule.companyMode || 'all')) return '请选择公司范围。';
  if (rule.companyMode === 'specified' && (!rule.companyIds?.length || rule.companyIds.some(id => !allowedCompanies.has(id)))) return '请选择本人数据权限内的公司。';
  if (!['all','specified'].includes(rule.advertiserMode || 'all')) return '请选择广告主账户范围。';
  if (rule.advertiserMode === 'specified' && (!rule.advertiserIds?.length || rule.advertiserIds.some(id => !allowedAdvertisers.has(id)))) return '请选择本人数据权限内的广告主账户。';
  if (!['all','specified'].includes(rule.scopeMode)) return '请选择规则应用范围。';
  const selectedCompanies = rule.companyMode === 'specified' ? new Set(rule.companyIds) : allowedCompanies;
  const companyAdvertisers = new Set(scope(state, state.actor, new Set(), 'material_performance').filter(account => rule.platforms.includes(account.platform) && selectedCompanies.has(account.company_id)).map(account => account.id));
  const selectedAdvertisers = rule.advertiserMode === 'specified' ? new Set(rule.advertiserIds) : companyAdvertisers;
  if ([...selectedAdvertisers].some(id => !companyAdvertisers.has(id))) return '广告主必须属于已选公司范围。';
  const scopedIds = new Set(materialScope(state).filter(material => rule.platforms.includes(material.platform) && selectedAdvertisers.has(material.advertiserId)).map(material => material.id));
  if (rule.scopeMode === 'specified' && (!rule.materialIds.length || rule.materialIds.some(id => !allowedIds.has(id) || !scopedIds.has(id)))) return '请选择当前媒介平台和广告主范围内的素材。';
  if (!['hourly','half-hourly','fixed-time'].includes(rule.frequency)) return '请选择有效的运行频率。';
  if (rule.frequency === 'fixed-time' && !/^([01]\d|2[0-3]):[0-5]\d$/.test(rule.fixedTime || '')) return '请选择有效的固定运行时间。';
  if ((rule.start && !/^\d{4}-\d{2}-\d{2}$/.test(rule.start)) || (rule.end && (!rule.start || rule.end < rule.start))) return '请检查生效日期，结束日期不能早于开始日期。';
  if (rule.sendNotifications && (!rule.channels.length || rule.channels.some(channel => !['site','wecom'].includes(channel)))) return '发送通知时请至少选择一种通知方式。';
  if (rule.channels.includes('wecom') && (!String(rule.webhook || '').trim() || !String(rule.wecomId || '').trim())) return '已选择企业微信提醒，请填写 Webhook 地址和企业微信 ID。';
  return '';
}
function periodValue(material, period, field) {
  if (!['today','previous3','previous5','previous7','previous7Inclusive'].includes(period || 'today')) return undefined;
  if (!period || period === 'today') return undefined;
  const daily = material.dailyFacts || [];
  const count = period === 'previous3' ? 3 : period === 'previous5' ? 5 : 7;
  const end = period === 'previous7Inclusive' ? daily.length : daily.length - 1;
  const start = end - count;
  if (start < 0) return null;
  const days = daily.slice(start, end);
  if (days.length !== count) return null;
  const total = key => days.reduce((sum, day) => sum + (Number.isFinite(day[key]) ? day[key] : 0), 0);
  const spend = total('spendCents') / 100, show = total('impressions'), click = total('clicks');
  const conversions = total('billing_time_conversions'), plays = total('video_plays');
  const values = {
    spend, show, click,
    ctr: show ? click / show * 100 : null,
    cpm: show ? spend / show * 1000 : null,
    cpc: click ? spend / click : null,
    attributionConversions: conversions,
    attributionCpa: conversions ? spend / conversions : null,
    deepConversions: null, deepCpa: null, payOrders: null, payGmv: null, payRoi: null,
    totalPlay: plays,
    play3sRate: plays ? total('video_plays_3s') / plays * 100 : null,
    playOverRate: null,
    likes: total('likes'), comments: total('comments'), shares: total('shares'),
    conversions: total('conversions'), orders: total('payment_events'), revenue: total('paymentAmountCents') / 100,
  };
  return values[field];
}
function valueOf(material, field, period = 'today') {
  if (['recent','previous','delta'].includes(field)) { const facts = volumeFacts(material); return facts.ready ? facts[field] : null; }
  const byPeriod = periodValue(material, period, field);
  return byPeriod === undefined ? material[field] : byPeriod;
}
const compare = (actual, op, expected) => op === 'gte' ? actual >= expected : op === 'gt' ? actual > expected : op === 'lte' ? actual <= expected : op === 'lt' ? actual < expected : op === 'eq' && actual === expected;
export function trialApplication(state, application) {
  const result = { hits: [], excluded: [], unmatched: [], at: SAMPLE_TIME };
  for (const material of visibleMaterials(state, application)) {
    const values = application.conditions.map(condition => ({ ...condition, actual: valueOf(material, condition.field, condition.period) }));
    const reason = !liveMaterial(state, material) ? '广告主未开放、停止同步或仅有历史数据' : !material.fresh ? '数据更新延迟' : values.some(condition => !Number.isFinite(condition.actual)) ? '字段缺失、分母为零或小时窗口不完整' : '';
    if (reason) result.excluded.push({ material, reason });
    else { const row = { material, values }; (values.every(condition => compare(condition.actual, condition.op, Number(condition.value))) ? result.hits : result.unmatched).push(row); }
  }
  return result;
}
function seedDefinition(id, owner, name, kind, conditions, publishedTo, platforms = ['ocean_engine']) { return { id, template: true, owner, name, kind, platforms, qianchuanReportTypes: qianchuanReportTypeOptions.map(([key]) => key), materialTypes: [], conditions, publishedTo, defaultFrequency: 'hourly', fixedTime: '09:00', defaultQuietHours: 4, defaultChannels: ['site'], webhook: '', wecomId: '', notificationTitle: '【创作平台告警】{规则名称}', notificationBody: '{媒介平台} · {广告主账户} 的 {素材名称} 命中 {提醒类型}，请及时查看。', enabled: true, version: 1, basedOn: '', createdAt: DEMO_DATE }; }
const seedMaterialIds = (platform = 'ocean_engine', accountNumber = 1) => ruleMaterials
  .filter(material => material.platform === platform && material.advertiserId === `${platform}:demo-${accountNumber}`)
  .slice(0, 100)
  .map(material => material.id);
const seedAdvertiserIds = (platform, accountNumbers) => accountNumbers.map(number => `${platform}:demo-${number}`);
const seedCompanyIds = advertiserIds => [...new Set(materialAccounts.filter(account => advertiserIds.includes(account.id)).map(account => account.company_id))];
const seedMaterialIdsForAdvertisers = (platform, accountNumbers) => accountNumbers.flatMap(number => seedMaterialIds(platform, number));
function seedApplication(id, definition, owner, options = {}) {
  const platform = options.platform || definition.platforms[0];
  const accountNumbers = options.accountNumbers || [1];
  const advertiserMode = options.advertiserMode || 'specified';
  const advertiserIds = advertiserMode === 'specified' ? seedAdvertiserIds(platform, accountNumbers) : [];
  const companyMode = options.companyMode || (advertiserMode === 'specified' ? 'specified' : 'all');
  const companyIds = companyMode === 'specified' ? seedCompanyIds(advertiserIds) : [];
  const scopeMode = options.scopeMode || 'specified';
  const materialIds = scopeMode === 'specified'
    ? (options.materialIds || seedMaterialIdsForAdvertisers(platform, accountNumbers)).slice(0, options.materialLimit || 100)
    : [];
  const channels = options.channels || ['site'];
  return {
    id, definitionId: definition.id, definitionVersion: definition.version, sourceOwner: definition.owner, sourceDefinitionId: '', basedOn: '',
    reusedFromDefinitionId: definition.owner === owner ? '' : definition.id, reusedFromOwner: definition.owner === owner ? '' : definition.owner,
    name: options.name || definition.name, kind: options.kind || definition.kind, customKindName: options.customKindName || '', owner, platforms: [platform],
    conditions: clone(options.conditions || definition.conditions), companyMode, companyIds, advertiserMode, advertiserIds, scopeMode, materialIds,
    qianchuanReportTypes: qianchuanReportTypeOptions.map(([key]) => key),
    materialTypes: (materialTypeOptions[platform] || []).map(([key]) => key), viewers: [], recipients: [owner],
    frequency: options.frequency || 'hourly', fixedTime: options.fixedTime || '09:00', start: options.start || '', end: options.end || '', quietHours: 4,
    channels, webhook: channels.includes('wecom') ? 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=demo' : '',
    wecomId: channels.includes('wecom') ? 'creation-demo' : '', sendNotifications: true, enabled: options.enabled !== false,
    contact: owner, description: options.description || '', createdAt: DEMO_DATE,
  };
}
export function seedStore() {
  const sharedByAdmin1 = ['preview-admin2','preview-member'];
  const definitions = [
    seedDefinition('DEF-1','preview-admin1','有消耗但暂无计费时间转化','risk',[{field:'spend',op:'gte',value:300},{field:'attributionConversions',op:'eq',value:0},{field:'hours',op:'gte',value:2}],sharedByAdmin1,['ocean_engine','qianchuan']),
    seedDefinition('DEF-2','preview-admin1','计费时间转化成本超出目标','risk',[{field:'attributionCpa',op:'gt',value:16.5},{field:'attributionConversions',op:'gte',value:10}],sharedByAdmin1,['ocean_engine','qianchuan']),
    seedDefinition('DEF-3','preview-admin1','千川支付 ROI 达标素材','opportunity',[{field:'payRoi',op:'gte',value:1.3},{field:'payOrders',op:'gte',value:20}],sharedByAdmin1,['qianchuan']),
    seedDefinition('DEF-4','preview-admin2','开始起量','volume',[{field:'previous',op:'lt',value:200},{field:'recent',op:'gte',value:200}],['preview-member'],['ocean_engine','qianchuan']),
    seedDefinition('DEF-5','preview-admin1','高播放但点击承接偏弱','opportunity',[{field:'totalPlay',op:'gte',value:80000},{field:'ctr',op:'lt',value:2.1}],sharedByAdmin1,['ocean_engine','qianchuan']),
    seedDefinition('DEF-6','preview-admin1','持续放量','volume',[{field:'previous',op:'gte',value:100},{field:'recent',op:'gte',value:200},{field:'delta',op:'gte',value:50}],sharedByAdmin1,['ocean_engine','qianchuan']),
    seedDefinition('DEF-7','preview-admin1','量级回落','volume',[{field:'previous',op:'gte',value:200},{field:'delta',op:'lte',value:-30}],sharedByAdmin1,['ocean_engine','qianchuan']),
    seedDefinition('DEF-8','preview-admin1','尚未起量','volume',[{field:'liveHours',op:'gte',value:6},{field:'recent',op:'lt',value:100}],sharedByAdmin1,['ocean_engine','qianchuan']),
    seedDefinition('DEF-9','preview-admin1','本地推高点击门店素材','opportunity',[{field:'spend',op:'gte',value:500},{field:'ctr',op:'gte',value:3}],sharedByAdmin1,['local']),
    seedDefinition('DEF-10','preview-admin1','点击承接表现较好','opportunity',[{field:'ctr',op:'gte',value:3},{field:'attributionConversions',op:'gte',value:50}],sharedByAdmin1,['ocean_engine','qianchuan']),
  ];
  return { definitions, applications: [
    // 一级管理员自用：单人、单规则、单广告主。
    seedApplication('APP-1', definitions[0], 'preview-admin1', {
      platform: 'ocean_engine', accountNumbers: [1], materialLimit: 12,
    }),

    // 同一千川模板被三个权限层级分别复用，范围、阈值和运行时间互不影响。
    seedApplication('APP-2', definitions[2], 'preview-member', {
      platform: 'qianchuan', name: '千川支付 ROI 达标素材 · 日常款', accountNumbers: [1, 3], scopeMode: 'all',
      conditions: [{field:'payRoi',op:'gte',value:1.5},{field:'payOrders',op:'gte',value:30}], frequency: 'half-hourly',
    }),
    seedApplication('APP-3', definitions[2], 'preview-admin2', {
      platform: 'qianchuan', name: '千川支付 ROI 达标素材 · 直播间', accountNumbers: [2], materialLimit: 8,
      conditions: [{field:'payRoi',op:'gte',value:1.2},{field:'payOrders',op:'gte',value:15}], frequency: 'fixed-time', fixedTime: '10:00',
      channels: ['site','wecom'],
    }),
    seedApplication('APP-4', definitions[2], 'preview-admin1', {
      platform: 'qianchuan', name: '千川支付 ROI 达标素材 · 全账户巡检', advertiserMode: 'all', companyMode: 'all', scopeMode: 'all',
    }),

    // 二级管理员和成员分别使用；同一成员对 AD 与千川建立两条独立规则。
    seedApplication('APP-5', definitions[3], 'preview-admin2', {
      platform: 'ocean_engine', name: '开始起量 · 团队账户', advertiserMode: 'all', companyMode: 'all', scopeMode: 'all',
    }),
    seedApplication('APP-6', definitions[3], 'preview-member', {
      platform: 'ocean_engine', name: '开始起量 · 成员重点素材', accountNumbers: [1], materialLimit: 16,
      conditions: [{field:'previous',op:'lt',value:200},{field:'recent',op:'gte',value:260}],
    }),
    seedApplication('APP-7', definitions[3], 'preview-member', {
      platform: 'qianchuan', name: '开始起量 · 千川商品', accountNumbers: [3, 4], scopeMode: 'all',
      conditions: [{field:'previous',op:'lt',value:150},{field:'recent',op:'gte',value:180}], frequency: 'half-hourly',
    }),

    // 同一成员重复复用同一模板，并按业务场景修改规则名称、阈值、平台和通知方式。
    seedApplication('APP-8', definitions[4], 'preview-member', {
      platform: 'ocean_engine', name: '高播放低点击 · 新品视频', accountNumbers: [1], materialLimit: 10,
      conditions: [{field:'totalPlay',op:'gte',value:100000},{field:'ctr',op:'lt',value:1.8}],
    }),
    seedApplication('APP-9', definitions[4], 'preview-member', {
      platform: 'qianchuan', name: '高播放低点击 · 千川内容', accountNumbers: [1, 2], scopeMode: 'all',
      conditions: [{field:'totalPlay',op:'gte',value:60000},{field:'ctr',op:'lt',value:2.4}], frequency: 'fixed-time', fixedTime: '20:00',
      channels: ['site','wecom'],
    }),

    // 广告主范围分别覆盖全部授权、多个指定、单个停用规则和本地推多门店。
    seedApplication('APP-10', definitions[5], 'preview-admin1', {
      platform: 'ocean_engine', name: '持续放量 · 全部授权账户', advertiserMode: 'all', companyMode: 'all', scopeMode: 'all',
    }),
    seedApplication('APP-11', definitions[6], 'preview-admin2', {
      platform: 'ocean_engine', name: '量级回落 · 三个重点账户', accountNumbers: [1, 3, 4], scopeMode: 'all',
      frequency: 'half-hourly', channels: ['site','wecom'],
    }),
    seedApplication('APP-12', definitions[7], 'preview-member', {
      platform: 'ocean_engine', name: '尚未起量 · 暂停观察', accountNumbers: [2], materialLimit: 7, enabled: false,
    }),
    seedApplication('APP-13', definitions[8], 'preview-member', {
      platform: 'local', name: '本地推高点击门店素材 · 两家门店', accountNumbers: [1, 3], scopeMode: 'all',
      frequency: 'fixed-time', fixedTime: '18:30',
    }),

    // 同一模板由一级、二级管理员分别使用，展示固定时间与半小时运行两种配置。
    seedApplication('APP-14', definitions[9], 'preview-admin1', {
      platform: 'qianchuan', name: '点击承接表现较好 · 千川晨报', accountNumbers: [1, 4], materialLimit: 12,
      frequency: 'fixed-time', fixedTime: '09:30', channels: ['site','wecom'],
    }),
    seedApplication('APP-15', definitions[9], 'preview-admin2', {
      platform: 'ocean_engine', name: '点击承接表现较好 · AD 实时', accountNumbers: [1, 4], scopeMode: 'all',
      conditions: [{field:'ctr',op:'gte',value:3.5},{field:'attributionConversions',op:'gte',value:30}], frequency: 'half-hourly',
    }),
  ], observations: {} };
}
export function readRules() {
  try {
    const stored = JSON.parse(localStorage.getItem(RULE_KEY));
    if (stored?.definitions && stored?.applications && stored?.observations) {
      const normalized = normalizeStore(stored);
      if (JSON.stringify(normalized) !== JSON.stringify(stored)) localStorage.setItem(RULE_KEY, JSON.stringify(normalized));
      return normalized;
    }
  } catch {}
  return seedStore();
}
const qianchuanReportTypeKeys = new Set(qianchuanReportTypeOptions.map(([key]) => key));
const normalizeSelection = record => {
  const platforms = record.platforms?.length ? record.platforms : ['ocean_engine'];
  if (!platforms.includes('qianchuan')) return { ...record, qianchuanReportTypes: record.qianchuanReportTypes || [] };
  const rawTypes = record.materialTypes || [];
  const legacyReports = rawTypes.filter(type => qianchuanReportTypeKeys.has(type));
  const qianchuanReportTypes = (record.qianchuanReportTypes?.length ? record.qianchuanReportTypes : legacyReports.length ? legacyReports : qianchuanReportTypeOptions.map(([key]) => key))
    .filter(type => qianchuanReportTypeKeys.has(type));
  const allowedMaterialTypes = new Set(qianchuanMaterialTypesForReports(qianchuanReportTypes).map(([key]) => key));
  const materialTypes = rawTypes.filter(type => allowedMaterialTypes.has(type));
  return {
    ...record,
    qianchuanReportTypes,
    materialTypes: materialTypes.length ? materialTypes : [...allowedMaterialTypes],
  };
};
function normalizeStore(store) {
  return {
    definitions: (store.definitions || []).map(definition => normalizeSelection({
      template: definition.template !== false,
      materialTypes: [],
      fixedTime: '09:00',
      defaultChannels: ['site'],
      webhook: '',
      wecomId: '',
      notificationTitle: '【创作平台告警】{规则名称}',
      notificationBody: '{媒介平台} · {广告主账户} 的 {素材名称} 命中 {提醒类型}，请及时查看。',
      ...definition,
      template: definition.template !== false,
    })),
    applications: (store.applications || []).map(application => normalizeSelection({
      materialTypes: [],
      fixedTime: '09:00',
      webhook: '',
      wecomId: '',
      notificationTitle: '【创作平台告警】{规则名称}',
      notificationBody: '{媒介平台} · {广告主账户} 的 {素材名称} 命中 {提醒类型}，请及时查看。',
      ...application,
      sourceDefinitionId: '',
      basedOn: '',
      sourceOwner: application.owner,
      reusedFromDefinitionId: application.reusedFromDefinitionId || application.sourceDefinitionId || application.basedOn || '',
      reusedFromOwner: application.reusedFromOwner || (application.sourceOwner && application.sourceOwner !== application.owner ? application.sourceOwner : ''),
    })),
    observations: store.observations || {},
  };
}
export function writeRules(store) { localStorage.setItem(RULE_KEY, JSON.stringify(store)); window.dispatchEvent(new Event(RULE_EVENT)); }
export function watchRules(callback) { const receive = event => { if (event.type === RULE_EVENT || event.key === RULE_KEY) callback(readRules()); }; window.addEventListener(RULE_EVENT, receive); window.addEventListener('storage', receive); return () => { window.removeEventListener(RULE_EVENT, receive); window.removeEventListener('storage', receive); }; }
const stableHash = value => [...String(value)].reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 7);
const eventTiming = key => {
  const ageHours = (stableHash(key) % 6) * 8;
  const openedAt = new Date(SAMPLE_NOW.getTime() - ageHours * 3600000);
  const at = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(openedAt).replaceAll('/', '-') + '（北京时间）';
  return { ageHours, at };
};
export function boardEvents(state, store) {
  const events = [];
  for (const application of availableApplications(state, store, true)) {
    const runtime = applicationRuntimeState(store, application);
    if (!runtime.active || !canViewApplicationResults(state, application)) continue;
    const definition = store.definitions.find(item => item.id === application.definitionId);
    for (const hit of trialApplication(state, application).hits) {
      const key = application.id + ':' + hit.material.id + ':' + DEMO_DATE;
      const observations = store.observations[key] || [];
      const latestStatus = [...observations].reverse().find(log => log.status)?.status || 'open';
      const timing = eventTiming(key);
      const escalated = latestStatus !== 'handled' && timing.ageHours >= ALERT_ESCALATION_HOURS;
      const event = { key, cycle: String(application.definitionVersion || 1) + ':' + DEMO_DATE, application, definition, runtime, rule: { ...application, id: application.id }, material: hit.material, values: hit.values, kind: application.kind, at: timing.at, ageHours: timing.ageHours, escalated, escalationHours: ALERT_ESCALATION_HOURS, observations };
      if (application.owner === state.actor || escalated) events.push(event);
    }
  }
  return events;
}
