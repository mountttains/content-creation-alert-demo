import { C as h, r as ref, h as computed, z as onMounted, ad as onUnmounted, ac as watch, V as useRouter, Y as useRoute, a5 as resolveComponent } from '../commercial-platform/runtime/assets-blue3/index-oddxqlpg.js';
import { readState, watchState, actorProfile, platforms, platformObjects, scope as accountScope } from './employee-state.mjs?v=dataset4';
import { createUI } from './employee-ui.mjs?v=rules18';
import {
  readRules, writeRules, watchRules, availableApplications, availableDefinitions, materialScope, visibleMaterials,
  canCreateRule, canReuseRule, canEditApplication, canViewApplicationResults, blankPersonalRule, validatePersonalRule, trialApplication,
  conditionsText, personName, kindLabels, metrics, metricPlatforms, operators, scheduleLabel, SAMPLE_TIME,
  periodLabels, boardEvents,
} from './reminder-rules.mjs?v=rules34';

const { el, button, input, select, check, field, empty, table, tag, drawer } = createUI(h);
const clone = value => structuredClone(JSON.parse(JSON.stringify(value)));
const toggle = (items, value) => items.includes(value) ? items.filter(item => item !== value) : [...items, value];
const sourceExplanations = {
  '自建规则': '当前账号从零创建并绑定自己的广告主与素材范围，可由创建者编辑和启停。',
  '复用规则': '沿用已有规则生成新的应用范围；成员只能重选本人有权的广告主与素材，不能修改条件和执行策略。',
  '管理员共享': '由管理员创建并共享给成员使用；成员可复用到自己的业务范围，但不能修改条件和执行策略。',
  '成员规则': '成员创建的规则，管理员仅能在权限相交范围内查看和监督。',
};
const kindExplanations = {
  risk: '异常：指标越过风险阈值时提醒，用于尽早发现效果恶化。',
  opportunity: '机会：指标达到可放大的表现条件时提醒，用于发现值得跟进的素材。',
  volume: '起量：当前完整统计窗口达到设定消耗，且高于相邻历史窗口；用于发现投放规模增长，不代表转化效率或素材质量。',
};
const statusExplanations = {
  运行中: '规则处于有效期且已开启；运行频率说明何时检查，不代表此刻一定有命中。',
  已暂停: '规则当前关闭，不会继续产生新的告警；重新开启后按原范围继续检查。',
  可复用: '这是共享条件模板，尚未绑定当前账号的业务范围；复用后会创建独立规则。',
  只读监督: '当前账号可以查看该规则及权限相交的命中，但不能替创建者编辑或启停。',
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
    const draft = ref(null), original = ref(null), reuseSource = ref(null), report = ref(null), trial = ref(null);
    const error = ref(''), query = ref(''), kind = ref('all'), materialQuery = ref(''), materialPage = ref(1), advertiser = ref('all'), advertiserFilter = ref('all'), createdFilter = ref('all'), reportQuery = ref(''), reportKind = ref('all'), reportResult = ref('all');
    const platformFilter = ref('all');
    const applications = computed(() => availableApplications(employee.value, store.value));
    const sharedDefinitions = computed(() => availableDefinitions(employee.value, store.value, false).filter(item => item.owner !== employee.value.actor && item.publishedTo?.includes(employee.value.actor)));
    const allowedMaterials = computed(() => materialScope(employee.value));
    const platformOptions = computed(() => [...new Set([...allowedMaterials.value.map(material => material.platform), ...applications.value.flatMap(item => item.platforms || []), ...sharedDefinitions.value.flatMap(item => item.platforms || [])])]);
    const advertiserFilterQuery = ref('');
    const advertiserOptions = computed(() => [...new Map(allowedMaterials.value.filter(material => platformFilter.value === 'all' || material.platform === platformFilter.value).map(material => [material.advertiserId, `${material.account} · ${material.advertiser}`])).entries()]);
    const rows = computed(() => applications.value.filter(item => {
      const matchesAdvertiser = advertiserFilter.value === 'all' || (item.advertiserMode === 'specified' ? item.advertiserIds?.includes(advertiserFilter.value) : visibleMaterials(employee.value, item).some(material => material.advertiserId === advertiserFilter.value));
      const createdDays = item.createdAt ? Math.floor((new Date(`${SAMPLE_TIME.slice(0, 10)}T00:00:00Z`) - new Date(`${item.createdAt}T00:00:00Z`)) / 86400000) : Infinity;
      const matchesCreated = createdFilter.value === 'all' || (createdFilter.value === 'last7' && createdDays >= 0 && createdDays < 7) || (createdFilter.value === 'last30' && createdDays >= 0 && createdDays < 30);
      const matchesPlatform = platformFilter.value === 'all' || item.platforms?.includes(platformFilter.value);
      return matchesPlatform && matchesAdvertiser && matchesCreated && (kind.value === 'all' || item.kind === kind.value) && `${item.name} ${conditionsText(item)}`.includes(query.value.trim());
    }));
    const idsFromRoute = () => String(route.query.materials || '').split(',').filter(Boolean);
    const managing = computed(() => props.mode === 'manage');
    const ruleRoute = extra => managing.value
      ? { path: '/media-management', query: { tab: 'rules', ...(route.query.platform ? { platform: route.query.platform } : {}), ...extra } }
      : { path: '/ad-data', query: { view: 'alerts', tab: 'rules', ...extra } };
    const goList = () => router.push(ruleRoute({}));
    const routeAction = (action, id = '') => router.push(ruleRoute({ action, ...(id ? { id } : {}) }));
    const closeReport = () => route.query.inspect ? router.replace(ruleRoute({})) : (report.value = null);
    const openMaterial = material => router.push({ path: '/ad-data', query: { view: 'performance', material: material.id, ...(material.platform === 'qianchuan' ? { platform: 'qianchuan' } : {}) } });

    function normalizeRule(item) {
      const next = clone(item), platforms = next.platforms?.length ? next.platforms : ['ocean_engine'];
      return { ...next, platforms: [platforms[0]], advertiserMode: next.advertiserMode || 'all', advertiserIds: next.advertiserIds || [], scopeMode: next.scopeMode || 'specified', sendNotifications: next.sendNotifications !== false, channels: next.channels?.length ? next.channels : ['site'], conditions: next.conditions.map(condition => ({ period: condition.period || 'today', ...condition })) };
    }
    function readRoute() {
      error.value = ''; trial.value = null; draft.value = null; original.value = null; reuseSource.value = null; report.value = null; materialPage.value = 1;
      requestAnimationFrame(() => { window.scrollTo(0, 0); document.querySelector('.ad-data-main')?.scrollTo(0, 0); });
      const action = String(route.query.action || ''), id = String(route.query.id || '');
      if (managing.value && ['new-rule','new-definition','apply'].includes(action) && canCreateRule(employee.value)) { draft.value = blankPersonalRule(employee.value, idsFromRoute()); return; }
      if (managing.value && action === 'reuse-rule') {
        const source = applications.value.find(rule => rule.id === id);
        if (source && canReuseRule(employee.value)) { reuseSource.value = source; draft.value = normalizeRule({ ...blankPersonalRule(employee.value), name: `${source.name}（复用）`, kind: source.kind, platforms: source.platforms, conditions: clone(source.conditions), frequency: source.frequency, channels: clone(source.channels), basedOn: source.definitionId || source.id, sourceOwner: source.owner }); }
        return;
      }
      if (managing.value && action === 'reuse-definition') {
        const source = sharedDefinitions.value.find(rule => rule.id === id);
        if (source && canReuseRule(employee.value)) { reuseSource.value = source; draft.value = normalizeRule({ ...blankPersonalRule(employee.value), name: `${source.name}（复用）`, kind: source.kind, platforms: source.platforms, conditions: clone(source.conditions), frequency: source.defaultFrequency || 'hourly', channels: clone(source.defaultChannels || ['site']), basedOn: source.id, sourceOwner: source.owner }); }
        return;
      }
      if (managing.value && ['edit-rule','edit-application'].includes(action)) {
        const item = applications.value.find(rule => rule.id === id);
        if (item && canEditApplication(employee.value, item)) { original.value = clone(item); draft.value = normalizeRule(item); }
        return;
      }
      if (route.query.inspect) report.value = applications.value.find(rule => rule.id === route.query.inspect) || null;
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
    watch(() => [route.query.action, route.query.id, route.query.materials, route.query.inspect, props.mode], readRoute, { immediate: true });
    watch(() => draft.value && JSON.stringify(draft.value), () => { trial.value = null; error.value = ''; });

    function saveRule() {
      const nextRule = clone(draft.value), current = original.value && store.value.applications.find(item => item.id === original.value.id);
      if (reuseSource.value && actorProfile(employee.value).role === 'member') {
        Object.assign(nextRule, { kind: reuseSource.value.kind, platforms: clone(reuseSource.value.platforms), conditions: clone(reuseSource.value.conditions), frequency: reuseSource.value.frequency || reuseSource.value.defaultFrequency || 'hourly', fixedTime: reuseSource.value.fixedTime || '09:00', channels: clone(reuseSource.value.channels || reuseSource.value.defaultChannels || ['site']) });
      }
      error.value = validatePersonalRule(employee.value, nextRule, current || null);
      if (error.value) return;
      const stamp = Date.now(), id = current?.id || `APP-${stamp}`;
      const currentDefinition = current && store.value.definitions.find(item => item.id === current.definitionId);
      const definitionId = currentDefinition?.owner === employee.value.actor ? currentDefinition.id : `DEF-${stamp}`;
      const definition = { id: definitionId, owner: employee.value.actor, name: nextRule.name, kind: nextRule.kind, platforms: clone(nextRule.platforms), conditions: clone(nextRule.conditions), publishedTo: [], defaultFrequency: nextRule.frequency, defaultQuietHours: nextRule.quietHours, defaultChannels: clone(nextRule.channels), enabled: nextRule.enabled, version: currentDefinition?.owner === employee.value.actor ? currentDefinition.version + 1 : 1, basedOn: nextRule.basedOn || '', createdAt: currentDefinition?.createdAt || new Date().toISOString().slice(0,10) };
      const record = { ...nextRule, id, definitionId, definitionVersion: definition.version, sourceOwner: employee.value.actor, owner: employee.value.actor, viewers: [], recipients: [employee.value.actor], contact: employee.value.actor, createdAt: current?.createdAt || new Date().toISOString().slice(0,10) };
      const next = clone(store.value);
      next.definitions = next.definitions.filter(item => item.id !== definitionId); next.definitions.unshift(definition);
      next.applications = next.applications.filter(item => item.id !== id); next.applications.unshift(record);
      writeRules(next); store.value = next; goList();
    }
    function toggleEnabled(item) {
      if (!canEditApplication(employee.value, item)) return;
      const next = clone(store.value), target = next.applications.find(row => row.id === item.id);
      target.enabled = !target.enabled; writeRules(next); store.value = next;
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
      ]))), button('＋ 新增告警条件', () => item.conditions.length < 8 && item.conditions.push({ period: 'today', field: 'spend', op: 'gte', value: '' }), 'rm-add-condition')]), el('div', 'rm-action-row', [el('strong', '', '则执行如下操作'), h('select', { value: 'notify', 'aria-label': '执行操作' }, [h('option', { value: 'notify' }, '仅发送通知'), h('option', { disabled: true }, '暂停投放（暂未接入）'), h('option', { disabled: true }, '开启投放（暂未接入）'), h('option', { disabled: true }, '调整预算（暂未接入）'), h('option', { disabled: true }, '调整出价（暂未接入）')]), help('创作平台当前读取投放数据并发送提醒，尚未接入媒介平台写权限，因此不能自动启停、调预算或调出价。', '执行能力说明')])];
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
      const platformOptions = [...new Set(allowedMaterials.value.map(material => material.platform))];
      const platformMaterials = allowedMaterials.value.filter(material => item.platforms.includes(material.platform));
      const materialCounts = Map.groupBy(platformMaterials, material => material.advertiserId);
      const advertiserOptions = accountScope(employee.value, employee.value.actor, new Set(), 'material_performance')
        .filter(account => item.platforms.includes(account.platform))
        .map(account => [account.id, `${account.name} · ${account.advertiser_id} · ${materialCounts.get(account.id)?.length || '暂无'}${materialCounts.has(account.id) ? ' 条' : '素材'}`]);
      const applicable = platformMaterials.filter(material => item.advertiserMode !== 'specified' || item.advertiserIds.includes(material.advertiserId));
      const materials = applicable.filter(material => (advertiser.value === 'all' || material.advertiserId === advertiser.value) && `${material.name} ${material.id}`.includes(materialQuery.value.trim()));
      const materialPageSize = 100;
      const materialPageCount = Math.max(1, Math.ceil(materials.length / materialPageSize));
      if (materialPage.value > materialPageCount) materialPage.value = materialPageCount;
      const materialRows = materials.slice((materialPage.value - 1) * materialPageSize, materialPage.value * materialPageSize);
      const dateMode = item.start ? 'range' : 'long';
      const labels = platformObjects[item.platforms[0]] || { account: '业务账户', material: '投放对象' };
      const selectPlatform = value => { item.platforms = [value]; item.advertiserMode = 'all'; item.advertiserIds = []; item.materialIds = []; advertiser.value = 'all'; materialPage.value = 1; };
      const dateAfter = (start, days) => { const date = new Date(`${start}T00:00:00Z`); date.setUTCDate(date.getUTCDate() + days - 1); return date.toISOString().slice(0, 10); };
      const activateRange = () => {
        item.start ||= SAMPLE_TIME.slice(0, 10); item.end ||= dateAfter(item.start, 30);
      };
      const setRangeDays = days => { item.start ||= SAMPLE_TIME.slice(0, 10); item.end = dateAfter(item.start, days); };
      const rangeDays = item.start && item.end ? Math.round((new Date(`${item.end}T00:00:00Z`) - new Date(`${item.start}T00:00:00Z`)) / 86400000) + 1 : 0;
      const memberReuse = actorProfile(employee.value).role === 'member' && Boolean(reuseSource.value);
      return el('div', 'rm-editor giant-form', [
        el('header', 'rm-editor-head', [button('返回规则列表', goList, 'text'), el('div', '', [el('h2', '', original.value ? '编辑告警规则' : reuseSource.value ? '复用告警规则' : '新建告警规则'), el('p', 'em-muted', memberReuse ? '类型、触发条件、频率和通知方式沿用原规则；仅重新选择本人有权的广告主与素材。' : reuseSource.value ? `复用 ${personName(reuseSource.value.owner)} 的条件逻辑，请重新选择自己的广告主和素材范围。` : '规则只作用于当前账号有权查看的素材。')])]),
        section('应用范围', '规则先作用于广告主账户，再按需限定素材；全部广告主只覆盖当前权限范围。', [
          field('应用对象', el('div', 'rm-segments', [button(`应用至${labels.material}`, () => {}, 'rm-segment active')])),
          field('媒介平台', memberReuse
            ? el('div', 'rm-member-locked-rule compact', [el('strong', '', platforms[item.platforms[0]] || item.platforms[0]), el('small', 'em-muted', '沿用管理员规则的媒介平台。')])
            : el('div', 'rm-segments', platformOptions.map(key => segment(key, item.platforms[0], platforms[key] || key, selectPlatform)))),
          field(labels.account, el('div', 'rm-segments', [segment('all', item.advertiserMode, `全部有权${labels.account}`, value => { item.advertiserMode = value; item.advertiserIds = []; item.materialIds = []; materialPage.value = 1; }), segment('specified', item.advertiserMode, `指定${labels.account}`, value => { item.advertiserMode = value; item.materialIds = []; materialPage.value = 1; })])),
          item.advertiserMode === 'specified' ? el('div', 'rm-advertiser-options', advertiserOptions.map(([id, label]) => check(label, item.advertiserIds.includes(id), () => { item.advertiserIds = toggle(item.advertiserIds, id); const nextAdvertisers = new Set(item.advertiserIds); item.materialIds = item.materialIds.filter(materialId => allowedMaterials.value.some(material => material.id === materialId && nextAdvertisers.has(material.advertiserId))); }))) : null,
          field(`${labels.material}范围`, el('div', 'rm-segments', [segment('all', item.scopeMode, `全部${labels.material}`, value => item.scopeMode = value), segment('specified', item.scopeMode, `指定${labels.material}`, value => { item.scopeMode = value; materialPage.value = 1; })])),
          item.scopeMode === 'all' ? el('p', 'rm-helper em-muted', `覆盖所选媒介平台和${labels.account}范围内 ${applicable.length} 条${labels.material}；后续进入该范围的${labels.material}自动纳入。`) : [
            el('div', 'rm-scope-filters', [select(advertiser.value, value => { advertiser.value = value; materialPage.value = 1; }, [['all',`全部已选${labels.account}`], ...[...new Map(applicable.map(material => [material.advertiserId, `${material.account} · ${material.advertiser}`])).entries()]], labels.account), input(materialQuery.value, value => { materialQuery.value = value; materialPage.value = 1; }, `搜索${labels.material}名称或 ID`)]),
            el('div', 'rm-material-picker', [
              el('section', 'rm-material-pane', [el('header', '', [el('strong', '', `${labels.material}列表`), el('div', 'rm-picker-head-actions', [el('span', 'em-muted', `${materials.length} 条`), check('全选本页', materialRows.length > 0 && materialRows.every(material => item.materialIds.includes(material.id)), () => { const ids = materialRows.map(material => material.id); const remove = ids.every(id => item.materialIds.includes(id)); changeMaterials(remove ? item.materialIds.filter(id => !ids.includes(id)) : [...new Set([...item.materialIds, ...ids])].slice(0, 100)); }, materialRows.length === 0)])]), el('div', 'rm-material-options', materialRows.length ? materialRows.map(material => el('div', 'rm-material-option', [check(material.name, item.materialIds.includes(material.id), () => changeMaterials(item.materialIds.includes(material.id) ? item.materialIds.filter(id => id !== material.id) : item.materialIds.length < 100 ? [...item.materialIds, material.id] : item.materialIds)), el('small', 'em-muted', `${material.id} · ${material.account} · ${material.project} · ${material.creator}`)])) : el('p', 'em-muted', '暂无选项')), materialPageCount > 1 ? el('footer', 'rm-picker-pagination', [el('span', 'em-muted', `第 ${materialPage.value} / ${materialPageCount} 页`), button('上一页', () => materialPage.value = Math.max(1, materialPage.value - 1), '', { disabled: materialPage.value === 1 }), button('下一页', () => materialPage.value = Math.min(materialPageCount, materialPage.value + 1), '', { disabled: materialPage.value === materialPageCount })]) : null]),
              el('section', 'rm-material-pane selected', [el('header', '', [el('strong', '', `已选 (${item.materialIds.length}/100)`), button('清空', () => changeMaterials([]), 'text', { disabled: !item.materialIds.length })]), el('div', 'rm-material-options', item.materialIds.length ? item.materialIds.map(id => { const material = applicable.find(row => row.id === id); return material ? el('div', 'rm-selected-material', [el('div', '', [el('strong', '', material.name), el('small', 'em-muted', `${material.id} · ${material.account}`)]), button('移除', () => changeMaterials(item.materialIds.filter(value => value !== id)), 'text danger')]) : null; }).filter(Boolean) : el('p', 'em-muted', '暂不选择'))]),
            ]),
          ],
        ]),
        section('告警规则触发方式', '条件之间为“且”的关系；满足全部条件时才发送提醒。', [
          el('label', 'em-field rm-rule-name-field', [el('span', '', '告警规则名称'), input(item.name, value => item.name = value, '请输入规则名称', { maxlength: 50 })]),
          memberReuse ? field('提醒类型', tag(kindLabels[item.kind], item.kind === 'risk' ? 'risk' : item.kind === 'opportunity' ? 'good' : 'volume')) : field('提醒类型', el('div', 'rm-segments', Object.entries(kindLabels).map(([key, label]) => segment(key, item.kind, label, value => item.kind = value)))),
          ...(memberReuse ? [field('触发条件', el('div', 'rm-member-locked-rule', [el('strong', '', conditionsText(item)), el('small', 'em-muted', '沿用管理员设定的判断逻辑，不可修改。')]))] : conditionsEditor(item)),
        ]),
        section('运行时间', '按创作平台当前数据更新节奏检查；固定时间用于每日提醒。', [
          memberReuse ? field('运行设置', el('div', 'rm-member-locked-rule', [el('strong', '', `${scheduleLabel(item)} · ${item.channels.map(channel => channel === 'site' ? '站内提醒' : '企业微信').join('、')}`), el('small', 'em-muted', '运行时间和通知渠道沿用原规则。')])) : field('运行频率', el('div', 'rm-segments rm-frequency-segments', [['hourly','每小时'],['four-hourly','每 4 小时'],['daily','每天'],['fixed-time','固定时间']].map(([key,label]) => segment(key, item.frequency, label, value => item.frequency = value)))),
          !memberReuse && item.frequency === 'fixed-time' ? field('提醒时间', el('div', 'rm-time-picker', [h(resolveComponent('a-time-picker'), { modelValue: item.fixedTime || '09:00', 'onUpdate:modelValue': value => item.fixedTime = value, format: 'HH:mm', 'value-format': 'HH:mm', 'allow-clear': false, 'aria-label': '每日提醒时间' })])) : null,
          !memberReuse ? field('生效范围', el('div', 'rm-lifetime-control', [
            el('div', 'rm-segments rm-lifetime-segments', [segment('long', dateMode, '长期有效', () => { item.start = ''; item.end = ''; }), segment('range', dateMode, '指定日期', activateRange)]),
            item.start ? el('div', 'rm-range-row', [
              h(resolveComponent('a-range-picker'), { modelValue: [item.start, item.end || item.start], 'onUpdate:modelValue': value => { if (!Array.isArray(value)) return; item.start = value[0] || ''; item.end = value[1] || ''; }, format: 'YYYY-MM-DD', 'value-format': 'YYYY-MM-DD', 'allow-clear': false, 'aria-label': '生效日期范围' }),
              el('div', 'rm-date-presets', [7, 30, 90].map(days => button(`近 ${days} 天`, () => setRangeDays(days), rangeDays === days ? 'active' : ''))),
            ]) : null,
          ])) : null,
          !memberReuse ? field('通知方式', el('div', 'rm-check-list inline', [check('站内提醒', item.channels.includes('site'), () => item.channels = toggle(item.channels, 'site')), check('企业微信提醒', item.channels.includes('wecom'), () => item.channels = toggle(item.channels, 'wecom'))])) : null,
        ]),
        error.value ? el('p', 'rm-save-error', error.value, { role: 'alert' }) : null,
        trial.value ? el('div', 'rm-trial-results', [el('strong', '', `试运行：命中 ${trial.value.hits.length} · 未命中 ${trial.value.unmatched.length} · 暂不判断（数据不足）${trial.value.excluded.length}`), el('p', 'em-muted', `${SAMPLE_TIME}，仅按当前快照计算，不发送通知。暂不判断（数据不足）表示数据尚未满足完整判断条件，不代表素材质量差。`)]) : null,
        el('div', 'rm-savebar giant', [button('提交', saveRule, 'primary'), el('span', 'rm-trial-control', [button('试运行', runTrial), help('按当前可见素材数据快照计算命中、未命中和暂不判断（数据不足）；不会保存规则，也不会发送通知。', '试运行说明')]), button('取消', goList)]),
      ]);
    }
    function reportDrawer() {
      const item = report.value;
      if (!item) return null;
      const result = trialApplication(employee.value, item);
      return drawer('命中规则详情', [
        el('section', 'rm-drawer-summary', [el('div', '', [el('h2', '', item.name), el('p', 'em-muted', `${kindLabels[item.kind]} · ${conditionsText(item)}`)]), item.enabled ? tag('运行中','good') : tag('已暂停','muted')]),
        el('div', 'rm-definition', [el('p', '', `媒介平台：${platforms[item.platforms?.[0]] || '—'}`), el('p', '', `广告主账户：${item.advertiserMode === 'specified' ? `${item.advertiserIds?.length || 0} 个指定广告主` : '全部有权广告主'}`), el('p', '', `应用对象：${item.scopeMode === 'all' ? '全部素材' : `${item.materialIds.length} 个指定素材`}`), el('p', '', `创建日期：${item.createdAt || '—'}`), el('p', '', `运行时间：${scheduleLabel(item)}`), el('p', '', `通知：${item.sendNotifications === false ? '不发送' : item.channels.map(channel => channel === 'site' ? '站内提醒' : '企业微信').join('、')}`)]),
        el('div', 'rm-report-count', [el('span', '', `当前可见素材 ${visibleMaterials(employee.value, item).length} 个 · 命中 ${result.hits.length} · 未命中 ${result.unmatched.length} · 暂不判断（数据不足）${result.excluded.length}`), help('暂不判断（数据不足）不是素材本身的问题，而是当前数据不足以做出可靠判断，例如数据更新延迟、字段缺失、分母为零、统计窗口尚未完整，或广告主只有历史数据。')]),
        el('section', 'rm-hit-section', [el('h3', '', '命中素材'), result.hits.length ? el('div', 'rm-hit-list', result.hits.map(row => el('article', 'rm-hit-row', [el('div', '', [el('strong', '', row.material.name), el('small', 'em-muted', `${row.material.id} · ${row.material.account}`)]), button('查看素材表现', () => openMaterial(row.material), 'text')])) ) : el('p', 'em-muted', '当前快照没有命中素材。')]),
        result.excluded.length ? el('details', 'rm-excluded-list', [el('summary', '', `暂不判断（数据不足）${result.excluded.length} 个`), ...result.excluded.map(row => el('p', 'em-muted', `${row.material.name} · ${row.reason}`))]) : null,
      ], [], closeReport);
    }
    function runReportView() {
      const records = applications.value.flatMap(item => {
        const result = trialApplication(employee.value, item);
        const details = [
          ...result.hits.map(row => ({ item, material: row.material, outcome: '命中提醒', outcomeKey: 'hit', values: row.values })),
          ...result.unmatched.map(row => ({ item, material: row.material, outcome: '未命中', outcomeKey: 'miss', values: row.values })),
          ...result.excluded.map(row => ({ item, material: row.material, outcome: '暂不判断（数据不足）', outcomeKey: 'excluded', reason: row.reason, values: [] })),
        ];
        return details.map(row => ({ ...row, at: SAMPLE_TIME }));
      }).filter(row => (platformFilter.value === 'all' || row.item.platforms?.includes(platformFilter.value))
        && (reportKind.value === 'all' || row.item.kind === reportKind.value)
        && (reportResult.value === 'all' || row.outcomeKey === reportResult.value)
        && `${row.item.name} ${row.material.name} ${row.material.id}`.toLowerCase().includes(reportQuery.value.trim().toLowerCase()));
      const allRecords = applications.value.flatMap(item => {
        const result = trialApplication(employee.value, item);
        return [...result.hits.map(row => ({ item, outcomeKey: 'hit' })), ...result.unmatched.map(row => ({ item, outcomeKey: 'miss' })), ...result.excluded.map(row => ({ item, outcomeKey: 'excluded' }))];
      });
      const stats = [
        ['规则检查对象', allRecords.length, ''],
        ['命中提醒', allRecords.filter(row => row.outcomeKey === 'hit').length, 'risk'],
        ['异常', allRecords.filter(row => row.outcomeKey === 'hit' && row.item.kind === 'risk').length, 'risk'],
        ['机会', allRecords.filter(row => row.outcomeKey === 'hit' && row.item.kind === 'opportunity').length, 'opportunity'],
        ['起量', allRecords.filter(row => row.outcomeKey === 'hit' && row.item.kind === 'volume').length, 'volume'],
        ['暂不判断（数据不足）', allRecords.filter(row => row.outcomeKey === 'excluded').length, 'muted'],
      ];
      const reportRows = records.map(row => h('tr', { key: `${row.item.id}:${row.material.id}:${row.outcomeKey}` }, [
        h('td', null, [el('strong', '', row.item.name), el('small', 'em-sub', row.material.name)]),
        h('td', null, row.at.replace('T', ' ')),
        h('td', null, [el('span', `rd-type-badge ${row.item.kind || 'unknown'}`, kindLabels[row.item.kind] || '未分类')]),
        h('td', null, [el('span', '', row.material.name), el('small', 'em-sub', `${row.material.id} · ${row.material.account}`)]),
        h('td', null, platforms[row.item.platforms?.[0]] || '—'),
        h('td', null, row.reason || conditionsText(row.item)),
        h('td', null, [tag(row.outcome, row.outcomeKey === 'hit' ? 'good' : row.outcomeKey === 'excluded' ? 'muted' : '')]),
        h('td', null, [button('查看规则', () => router.push(ruleRoute({ inspect: row.item.id })), 'text')]),
      ]));
      return el('div', 'rm-run-report', [
        el('section', 'em-card rm-run-summary', [el('header', 'rm-report-heading', [el('div', '', [el('h2', '', '运行数据'), help('按当前可见规则范围内的素材快照计算。暂不判断表示数据更新、字段或统计窗口不足，不代表素材质量差。', '运行数据说明')]), el('small', 'em-muted', `${SAMPLE_TIME.replace('T', ' ')} · 当前演示快照`)]), el('div', 'rm-run-stats', stats.map(([label, value, kind]) => el('article', `rm-run-stat ${kind}`, [el('span', '', label), el('strong', '', String(value))])))]),
        el('section', 'em-card rm-run-records', [el('header', 'rm-report-heading', [el('h2', '', '运行记录'), el('small', 'em-muted', `共 ${records.length} 条`)]), el('div', 'rm-run-filters', [input(reportQuery.value, value => reportQuery.value = value, '搜索规则名称、素材名称或 ID'), filterDropdown('媒介平台', platformFilter.value, [['all','全部平台'], ...platformOptions.value.map(key => [key, platforms[key] || key])], value => platformFilter.value = value), select(reportKind.value, value => reportKind.value = value, [['all','提醒类型：全部'], ...Object.entries(kindLabels)], '提醒类型'), select(reportResult.value, value => reportResult.value = value, [['all','运行结果：全部'],['hit','命中提醒'],['miss','未命中'],['excluded','暂不判断（数据不足）']], '运行结果')]), table(['规则名称','运行时间','提醒类型','运行对象','媒介平台','满足条件','运行结果','操作'], reportRows, '当前筛选下没有运行记录')]),
      ]);
    }
    function listView() {
      const allowed = canCreateRule(employee.value);
      const sharedRows = sharedDefinitions.value.filter(item => (platformFilter.value === 'all' || item.platforms?.includes(platformFilter.value)) && advertiserFilter.value === 'all' && (kind.value === 'all' || item.kind === kind.value) && `${item.name} ${conditionsText(item)}`.includes(query.value.trim())).map(item => ({ ...item, _shared: true, advertiserMode: 'all', advertiserIds: [], scopeMode: 'specified', materialIds: [], channels: item.defaultChannels || ['site'], frequency: item.defaultFrequency || 'hourly', sendNotifications: true }));
      const displayRows = [...rows.value, ...sharedRows];
      const showSwitch = managing.value && displayRows.length > 0;
      const tableRows = displayRows.map(item => {
        const labels = platformObjects[item.platforms?.[0]] || { account: '业务账户', material: '投放对象' };
        const governed = !item._shared && item.owner !== employee.value.actor;
        const ownerRole = actorProfile({ ...employee.value, actor: item.owner }).role;
        const reused = Boolean(item.basedOn || (item.sourceOwner && item.sourceOwner !== item.owner));
      const sourceLabel = item._shared ? '管理员共享'
          : !governed ? reused ? '复用规则' : '自建规则'
          : ownerRole === 'admin2' ? '管理员共享'
          : reused ? '复用规则' : '成员规则';
        return h('tr', { key: `${item._shared ? 'shared' : 'application'}:${item.id}` }, [
        ...(showSwitch ? [h('td', { class: 'rm-toggle-cell' }, [item._shared
          ? enabledSwitch(item, true, false, '共享规则复用后可启用')
          : enabledSwitch(item, !canEditApplication(employee.value, item), null, governed ? '仅创建者可启停' : '')])] : []),
        h('td', null, [el('div', 'rm-rule-name', [el('strong', '', item.name), el('span', `employee-tag ${item.kind === 'risk' ? 'risk' : item.kind === 'opportunity' ? 'good' : 'volume'}`, kindLabels[item.kind], { title: kindExplanations[item.kind], 'aria-label': `${kindLabels[item.kind]}：${kindExplanations[item.kind]}` }), el('span', `employee-tag ${item._shared || governed ? 'shared' : 'muted'} rm-source-tag`, sourceLabel, { title: sourceExplanations[sourceLabel], 'aria-label': `${sourceLabel}：${sourceExplanations[sourceLabel]}` })]), el('small', 'em-sub', conditionsText(item))]),
        h('td', null, platforms[item.platforms?.[0]] || '—'),
        h('td', null, item._shared ? '复用时选择' : item.advertiserMode === 'specified' ? `${item.advertiserIds?.length || 0} 个${labels.account}` : `全部有权${labels.account}`),
        h('td', null, item.createdAt || '—'),
        h('td', null, item._shared ? '未应用' : item.scopeMode === 'all' ? `全部${labels.material}` : `${item.materialIds.length} 条${labels.material}`),
        h('td', null, personName(item.owner)),
        h('td', null, item.sendNotifications === false ? '不发送' : item.channels.map(channel => channel === 'site' ? '站内提醒' : '企业微信').join('、')),
        h('td', null, item._shared ? el('span', 'employee-tag shared', '可复用', { title: statusExplanations['可复用'], 'aria-label': `可复用：${statusExplanations['可复用']}` }) : [el('span', `employee-tag ${item.enabled ? 'good' : 'muted'}`, item.enabled ? '运行中' : '已暂停', { title: statusExplanations[item.enabled ? '运行中' : '已暂停'], 'aria-label': `${item.enabled ? '运行中' : '已暂停'}：${statusExplanations[item.enabled ? '运行中' : '已暂停']}` }), governed ? el('span', 'employee-tag shared', '只读监督', { title: statusExplanations['只读监督'], 'aria-label': `只读监督：${statusExplanations['只读监督']}` }) : null, el('small', 'em-sub', scheduleLabel(item))]),
        h('td', null, [el('div', 'em-actions', [
          !item._shared && canViewApplicationResults(employee.value, item) ? button('查看命中', () => router.push(ruleRoute({ inspect: item.id })), 'text rm-action-view', { title: '查看当前账号有权查看的规则命中素材。' }) : null,
          managing.value && !item._shared && canEditApplication(employee.value, item) ? button('编辑', () => routeAction('edit-rule', item.id), 'text rm-action-edit', { title: '编辑自己创建的规则条件和范围。' }) : null,
          managing.value && canReuseRule(employee.value) ? button(item._shared ? '复用到我的广告主' : '复用', () => routeAction(item._shared ? 'reuse-definition' : 'reuse-rule', item.id), 'text rm-action-reuse', { title: actorProfile(employee.value).role === 'member' ? '沿用管理员规则的条件和执行策略，仅重选本人有权的广告主与素材。' : '复制条件并创建独立规则；广告主与素材范围需按自己的权限重新选择。' }) : null,
        ])]),
      ]);
      });
      return el('div', `rm-root ${managing.value ? 'manage' : 'report-only'}`, [
        el('header', 'rm-list-head', [
          el('div', '', [el('h2', '', managing.value ? '告警规则' : '规则报告')]),
          el('div', 'rm-list-head-actions', [filterDropdown('媒介平台', platformFilter.value, [['all','全部平台'], ...platformOptions.value.map(key => [key, platforms[key] || key])], value => { platformFilter.value = value; advertiserFilter.value = 'all'; }), filterDropdown('广告主账户', advertiserFilter.value, [['all','全部广告主'], ...advertiserOptions.value.map(([id, name]) => [id, name])], value => advertiserFilter.value = value, true), filterDropdown('创建日期', createdFilter.value, [['all','全部时间'],['last7','近 7 天'],['last30','近 30 天']], value => createdFilter.value = value), managing.value && allowed ? button('新建告警规则', () => routeAction('new-rule'), 'primary') : null]),
        ]),
        el('section', 'em-card', [
          el('div', 'rm-list-filters', [
            input(query.value, value => query.value = value, '搜索规则或条件'),
            select(kind.value, value => kind.value = value, [['all','全部类型'], ...Object.entries(kindLabels)], '提醒类型'),
          ]),
          table([...(showSwitch ? ['开关'] : []),'规则','媒介平台','业务账户','创建日期','投放对象','创建者','通知渠道','状态','操作'], tableRows, displayRows.length ? '' : '当前账号还没有告警规则'),
        ]),
      ]);
    }
    return () => draft.value ? editorView() : managing.value ? el('div', 'rm-rule-page', [listView(), report.value ? reportDrawer() : null]) : el('div', 'rm-rule-page', [runReportView(), report.value ? reportDrawer() : null]);
  },
};
