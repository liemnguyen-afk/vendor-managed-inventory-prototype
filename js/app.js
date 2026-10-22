/* Vendor Managed Inventory prototype — global header, footer and UI helpers. */

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONS = {
  check: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12.5l3.2 3.2L17 9"/></svg>',
  apps: '<svg viewBox="0 0 24 24" width="18" height="18" fill="#535f66">' +
    [6, 12, 18].flatMap(y => [6, 12, 18].map(x => `<circle cx="${x}" cy="${y}" r="1.5"/>`)).join('') + '</svg>',
  plus: '<svg viewBox="0 0 20 20" width="20" height="20"><circle cx="10" cy="10" r="10" fill="#3a9b3a"/><path d="M10 5v10M5 10h10" stroke="#fff" stroke-width="2.6"/></svg>',
  caret: '<svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5l3 3 3-3"/></svg>',
  translate: '<svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="#2f2f2f" stroke-width="1.2"><rect x="1.5" y="1.5" width="11" height="11"/><rect x="7.5" y="7.5" width="11" height="11" fill="#fff"/><path d="M4 9.5L7 4l3 5.5M5 8h4M10.5 11h5M13 9.5v1.5M15 11c-.5 2.5-2.5 4.5-4.5 5M11.5 13c1 1.5 2.5 2.7 4 3.2"/></svg>',
};

/* ---------------------------------------------------------------- Global header */
function renderHeader({ primary = 'Setup', sub = 'All Setup Items' } = {}) {
  const primaryLinks = ['Expenses', 'Forecasts', 'Requests', 'Orders', 'Contingent Workforce', 'Invoices',
    'Spend Pulse', 'Payments', 'Spend Guard', 'Setup', 'More...'];
  const subLinks = ['All Setup Items', 'Company Info', 'Accounts', 'Users', 'Approvals', 'Budget Periods', 'Budget Lines'];
  const link = (label, selected) =>
    `<a href="${label === 'Setup' ? 'index.html' : '#'}" ${label === 'Setup' ? '' : 'data-stub'} class="${selected ? 'selected' : ''}">${esc(label)}</a>`;

  document.body.insertAdjacentHTML('afterbegin', `
  <header class="gh">
    <div class="gh-top">
      <label class="gh-search">
        <input placeholder="What do you need?">
        <img src="assets/magnifying-glass.svg" width="18" height="18" alt="">
      </label>
      <div class="gh-right">
        <span class="gh-avatar">LN</span>
        <button class="gh-circle" data-stub aria-label="Notifications"><img src="assets/bell.svg" alt=""></button>
        <button class="gh-circle cart" data-stub aria-label="Cart"><img src="assets/cart.svg" alt=""><span class="badge">0</span></button>
        <button class="gh-circle" data-stub aria-label="Tasks"><span class="tasks">${ICONS.check}</span></button>
        <button class="gh-circle" data-stub aria-label="Apps">${ICONS.apps}</button>
        <button class="gh-ai" data-stub aria-label="Navi AI assistant"><img src="assets/ai-sparkle.svg" alt=""></button>
      </div>
    </div>
    <nav class="gh-nav">
      <a class="home" href="index.html" aria-label="Home"><img src="assets/home.svg" alt=""></a>
      ${primaryLinks.map(l => link(l, l === primary)).join('')}
    </nav>
    <nav class="gh-subnav">${subLinks.map(l => link(l, false)).join('')}</nav>
  </header>`);
}

/* ---------------------------------------------------------------- Classic footer */
function renderFooter() {
  document.body.insertAdjacentHTML('beforeend', `
  <footer class="classic-foot">
    <img src="assets/coupa-logo-blue.svg" alt="coupa">
    <div class="links">
      <span>Total Spend Management - Make Margins Multiply</span><i>•</i>
      <span class="lang">${ICONS.translate}English (United States)</span><i>•</i>
      <span>Accessibility</span><i>•</i>
      <a href="#" data-stub>Coupa Cares</a>
    </div>
  </footer>`);
}

/* ---------------------------------------------------------------- Flash message */
function flash(msg, kind = 'ok') {
  let f = document.querySelector('.flash');
  if (!f) {
    f = document.createElement('div');
    f.className = 'flash';
    document.querySelector('.classic').prepend(f);
  }
  f.textContent = msg;
  f.classList.toggle('error', kind === 'error');
  f.hidden = false;
  clearTimeout(f._h);
  f._h = setTimeout(() => { f.hidden = true; }, 5000);
}

/* ---------------------------------------------------------------- Stub links */
document.addEventListener('click', e => {
  const stub = e.target.closest('[data-stub]');
  if (!stub) return;
  e.preventDefault();
  flash('Not part of this prototype flow');
});

function initPage(headerOpts) {
  renderHeader(headerOpts);
  renderFooter();
}
