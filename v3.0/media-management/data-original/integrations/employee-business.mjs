import { access, actorProfile, effectiveFeatures, features, readState, setPreviewActor, watchState } from './employee-state.mjs?v=dataset5';

export function createEmployeeBusiness({ h, ref, computed, onMounted, onUnmounted, useRouter, useRoute }) {
  const el = (tag, cls, children, props = {}) => h(tag, { class: cls, ...props }, children && typeof children === 'object' && !Array.isArray(children) ? [children] : children);
  const button = (label, onClick, cls = '') => el('button', `pe-button ${cls}`, label, { type: 'button', onClick });
  return {
    name: 'EmployeeBusinessEntry',
    props: { compact: Boolean },
    setup(props) {
      const router = useRouter(), route = useRoute(), state = ref(readState()), notice = ref('');
      let stop;
      onMounted(() => { stop = watchState(next => { state.value = next; notice.value = ''; }); });
      onUnmounted(() => stop?.());
      const platform = computed(() => route.query.platform === 'qianchuan' ? 'qianchuan' : route.query.platform === 'local' ? 'local' : 'ocean_engine');
      const current = computed(() => access(state.value, platform.value));
      const media = (tab) => router.push({ path: '/media-management', query: { from: 'ad-data', ...(platform.value !== 'ocean_engine' ? { platform: platform.value } : {}), ...(tab ? { tab } : {}) } });
      const controls = () => el('label', 'employee-preview-identity', [
        el('span', '', '预览身份'),
        h('select', { 'aria-label': '预览身份', value: ({ 'new-user': 'unassigned', 'preview-platform': 'platform', 'preview-admin1': 'admin1', 'preview-admin2': 'admin2', 'preview-member': 'member' })[state.value.actor],
          onChange: e => setPreviewActor(e.target.value) }, [
          ['unassigned', '未分配成员'], ['platform', '平台管理员'], ['admin1', '一级管理员'], ['admin2', '二级管理员'], ['member', '已分配成员'],
        ].map(([value, label]) => h('option', { value }, label))),
      ]);
      return () => {
        if (props.compact) return el('div', 'employee-header-actions', [controls()]);
        const value = current.value;
        const copy = {
          feature: ['真实投放数据尚未开通', '请联系上级管理员开通功能并分配广告主，完成后刷新权限。'],
          unassigned: [value.canAuthorize ? '还没有可用的媒介数据' : '暂未分配广告主数据范围', value.canAuthorize ? '请前往用户中心的媒介管理完成授权、获取广告主或数据范围分配。' : '请联系上级管理员分配广告主，分配后即可查看数据。'],
          pending: ['广告主已分配，暂未开放报表数据', `请由一级管理员在媒介管理中${platform.value === 'local' ? '开启同步' : '设置订阅'}。分配广告主不会自动开启数据更新。`],
          history: ['当前来源仅可查看历史数据', '来源已退订、停止同步或断开授权。历史数据可按截止范围查看，暂不判断后续起量与效果异常。'],
          live: ['广告主范围已分配', '数据按当前账号的广告主和功能权限展示；授权、订阅及人员赋权统一在媒介管理中维护。'],
        }[value.kind];
        return el('div', 'performance-business-entry', [
          el('div', 'pe-entry-grid', [
            el('section', 'pe-access-card', [
              el('div', 'pe-entry-copy', [el('h2', '', copy[0]), el('p', '', copy[1]),
                value.kind === 'feature' ? el('span', 'employee-tag', '示例体验') : null,
                notice.value ? el('p', 'employee-action-notice', notice.value, { role: 'status' }) : null]),
              el('div', 'pe-access-actions', [
                button('刷新权限', () => { state.value = readState(); notice.value = '已刷新当前预览身份的权限。'; }, 'secondary'),
                button(value.canAuthorize ? '前往媒介管理' : '查看我的权限', () => media(value.canAuthorize ? undefined : 'grants'), 'text'),
              ]),
            ]),
          ]),
        ]);
      };
    },
  };
}
