const mediaPath = '#/media-management?tab=rules';
const focusedPreview = () => location.hash.startsWith('#/media-management') || (location.hash.startsWith('#/ad-data') && new URLSearchParams(location.hash.split('?')[1] || '').get('view') === 'alerts');

function mediaIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '18');
  svg.setAttribute('height', '18');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.8');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  for (const pathData of ['M4 6.5h16v12H4z', 'M8 6.5V4h8v2.5', 'M8 11h8', 'M8 14.5h5']) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.append(path);
  }
  return svg;
}

function addMediaEntry(menu) {
  if (menu.querySelector('[data-media-management-entry]')) return;
  const accountButton = [...menu.querySelectorAll(':scope > button')].find(button => button.textContent.trim() === '账号中心');
  if (!accountButton) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('role', 'menuitem');
  button.className = accountButton.className;
  [...accountButton.attributes].forEach(attribute => {
    if (attribute.name.startsWith('data-v-')) button.setAttribute(attribute.name, '');
  });
  button.dataset.mediaManagementEntry = '';
  button.append(mediaIcon(), document.createTextNode('媒介管理'));
  button.addEventListener('click', () => { window.location.hash = mediaPath; });
  accountButton.after(button);
}

function lockProductRail() {
  document.querySelectorAll('.main-navigation-rail .rail-primary .rail-button').forEach(button => {
    const isAlertEntry = button.textContent.replace(/\s+/g, '').startsWith('数据');
    if (!focusedPreview()) {
      button.removeAttribute('aria-disabled');
      button.classList.remove('alert-preview-disabled');
      button.classList.remove('alert-preview-entry');
      return;
    }
    if (isAlertEntry) {
      button.removeAttribute('aria-disabled');
      button.classList.remove('alert-preview-disabled');
      button.classList.add('alert-preview-entry');
      button.title = '投放提醒';
      return;
    }
    button.setAttribute('aria-disabled', 'true');
    button.classList.add('alert-preview-disabled');
    button.classList.remove('alert-preview-entry');
    button.title = '当前预览仅开放告警相关页面';
  });
}

document.addEventListener('click', event => {
  const button = event.target.closest('.main-navigation-rail .rail-primary .rail-button');
  if (!button || !focusedPreview()) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (button.classList.contains('alert-preview-entry')) {
    window.location.hash = '#/ad-data?view=alerts';
  }
}, true);
window.addEventListener('hashchange', lockProductRail);

const observer = new MutationObserver(() => {
  document.querySelectorAll('.menu-card').forEach(addMediaEntry);
  lockProductRail();
});
observer.observe(document.documentElement, { childList: true, subtree: true });
document.querySelectorAll('.menu-card').forEach(addMediaEntry);
lockProductRail();
