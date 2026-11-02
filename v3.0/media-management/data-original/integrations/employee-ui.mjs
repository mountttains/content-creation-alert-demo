export function createUI(h) {
  const el = (tag, cls, children, props = {}) => h(tag, { class: cls, ...props }, children && typeof children === 'object' && !Array.isArray(children) ? [children] : children);
  const button = (label, onClick, cls = '', props = {}) => el('button', `em-button ${cls}`, label, { type: 'button', onClick, ...props });
  const input = (value, onInput, placeholder, props = {}) => h('input', { value, onInput: e => onInput(e.target.value), placeholder, ...props });
  const select = (value, onChange, entries, label, props = {}) => h('select', { value, onChange: e => onChange(e.target.value), 'aria-label': label, ...props }, entries.map(([key, name]) => h('option', { value: key }, name)));
  const check = (label, checked, onChange, disabled = false) => el('label', 'em-check', [h('input', { type: 'checkbox', checked, disabled, onChange }), label]);
  const field = (label, content) => el(content?.type === 'div' ? 'div' : 'label', 'em-field', [el('span', '', label), content]);
  const empty = (title, description, action) => el('div', 'em-empty', [el('strong', '', title), el('p', '', description), action]);
  const table = (headers, rows) => el('div', 'em-table-scroll', el('table', 'em-table', [
    h('thead', null, [h('tr', null, headers.map(label => h('th', null, [label])))]),
    h('tbody', null, rows.length ? rows : [h('tr', null, [h('td', { colspan: headers.length }, [empty('暂无记录', '当前范围内没有匹配的数据。')])])]),
  ]));
  const tag = (text, cls = '') => el('span', `employee-tag ${cls}`, text);
  const drawer = (title, body, actions, close, options = {}) => {
    let previous;
    return el('div', options.overlayClass || 'em-overlay', el('section', options.drawerClass || 'em-drawer', [
      el('header', 'em-drawer-head', [el('h2', '', title), button('关闭', close)]),
      el('div', 'em-drawer-body', body), actions?.length ? el('footer', 'em-drawer-foot', actions) : null,
    ], { role: 'dialog', 'aria-modal': 'true', 'aria-label': title, tabindex: '-1',
      onVnodeMounted: v => { previous = document.activeElement; v.el.focus(); },
      onVnodeBeforeUnmount: () => { if (previous?.isConnected) previous.focus(); },
      onKeydown: e => {
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        if (e.key !== 'Tab') return;
        const nodes = [...e.currentTarget.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea,a[href]')];
        if (!nodes.length) { e.preventDefault(); return; }
        if (e.shiftKey && (document.activeElement === nodes[0] || document.activeElement === e.currentTarget)) { nodes.at(-1).focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === nodes.at(-1)) { nodes[0].focus(); e.preventDefault(); }
      },
    }), { onMousedown: e => { if (e.target === e.currentTarget) close(); } });
  };
  return { el, button, input, select, check, field, empty, table, tag, drawer };
}
