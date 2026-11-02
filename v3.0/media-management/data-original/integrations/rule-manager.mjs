import { C as h, r as ref, h as computed, z as onMounted, ad as onUnmounted, ac as watch, V as useRouter, Y as useRoute, a5 as resolveComponent } from '../commercial-platform/runtime/assets-blue3/index-oddxqlpg.js';
import { readState, watchState, actorProfile, effectiveFeatures, managedPeople, platforms, platformObjects, roles, scope as accountScope } from './employee-state.mjs?v=dataset5';
import { createUI } from './employee-ui.mjs?v=rules19';
import { materialActions, materialDetailBody } from './material-detail.mjs?v=3';
import {
  readRules, writeRules, watchRules, availableApplications, availableDefinitions, materialScope, visibleMaterials,
  canCreateRule, canReuseRule, canApplyDefinition, canEditDefinition, canToggleDefinition, canDeleteDefinition,
  canEditApplication, canToggleApplication, canDeleteApplication, blankPersonalRule, validatePersonalRule, trialApplication,
  conditionsText, personName, kindLabels, metrics, metricPlatforms, operators, scheduleLabel, SAMPLE_TIME,
  periodLabels, applicationRuntimeState, materialTypeOptions, materialTypeLabel, qianchuanReportTypeOptions,
  qianchuanReportMaterialTypes, qianchuanReportTypeLabel, qianchuanMaterialTypesForReports,
} from './reminder-rules.mjs?v=rules43';

const { el, button, input, select, check, field, empty, table, tag, drawer } = createUI(h);
const clone = value => structuredClone(JSON.parse(JSON.stringify(value)));
const toggle = (items, value) => items.includes(value) ? items.filter(item => item !== value) : [...items, value];
const reminderTypeText = item => item.kind === 'custom' ? (item.customKindName || '自定义') : (kindLabels[item.kind] || '未分类');
const format = (field, value) => Number.isFinite(value)
  ? `${Number(value.toFixed(2)).toLocaleString('zh-CN')}${metrics[field]?.[1] || ''}`
  : '—';
const kindExplanations = {
  risk: '异常：指标越过风险阈值时提醒，用于尽早发现效果恶化。',
  opportunity: '机会：指标达到可放大的表现条件时提醒，用于发现值得跟进的素材。',
  volume: '起量：当前完整统计窗口达到设定消耗，且高于相邻历史窗口；用于发现投放规模增长，不代表转化效率或素材质量。',
};
let helpId = 0;
const help = (text, label = '说明') => {
  const id = `rm-help-${++helpId}`;
  return el('span', 'rm-help-wrap', [el('button', 'rm-help', '?', { type: 'button', 'aria-label': label, 'aria-describedby': id }), el('span', 'rm-tooltip', text, { id, role: 'tooltip' })]);
};
const section = (title, description, body) => el('section', 'rm-section em-card', [el('header', 'rm-section-heading', [el('h3', '', title), description ? help(description, `${title}说明`) : null]), el('div', 'rm-section-body', body)]);
const metricGroups = [
  ['投放数据', ['spend','show','click','ctr','cpm','cpc']],
  ['转化数据', ['attributionConversions','attributionCpa','deepConversions','deepCpa','payOrders','payGmv','payRoi']],
  ['内容数据', ['totalPlay','play3sRate','playOverRate','likes','comments','shares']],
  ['诊断与起量', ['hours','liveHours','recent','previous','delta']],
];

export default {
  name: 'ReminderRuleManager',
  props: { mode: { type: String, default: 'manage' } },
  setup(props) {
    const router = useRouter(), route = useRoute(), employee = ref(readState()), store = ref(readRules());
    const draft = ref(null), original = ref(null), reuseSource = ref(null), report = ref(null), materialDetail = ref(null), trial = ref(null), guideOpen = ref(false), pendingDelete = ref(null), scopeDetail = ref(null);
    const error = ref(''), query = ref(''), kind = ref('all'), materialQuery = ref(''), materialPage = ref(1), advertiser = ref('all'), advertiserFilter = ref('all'), createdFilter = ref('all'), reportQuery = ref(''), reportKind = ref('all'), reportResult = ref('all'), scopeAdvertiserQuery = ref('');
    const platformFilter = ref('all');
    const manageView = ref(String(route.query.configView || 'templates') === 'rules' ? 'rules' : 'templates');
    const reportViewer = computed(() => employee.value);
    const applications = computed(() => availableApplications(reportViewer.value, store.value));
    const definitions = computed(() => availableDefinitions(reportViewer.value, store.value));
    const allowedMaterials = computed(() => materialScope(reportViewer.value));
    const platformOptions = computed(() => [...new Set([...allowedMaterials.value.map(material => material.platform), ...applications.value.flatMap(item => item.platforms || []), ...definitions.value.flatMap(item => item.platforms || [])])]);
    const advertiserFilterQuery = ref('');
    const advertiserOptions = computed(() => [...new Map(allowedMaterials.value.filter(material => platformFilter.value === 'all' || material.platform === platformFilter.value).map(material => [material.advertiserId, `${material.account} · ${material.advertiser}`])).entries()]);
    const rows = computed(() => applications.value.filter(item => !item.deletedAt).filter(item => {
      const matchesAdvertiser = advertiserFilter.value === 'all' || (item.advertiserMode === 'specified' ? item.advertiserIds?.includes(advertiserFilter.value) : visibleMaterials(employee.value, item).some(material => material.advertiserId === advertiserFilter.value));
      const createdDays = item.createdAt ? Math.floor((new Date(`${SAMPLE_TIME.slice(0, 10)}T00:00:00Z`) - new Date(`${item.createdAt}T00:00:00Z`)) / 86400000) : Infinity;
      const matchesCreated = createdFilter.value === 'all' || (createdFilter.value === 'last7' && createdDays >= 0 && createdDays < 7) || (createdFilter.value === 'last30' && createdDays >= 0 && createdDays < 30);
      const matchesPlatform = platformFilter.value === 'all' || item.platforms?.includes(platformFilter.value);
      return matchesPlatform && matchesAdvertiser && matchesCreated && (kind.value === 'all' || item.kind === kind.value) && `${item.name} ${conditionsText(item)}`.includes(query.value.trim());
    }));
    const idsFromRoute = () => String(route.query.materials || '').split(',').filter(Boolean);
    const managing = computed(() => props.mode === 'manage');
    const embeddedAlerts = computed(() => route.path === '/ad-data' && route.query.view === 'alerts');
    const ruleRoute = extra => managing.value && !embeddedAlerts.value
      ? { path: '/media-management', query: { tab: 'rules', configView: manageView.value, ...(route.query.platform ? { platform: route.query.platform } : {}), ...extra } }
      : managing.value
        ? { path: '/ad-data', query: { view: 'alerts', tab: 'rules', configView: manageView.value, ...extra } }
      : { path: '/ad-data', query: { view: 'alerts', tab: 'rules', ...extra } };
    const goList = () => router.push(ruleRoute({}));
    const routeAction = (action, id = '') => router.push(ruleRoute({ action, ...(id ? { id } : {}) }));
    const closeReport = () => { materialDetail.value = null; route.query.inspect ? router.replace(ruleRoute({})) : (report.value = null); };
    const openMaterial = material => { materialDetail.value = material; };
    const closeMaterial = () => { materialDetail.value = null; };

    function normalizeRule(item) {
      const next = clone(item), platforms = next.platforms?.length ? next.platforms : ['ocean_engine'];
      const isQianchuan = platforms[0] === 'qianchuan';
      const reportKeys = new Set(qianchuanReportTypeOptions.map(([key]) => key));
      const legacyReports = (next.materialTypes || []).filter(type => reportKeys.has(type));
      const qianchuanReportTypes = isQianchuan
        ? (next.qianchuanReportTypes?.length ? next.qianchuanReportTypes : legacyReports.length ? legacyReports : [...reportKeys]).filter(type => reportKeys.has(type))
        : [];
      const availableTypes = isQianchuan ? qianchuanMaterialTypesForReports(qianchuanReportTypes) : materialTypeOptions[platforms[0]] || [];
      const typeKeys = new Set(availableTypes.map(([key]) => key));
      const selectedTypes = (next.materialTypes || []).filter(type => typeKeys.has(type));
      const channels = ['site', ...((next.channels || []).includes('wecom') ? ['wecom'] : [])];
      return { ...next, platforms: [platforms[0]], customKindName: next.customKindName || '', qianchuanReportTypes, materialTypes: selectedTypes.length ? selectedTypes : availableTypes.map(([key]) => key), companyMode: next.companyMode || 'all', companyIds: next.companyIds || [], advertiserMode: next.advertiserMode || 'all', advertiserIds: next.advertiserIds || [], scopeMode: next.scopeMode || 'specified', materialIds: next.materialIds || [], sendNotifications: true, channels, webhook: next.webhook || '', wecomId: next.wecomId || '', notificationTitle: '【创作平台告警】{规则名称}', notificationBody: '{媒介平台} · {广告主账户} 的 {素材名称} 命中 {提醒类型}，请及时查看。', conditions: next.conditions.map(condition => ({ period: condition.period || 'today', ...condition })) };
    }
    function definitionDraft(definition = null) {
      const source = definition || { name: '', kind: 'risk', customKindName: '', owner: employee.value.actor, platforms: [allowedMaterials.value[0]?.platform || 'ocean_engine'], qianchuanReportTypes: qianchuanReportTypeOptions.map(([key]) => key), materialTypes: [], conditions: [{ period: 'today', field: 'spend', op: 'gte', value: '' }], defaultFrequency: 'hourly', fixedTime: '09:00', defaultChannels: ['site'], webhook: '', wecomId: '', notificationTitle: '【创作平台告警】{规则名称}', notificationBody: '{媒介平台} · {广告主账户} 的 {素材名称} 命中 {提醒类型}，请及时查看。', publishedTo: [], enabled: true, version: 1, createdAt: '' };
      return normalizeRule({ ...source, _template: true, frequency: source.defaultFrequency || 'hourly', channels: clone(source.defaultChannels || ['site']), advertiserMode: 'all', advertiserIds: [], scopeMode: 'all', materialIds: [] });
    }
    function readRoute() {
      error.value = ''; trial.value = null; draft.value = null; original.value = null; reuseSource.value = null; report.value = null; materialDetail.value = null; scopeDetail.value = null; materialPage.value = 1;
      if (managing.value) manageView.value = String(route.query.configView || 'templates') === 'rules' ? 'rules' : 'templates';
      requestAnimationFrame(() => { window.scrollTo(0, 0); document.querySelector('.ad-data-main')?.scrollTo(0, 0); });
      const action = String(route.query.action || ''), id = String(route.query.id || '');
      if (managing.value && action === 'new-template' && ['platform','admin1','admin2'].includes(actorProfile(employee.value).role)) { original.value = null; draft.value = definitionDraft(); return; }
      if (managing.value && action === 'edit-template') {
        const source = definitions.value.find(item => item.id === id);
        if (source && canEditDefinition(employee.value, source)) { original.value = clone(source); draft.value = definitionDraft(source); }
        return;
      }
      if (managing.value && ['new-rule','new-definition','apply'].includes(action) && canCreateRule(employee.value)) { draft.value = blankPersonalRule(employee.value, idsFromRoute()); return; }
      if (managing.value && action === 'reuse-rule') {
        const source = applications.value.find(rule => rule.id === id);
        if (source && canReuseRule(employee.value)) { reuseSource.value = source; draft.value = normalizeRule({ ...blankPersonalRule(employee.value), name: source.name, kind: source.kind, customKindName: source.customKindName || '', platforms: source.platforms, qianchuanReportTypes: clone(source.qianchuanReportTypes || []), materialTypes: clone(source.materialTypes || []), conditions: clone(source.conditions), frequency: source.frequency, fixedTime: source.fixedTime || '09:00', channels: clone(source.channels), webhook: source.webhook || '', wecomId: source.wecomId || '', reusedFromDefinitionId: source.definitionId || source.id, reusedFromOwner: source.owner }); }
        return;
      }
      if (managing.value && action === 'reuse-definition') {
        const source = definitions.value.find(rule => rule.id === id);
        if (source && canReuseRule(employee.value) && source.enabled !== false) { reuseSource.value = source; draft.value = normalizeRule({ ...blankPersonalRule(employee.value), name: source.name, kind: source.kind, customKindName: source.customKindName || '', platforms: source.platforms, qianchuanReportTypes: clone(source.qianchuanReportTypes || []), materialTypes: clone(source.materialTypes || []), conditions: clone(source.conditions), frequency: source.defaultFrequency || 'hourly', fixedTime: source.fixedTime || '09:00', channels: clone(source.defaultChannels || ['site']), webhook: source.webhook || '', wecomId: source.wecomId || '', reusedFromDefinitionId: source.id, reusedFromOwner: source.owner }); }
        return;
      }
      if (managing.value && ['edit-rule','edit-application'].includes(action)) {
        const item = applications.value.find(rule => rule.id === id);
        if (item && canEditApplication(employee.value, item)) { original.value = clone(item); draft.value = normalizeRule(item); }
        return;
      }
      if (!managing.value && route.query.inspect) report.value = applications.value.find(rule => rule.id === route.query.inspect) || null;
    }
    let stopEmployee, stopRules;
    const closeFilterPopovers = event => {
      document.querySelectorAll('.rm-filter-picker[open]').forEach(node => {
        if (!node.contains(event.target)) node.removeAttribute('open');
      });
    };
    onMounted(() => {
      stopEmployee = watchState(next => { employee.value = next; readRoute(); });
      stopRules = watchRules(next => { store.value = next; if (!draft.value) readRoute(); });
      document.addEventListener('pointerdown', closeFilterPopovers);
    });
    onUnmounted(() => { stopEmployee?.(); stopRules?.(); document.removeEventListener('pointerdown', closeFilterPopovers); });
    watch(() => [route.query.action, route.query.id, route.query.materials, route.query.inspect, route.query.configView, props.mode], readRoute, { immediate: true });
    watch(() => draft.value && JSON.stringify(draft.value), () => { trial.value = null; error.value = ''; });

    function saveRule() {
      const nextRule = clone(draft.value), current = original.value && store.value.applications.find(item => item.id === original.value.id);
      if (nextRule._template) {
        if (!['platform','admin1','admin2'].includes(actorProfile(employee.value).role)) { error.value = '仅管理员可以新增企业模板。'; return; }
        const validationDraft = { ...nextRule, owner: employee.value.actor, advertiserMode: 'all', advertiserIds: [], scopeMode: 'all', materialIds: [] };
        error.value = validatePersonalRule(employee.value, validationDraft, null);
        if (error.value) return;
        const next = clone(store.value), stamp = Date.now(), currentDefinition = original.value && next.definitions.find(item => item.id === original.value.id);
        const definition = {
          id: currentDefinition?.id || `DEF-${stamp}`,
          template: true,
          owner: currentDefinition?.owner || employee.value.actor,
          name: nextRule.name.trim(),
          kind: nextRule.kind,
          customKindName: nextRule.kind === 'custom' ? nextRule.customKindName.trim() : '',
          platforms: clone(nextRule.platforms),
          qianchuanReportTypes: clone(nextRule.qianchuanReportTypes || []),
          materialTypes: clone(nextRule.materialTypes || []),
          conditions: clone(nextRule.conditions),
          publishedTo: currentDefinition?.publishedTo || managedPeople(employee.value).map(person => person.id),
          defaultFrequency: nextRule.frequency,
          fixedTime: nextRule.fixedTime || '09:00',
          defaultQuietHours: 4,
          defaultChannels: clone(nextRule.channels),
          webhook: nextRule.webhook || '',
          wecomId: nextRule.wecomId || '',
          notificationTitle: '【创作平台告警】{规则名称}',
          notificationBody: '{媒介平台} · {广告主账户} 的 {素材名称} 命中 {提醒类型}，请及时查看。',
          enabled: currentDefinition?.enabled !== false,
          version: (currentDefinition?.version || 0) + 1,
          basedOn: currentDefinition?.basedOn || '',
          createdAt: currentDefinition?.createdAt || new Date().toISOString().slice(0, 10),
        };
        next.definitions = next.definitions.filter(item => item.id !== definition.id);
        next.definitions.unshift(definition);
        writeRules(next); store.value = next; manageView.value = 'templates'; goList(); return;
      }
      error.value = validatePersonalRule(employee.value, nextRule, current || null);
      if (error.value) return;
      const stamp = Date.now(), id = current?.id || `APP-${stamp}`;
      const currentDefinition = current && store.value.definitions.find(item => item.id === current.definitionId);
      const next = clone(store.value);
      const recordOwner = current?.owner || employee.value.actor;
      const canReuseLocalDefinition = currentDefinition && currentDefinition.template === false && currentDefinition.owner === recordOwner;
      const definitionId = canReuseLocalDefinition ? currentDefinition.id : `DEF-${stamp}`;
      const definition = { id: definitionId, template: false, owner: recordOwner, name: nextRule.name, kind: nextRule.kind, customKindName: nextRule.customKindName || '', platforms: clone(nextRule.platforms), qianchuanReportTypes: clone(nextRule.qianchuanReportTypes || []), materialTypes: clone(nextRule.materialTypes || []), conditions: clone(nextRule.conditions), publishedTo: [], defaultFrequency: nextRule.frequency, fixedTime: nextRule.fixedTime || '09:00', defaultQuietHours: 4, defaultChannels: clone(nextRule.channels), webhook: nextRule.webhook || '', wecomId: nextRule.wecomId || '', notificationTitle: '【创作平台告警】{规则名称}', notificationBody: '{媒介平台} · {广告主账户} 的 {素材名称} 命中 {提醒类型}，请及时查看。', enabled: nextRule.enabled, version: (canReuseLocalDefinition ? currentDefinition.version : 0) + 1, basedOn: '', createdAt: currentDefinition?.createdAt || new Date().toISOString().slice(0,10) };
      const reusedFromDefinitionId = current?.reusedFromDefinitionId || reuseSource.value?.definitionId || reuseSource.value?.id || nextRule.reusedFromDefinitionId || '';
      const reusedFromOwner = current?.reusedFromOwner || reuseSource.value?.owner || nextRule.reusedFromOwner || '';
      const record = { ...nextRule, id, definitionId, sourceDefinitionId: '', basedOn: '', definitionVersion: definition.version, sourceOwner: recordOwner, reusedFromDefinitionId, reusedFromOwner, owner: recordOwner, viewers: current?.viewers || [], recipients: current?.recipients || [recordOwner], contact: current?.contact || recordOwner, notificationTitle: definition.notificationTitle, notificationBody: definition.notificationBody, createdAt: current?.createdAt || new Date().toISOString().slice(0,10) };
      next.definitions = next.definitions.filter(item => item.id !== definitionId).concat([definition]);
      next.applications = next.applications.filter(item => item.id !== id); next.applications.unshift(record);
      writeRules(next); store.value = next; goList();
    }
    function toggleEnabled(item) {
      if (!canToggleApplication(employee.value, item)) return;
      const next = clone(store.value), target = next.applications.find(row => row.id === item.id);
      target.enabled = !target.enabled;
      writeRules(next); store.value = next;
    }
    function toggleDefinition(item) {
      if (!canToggleDefinition(employee.value, item)) return;
      const next = clone(store.value), target = next.definitions.find(row => row.id === item.id);
      if (!target) return;
      target.enabled = target.enabled === false;
      writeRules(next); store.value = next;
    }
    const linkedRules = definition => applications.value.filter(application => !application.deletedAt && (application.reusedFromDefinitionId === definition.id || application.definitionId === definition.id || application.sourceDefinitionId === definition.id || application.basedOn === definition.id));
    function requestDelete(type, item) { pendingDelete.value = { type, item }; }
    function confirmDelete() {
      const target = pendingDelete.value;
      if (!target || (target.type === 'template' ? !canDeleteDefinition(employee.value, target.item) : !canDeleteApplication(employee.value, target.item))) return;
      const next = clone(store.value), deletedAt = new Date().toISOString();
      if (target.type === 'template') {
        const definition = next.definitions.find(item => item.id === target.item.id);
        if (!definition) return;
        definition.enabled = false; definition.deletedAt = deletedAt; definition.deletedBy = employee.value.actor;
      } else {
        const application = next.applications.find(item => item.id === target.item.id);
        if (!application) return;
        application.enabled = false; application.deletedAt = deletedAt; application.deletedBy = employee.value.actor;
      }
      writeRules(next); store.value = next; pendingDelete.value = null;
    }
    function enabledSwitch(item, disabled = false, forcedState = null, disabledReason = '') {
      const active = forcedState === null ? item.enabled : forcedState;
      return el('button', `rm-toggle${active ? ' active' : ''}${disabled ? ' disabled' : ''}`, null, {
        type: 'button',
        role: 'switch',
        disabled,
        title: disabledReason,
        'aria-checked': String(Boolean(active)),
        'aria-label': disabled ? `${item.name}：${active ? '已启用' : '未启用'}，${disabledReason}` : `${active ? '停用' : '启用'}告警规则：${item.name}`,
        onClick: () => !disabled && toggleEnabled(item),
      });
    }
    function definitionSwitch(item) {
      const allowed = canToggleDefinition(employee.value, item);
      return el('button', `rm-toggle${item.enabled !== false ? ' active' : ''}${allowed ? '' : ' disabled'}`, null, {
        type: 'button', role: 'switch', disabled: !allowed, 'aria-checked': String(item.enabled !== false),
        title: allowed ? (item.enabled === false ? '启用模板，允许继续复用' : '停用模板，停止新的复用；已生成规则不受影响') : '当前账号不能启停此模板',
        'aria-label': `${item.enabled === false ? '启用' : '停用'}模板：${item.name}`,
        onClick: () => allowed && toggleDefinition(item),
      });
    }
    function runTrial() {
      error.value = validatePersonalRule(employee.value, draft.value, original.value || null);
      if (!error.value) trial.value = trialApplication(employee.value, draft.value);
    }
    function segment(value, current, label, update) { return button(label, () => update(value), current === value ? 'rm-segment active' : 'rm-segment'); }
    function conditionsEditor(item) {
      const availableMetrics = Object.entries(metrics).filter(([key]) => !metricPlatforms[key] || (item.platforms.length && item.platforms.every(platform => metricPlatforms[key].includes(platform))));
      const availableMetricKeys = new Set(availableMetrics.map(([key]) => key));
      const metricSelect = (condition, index) => h('select', {
        value: condition.field,
        'aria-label': `条件 ${index + 1} 指标`,
        onChange: event => {
          condition.field = event.target.value;
          condition.period = ['recent','previous','delta'].includes(condition.field) ? 'rolling' : condition.period === 'rolling' ? 'today' : condition.period || 'today';
        },
      }, metricGroups.map(([label, keys]) => h('optgroup', { label }, keys.filter(key => availableMetricKeys.has(key)).map(key => h('option', { value: key }, metrics[key][0])))));
      return [el('div', 'rm-condition-shell', [el('strong', '', '符合以下所有条件时'), el('div', 'rm-condition-list', item.conditions.map((condition, index) => el('div', 'rm-condition-row giant', [
        select(['recent','previous','delta'].includes(condition.field) ? 'rolling' : condition.period || 'today', value => condition.period = value, ['recent','previous','delta'].includes(condition.field) ? [['rolling','当前窗口']] : Object.entries(periodLabels).filter(([key]) => key !== 'rolling'), `条件 ${index + 1} 统计周期`),
        metricSelect(condition, index),
        select(condition.op, value => condition.op = value, Object.entries(operators).map(([key,label]) => [key, label === '≥' ? '大于等于' : label === '≤' ? '小于等于' : label === '>' ? '大于' : label === '<' ? '小于' : '等于']), `条件 ${index + 1} 运算符`),
        input(condition.value, value => condition.value = value, '请输入', { type: 'number', min: condition.field === 'delta' ? undefined : 0, step: 'any', 'aria-label': `条件 ${index + 1} 阈值` }),
        el('span', 'rm-unit', metrics[condition.field]?.[1] || ''),
        button('删除', () => item.conditions.length > 1 && item.conditions.splice(index, 1), 'text danger', { disabled: item.conditions.length === 1, 'aria-label': `删除条件 ${index + 1}` }),
      ]))), button('＋ 新增告警条件', () => item.conditions.length < 8 && item.conditions.push({ period: 'today', field: 'spend', op: 'gte', value: '' }), 'rm-add-condition')])];
    }
    function changeMaterials(ids) { draft.value.materialIds = ids; }
    function filterDropdown(label, value, options, onChange, searchable = false) {
      const selectedLabel = options.find(([key]) => key === value)?.[1] || options[0]?.[1] || '全部';
      const visibleOptions = searchable ? options.filter(([key, name]) => key === 'all' || `${name} ${key}`.toLocaleLowerCase().includes(advertiserFilterQuery.value.trim().toLocaleLowerCase())) : options;
      return el('details', 'rm-filter-picker', [
        el('summary', 'rm-filter-summary', [el('span', '', label), el('strong', '', selectedLabel), el('i', '', '', { 'aria-hidden': 'true' })]),
        el('div', 'rm-filter-menu', [
          searchable ? input(advertiserFilterQuery.value, value => advertiserFilterQuery.value = value, '搜索广告主名称或 ID', { type: 'search', 'aria-label': '搜索广告主名称或 ID' }) : null,
          el('div', 'rm-filter-options', visibleOptions.map(([key, name]) => h('button', { type: 'button', class: value === key ? 'active' : '', onClick: event => { onChange(key); event.currentTarget.closest('details').open = false; } }, [el('span', '', name), value === key ? el('span', 'rm-filter-check', '') : null]))),
        ]),
      ]);
    }

    function editorView() {
      const item = draft.value;
      const isTemplate = Boolean(item._template);
      const platformOptions = [...new Set(allowedMaterials.value.map(material => material.platform))];
      const isQianchuan = item.platforms[0] === 'qianchuan';
      const selectedReportTypes = isQianchuan
        ? (item.qianchuanReportTypes?.length ? item.qianchuanReportTypes : qianchuanReportTypeOptions.map(([key]) => key))
        : [];
      const availableTypes = isQianchuan ? qianchuanMaterialTypesForReports(selectedReportTypes) : materialTypeOptions[item.platforms[0]] || [];
      const selectedMaterialTypes = item.materialTypes?.length ? item.materialTypes : availableTypes.map(([key]) => key);
      const matchesTypeSelection = material => {
        if (!item.platforms.includes(material.platform)) return false;
        if (!isQianchuan) return selectedMaterialTypes.includes(material.materialType);
        if (!selectedReportTypes.includes(material.reportType)) return false;
        return !(qianchuanReportMaterialTypes[material.reportType] || []).length || selectedMaterialTypes.includes(material.materialType);
      };
      const platformMaterials = allowedMaterials.value.filter(matchesTypeSelection);
      const materialCounts = Map.groupBy(platformMaterials, material => material.advertiserId);
      const platformAccounts = accountScope(employee.value, employee.value.actor, new Set(), 'material_performance').filter(account => item.platforms.includes(account.platform));
      const companyOptions = [...new Map(platformAccounts.map(account => [account.company_id, account.company_name])).entries()];
      const selectedCompanyIds = item.companyMode === 'specified' ? item.companyIds : companyOptions.map(([id]) => id);
      const scopeAdvertisers = platformAccounts
        .filter(account => selectedCompanyIds.includes(account.company_id))
        .map(account => ({ id: account.id, name: account.name, code: account.advertiser_id, count: materialCounts.get(account.id)?.length || 0 }));
      const filteredAdvertisers = scopeAdvertisers.filter(account => (account.name + ' ' + account.code).toLocaleLowerCase().includes(scopeAdvertiserQuery.value.trim().toLocaleLowerCase()));
      const applicable = platformMaterials.filter(material => selectedCompanyIds.includes(material.companyId) && (item.advertiserMode !== 'specified' || item.advertiserIds.includes(material.advertiserId)));
      const materials = applicable.filter(material => (advertiser.value === 'all' || material.advertiserId === advertiser.value) && `${material.name} ${material.id}`.includes(materialQuery.value.trim()));
      const materialPageSize = 100;
      const materialPageCount = Math.max(1, Math.ceil(materials.length / materialPageSize));
      if (materialPage.value > materialPageCount) materialPage.value = materialPageCount;
      const materialRows = materials.slice((materialPage.value - 1) * materialPageSize, materialPage.value * materialPageSize);
      const dateMode = item.start ? 'range' : 'long';
      const selectPlatform = value => {
        item.platforms = [value];
        item.qianchuanReportTypes = value === 'qianchuan' ? qianchuanReportTypeOptions.map(([key]) => key) : [];
        item.materialTypes = (materialTypeOptions[value] || []).map(([key]) => key);
        item.companyMode = 'all'; item.companyIds = []; item.advertiserMode = 'all'; item.advertiserIds = []; item.materialIds = []; advertiser.value = 'all'; materialPage.value = 1; scopeAdvertiserQuery.value = '';
      };
      const changeCompanies = ids => {
        item.companyIds = ids;
        const allowedAccountIds = new Set(platformAccounts.filter(account => ids.includes(account.company_id)).map(account => account.id));
        item.advertiserIds = item.advertiserIds.filter(id => allowedAccountIds.has(id));
        item.materialIds = item.materialIds.filter(materialId => allowedMaterials.value.some(material => material.id === materialId && ids.includes(material.companyId)));
      };
      const changeAdvertisers = ids => {
        item.advertiserIds = ids;
        const nextAdvertisers = new Set(ids);
        item.materialIds = item.materialIds.filter(materialId => allowedMaterials.value.some(material => material.id === materialId && nextAdvertisers.has(material.advertiserId)));
      };
      const dateAfter = (start, days) => { const date = new Date(`${start}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + days - 1); return date.toISOString().slice(0, 10); };
      const activateRange = () => {
        item.start ||= SAMPLE_TIME.slice(0, 10); item.end ||= dateAfter(item.start, 30);
      };
      const setRangeDays = days => { item.start ||= SAMPLE_TIME.slice(0, 10); item.end = dateAfter(item.start, days); };
      const rangeDays = item.start && item.end ? Math.round((new Date(`${item.end}T00:00:00Z`) - new Date(`${item.start}T00:00:00Z`)) / 86400000) + 1 : 0;
      const reportTypePicker = isQianchuan ? el('div', 'rm-type-options rm-report-type-options', [
        el('div', 'rm-type-options-head', [el('strong', '', '已选 ' + selectedReportTypes.length + ' / ' + qianchuanReportTypeOptions.length), button('全选', () => { item.qianchuanReportTypes = qianchuanReportTypeOptions.map(([key]) => key); item.materialTypes = materialTypeOptions.qianchuan.map(([key]) => key); }, 'text', { disabled: selectedReportTypes.length === qianchuanReportTypeOptions.length })]),
        el('div', 'rm-type-option-list', qianchuanReportTypeOptions.map(([key, label]) => check(label, selectedReportTypes.includes(key), () => {
          const next = toggle(selectedReportTypes, key);
          if (!next.length) return;
          item.qianchuanReportTypes = next;
          item.materialTypes = qianchuanMaterialTypesForReports(next).map(([type]) => type);
          item.materialIds = item.materialIds.filter(id => allowedMaterials.value.some(material => material.id === id
            && next.includes(material.reportType)
            && (!(qianchuanReportMaterialTypes[material.reportType] || []).length || item.materialTypes.includes(material.materialType))));
        }))),
        el('p', 'rm-type-note', '对应素材表现中的 5 个独立报表视图，可多选并默认全选。'),
      ]) : null;
      const materialTypePicker = availableTypes.length
        ? el('div', 'rm-type-options', [
            el('div', 'rm-type-options-head', [el('strong', '', `已选 ${selectedMaterialTypes.length} / ${availableTypes.length}`), button('全选', () => item.materialTypes = availableTypes.map(([key]) => key), 'text', { disabled: selectedMaterialTypes.length === availableTypes.length })]),
            el('div', 'rm-type-option-list', availableTypes.map(([key, label]) => check(label, selectedMaterialTypes.includes(key), () => {
              const next = toggle(selectedMaterialTypes, key);
              if (!next.length) return;
              item.materialTypes = next;
              item.materialIds = item.materialIds.filter(id => allowedMaterials.value.some(material => material.id === id && next.includes(material.materialType)));
            }))),
          ])
        : el('div', 'rm-type-options rm-type-empty', [el('strong', '', '无需选择素材类型'), el('span', '', '当前选择的是直播间、商品等报表对象，按报表对象直接判断。')]);
      return el('div', 'rm-editor giant-form', [
        el('header', 'rm-editor-head', [button(isTemplate ? '返回模板列表' : '返回规则列表', goList, 'text'), el('div', '', [el('h2', '', isTemplate ? original.value ? '编辑企业模板' : '新增企业模板' : original.value ? '编辑规则' : reuseSource.value ? '复用模板' : '新增规则'), el('p', 'em-muted', isTemplate ? '企业模板仅预设平台、报表 / 素材类型、判断条件和运行时间，不绑定业务范围。' : reuseSource.value ? `已带入 ${personName(reuseSource.value.owner)} 的模板配置；保存前可修改条件数值、时间和业务范围。` : '规则只作用于当前账号有权查看的素材。')])]),
        section(isTemplate ? '适用范围' : '应用范围', isTemplate ? '模板只声明适用平台和报表 / 素材类型；复用为规则时再绑定公司、广告主和素材。' : '业务范围统一按公司、广告主、素材逐级限定；每一级只显示当前账号有权访问的数据。', [
          field('媒介平台', el('div', 'rm-segments', platformOptions.map(key => segment(key, item.platforms[0], platforms[key] || key, selectPlatform)))),
          isQianchuan ? field('千川报表类型', reportTypePicker) : null,
          field('素材类型', materialTypePicker),
          isQianchuan ? el('p', 'rm-inline-scope-note', availableTypes.length ? '素材类型仅作用于全域素材和标准素材；直播间、商品等报表按报表对象统计。' : '当前所选报表按直播间、商品等报表对象统计，无需选择素材类型。') : null,
          !isTemplate ? field('公司', el('div', 'rm-scope-level', [
            el('div', 'rm-segments', [segment('all', item.companyMode, '全部有权公司', value => { item.companyMode = value; item.companyIds = []; item.advertiserMode = 'all'; item.advertiserIds = []; item.materialIds = []; }), segment('specified', item.companyMode, '指定公司', value => { item.companyMode = value; item.companyIds = []; item.advertiserMode = 'all'; item.advertiserIds = []; item.materialIds = []; })]),
            item.companyMode === 'specified' ? el('div', 'rm-company-options', [
              el('div', 'rm-company-options-head', [el('strong', '', '公司列表'), check('全选', companyOptions.length > 0 && companyOptions.every(([id]) => item.companyIds.includes(id)), () => changeCompanies(item.companyIds.length === companyOptions.length ? [] : companyOptions.map(([id]) => id)), !companyOptions.length)]),
              el('div', 'rm-company-option-list', companyOptions.map(([id, name]) => check(name, item.companyIds.includes(id), () => changeCompanies(toggle(item.companyIds, id))))),
            ]) : null,
          ])) : null,
          !isTemplate ? field('广告主', el('div', 'rm-segments', [segment('all', item.advertiserMode, '全部有权广告主', value => { item.advertiserMode = value; item.advertiserIds = []; item.materialIds = []; materialPage.value = 1; }), segment('specified', item.advertiserMode, '指定广告主', value => { item.advertiserMode = value; item.materialIds = []; materialPage.value = 1; })])) : null,
          !isTemplate && item.advertiserMode === 'specified' ? [
            input(scopeAdvertiserQuery.value, value => scopeAdvertiserQuery.value = value, '搜索广告主名称或 ID', { class: 'rm-scope-search', 'aria-label': '搜索指定广告主' }),
            el('div', 'rm-material-picker rm-advertiser-picker-grid', [
              el('section', 'rm-material-pane', [
                el('header', '', [
                  el('strong', '', '广告主列表'),
                  el('div', 'rm-picker-head-actions', [
                    el('span', 'em-muted', filteredAdvertisers.length + ' 个'),
                    check('全选搜索结果', filteredAdvertisers.length > 0 && filteredAdvertisers.every(account => item.advertiserIds.includes(account.id)), () => {
                      const ids = filteredAdvertisers.map(account => account.id);
                      const remove = ids.every(id => item.advertiserIds.includes(id));
                      changeAdvertisers(remove ? item.advertiserIds.filter(id => !ids.includes(id)) : [...new Set([...item.advertiserIds, ...ids])]);
                    }, filteredAdvertisers.length === 0),
                  ]),
                ]),
                el('div', 'rm-material-options', filteredAdvertisers.length ? filteredAdvertisers.map(account => el('div', 'rm-material-option', [
                  check(account.name, item.advertiserIds.includes(account.id), () => changeAdvertisers(toggle(item.advertiserIds, account.id))),
                  el('small', 'em-muted', account.code + ' · ' + (account.count ? account.count + ' 条素材' : '暂无素材')),
                ])) : el('p', 'em-muted', '暂无匹配广告主')),
              ]),
              el('section', 'rm-material-pane selected', [
                el('header', '', [el('strong', '', '已选（' + item.advertiserIds.length + '）'), button('清空', () => changeAdvertisers([]), 'text', { disabled: !item.advertiserIds.length })]),
                el('div', 'rm-material-options', item.advertiserIds.length ? item.advertiserIds.map(id => {
                  const account = scopeAdvertisers.find(row => row.id === id);
                  return account ? el('div', 'rm-selected-material', [el('div', '', [el('strong', '', account.name), el('small', 'em-muted', account.code + ' · ' + (account.count ? account.count + ' 条素材' : '暂无素材'))]), button('移除', () => changeAdvertisers(item.advertiserIds.filter(value => value !== id)), 'text danger')]) : null;
                }).filter(Boolean) : el('p', 'em-muted', '暂不选择')),
              ]),
            ]),
          ] : null,
          !isTemplate ? field('素材', el('div', 'rm-segments', [segment('all', item.scopeMode, '全部素材', value => item.scopeMode = value), segment('specified', item.scopeMode, '指定素材', value => { item.scopeMode = value; materialPage.value = 1; })])) : null,
          isTemplate ? el('p', 'rm-helper em-muted', `复用后仅可选择 ${availableTypes.filter(([key]) => !item.materialTypes.length || item.materialTypes.includes(key)).map(([, label]) => label).join('、') || '全部类型'}；模板本身不占用公司、广告主或素材范围。`) : item.scopeMode === 'all' ? el('p', 'rm-helper em-muted', `覆盖所选公司和广告主范围内 ${applicable.length} 条素材；后续进入该范围的素材自动纳入。`) : [
            el('div', 'rm-scope-filters', [select(advertiser.value, value => { advertiser.value = value; materialPage.value = 1; }, [['all','全部已选广告主'], ...[...new Map(applicable.map(material => [material.advertiserId, `${material.account} · ${material.advertiser}`])).entries()]], '广告主'), input(materialQuery.value, value => { materialQuery.value = value; materialPage.value = 1; }, '搜索素材名称或 ID')]),
            el('div', 'rm-material-picker', [
              el('section', 'rm-material-pane', [el('header', '', [el('strong', '', '素材列表'), el('div', 'rm-picker-head-actions', [el('span', 'em-muted', `${materials.length} 条`), check('全选本页', materialRows.length > 0 && materialRows.every(material => item.materialIds.includes(material.id)), () => { const ids = materialRows.map(material => material.id); const remove = ids.every(id => item.materialIds.includes(id)); changeMaterials(remove ? item.materialIds.filter(id => !ids.includes(id)) : [...new Set([...item.materialIds, ...ids])].slice(0, 100)); }, materialRows.length === 0)])]), el('div', 'rm-material-options', materialRows.length ? materialRows.map(material => el('div', 'rm-material-option', [check(material.name, item.materialIds.includes(material.id), () => changeMaterials(item.materialIds.includes(material.id) ? item.materialIds.filter(id => id !== material.id) : item.materialIds.length < 100 ? [...item.materialIds, material.id] : item.materialIds)), el('small', 'em-muted', `${material.id} · ${material.account} · ${material.project} · ${material.creator}`)])) : el('p', 'em-muted', '暂无选项')), materialPageCount > 1 ? el('footer', 'rm-picker-pagination', [el('span', 'em-muted', `第 ${materialPage.value} / ${materialPageCount} 页`), button('上一页', () => materialPage.value = Math.max(1, materialPage.value - 1), '', { disabled: materialPage.value === 1 }), button('下一页', () => materialPage.value = Math.min(materialPageCount, materialPage.value + 1), '', { disabled: materialPage.value === materialPageCount })]) : null]),
              el('section', 'rm-material-pane selected', [el('header', '', [el('strong', '', `已选 (${item.materialIds.length}/100)`), button('清空', () => changeMaterials([]), 'text', { disabled: !item.materialIds.length })]), el('div', 'rm-material-options', item.materialIds.length ? item.materialIds.map(id => { const material = applicable.find(row => row.id === id); return material ? el('div', 'rm-selected-material', [el('div', '', [el('strong', '', material.name), el('small', 'em-muted', `${material.id} · ${material.account}`)]), button('移除', () => changeMaterials(item.materialIds.filter(value => value !== id)), 'text danger')]) : null; }).filter(Boolean) : el('p', 'em-muted', '暂不选择'))]),
            ]),
          ],
        ]),
        section(isTemplate ? '模板规则设置' : '规则设置', '条件之间为“且”的关系；满足全部条件时才发送提醒。', [
          el('label', 'em-field rm-rule-name-field', [el('span', '', isTemplate ? '模板名称' : '规则名称'), input(item.name, value => item.name = value, isTemplate ? '请输入企业模板名称' : '请输入规则名称', { maxlength: 50 })]),
          field('提醒类型', el('div', 'rm-kind-editor', [el('div', 'rm-segments rm-kind-segments', Object.entries(kindLabels).map(([key, label]) => segment(key, item.kind, label, value => item.kind = value))), item.kind === 'custom' ? input(item.customKindName || '', value => item.customKindName = value, '输入自定义提醒类型，例如：高潜待跟进', { maxlength: 16, 'aria-label': '自定义提醒类型名称', class: 'rm-custom-kind-input' }) : null])),
          ...conditionsEditor(item),
        ]),
        section('运行时间', '按创作平台当前数据更新节奏检查；固定时间用于每日提醒。', [
          field('运行频率', el('div', 'rm-segments rm-frequency-segments', [['half-hourly','每30分钟'],['hourly','每小时'],['fixed-time','固定时间']].map(([key,label]) => segment(key, item.frequency, label, value => item.frequency = value)))),
          item.frequency === 'fixed-time' ? field('提醒时间', el('div', 'rm-time-picker', [h(resolveComponent('a-time-picker'), { modelValue: item.fixedTime || '09:00', 'onUpdate:modelValue': value => item.fixedTime = value, format: 'HH:mm', 'value-format': 'HH:mm', 'allow-clear': false, 'aria-label': '每日提醒时间' })])) : null,
          field('生效范围', el('div', 'rm-lifetime-control', [
            el('div', 'rm-segments rm-lifetime-segments', [segment('long', dateMode, '长期有效', () => { item.start = ''; item.end = ''; }), segment('range', dateMode, '指定日期', activateRange)]),
            item.start ? el('div', 'rm-range-row', [
              h(resolveComponent('a-range-picker'), { modelValue: [item.start, item.end || item.start], 'onUpdate:modelValue': value => { if (!Array.isArray(value)) return; item.start = value[0] || ''; item.end = value[1] || ''; }, format: 'YYYY-MM-DD', 'value-format': 'YYYY-MM-DD', 'allow-clear': false, 'aria-label': '生效日期范围' }),
              el('div', 'rm-date-presets', [7, 30, 90].map(days => button(`近 ${days} 天`, () => setRangeDays(days), rangeDays === days ? 'active' : ''))),
            ]) : null,
          ])),
          field('提醒与通知', el('div', 'rm-delivery-settings', [
            el('div', 'rm-delivery-default', [el('strong', '', '站内规则报告'), el('small', 'em-muted', '命中结果默认进入“数据投放－投放提醒”的规则报告，并显示未读数量，无需单独配置通知内容。')]),
            check('同时发送企业微信', item.channels.includes('wecom'), () => item.channels = item.channels.includes('wecom') ? ['site'] : ['site', 'wecom']),
          ])),
          item.channels.includes('wecom') ? [el('div', 'rm-two-cols rm-wecom-fields', [el('label', 'em-field', [el('span', '', 'Webhook 地址'), input(item.webhook || '', value => item.webhook = value, 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=...', { type: 'url', required: true })]), el('label', 'em-field', [el('span', '', '企业微信 ID'), input(item.wecomId || '', value => item.wecomId = value, '填写接收群或应用 ID', { required: true })])]), el('p', 'rm-wecom-default-copy em-muted', '企业微信采用创作平台统一告警格式，自动带入媒介平台、广告主账户、素材名称、提醒类型和命中值，无需额外配置消息格式。')] : null,
        ]),
        error.value ? el('p', 'rm-save-error', error.value, { role: 'alert' }) : null,
        trial.value ? el('div', 'rm-trial-results', [el('strong', '', `试运行：命中 ${trial.value.hits.length} · 未命中 ${trial.value.unmatched.length} · 数据不足 ${trial.value.excluded.length}`), el('p', 'em-muted', `${SAMPLE_TIME}，仅按当前快照计算，不发送通知。数据不足的素材不会生成待处理提醒；条件可判断时才参与规则监控。`)]) : null,
        el('div', 'rm-savebar giant', [button(isTemplate ? '保存企业模板' : '提交规则', saveRule, 'primary'), !isTemplate ? el('span', 'rm-trial-control', [button('试运行', runTrial), help('按当前可见素材数据快照计算命中、未命中和数据不足；不会保存规则，也不会发送通知。', '试运行说明')]) : null, button('取消', goList)]),
      ]);
    }
    function reportDrawer() {
      const item = report.value;
      if (!item) return null;
      if (item.runBatch) {
        const batch = item.runBatch;
        const result = batch.result;
        const detailRows = [
          ...result.hits.map(row => ({ ...row, outcome: '命中提醒', outcomeKey: 'hit' })),
          ...result.unmatched.map(row => ({ ...row, outcome: '未命中', outcomeKey: 'miss' })),
          ...result.excluded.map(row => ({ ...row, outcome: '数据不足', outcomeKey: 'excluded' })),
        ];
        const executionDrawer = drawer('规则执行详情', [
          el('section', 'rm-drawer-summary', [el('div', '', [el('h2', '', batch.application.name), el('p', 'em-muted', `${reminderTypeText(batch.application)} · ${conditionsText(batch.application)}`)]), tag(`${detailRows.length} 条素材检查`, 'muted')]),
          el('div', 'rm-definition', [el('p', '', `执行时间：${SAMPLE_TIME}`), el('p', '', `媒介平台：${(batch.application.platforms || []).map(platform => platforms[platform] || platform).join('、')}`), el('p', '', `检查范围：${batch.checked} 条素材`), el('p', '', `执行状态：${applicationRuntimeState(store.value, batch.application).status === 'running' ? '正常完成' : '规则暂停或已过期'}`)]),
          el('div', 'rm-batch-outcomes', [['命中提醒', result.hits.length, 'good'], ['未命中', result.unmatched.length, 'muted'], ['数据不足', result.excluded.length, 'warning']].map(([label, count, tone]) => el('article', tone, [el('span', '', label), el('strong', '', String(count))]))),
          el('section', 'rm-hit-section', [
            el('h3', '', '素材检查明细'),
            detailRows.length
              ? el('div', 'rm-hit-list', detailRows.map(row => el('article', 'rm-hit-row', [
                  el('div', '', [
                    button(row.material.name, () => openMaterial(row.material), 'rm-material-name', { title: '进入素材表现并定位到该素材' }),
                    el('small', 'em-muted', `${row.material.id} · ${row.material.account}`),
                    el('small', 'em-muted', row.reason || row.values.map(value => format(value.field, value.actual)).join('；')),
                  ]),
                  el('div', 'rm-batch-row-actions', [
                    tag(row.outcome, row.outcomeKey === 'hit' ? 'good' : row.outcomeKey === 'excluded' ? 'muted' : ''),
                    row.outcomeKey === 'hit' ? materialActions({ button, router, material: row.material, onDetail: () => openMaterial(row.material) }) : null,
                  ]),
                ])))
              : el('p', 'em-muted', '本次执行没有可检查的素材。'),
          ]),
        ], [], closeReport, { drawerClass: 'em-drawer rm-execution-drawer' });
        const materialDrawer = materialDetail.value ? drawer(
          '素材表现 · 单条素材详情',
          materialDetailBody({ el, button, router, material: materialDetail.value, platformLabel: platforms[materialDetail.value.platform] || materialDetail.value.platform, sampleDate: SAMPLE_TIME.slice(0, 10) }),
          [],
          closeMaterial,
          { overlayClass: 'em-overlay em-overlay-secondary', drawerClass: 'em-drawer material-performance-drawer' },
        ) : null;
        return [executionDrawer, materialDrawer];
      }
      const result = trialApplication(reportViewer.value, item);
      return drawer('命中规则详情', [
        el('section', 'rm-drawer-summary', [el('div', '', [el('h2', '', item.name), el('p', 'em-muted', `${reminderTypeText(item)} · ${conditionsText(item)}`)]), item.enabled ? tag('运行中','good') : tag('已暂停','muted')]),
        el('div', 'rm-definition', [el('p', '', `媒介平台：${platforms[item.platforms?.[0]] || '—'}`), el('p', '', `广告主账户：${item.advertiserMode === 'specified' ? `${item.advertiserIds?.length || 0} 个指定广告主` : '全部有权广告主'}`), el('p', '', `应用对象：${item.scopeMode === 'all' ? '全部素材' : `${item.materialIds.length} 个指定素材`}`), el('p', '', `创建日期：${item.createdAt || '—'}`), el('p', '', `运行时间：${scheduleLabel(item)}`), el('p', '', `提醒去向：${item.channels.map(channel => channel === 'site' ? '规则报告' : '企业微信').join('、')}`)]),
        el('div', 'rm-report-count', [el('span', '', `当前可见素材 ${visibleMaterials(reportViewer.value, item).length} 个 · 命中 ${result.hits.length} · 未命中 ${result.unmatched.length} · 数据不足 ${result.excluded.length}`), help('数据不足不是素材问题，不会生成告警；仅表示数据更新延迟、字段缺失、分母为零、统计窗口未完成，或广告主只有历史数据。')]),
        el('section', 'rm-hit-section', [el('h3', '', '命中素材'), result.hits.length ? el('div', 'rm-hit-list', result.hits.map(row => el('article', 'rm-hit-row', [button(row.material.name, () => openMaterial(row.material), 'rm-material-name', { title: '进入素材表现并定位到该素材' }), el('small', 'em-muted', `${row.material.id} · ${row.material.account}`), el('div', 'em-actions', [button('查看素材表现', () => openMaterial(row.material), 'text'), button('进入爆款工厂', () => router.push({ path: '/viral-factory', query: { material: row.material.id } }), 'text'), button('加入素材库', () => router.push({ path: '/resource', query: { material: row.material.id } }), 'text')])])) ) : el('p', 'em-muted', '当前快照没有命中素材。')]),
        result.excluded.length ? el('details', 'rm-excluded-list', [el('summary', '', `数据不足 ${result.excluded.length} 个素材`), ...result.excluded.map(row => el('p', 'em-muted', `${row.material.name} · ${row.reason}`))]) : null,
      ], [], closeReport);
    }
    function runReportView() {
      const makeBatch = application => {
        const runtime = applicationRuntimeState(store.value, application);
        const result = runtime.active ? trialApplication(reportViewer.value, application) : { hits: [], unmatched: [], excluded: [] };
        const materials = [...result.hits, ...result.unmatched, ...result.excluded];
        const outcomeKey = !runtime.active ? 'paused' : result.hits.length ? 'hit' : result.excluded.length ? 'insufficient' : 'clear';
        return { application, result, checked: materials.length, outcomeKey, runtime };
      };
      const allBatches = applications.value.map(makeBatch);
      const records = allBatches.filter(batch => {
        const application = batch.application;
        const createdDays = application.createdAt ? Math.floor((new Date(`${SAMPLE_TIME.slice(0, 10)}T00:00:00Z`) - new Date(`${application.createdAt}T00:00:00Z`)) / 86400000) : Infinity;
        const matchesCreated = createdFilter.value === 'all' || (createdFilter.value === 'last7' && createdDays >= 0 && createdDays < 7) || (createdFilter.value === 'last30' && createdDays >= 0 && createdDays < 30);
        const matchesAdvertiser = advertiserFilter.value === 'all' || (application.advertiserMode === 'specified' ? application.advertiserIds?.includes(advertiserFilter.value) : visibleMaterials(reportViewer.value, application).some(material => material.advertiserId === advertiserFilter.value));
        return (platformFilter.value === 'all' || application.platforms?.includes(platformFilter.value))
          && matchesAdvertiser && matchesCreated
          && (reportKind.value === 'all' || application.kind === reportKind.value)
          && (reportResult.value === 'all' || batch.outcomeKey === reportResult.value)
          && `${application.name} ${batch.result.hits.concat(batch.result.unmatched, batch.result.excluded).map(row => row.material.name + ' ' + row.material.id).join(' ')}`.toLowerCase().includes(reportQuery.value.trim().toLowerCase());
      });
      const stats = [
        ['执行规则数', allBatches.length, ''],
        ['检查素材', allBatches.reduce((sum, batch) => sum + batch.checked, 0), ''],
        ['命中提醒', allBatches.reduce((sum, batch) => sum + batch.result.hits.length, 0), 'risk'],
        ['未命中', allBatches.reduce((sum, batch) => sum + batch.result.unmatched.length, 0), 'muted'],
        ['数据不足', allBatches.reduce((sum, batch) => sum + batch.result.excluded.length, 0), 'warning'],
      ];
      const executionStatus = batch => batch.runtime.status === 'running'
        ? { label: '已执行', detail: '规则继续运行', tone: 'good' }
        : batch.runtime.status === 'out-of-range'
          ? { label: '未执行', detail: '规则已到期', tone: 'warning' }
          : batch.runtime.status === 'deleted'
            ? { label: '未执行', detail: '规则已删除', tone: 'muted' }
            : { label: '未执行', detail: '规则已暂停', tone: 'muted' };
      const reportRows = records.map(batch => {
        const status = executionStatus(batch);
        return h('tr', { key: 'batch:' + batch.application.id }, [
        h('td', null, [el('strong', '', batch.application.name), el('small', 'em-sub', conditionsText(batch.application))]),
        h('td', null, SAMPLE_TIME),
        h('td', null, [el('span', `rd-type-badge ${batch.application.kind || 'unknown'}`, reminderTypeText(batch.application))]),
        h('td', null, `${batch.checked} 条素材`),
        h('td', null, platforms[batch.application.platforms?.[0]] || '—'),
        h('td', null, [tag(String(batch.result.hits.length), batch.result.hits.length ? 'good' : 'muted')]),
        h('td', null, [tag(String(batch.result.unmatched.length), 'muted')]),
        h('td', null, [tag(String(batch.result.excluded.length), batch.result.excluded.length ? 'warning' : 'muted')]),
        h('td', { title: status.detail }, [tag(status.label, status.tone)]),
        h('td', null, [button('查看执行明细', () => { report.value = { ...batch.application, runBatch: batch }; }, 'text')]),
        ]);
      });
      const statusHeading = el('span', 'rm-table-head-help', ['执行状态', help('表示本次演示执行是否实际运行。规则处于暂停、到期或删除状态时不会执行；命中结果分别查看前面的命中、未命中和数据不足。', '执行状态说明')]);
      return el('div', 'rm-run-report', [
        el('section', 'em-card rm-run-summary', [el('header', 'rm-report-heading', [el('div', '', [el('h2', '', '规则报告'), help('规则报告按一次规则执行汇总；数据不足只表示当前快照无法可靠判断，不代表素材质量差。', '规则报告说明')]), el('small', 'em-muted', `${SAMPLE_TIME} · 最近一次演示执行`)]), el('div', 'rm-run-stats', stats.map(([label, value, kind]) => el('article', `rm-run-stat ${kind}`, [el('span', '', label), el('strong', '', String(value))])))]),
        el('section', 'em-card rm-run-records', [el('header', 'rm-report-heading', [el('h2', '', '规则执行记录'), el('small', 'em-muted', `共 ${records.length} 条`)]), el('div', 'rm-run-filters rm-unified-toolbar', [filterDropdown('媒介平台', platformFilter.value, [['all','全部平台'], ...platformOptions.value.map(key => [key, platforms[key] || key])], value => { platformFilter.value = value; advertiserFilter.value = 'all'; }), filterDropdown('广告主账户', advertiserFilter.value, [['all','全部广告主'], ...advertiserOptions.value.map(([id, name]) => [id, name])], value => advertiserFilter.value = value, true), filterDropdown('创建日期', createdFilter.value, [['all','全部时间'],['last7','近 7 天'],['last30','近 30 天']], value => createdFilter.value = value), input(reportQuery.value, value => reportQuery.value = value, '搜索规则、素材名称或 ID'), select(reportKind.value, value => reportKind.value = value, [['all','提醒类型：全部'], ...Object.entries(kindLabels)], '提醒类型'), select(reportResult.value, value => reportResult.value = value, [['all','执行结果：全部'],['hit','有命中提醒'],['clear','无命中'],['insufficient','含数据不足'],['paused','未执行']], '执行结果')]), table(['规则名称','执行时间','提醒类型','检查素材','媒介平台','命中','未命中','数据不足',statusHeading,'操作'], reportRows, '当前筛选下没有规则执行记录')]),
      ]);
    }
    function listView() {
      const allowed = canCreateRule(employee.value);
      const isTemplates = manageView.value === 'templates';
      const canCreateTemplate = ['platform','admin1','admin2'].includes(actorProfile(employee.value).role);
      const changeView = value => { manageView.value = value; advertiserFilter.value = 'all'; query.value = ''; router.replace(ruleRoute({})); };
      const detailTrigger = (title, subtitle, open, ariaLabel) => el('button', 'rm-scope-detail-trigger', [el('strong', '', title), el('small', '', subtitle), el('i', '', '', { 'aria-hidden': 'true' })], { type: 'button', onClick: open, 'aria-label': ariaLabel });
      const accountsForRule = item => accountScope(employee.value, employee.value.actor, new Set(), 'material_performance')
        .filter(account => item.platforms?.includes(account.platform))
        .filter(account => item.companyMode !== 'specified' || item.companyIds?.includes(account.company_id))
        .filter(account => item.advertiserMode !== 'specified' || item.advertiserIds?.includes(account.id));
      const templateRecords = definitions.value.filter(item => item.template !== false && !item.deletedAt).filter(item => {
        const createdDays = item.createdAt ? Math.floor((new Date(`${SAMPLE_TIME.slice(0, 10)}T00:00:00Z`) - new Date(`${item.createdAt}T00:00:00Z`)) / 86400000) : Infinity;
        const matchesCreated = createdFilter.value === 'all' || (createdFilter.value === 'last7' && createdDays >= 0 && createdDays < 7) || (createdFilter.value === 'last30' && createdDays >= 0 && createdDays < 30);
        return (platformFilter.value === 'all' || item.platforms?.includes(platformFilter.value)) && matchesCreated && (kind.value === 'all' || item.kind === kind.value) && `${item.name} ${conditionsText(item)} ${reminderTypeText(item)}`.includes(query.value.trim());
      }).map(item => ({ ...item, _template: true, advertiserMode: 'all', advertiserIds: [], scopeMode: 'all', materialIds: [], channels: item.defaultChannels || ['site'], frequency: item.defaultFrequency || 'hourly', sendNotifications: true }));
      const templateUsage = definition => {
        const linked = linkedRules(definition);
        return { rules: linked.length, people: new Set(linked.map(application => application.owner)).size, mine: linked.filter(application => application.owner === employee.value.actor).length };
      };
      const typeTag = item => el('span', `employee-tag ${item.kind === 'risk' ? 'risk' : item.kind === 'opportunity' ? 'good' : item.kind === 'volume' ? 'volume' : 'custom'}`, reminderTypeText(item), { title: kindExplanations[item.kind] || '自定义：由创建者定义提醒类型名称与适用场景；所有自定义类型统一使用紫色标签。' });
      const platformTypeSummary = item => {
        const platform = item.platforms?.[0];
        if (platform !== 'qianchuan') return item.materialTypes?.length ? item.materialTypes.map(type => materialTypeLabel(platform, type)).join('、') : '全部素材类型';
        const reportTypes = item.qianchuanReportTypes?.length ? item.qianchuanReportTypes : qianchuanReportTypeOptions.map(([key]) => key);
        const reportText = reportTypes.length === qianchuanReportTypeOptions.length ? '全部 5 类报表' : reportTypes.map(qianchuanReportTypeLabel).join('、');
        const available = qianchuanMaterialTypesForReports(reportTypes);
        const selected = (item.materialTypes || []).filter(type => available.some(([key]) => key === type));
        const materialText = available.length ? `素材：${(selected.length ? selected : available.map(([key]) => key)).map(type => materialTypeLabel('qianchuan', type)).join('、')}` : '无需素材类型';
        return `${reportText} · ${materialText}`;
      };
      const templateRows = templateRecords.map(item => {
        const usage = templateUsage(item);
        const linked = linkedRules(item);
        const memberUsage = [...Map.groupBy(linked, application => application.owner)].map(([owner, rules]) => ({ owner, name: personName(owner), rules }));
        const channels = item.defaultChannels || ['site'];
        const canEdit = canEditDefinition(employee.value, item);
        const canDelete = canDeleteDefinition(employee.value, item);
        return h('tr', { key: `template:${item.id}` }, [
          h('td', { class: 'rm-toggle-cell' }, [definitionSwitch(item)]),
          h('td', null, [el('div', 'rm-rule-name', [el('strong', '', item.name), typeTag(item)]), el('small', 'em-sub', conditionsText(item))]),
          h('td', null, [el('strong', '', platforms[item.platforms?.[0]] || '—'), el('small', 'em-sub', platformTypeSummary(item))]),
          h('td', null, item.createdAt || '—'),
          h('td', null, personName(item.owner)),
          h('td', null, [detailTrigger(`${usage.people} 人 · ${usage.rules} 条规则`, usage.mine ? `我已复用 ${usage.mine} 条` : usage.rules ? '查看使用成员' : '尚未复用', () => { scopeDetail.value = { type: 'members', title: `${item.name} · 成员使用情况`, summary: `${usage.people} 个成员共生成 ${usage.rules} 条独立规则`, members: memberUsage }; }, `查看${item.name}的成员使用详情`)]),
          h('td', null, channels.map(channel => channel === 'site' ? '规则报告' : '企业微信').join('、')),
          h('td', null, el('span', `employee-tag ${item.enabled !== false ? 'good' : 'muted'}`, item.enabled !== false ? '可复用' : '已停用')),
          h('td', null, [el('div', 'em-actions', [
            canEdit ? button('编辑', () => routeAction('edit-template', item.id), 'text rm-action-edit') : null,
            item.enabled !== false && canApplyDefinition(employee.value, item) && canReuseRule(employee.value) ? button('复用', () => routeAction('reuse-definition', item.id), 'text rm-action-reuse', { title: '沿用模板的条件、运行时间与企业微信设置，再选择自己有权的广告主和素材范围。' }) : null,
            canDelete ? button('删除', () => requestDelete('template', item), 'text danger', { title: usage.rules ? '仅删除模板，已生成规则不受影响' : '删除企业模板' }) : null,
          ])]),
        ]);
      });
      const ruleRows = rows.value.map(item => {
        const labels = platformObjects[item.platforms?.[0]] || { account: '业务账户', material: '投放对象' };
        const accounts = accountsForRule(item);
        const runtime = applicationRuntimeState(store.value, item);
        const runtimeLabel = runtime.status === 'paused' ? '已暂停' : runtime.status === 'out-of-range' ? '已过期' : '运行中';
        return h('tr', { key: `application:${item.id}` }, [
          h('td', { class: 'rm-toggle-cell' }, [enabledSwitch(item, !canToggleApplication(employee.value, item), null, '当前账号只能查看该规则')]),
          h('td', null, [el('div', 'rm-rule-name', [el('strong', '', item.name), typeTag(item)]), el('small', 'em-sub', conditionsText(item))]),
          h('td', null, platforms[item.platforms?.[0]] || '—'),
          h('td', null, [detailTrigger(`${accounts.length} 个${labels.account}`, item.advertiserMode === 'specified' ? '指定范围' : '全部有权范围', () => { scopeDetail.value = { type: 'advertisers', title: `${item.name} · ${labels.account}`, summary: `当前规则覆盖 ${accounts.length} 个${labels.account}`, accounts }; }, `查看${item.name}覆盖的${labels.account}详情`)]),
          h('td', null, item.createdAt || '—'),
          h('td', null, item.scopeMode === 'all' ? `全部${labels.material}` : `${item.materialIds.length} 条${labels.material}`),
          h('td', null, personName(item.owner)),
          h('td', null, item.channels.map(channel => channel === 'site' ? '规则报告' : '企业微信').join('、')),
          h('td', null, [el('span', `employee-tag ${runtime.active ? 'good' : 'muted'}`, runtimeLabel), el('small', 'em-sub', scheduleLabel(item))]),
          h('td', null, [el('div', 'em-actions', [
            canEditApplication(employee.value, item) ? button('编辑', () => routeAction('edit-rule', item.id), 'text rm-action-edit') : null,
            canDeleteApplication(employee.value, item) ? button('删除', () => requestDelete('rule', item), 'text danger', { title: '删除后停止监控，历史规则报告继续保留' }) : null,
          ])]),
        ]);
      });
      const toolbar = el('div', 'rm-list-filters rm-unified-toolbar', [
        input(query.value, value => query.value = value, isTemplates ? '搜索模板或条件' : '搜索规则或条件'),
        filterDropdown('媒介平台', platformFilter.value, [['all','全部平台'], ...platformOptions.value.map(key => [key, platforms[key] || key])], value => { platformFilter.value = value; advertiserFilter.value = 'all'; }),
        !isTemplates ? filterDropdown('广告主账户', advertiserFilter.value, [['all','全部广告主'], ...advertiserOptions.value.map(([id, name]) => [id, name])], value => advertiserFilter.value = value, true) : null,
        filterDropdown('创建日期', createdFilter.value, [['all','全部时间'],['last7','近 7 天'],['last30','近 30 天']], value => createdFilter.value = value),
        select(kind.value, value => kind.value = value, [['all','提醒类型：全部'], ...Object.entries(kindLabels)], '提醒类型'),
      ]);
      return el('div', `rm-root ${managing.value ? 'manage' : 'report-only'}`, [
        el('header', 'rm-list-head', [
          el('div', '', [el('div', 'rm-view-switch', [button('模板', () => changeView('templates'), isTemplates ? 'active' : '', { 'aria-pressed': String(isTemplates) }), button('规则', () => changeView('rules'), !isTemplates ? 'active' : '', { 'aria-pressed': String(!isTemplates) })])]),
          el('div', 'rm-list-head-actions', [button('使用边界说明', () => guideOpen.value = true, ''), isTemplates ? (canCreateTemplate ? button('新增企业模板', () => routeAction('new-template'), 'primary') : null) : (allowed ? button('新增规则', () => routeAction('new-rule'), 'primary') : null)]),
        ]),
        el('section', 'em-card', [
          toolbar,
          isTemplates
            ? table(['开关','企业模板','平台与报表 / 素材类型','创建日期','创建者','成员使用情况','提醒去向','状态','操作'], templateRows, '当前筛选下没有可复用的企业模板')
            : table(['开关','规则','媒介平台','广告主账户','创建日期','素材范围','创建者','提醒去向','状态','操作'], ruleRows, '当前筛选下没有告警规则'),
        ]),
        scopeDetail.value ? scopeDetailDrawer() : null,
      ]);
    }
    function scopeDetailDrawer() {
      const detail = scopeDetail.value;
      if (!detail) return null;
      const companyGroups = detail.type === 'advertisers'
        ? [...Map.groupBy(detail.accounts, account => account.company_id || account.company_name || 'unlinked').entries()].map(([key, accounts]) => ({
            key,
            name: accounts[0]?.company_name || '未关联公司',
            id: accounts[0]?.company_id || '',
            accounts,
          }))
        : [];
      const body = detail.type === 'members'
        ? [
            el('div', 'rm-scope-detail-summary', [el('strong', '', detail.summary), el('p', 'em-muted', '复用模板后生成独立规则；成员后续修改不会反向改变企业模板。')]),
            detail.members.length
              ? el('div', 'rm-scope-detail-list', detail.members.map(member => el('article', 'rm-scope-detail-item member', [el('div', 'rm-scope-avatar', member.name.split('（')[0].slice(0, 2)), el('div', '', [el('strong', '', member.name), el('small', 'em-muted', `${member.rules.length} 条规则`), el('p', '', member.rules.map(rule => rule.name).join('、'))])])) )
              : empty('暂无成员使用', '当前还没有成员复用该模板。'),
          ]
        : [
            el('div', 'rm-scope-detail-summary', [el('strong', '', detail.summary), el('p', 'em-muted', '账户范围随当前规则配置及账号的数据权限展示。')]),
            detail.accounts.length
              ? el('div', 'rm-company-tree', companyGroups.map(company => el('section', 'rm-company-group', [
                  el('header', 'rm-company-head', [
                    el('div', 'rm-company-mark', '司', { 'aria-hidden': 'true' }),
                    el('div', '', [el('strong', '', company.name), company.id ? el('small', 'em-muted', `公司 ID：${company.id}`) : el('small', 'em-muted', '暂未关联公司主体')]),
                    el('span', '', `${company.accounts.length} 个账户`),
                  ]),
                  el('div', 'rm-company-accounts', company.accounts.map(account => el('article', 'rm-scope-detail-item advertiser', [
                    el('div', `rm-account-source ${account.platform || 'unknown'}`, (platforms[account.platform] || '平台').slice(0, 1)),
                    el('div', '', [el('strong', '', account.name || account.advertiser_id || account.id), el('small', 'em-muted', `${platforms[account.platform] || account.platform || '—'} · ${account.advertiser_id || account.id}`)]),
                  ]))),
                ])))
              : empty('暂无广告主账户', '当前规则范围内没有可查看的广告主账户。'),
          ];
      return drawer(detail.title, body, [], () => { scopeDetail.value = null; }, { overlayClass: 'em-overlay rm-scope-detail-overlay', drawerClass: 'em-drawer rm-scope-detail-drawer' });
    }
    function permissionGuide() {
      const currentRole = actorProfile(employee.value).role;
      return drawer('模板与规则使用边界', [
        el('section', 'rm-boundary-current', [tag(`当前身份：${roles[currentRole] || currentRole}`, 'shared'), el('p', '', '一级管理员拥有全组织模板与规则的查看、编辑和开关权限；二级管理员管理自己及下属成员范围；成员管理自己的规则。')]),
        el('section', 'rm-boundary-section', [el('h3', '', '三层权限范围'), el('div', 'rm-boundary-roles', [
          el('article', '', [el('strong', '', '一级管理员'), el('p', '', '查看全组织所有模板与规则；可编辑、启停其他人的配置，并管理模板。')]),
          el('article', '', [el('strong', '', '二级管理员'), el('p', '', '查看自己和所管理成员的模板与规则；可编辑自己的配置，并可启停下属成员的配置。')]),
          el('article', '', [el('strong', '', '成员'), el('p', '', '查看、编辑和启停自己的规则；复用模板后仍可修改条件数值、时间、范围与企业微信配置。')]),
        ])]),
        el('section', 'rm-boundary-section', [el('h3', '', '操作权限矩阵'), el('div', 'rm-boundary-matrix', [
          el('div', 'rm-boundary-matrix-row head', [el('strong', '', '操作'), el('strong', '', '一级管理员'), el('strong', '', '二级管理员'), el('strong', '', '成员')]),
          el('div', 'rm-boundary-matrix-row', [el('span', '', '新增企业模板'), el('span', 'allowed', '可以'), el('span', 'allowed', '可以'), el('span', 'denied', '不可以')]),
          el('div', 'rm-boundary-matrix-row', [el('span', '', '复用模板（生成规则）'), el('span', '', '所有可见模板'), el('span', '', '上级共享或自己创建'), el('span', '', '管理员共享模板')]),
          el('div', 'rm-boundary-matrix-row', [el('span', '', '新增规则'), el('span', 'allowed', '有素材权限即可'), el('span', 'allowed', '有素材权限即可'), el('span', 'allowed', '有素材权限即可')]),
          el('div', 'rm-boundary-matrix-row', [el('span', '', '编辑模板 / 规则'), el('span', '', '全组织'), el('span', '', '仅自己创建'), el('span', '', '自己的全部规则')]),
          el('div', 'rm-boundary-matrix-row', [el('span', '', '启停模板 / 规则'), el('span', '', '全组织'), el('span', '', '自己与下属成员'), el('span', '', '自己的全部规则')]),
          el('div', 'rm-boundary-matrix-row', [el('span', '', '删除模板 / 规则'), el('span', '', '全组织'), el('span', '', '仅自己创建'), el('span', '', '自己的全部规则')]),
          el('div', 'rm-boundary-matrix-row', [el('span', '', '查看范围'), el('span', '', '全组织'), el('span', '', '自己与下属成员'), el('span', '', '仅自己')]),
        ]), el('p', 'rm-boundary-reason', '模板只是快速配置起点；规则保存后归当前创建者独立管理。')]),
        el('section', 'rm-boundary-section', [el('h3', '', '模板与规则的边界'), el('div', 'rm-boundary-compare', [
          el('article', '', [tag('模板', 'shared'), el('strong', '', '可复用的企业标准'), el('p', '', '只设置平台、报表 / 素材类型、判断条件、运行时间和企业微信设置，不绑定具体公司、广告主或素材。只有管理员可以创建。')]),
          el('article', '', [tag('规则', 'good'), el('strong', '', '实际运行的业务配置'), el('p', '', '必须绑定当前用户有权的广告主和素材范围。所有有素材权限的用户都可创建，但规则本身不能再次被复用。')]),
        ])]),
        el('section', 'rm-boundary-section', [el('h3', '', '巨量千川范围口径'), el('ol', 'rm-boundary-flow compact', [
          el('li', '', [el('strong', '', '报表类型'), el('span', '', '全域素材、全域直播间、全域商品、标准素材、标准直播间画面是 5 个独立报表视图，默认全选。')]),
          el('li', '', [el('strong', '', '素材类型'), el('span', '', '全域素材支持标题、视频；标准素材支持标题、图片、视频。直播间和商品类报表无需二级素材类型。')]),
          el('li', '', [el('strong', '', '执行顺序'), el('span', '', '先按报表类型确定检查对象，再仅对支持的报表应用素材类型筛选，避免把报表视图误当成素材类型。')]),
        ])]),
        el('section', 'rm-boundary-section', [el('h3', '', '复用流程'), el('ol', 'rm-boundary-flow', [
          el('li', '', [el('strong', '', '1 选择模板'), el('span', '', '只显示已启用、已共享且适配本人平台与素材权限的模板。')]),
          el('li', '', [el('strong', '', '2 选择业务范围'), el('span', '', '复用者仅选择自己有权的广告主和素材，不会把广告主追加回模板。')]),
          el('li', '', [el('strong', '', '3 按需修改'), el('span', '', '可继续修改提醒类型、条件数值、运行时间、业务范围和企业微信接收配置。')]),
          el('li', '', [el('strong', '', '4 生成独立规则'), el('span', '', '保存后不再跟随模板内容或开关变化；模板停用只会停止新的复用。')]),
        ])]),
        el('section', 'rm-boundary-section', [el('h3', '', '删除边界与流程'), el('div', 'rm-boundary-delete-grid', [
          el('article', '', [tag('删除规则', 'good'), el('strong', '', '创建者可以直接删除自己的规则'), el('p', '', '确认删除后立即停止后续监控；不影响源模板、其他人的规则、广告主权限或素材。已产生的规则报告继续保留，并显示“规则已删除”。')]),
          el('article', '', [tag('删除模板', 'shared'), el('strong', '', '删除模板不影响已生成规则'), el('p', '', '模板只是配置副本来源；删除后停止继续复用，成员已经保存的规则仍按自己的配置运行。')]),
        ])]),
      ], [button('我知道了', () => guideOpen.value = false, 'primary')], () => guideOpen.value = false);
    }
    function deleteDrawer() {
      const target = pendingDelete.value;
      if (!target) return null;
      const isTemplate = target.type === 'template', usage = isTemplate ? linkedRules(target.item) : [];
      return drawer(isTemplate ? '删除企业模板' : '删除规则', [
        el('section', 'rm-delete-summary', [el('strong', '', target.item.name), el('p', 'em-muted', isTemplate ? `模板删除后不能继续复用；已基于它生成的 ${usage.length} 条独立规则不受影响。` : '规则删除后立即停止监控，不影响模板或其他人的规则；历史规则报告继续保留。')]),
        el('div', 'rm-delete-confirm', [el('strong', '', '删除范围'), el('p', '', isTemplate ? '仅删除当前企业模板，不删除已生成规则、广告主权限或历史报告。' : '仅删除当前规则及后续监控，不删除素材、广告主权限或模板。')]),
      ], [button('取消', () => pendingDelete.value = null), button('确认删除', confirmDelete, 'danger')], () => pendingDelete.value = null);
    }
    return () => draft.value ? editorView() : managing.value ? el('div', 'rm-rule-page', [listView(), guideOpen.value ? permissionGuide() : null, pendingDelete.value ? deleteDrawer() : null]) : el('div', 'rm-rule-page', [runReportView(), report.value ? reportDrawer() : null]);
  },
};
