import { C as h, r as ref, h as computed, z as onMounted, ad as onUnmounted, ac as watch, V as useRouter, Y as useRoute } from '../commercial-platform/runtime/assets-blue3/index-oddxqlpg.js';
import { readState, writeState, watchState, access, actorProfile, effectiveFeatures, scope, grantableScope, managedPeople, people, platforms, platformObjects, features, roles, sampleAdvertisers } from './employee-state.mjs?v=dataset5';
import { createEmployeeBusiness } from './employee-business.mjs?v=4';
import { createUI } from './employee-ui.mjs?v=rules19';
import RuleManager from './rule-manager.mjs?v=rules53';

const { el, button, input, select, check, field, empty, table, tag, drawer } = createUI(h);
const Business = createEmployeeBusiness({ h, ref, computed, onMounted, onUnmounted, useRouter, useRoute });
const copy = value => JSON.parse(JSON.stringify(value));
const toggle = (values, value) => values.includes(value) ? values.filter(v => v !== value) : [...values, value];
const matches = (item, query) => `${item.name} ${item.advertiser_id || item.id}`.toLowerCase().includes(query.trim().toLowerCase());
const uniqueScope = items => [...new Map(items.map(item => [`${item.platform}:${item.advertiser_id}`, item])).values()];

export default {
  name: 'EmployeeMediaWorkspace',
  setup() {
    const router = useRouter(), route = useRoute(), state = ref(readState());
    const tab = ref('rules');
    const platform = ref(['qianchuan', 'local'].includes(route.query.platform) ? route.query.platform : 'ocean_engine');
    const selectedConnection = ref(''), search = ref(''), collection = ref(''), principal = ref(''), selected = ref([]), message = ref(''), error = ref(''), panel = ref(null), accountPage = ref(1), accountPageSize = ref(10);
    const roleFilter = ref(''), assignmentSource = ref(''), assignmentPlatform = ref(''), assignmentState = ref('');
    const actor = computed(() => actorProfile(state.value));
    const current = computed(() => access(state.value, platform.value));
    const visibleScope = computed(() => scope(state.value));
    const connections = computed(() => state.value.connections.filter(c => c.platform === platform.value && (
      actor.value.role === 'platform' || c.owner === actor.value.id || visibleScope.value.some(a => a.source === c.id))));
    const connection = computed(() => connections.value.find(c => c.id === selectedConnection.value) || connections.value[0]);
    const advertisers = computed(() => (connection.value?.advertisers || []).filter(a =>
      (current.value.canAuthorize || visibleScope.value.some(v => v.id === a.id)) && matches(a, search.value)
      && (!principal.value || a.source === principal.value)
      && (!collection.value || (collection.value === 'enabled') === (a.enabled && connection.value.active))));
    const accountPageCount = computed(() => Math.max(1, Math.ceil(advertisers.value.length / accountPageSize.value)));
    const pagedAdvertisers = computed(() => advertisers.value.slice((accountPage.value - 1) * accountPageSize.value, accountPage.value * accountPageSize.value));
    let stop;
    onMounted(() => { stop = watchState(next => { state.value = next; panel.value = null; selected.value = []; }); });
    onUnmounted(() => stop?.());
    watch(() => [route.query.tab, route.query.platform], ([nextTab, nextPlatform]) => {
      tab.value = 'rules';
      platform.value = ['qianchuan', 'local'].includes(nextPlatform) ? nextPlatform : 'ocean_engine';
      selected.value = []; selectedConnection.value = ''; search.value = ''; collection.value = ''; principal.value = '';
      roleFilter.value = ''; assignmentSource.value = ''; assignmentPlatform.value = ''; assignmentState.value = '';
      accountPage.value = 1;
    });
    watch(() => [search.value, collection.value, principal.value, selectedConnection.value, platform.value, accountPageSize.value], () => accountPage.value = 1);
    watch(() => advertisers.value.length, () => accountPage.value = Math.min(accountPage.value, accountPageCount.value));
    const navigate = (nextTab, nextPlatform = platform.value) => router.replace({ path: '/media-management', query: {
      ...route.query, tab: nextTab === 'platforms' ? undefined : nextTab, action: undefined, id: undefined, materials: undefined, inspect: undefined, platform: nextPlatform === 'ocean_engine' ? undefined : nextPlatform,
    } });
    function save(change, notice) {
      const next = copy(readState());
      try { change(next); writeState(next); state.value = next; panel.value = null; error.value = ''; message.value = notice; }
      catch (e) { error.value = e.message || '预览记录暂时无法保存。'; }
    }
    function open(type, data = {}) { error.value = ''; panel.value = { type, ...data }; }
    const close = () => { panel.value = null; error.value = ''; };
    const allSelected = () => pagedAdvertisers.value.length > 0 && pagedAdvertisers.value.every(a => selected.value.includes(a.id));
    function chooseAll() {
      const ids = pagedAdvertisers.value.map(a => a.id);
      selected.value = allSelected() ? selected.value.filter(id => !ids.includes(id)) : [...new Set([...selected.value, ...ids])];
    }
    function changeCollection(enabled, ids = selected.value) {
      if (!current.value.canAuthorize || !connection.value?.active || !ids.length) return;
      open('collection', { enabled, ids: [...ids], connectionId: connection.value.id });
    }
    function editGrant(row) {
      if (!current.value.canGrant || row?.to === actor.value.id) return;
      open('grant', { original: row ? copy(row) : null, to: row?.to || '', role: row?.role || (actor.value.role === 'admin2' ? 'member' : 'admin2'),
        features: [...(row?.features || effectiveFeatures(state.value))], advertisers: [...(row?.advertisers || [])],
        sources: [...new Set(grantableScope(state.value).filter(a => row?.advertisers.includes(a.id)).map(a => a.source))], personnel: [...(row?.personnel || [])], query: '', personQuery: '', confirmed: false });
    }
    function submitGrant() {
      const p = panel.value;
      if (!p?.to || !managedPeople(state.value).some(person => person.id === p.to)) { error.value = '请选择可管理范围内的被赋权账户。'; return; }
      if (!p.original && state.value.grants.some(g => g.by === actor.value.id && g.to === p.to)) { error.value = '已向该账户赋权，请通过列表中的“修改”调整。'; return; }
      if (p.sources.length && !p.advertisers.length) { error.value = '已选择广告主来源，请至少选择一个具体广告主。'; return; }
      if (p.original && p.original.role !== p.role && !p.confirmed) { p.confirmRole = true; return; }
      const allowed = new Set(grantableScope(state.value).map(a => a.id)), held = effectiveFeatures(state.value);
      if (p.advertisers.some(id => !allowed.has(id)) || p.features.some(f => !held.includes(f))) { error.value = '当前范围已变化，请重新选择可分配的权限。'; return; }
      const role = actor.value.role === 'admin2' ? 'member' : p.role;
      save(next => {
        const row = { id: p.original?.id || `grant-${Date.now()}`, by: actor.value.id, to: p.to, role,
          features: [...p.features], advertisers: [...p.advertisers], personnel: role === 'member' ? [] : [...p.personnel],
          createdAt: p.original?.createdAt || '2026-10-30 10:00', updatedAt: '2026-10-31 10:30' };
        next.grants = next.grants.filter(g => !(g.by === actor.value.id && g.to === p.to)); next.grants.push(row);
        next.roleAssignments = { ...next.roleAssignments, [p.to]: role };
        if (role === 'member' && p.original?.role !== 'member') next.grants = next.grants.filter(g => g.by !== p.to);
      }, '赋权已保存；其他管理员来源保持原有范围。');
    }
    const status = a => !connection.value?.active ? '仅历史' : a.enabled ? 'live' : a.history ? '仅历史' : 'none';
    function authorization() {
      const c = connection.value, labels = platformObjects[platform.value];
      return [
        el('div', 'em-section-actions', [el('div', 'em-platforms', Object.entries(platforms).map(([key, label]) => button(label, () => navigate(tab.value, key), platform.value === key ? 'selected' : ''))),
          current.value.canAuthorize ? button(`新增 ${platforms[platform.value]}授权`, () => open('authorize', { mode: '', name: '', connectionId: '' }), 'primary') : null]),
        !c ? empty(current.value.canAuthorize ? `尚未接入${platforms[platform.value]}` : `暂无分配的${labels.account}`, `请${current.value.canAuthorize ? '授权平台账号后按需获取' : '联系管理员分配'}${labels.account}。`, current.value.canAuthorize ? button('新增授权', () => open('authorize', { mode: '', name: '', connectionId: '' }), 'primary') : null)
          : el('section', 'em-card', [
            el('div', 'em-connection-picker', [field('授权连接', select(c.id, value => { selectedConnection.value = value; selected.value = []; }, connections.value.map(item => [item.id, item.name]), '授权连接'))]),
            el('header', 'em-connection-head', [el('div', '', [current.value.canAuthorize ? button(c.name, () => open('rename', { connectionId: c.id, name: c.name }), 'connection-name') : el('h2', '', c.name),
              el('p', 'em-muted', `连接 ID：${c.id}`), el('div', 'em-actions', [tag(`共 ${advertisers.value.length} 个${labels.account}`, 'muted'), tag('巨量授权', 'muted'), tag(c.active ? '连接有效' : '链接已断开', c.active ? 'good' : 'muted')])]),
              current.value.canAuthorize ? el('div', 'em-actions', [button(`同步${labels.account}`, () => open('discover', { mode: 'accounts', ids: [], text: '' }), '', { disabled: !c.active }), button('断开链接', () => open('disconnect', { connectionId: c.id }), 'text danger', { disabled: !c.active })]) : null]),
            !c.active ? el('p', 'em-notice warning', '链接已断开，仅可查看历史数据。本来源下的二级管理员和成员也仅保留历史查看。') : null,
            el('p', 'em-muted em-collection-help', current.value.canAuthorize
              ? `“我的${platform.value === 'local' ? '同步设置' : '订阅'}”决定本来源及下级的数据查看范围；${labels.account}分配不会自动${platform.value === 'local' ? '开启同步' : '订阅'}。停止后仅保留截止范围内的数据，其他管理员的独立来源不受影响。`
              : `仅展示分配给你的${labels.account}，订阅与同步由一级管理员管理。`),
            el('div', 'em-filters', [input(search.value, value => search.value = value, `搜索${labels.account}名称或 ID`, { 'aria-label': `搜索${labels.account}` }), select(principal.value, value => principal.value = value, [['', `全部${labels.account}来源`], ...connections.value.map(item => [item.id, item.name])], `${labels.account}来源`), select(collection.value, value => collection.value = value, [['', current.value.canAuthorize && platform.value !== 'local' ? '我的订阅情况' : '全部采集状态'], ['enabled', platform.value === 'local' ? '已开启同步' : '已订阅'], ['disabled', platform.value === 'local' ? '未开启同步' : '未订阅']], '采集状态'), button('刷新', () => { state.value = readState(); message.value = '已刷新本地预览记录。'; }, '', { 'aria-label': '刷新账户' })]),
            current.value.canAuthorize ? el('div', 'em-actions em-batch', [button(platform.value === 'local' ? '批量开启同步' : '批量订阅', () => changeCollection(true), '', { disabled: !selected.value.length || !c.active }), button(platform.value === 'local' ? '批量停止同步' : '批量退订', () => changeCollection(false), '', { disabled: !selected.value.length || !c.active }), button('批量移除', () => open('remove', { ids: [...selected.value], connectionId: c.id }), 'danger', { disabled: !selected.value.length || !c.active }), el('span', 'em-muted', `已选 ${selected.value.length} 个${labels.account}`)]): null,
            table([...(current.value.canAuthorize ? [check('全选本页', allSelected(), chooseAll)] : []), labels.account, `${labels.account} ID`, `${labels.account}来源`, ...(platform.value === 'qianchuan' ? ['关联店铺'] : []), current.value.canAuthorize ? platform.value === 'local' ? '我的同步设置 / 平台状态' : '我的订阅 / 平台状态' : '来源采集状态 / 平台状态', ...(current.value.canAuthorize ? ['操作'] : [])], pagedAdvertisers.value.map(a => h('tr', { key: a.id }, [
              ...(current.value.canAuthorize ? [h('td', null, [check('', selected.value.includes(a.id), () => selected.value = toggle(selected.value, a.id))])] : []),
              h('td', null, [el('strong', '', a.name)]), h('td', null, a.advertiser_id), h('td', null, [el('span', '', c.name), el('small', 'em-sub', c.id)]), ...(platform.value === 'qianchuan' ? [h('td', null, '暂无关联店铺（示例）')] : []),
              h('td', null, [tag(status(a) === 'live' ? platform.value === 'local' ? '已开启同步' : '已订阅' : status(a) === '仅历史' ? '仅历史' : platform.value === 'local' ? '未开启同步' : '未订阅', status(a) === 'live' ? 'good' : 'muted'), el('small', 'em-sub', a.enabled ? '平台已有' + (platform.value === 'local' ? '同步' : '订阅') + '记录' : '暂无平台' + (platform.value === 'local' ? '同步' : '订阅') + '记录')]),
              ...(current.value.canAuthorize ? [h('td', null, [button(a.enabled ? platform.value === 'local' ? '停止同步' : '退出订阅' : platform.value === 'local' ? '开启同步' : '订阅', () => changeCollection(!a.enabled, [a.id]), 'text', { disabled: !c.active }), button('移除', () => open('remove', { ids: [a.id], connectionId: c.id }), 'text danger', { disabled: !c.active })])] : []),
            ]))),
            el('footer', 'em-pagination', [
              el('span', '', `共 ${advertisers.value.length} 个${labels.account}`),
              el('label', '', [el('span', '', '每页'), h('select', { value: String(accountPageSize.value), 'aria-label': `每页${labels.account}数量`, onChange: event => accountPageSize.value = Number(event.target.value) }, [10, 50, 100, 200].map(size => h('option', { value: String(size) }, `${size} 条`)))]),
              el('span', '', `第 ${accountPage.value} / ${accountPageCount.value} 页`),
              button('上一页', () => accountPage.value = Math.max(1, accountPage.value - 1), '', { disabled: accountPage.value === 1 }),
              button('下一页', () => accountPage.value = Math.min(accountPageCount.value, accountPage.value + 1), '', { disabled: accountPage.value === accountPageCount.value }),
            ]),
          ]),
      ];
    }
    function assignments() {
      const managed = new Set(managedPeople(state.value).map(p => p.id));
      const recipients = [...new Set(state.value.grants.filter(g => g.to !== actor.value.id && managed.has(g.to) && (actor.value.role === 'platform' || g.by === actor.value.id)).map(g => g.to))];
      const rowData = [actor.value.id, ...recipients].map(id => {
        const self = id === actor.value.id, person = people.find(p => p.id === id), grant = state.value.grants.find(g => g.to === id && g.by === actor.value.id);
        const scopes = uniqueScope(scope(state.value, id)), featureKeys = effectiveFeatures(state.value, id);
        const role = self ? actor.value.role : state.value.grants.filter(g => g.to === id).at(-1)?.role || 'member';
        const rowState = !scopes.length ? 'pending' : scopes.every(item => item.history || !item.active) ? 'history' : scopes.some(item => item.enabled && item.active) ? 'active' : 'pending';
        return { id, self, person, grant, scopes, featureKeys, role, rowState };
      });
      const rows = rowData.filter(row => {
        const searchable = row.self ? actor.value : row.person || { id: row.id, name: row.id };
        return matches(searchable, search.value)
          && (!roleFilter.value || row.role === roleFilter.value)
          && (!assignmentSource.value || row.scopes.some(item => item.source === assignmentSource.value))
          && (!assignmentPlatform.value || row.scopes.some(item => item.platform === assignmentPlatform.value))
          && (!assignmentState.value || row.rowState === assignmentState.value);
      });
      const sourceOptions = [...new Map(grantableScope(state.value).map(item => [item.source, state.value.connections.find(c => c.id === item.source)])).values()].filter(Boolean);
      return el('section', 'em-card', [
        el('div', 'em-filters em-assignment-filters', [
          input(search.value, value => search.value = value, '搜索账户名称或账号', { 'aria-label': '搜索赋权账户' }),
          select(roleFilter.value, value => roleFilter.value = value, [['', '全部企业角色'], ...Object.entries(roles).filter(([key]) => key !== 'platform')], '企业角色'),
          select(assignmentSource.value, value => assignmentSource.value = value, [['', '全部广告主来源'], ...sourceOptions.map(c => [c.id, c.name])], '广告主来源'),
          select(assignmentPlatform.value, value => assignmentPlatform.value = value, [['', '全部媒介平台'], ...Object.entries(platforms)], '媒介平台'),
          select(assignmentState.value, value => assignmentState.value = value, [['', '全部授权状态'], ['active', '生效中'], ['pending', '待完善'], ['history', '仅历史']], '授权状态'),
          button('刷新', () => { state.value = readState(); message.value = '已刷新本地预览记录。'; }),
          el('span', 'em-muted em-filter-count', actor.value.role === 'member' ? '仅查看本人权限' : '本人 + ' + recipients.length + ' 条赋权记录'),
        ]),
        !current.value.canGrant ? el('p', 'em-readonly-hint', '当前身份仅查看本人已获得的媒介范围与功能权限；变更请联系上级管理员。') : null,
        table(['被赋权账户', '企业角色', '广告主范围', '媒介平台', '功能权限', '授权时间', '授权状态', ...(current.value.canGrant ? ['操作'] : [])], rows.map(row => h('tr', { key: row.id, class: row.self ? 'em-self-row' : '' }, [
          h('td', null, [el('div', 'em-identity-cell', [el('span', 'em-avatar', (row.self ? actor.value.name : row.person?.name || row.id).slice(0, 1)), el('div', '', [el('strong', '', row.self ? actor.value.name : row.person?.name || row.id), row.self ? tag('本人') : null, el('small', 'em-sub', row.id)])])]),
          h('td', null, roles[row.role]),
          h('td', null, row.scopes.length ? [el('details', 'em-scope', [el('summary', '', row.scopes.length + ' 个广告主 · 查看'), el('div', 'em-scope-list', row.scopes.map(a => el('p', '', a.name + ' · ' + a.advertiser_id)))])] : '暂未分配广告主'),
          h('td', null, row.scopes.length ? [...new Set(row.scopes.map(item => item.platform))].map(key => tag(platforms[key], 'muted')) : '—'),
          h('td', null, row.featureKeys.length ? row.featureKeys.map(f => tag(features[f])) : '未开通'),
          h('td', null, row.self ? '系统当前权限' : row.grant?.createdAt || '—'),
          h('td', null, [tag(row.rowState === 'active' ? '生效中' : row.rowState === 'history' ? '仅历史' : '待完善', row.rowState === 'active' ? 'good' : 'muted')]),
          ...(current.value.canGrant ? [h('td', null, !row.self && row.grant ? [button('修改', () => editGrant(row.grant), 'text'), button('撤销', () => open('revoke', { grant: copy(row.grant), ids: [], query: '' }), 'text danger')] : '—')] : []),
        ]))),
        !rows.length ? empty('暂无匹配的赋权记录', '调整筛选条件后重试。') : null,
      ]);
    }
    function panelView() {
      const p = panel.value;
      if (!p) return null;
      const cancel = button('取消', close), alert = error.value ? el('p', 'em-error', error.value, { role: 'alert' }) : null;
      if (p.type === 'authorize') return drawer(p.connectionId ? '重新授权' : `新增 ${platforms[platform.value]}授权`, [
        el('p', 'em-notice', '交互预览：此处演示接入方式与落点，不连接巨量平台，不录入真实凭证。'),
        ...(!p.mode ? [el('div', 'em-methods', [['auto', '自动授权', '在新窗口完成平台授权，原窗口确认接入结果。'], ['manual', '手动粘贴授权链接', '在平台完成授权后，返回原窗口粘贴完整回调链接。'], ['import', '导入授权凭证', '使用已有有效凭证接入，由系统维护后续续期。']].map(([key, title, description]) => button(el('span', '', [el('strong', '', title), el('small', '', description)]), () => p.mode = key))) ] : [
          button('返回接入方式', () => p.mode = '', 'text'), field('示例连接名称', input(p.name, value => p.name = value, '输入连接名称')),
          el('p', 'em-muted', '正式流程应等待平台返回或校验回调／凭证后再确认；此处仅创建本地示例连接。授权完成不会自动获取广告主或订阅。'),
        ]), alert,
      ], [cancel, p.mode ? button('完成示例接入', () => {
        if (!current.value.canAuthorize) return;
        if (!p.name.trim()) { error.value = '请输入示例连接名称。'; return; }
        save(next => { const found = next.connections.find(c => c.id === p.connectionId); if (found) { found.active = true; found.name = p.name.trim(); }
          else next.connections.push({ id: `source-${Date.now()}`, platform: platform.value, owner: actor.value.id, name: p.name.trim(), active: true, advertisers: [] }); }, '示例授权已完成，可以按需获取广告主。');
      }, 'primary') : null], close);
      if (p.type === 'rename') return drawer('编辑连接名称', [field('连接名称', input(p.name, value => p.name = value, '输入连接名称')), alert], [cancel, button('保存', () => { if (!p.name.trim()) { error.value = '名称不能为空。'; return; } save(next => next.connections.find(c => c.id === p.connectionId).name = p.name.trim(), '连接名称已保存。'); }, 'primary')], close);
      if (p.type === 'discover') {
        const candidates = sampleAdvertisers().filter(a => a.platform === platform.value);
        return drawer('同步广告主', [el('div', 'em-actions', [button('按管理账户同步', () => p.mode = 'accounts', p.mode === 'accounts' ? 'selected' : ''), button('按广告主 ID 添加', () => p.mode = 'ids', p.mode === 'ids' ? 'selected' : '')]),
          el('p', 'em-muted', '按需选择广告主；获取广告主不会自动订阅或分配给成员。'),
          p.mode === 'ids' ? field('广告主 ID', el('textarea', '', p.text, { rows: 6, placeholder: '每行一个示例广告主 ID', value: p.text, onInput: e => p.text = e.target.value })) : el('div', 'em-option-list', candidates.map(a => check(`${a.name} · ${a.advertiser_id}`, p.ids.includes(a.id), () => p.ids = toggle(p.ids, a.id)))), alert,
        ], [cancel, button('确认获取示例广告主', () => {
          const values = p.mode === 'ids' ? p.text.split(/[\s,，]+/).filter(Boolean).map(advertiser_id => ({ advertiser_id, name: `示例广告主 ${advertiser_id}`, platform: platform.value })) : candidates.filter(a => p.ids.includes(a.id));
          if (!values.length) { error.value = '请至少选择或输入一个广告主。'; return; }
          const ref = connection.value.id;
          save(next => { const c = next.connections.find(item => item.id === ref); for (const a of values) if (!c.advertisers.some(item => item.advertiser_id === a.advertiser_id)) c.advertisers.push({ ...a, id: `${ref}:${a.advertiser_id}`, source: ref, enabled: false, history: false }); }, '广告主已获取，尚未订阅／开启同步。');
        }, 'primary')], close);
      }
      if (['collection', 'disconnect', 'remove'].includes(p.type)) {
        const title = p.type === 'collection' ? platform.value === 'local' ? p.enabled ? '开启同步确认' : '停止同步确认' : p.enabled ? '加入订阅确认' : '退出订阅确认' : p.type === 'disconnect' ? '断开链接确认' : '移除广告主确认';
        return drawer(title, [el('p', '', p.type === 'remove' ? '仅移除此连接中的所选广告主，并撤回依赖本来源的分配。其他来源保持有效。' : p.type === 'disconnect' ? '断开本来源及其下级的新数据更新，仅保留已有历史数据查看。其他管理员的独立来源不受影响。' : p.enabled ? '开启成功后，本来源及获得此来源分配的下级可查看系统已有数据与后续更新。广告主分配范围保持不变。' : '停止后，本来源及其下级仅可查看截止范围内的历史数据。其他管理员的独立来源不受影响。'), alert], [cancel, button('确认', () => save(next => {
          const c = next.connections.find(item => item.id === p.connectionId);
          if (p.type === 'disconnect') { c.active = false; c.advertisers.forEach(a => { a.history ||= a.enabled; a.enabled = false; }); }
          else if (p.type === 'remove') c.advertisers = c.advertisers.filter(a => !p.ids.includes(a.id));
          else c.advertisers.forEach(a => { if (p.ids.includes(a.id)) { a.history ||= a.enabled; a.enabled = p.enabled; } });
          selected.value = [];
        }, '本地预览记录已更新。'), 'primary')], close);
      }
      if (p.type === 'grant') {
        const available = grantableScope(state.value).filter(a => actor.value.role === 'admin2' || p.sources.includes(a.source));
        const candidates = managedPeople(state.value).filter(person => matches(person, p.personQuery));
        const sourceOptions = [...new Map(grantableScope(state.value).map(a => [a.source, state.value.connections.find(c => c.id === a.source)])).values()].filter(c => c?.active);
        return drawer(p.original ? '修改赋权' : '新增赋权', [
          !grantableScope(state.value).length ? el('p', 'em-notice', '暂无可分配的广告主，可先单独开通功能。完成媒介授权并获取广告主后，再分配查看范围。') : null,
          !p.original ? field('搜索被赋权账户', input(p.personQuery, value => p.personQuery = value, '输入姓名或账号')) : null,
          field('被赋权账户', select(p.to, value => p.to = value, [['', '请选择账户'], ...candidates.map(person => [person.id, `${person.name} · ${person.id}`])], '被赋权账户', { disabled: !!p.original })),
          field('企业角色', select(p.role, value => { p.role = value; p.confirmed = false; p.confirmRole = false; }, Object.entries(roles).filter(([key]) => key !== 'platform' && (actor.value.role !== 'admin2' || key === 'member')), '企业角色')),
          actor.value.role !== 'admin2' ? el('div', 'em-field', [el('span', '', '广告主来源（可留空）'), ...sourceOptions.map(c => check(`${c.name} · ${platforms[c.platform]}`, p.sources.includes(c.id), () => { p.sources = toggle(p.sources, c.id); p.advertisers = p.advertisers.filter(id => grantableScope(state.value).some(a => a.id === id && p.sources.includes(a.source))); }))]) : null,
          (p.sources.length || actor.value.role === 'admin2') ? el('div', 'em-field', [el('span', '', '广告主账户'), input(p.query, value => p.query = value, '搜索广告主名称或 ID'), check('全选当前结果', available.filter(a => matches(a, p.query)).length > 0 && available.filter(a => matches(a, p.query)).every(a => p.advertisers.includes(a.id)), () => { const ids = available.filter(a => matches(a, p.query)).map(a => a.id); p.advertisers = ids.every(id => p.advertisers.includes(id)) ? p.advertisers.filter(id => !ids.includes(id)) : [...new Set([...p.advertisers, ...ids])]; }), el('div', 'em-option-list', available.filter(a => matches(a, p.query)).map(a => check(`${a.name} · ${a.advertiser_id}`, p.advertisers.includes(a.id), () => p.advertisers = toggle(p.advertisers, a.id))))]) : null,
          actor.value.role !== 'admin2' && p.role !== 'member' ? el('div', 'em-field', [el('span', '', '人员分配（可管理人员）'), ...people.filter(person => person.id !== p.to && person.id !== actor.value.id && (p.role === 'admin1' ? person.role !== 'admin1' : person.role === 'member')).map(person => check(person.name, p.personnel.includes(person.id), () => p.personnel = toggle(p.personnel, person.id)))]) : null,
          el('div', 'em-field', [el('span', '', '功能权限'), ...Object.entries(features).map(([key, label]) => check(label, p.features.includes(key), () => p.features = toggle(p.features, key), !effectiveFeatures(state.value).includes(key)))]),
          el('p', 'em-muted', '可不选广告主单独开通功能，也可一并分配广告主范围；只能分配自己拥有的功能。'),
          p.to && state.value.grants.some(g => g.to === p.to && g.by !== actor.value.id) ? el('p', 'em-notice', '该账号还有其他管理员来源。本次只修改当前管理员授予的范围。') : null,
          p.confirmRole ? el('div', 'em-notice warning', [el('strong', '', '确认修改角色'), el('p', '', `将由${roles[p.original.role]}调整为${roles[p.role]}。降为成员会撤回由其发出的赋权；其他来源继续保留。`), check('确认角色调整', p.confirmed, () => p.confirmed = !p.confirmed)]) : null, alert,
        ], [cancel, button('确认赋权', submitGrant, 'primary', { disabled: !p.to || (!!p.confirmRole && !p.confirmed) })], close);
      }
      if (p.type === 'revoke') {
        const values = grantableScope(state.value).filter(a => p.grant.advertisers.includes(a.id));
        return drawer(values.length ? '撤销广告主授权' : '撤销赋权', [el('p', '', '仅撤销当前管理员的分配来源。其他管理员的有效分配继续保留。'), input(p.query, value => p.query = value, '搜索广告主名称或 ID'),
          el('div', 'em-option-list', values.filter(a => matches(a, p.query)).map(a => check(`${a.name} · ${a.advertiser_id}`, p.ids.includes(a.id), () => p.ids = toggle(p.ids, a.id)))), alert,
        ], [cancel, button('确认撤销', () => save(next => { const g = next.grants.find(item => item.id === p.grant.id); if (values.length) g.advertisers = g.advertisers.filter(id => !p.ids.includes(id)); else next.grants = next.grants.filter(item => item.id !== g.id); }, '已撤销所选分配。'), 'danger', { disabled: values.length > 0 && !p.ids.length })], close);
      }
      return null;
    }
    return () => el('div', 'employee-media-page', [
      el('div', 'em-layout', [
        el('header', 'em-topbar', [el('div', '', [el('strong', '', '媒介管理'), el('small', 'em-sub', '授权连接、业务账户数据范围与人员权限')]), el('div', 'em-grow'), h(Business, { compact: true })]),
        el('aside', 'em-sidebar', [el('strong', '', actor.value.role === 'platform' ? '后台管理' : '用户中心'), button('媒介管理', () => {}, 'selected')]),
        el('main', 'em-main', [
          el('header', 'em-page-title', [el('h1', '', '媒介管理'), tag('交互预览 · 本地示例', 'muted')]),
          el('nav', 'em-tabs', [button('媒介授权', () => {}, 'em-tab-disabled', { disabled: true, title: '当前预览仅开放告警相关页面' }), button(actor.value.role === 'member' ? '我的媒介权限' : '媒介赋权', () => {}, 'em-tab-disabled', { disabled: true, title: '当前预览仅开放告警相关页面' }), button('告警配置', () => {}, 'active', { 'aria-current': 'page' }), el('div', 'em-grow')], { 'aria-label': '媒介管理功能' }),
          message.value ? el('div', 'em-notice', message.value, { role: 'status' }) : null,
          h(RuleManager, { mode: 'manage' }),
        ]),
      ], { inert: panel.value ? '' : null }), panelView(),
    ]);
  },
};
