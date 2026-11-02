// Isolated preview data. No employee credentials, production API calls or legacy demo writes.
export const STATE_KEY = 'creation:employee-media-preview:v6';
export const CHANGE_EVENT = 'creation-employee-media-change';
export const platforms = { ocean_engine: '巨量 AD', qianchuan: '巨量千川', local: '巨量本地推' };
export const platformObjects = {
  ocean_engine: { account: '广告主账户', delivery: '项目', material: '广告素材' },
  qianchuan: { account: '千川账户', delivery: '计划', material: '投放素材' },
  local: { account: '经营账户', delivery: '', material: '门店素材' },
};
export const features = { material_performance: '素材表现', reminder_rule_create: '新建告警规则', analytics: '智能分析', viral_agent: '复刻爆款' };
export const roles = { platform: '平台管理员', admin1: '一级管理员', admin2: '二级管理员', member: '成员' };
export const people = [
  { id: 'preview-admin1', name: '一级管理员（示例）', role: 'admin1' },
  { id: 'preview-admin2', name: '二级管理员（示例）', role: 'admin2' },
  { id: 'preview-member', name: '成员（示例）', role: 'member' },
  { id: 'new-user', name: '未分配成员（示例）', role: 'member' },
];
const actorFor = { platform: 'preview-platform', admin1: 'preview-admin1', admin2: 'preview-admin2', member: 'preview-member', unassigned: 'new-user' };
const accountNames = {
  ocean_engine: n => `星河 AD 示例广告主 ${String(n).padStart(3, '0')}`,
  qianchuan: n => `千川示例店铺账户 ${String(n).padStart(3, '0')}`,
  local: n => `本地推示例经营门店 ${String(n).padStart(3, '0')}`,
};
const accountPrefixes = { ocean_engine: 'AD', qianchuan: 'QC', local: 'LOCAL' };
const accountCounts = { ocean_engine: 40, qianchuan: 35, local: 25 };
const companyNames = {
  ocean_engine: ['星河科技（示例）', '远山消费（示例）', '云帆教育（示例）', '青禾生活（示例）'],
  qianchuan: ['星河电商（示例）', '远山服饰（示例）', '云帆家居（示例）', '青禾食品（示例）'],
  local: ['星河到店（示例）', '远山餐饮（示例）', '云帆服务（示例）', '青禾零售（示例）'],
};
const catalog = Object.keys(platforms).flatMap(platform => Array.from({ length: accountCounts[platform] }, (_, index) => {
  const n = index + 1;
  const companyIndex = index % companyNames[platform].length;
  return {
    id: `${platform}:demo-${n}`,
    advertiser_id: `${accountPrefixes[platform]}-${String(n).padStart(6, '0')}`,
    name: accountNames[platform](n),
    platform,
    company_id: `${platform}:company-${companyIndex + 1}`,
    company_name: companyNames[platform][companyIndex],
    source: `source-${platform}`,
    principal_id: `principal-${platform}`,
    principal_name: `${platforms[platform]}授权主体`,
    enabled: n !== 2,
    history: false,
  };
}));
export const sampleAdvertisers = () => structuredClone(catalog);
function normalizeState(state) {
  const accountById = new Map(catalog.map(account => [account.id, account]));
  return {
    ...state,
    connections: state.connections.map(connection => ({
      ...connection,
      advertisers: connection.advertisers.map(account => ({ ...accountById.get(account.id), ...account })),
    })),
  };
}
function seed() {
  return { actor: 'new-user', connections: Object.keys(platforms).map(platform => ({
    id: `source-${platform}`, platform, owner: 'preview-admin1', name: `${platforms[platform]}示例连接`, active: true,
    advertisers: sampleAdvertisers().filter(a => a.platform === platform),
  })), grants: [
    { id: 'seed-admin2', by: 'preview-admin1', to: 'preview-admin2', role: 'admin2', personnel: ['preview-member'], features: ['material_performance', 'reminder_rule_create', 'analytics'], advertisers: catalog.map(a => a.id), createdAt: '2026-10-28 09:20', updatedAt: '2026-10-31 10:30' },
    { id: 'seed-member', by: 'preview-admin2', to: 'preview-member', role: 'member', personnel: [], features: ['material_performance'], advertisers: catalog.map(a => a.id), createdAt: '2026-10-29 14:10', updatedAt: '2026-10-31 10:30' },
  ] };
}
export function readState() {
  try { const s = JSON.parse(localStorage.getItem(STATE_KEY)); if (s?.connections && s?.grants && s?.actor) return normalizeState(s); } catch {}
  return seed();
}
export function writeState(next) {
  localStorage.setItem(STATE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
export function setPreviewActor(profile) { const s = readState(); s.actor = actorFor[profile] || 'new-user'; writeState(s); }
export function actorProfile(s) {
  const person = people.find(p => p.id === s.actor);
  const assigned = s.grants.filter(g => g.to === s.actor).at(-1);
  return { id: s.actor, name: person?.name || '平台管理员（示例）', role: s.actor === 'preview-platform' ? 'platform' : s.roleAssignments?.[s.actor] || assigned?.role || person?.role || 'member' };
}
export function effectiveFeatures(s, username = s.actor, visited = new Set()) {
  if (username === 'preview-platform' || s.connections.some(c => c.owner === username)) return Object.keys(features);
  if (visited.has(username)) return [];
  const seen = new Set([...visited, username]);
  return [...new Set(s.grants.filter(g => g.to === username).flatMap(g => g.features.filter(f => effectiveFeatures(s, g.by, seen).includes(f))))];
}
export function scope(s, username = s.actor, visited = new Set(), application = '') {
  if (visited.has(username)) return [];
  const seen = new Set([...visited, username]);
  const own = s.connections.filter(c => c.owner === username).flatMap(c => c.advertisers.map(a => ({ ...a, active: c.active })));
  const inherited = s.grants.filter(g => g.to === username && (!application || g.features.includes(application)))
    .flatMap(g => (g.by === 'preview-platform' ? s.connections.flatMap(c => c.advertisers.map(a => ({ ...a, active: c.active }))) : scope(s, g.by, seen, application)).filter(a => g.advertisers.includes(a.id)));
  return [...new Map([...own, ...inherited].map(a => [a.id, a])).values()];
}
export function access(s, platform = 'ocean_engine') {
  const actor = actorProfile(s), featureKeys = effectiveFeatures(s), advertisers = scope(s, s.actor, new Set(), 'material_performance').filter(a => a.platform === platform);
  const kind = !featureKeys.includes('material_performance') ? 'feature' : !advertisers.length ? 'unassigned'
    : advertisers.some(a => a.enabled && a.active) ? 'live' : advertisers.some(a => a.history) ? 'history' : 'pending';
  return { actor, featureKeys, advertisers, kind, canAuthorize: ['platform', 'admin1'].includes(actor.role), canGrant: actor.role !== 'member' };
}
export function managedPeople(s) {
  const actor = actorProfile(s);
  if (['platform', 'admin1'].includes(actor.role)) return people.filter(p => p.id !== s.actor);
  const names = new Set(s.grants.filter(g => g.to === s.actor).flatMap(g => g.personnel));
  return people.filter(p => p.id !== s.actor && actorProfile({ ...s, actor: p.id }).role === 'member' && names.has(p.id));
}
export function grantableScope(s) {
  return actorProfile(s).role === 'platform' ? s.connections.flatMap(c => c.advertisers.map(a => ({ ...a, active: c.active }))) : scope(s);
}
export function watchState(callback) {
  const receive = e => { if (e.type === CHANGE_EVENT || e.key === STATE_KEY) callback(readState()); };
  window.addEventListener(CHANGE_EVENT, receive); window.addEventListener('storage', receive);
  return () => { window.removeEventListener(CHANGE_EVENT, receive); window.removeEventListener('storage', receive); };
}
