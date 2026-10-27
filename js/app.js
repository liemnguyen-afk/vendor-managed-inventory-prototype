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

/* ---------------------------------------------------------------- Prototype navigator
 * Bottom-left "Prototype ▾" toggle: jump to any screen, switch between the supplier and buyer views of
 * the same stock, or reset the sample data. Reviewer tool — not part of the product UI. */
const PROTO_SCREENS = [
  ['CSP — Supplier (Ines Ellis, Northwind Supply Co.)', [
    ['supplier-items.html', 'Items'],
    ['supplier-stock-location.html', 'Stock Location (inline edit)'],
    ['supplier-bulk-load.html?from=stock-location', 'Bulk Load Inventory Balance'],
  ]],
  ['Enterprise — Buyer (Buyer Demo Company)', [
    ['ohb.html', 'On-Hand Balances'],
    ['ohb-vendor-stock.html', 'Vendor Stock Balances'],
    ['inventory-settings.html', 'Inventory Settings'],
    ['warehouse.html', 'Warehouse — Laughlin Nevada'],
    ['warehouse-create.html', 'Create Warehouse'],
  ]],
];
// Same data, other side
const PROTO_COUNTERPART = {
  'supplier-stock-location.html': ['ohb-vendor-stock.html', 'Switch to Buyer: Vendor Stock Balances'],
  'supplier-items.html': ['ohb.html', 'Switch to Buyer: On-Hand Balances'],
  'supplier-bulk-load.html': ['ohb-vendor-stock.html', 'Switch to Buyer: Vendor Stock Balances'],
  'ohb-vendor-stock.html': ['supplier-stock-location.html', 'Switch to Supplier: Stock Location'],
  'ohb.html': ['supplier-items.html', 'Switch to Supplier: Items'],
};
function renderProtoNav() {
  if (document.querySelector('.proto-nav')) return;
  const here = location.pathname.split('/').pop() || 'index.html';
  const other = PROTO_COUNTERPART[here];
  document.body.insertAdjacentHTML('beforeend', `
  <div class="proto-nav">
    <div class="panel" id="proto-panel" role="dialog" aria-label="Prototype navigator">
      ${other ? `<a class="switch" href="${other[0]}">⇄ ${esc(other[1])}</a>` : ''}
      ${PROTO_SCREENS.map(([group, items]) => `<h4>${esc(group)}</h4>${items.map(([href, label]) =>
        `<a href="${href}" class="${href.split('?')[0] === here ? 'here' : ''}" ${href.split('?')[0] === here ? 'aria-current="page"' : ''}>${esc(label)}</a>`).join('')}`).join('')}
      <h4>Data</h4>
      <button type="button" data-proto-reset>Reset sample data</button>
    </div>
    <button type="button" class="proto-toggle" aria-expanded="false" aria-controls="proto-panel">Prototype ▾</button>
  </div>`);
  const root = document.querySelector('.proto-nav'), toggle = root.querySelector('.proto-toggle');
  const set = open => { root.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); };
  toggle.addEventListener('click', () => set(!root.classList.contains('open')));
  document.addEventListener('click', e => { if (!root.contains(e.target)) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  root.querySelector('[data-proto-reset]').addEventListener('click', () => {
    Object.keys(localStorage).filter(k => k.startsWith('vmi.')).forEach(k => localStorage.removeItem(k));
    sessionStorage.removeItem('vmi.flash');
    location.reload();
  });
}

/* ---------------------------------------------------------------- Global header */
// theme 'white': search bar + white nav (Inventory Settings screengrab).
// theme 'blue': classic blue nav band, no search, no apps button (Warehouse screengrab).
const NAV_LINKS = {
  white: ['Expenses', 'Forecasts', 'Requests', 'Orders', 'Contingent Workforce', 'Invoices',
    'Spend Pulse', 'Payments', 'Spend Guard', 'Inventory', 'Setup', 'More...'],
  blue: ['Expenses', 'Requests', 'Orders', 'Agreements', 'Invoices', 'Spend Pulse', 'Payments', 'Inventory',
    'Sourcing', 'Suppliers', 'Contracts', 'Spend Guard', 'Setup', 'More...'],
};

// Pages that exist in this prototype; everything else is a stub link
const HEADER_HREF = { 'Setup': 'inventory-settings.html', 'Inventory': 'ohb.html', 'On-Hand Balances': 'ohb.html' };
const SUB_LINKS = {
  Setup: ['All Setup Items', 'Company Info', 'Accounts', 'Users', 'Approvals', 'Budget Periods', 'Budget Lines'],
  Inventory: ['Overview', 'Workbench', 'On-Hand Balances', 'Fulfillment', 'Picklists'],
};

function renderHeader({ primary = 'Setup', theme = 'white', sub = null } = {}) {
  queueMicrotask(renderProtoNav);
  const subLinks = SUB_LINKS[primary] || SUB_LINKS.Setup;
  const link = (label, selected) => HEADER_HREF[label]
    ? `<a href="${HEADER_HREF[label]}" class="${selected ? 'selected' : ''}" ${selected ? 'aria-current="page"' : ''}>${esc(label)}</a>`
    : `<a href="#" data-stub class="${selected ? 'selected' : ''}">${esc(label)}</a>`;
  const blue = theme === 'blue';

  document.body.insertAdjacentHTML('afterbegin', `
  <header class="gh ${theme}">
    <div class="gh-top">
      ${blue ? '' : `<label class="gh-search">
        <input placeholder="What do you need?">
        <img src="assets/magnifying-glass.svg" width="18" height="18" alt="">
      </label>`}
      <div class="gh-right">
        <span class="gh-avatar">LN</span>
        <button class="gh-circle" data-stub aria-label="Notifications"><img src="assets/bell.svg" alt=""></button>
        <button class="gh-circle cart" data-stub aria-label="Cart"><img src="assets/cart.svg" alt=""><span class="badge">0</span></button>
        <button class="gh-circle" data-stub aria-label="Tasks"><span class="tasks">${ICONS.check}</span></button>
        ${blue ? '' : `<button class="gh-circle" data-stub aria-label="Apps">${ICONS.apps}</button>`}
        <button class="gh-ai" data-stub aria-label="Navi AI assistant"><img src="assets/ai-sparkle.svg" alt=""></button>
      </div>
    </div>
    <nav class="gh-nav">
      <a class="home" href="ohb.html" aria-label="Home"><img src="assets/${blue ? 'home-white' : 'home'}.svg" alt=""></a>
      ${NAV_LINKS[theme].map(l => link(l, l === primary)).join('')}
    </nav>
    <nav class="gh-subnav">${subLinks.map(l => link(l, l === sub)).join('')}</nav>
  </header>`);
}

/* ---------------------------------------------------------------- Supplier Portal (CSP) shell */
// Clarity-styled supplier header + footer (Supplier Portal Items screengrab).
const CSP_ICONS = {
  home: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M3.5 10.5L12 3.5l8.5 7V20a.5.5 0 01-.5.5h-5v-6h-6v6H4a.5.5 0 01-.5-.5z"/></svg>',
  bell: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M6 17V11a6 6 0 0112 0v6l1.5 2h-15zM10 21h4"/></svg>',
  help: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9.25"/><path d="M9.6 9.4a2.5 2.5 0 114 2c-.9.6-1.6 1.1-1.6 2.3M12 16.8v.2"/></svg>',
  chevron: '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5l3 3 3-3"/></svg>',
  translate: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h10M8 3v2M5 5c.8 3.5 3.5 6.5 7 8M11 5c-.8 3.6-3.4 7-7.5 9M12.5 21l4-10 4 10M14 17.5h5"/></svg>',
};

const CSP_TABS = [['Items', 'supplier-items.html']];

function renderCspHeader({ primary = 'Items', tab = 'Items' } = {}) {
  queueMicrotask(renderProtoNav);
  const links = ['Invoices', 'Orders', 'Agreements', 'Business Profile', 'Dashboards', 'Payments', 'Service Sheets',
    'Items', 'ASN', 'Sourcing', 'Setup'];
  const link = l => `<a href="${l === primary ? '#' : '#'}" ${l === primary ? 'aria-current="page"' : 'data-stub'} class="${l === primary ? 'selected' : ''}">${esc(l)}</a>`;
  document.body.insertAdjacentHTML('afterbegin', `
  <header class="csp">
    <div class="csp-top">
      <a class="csp-logo" href="#" data-stub aria-label="Coupa Supplier Portal home">
        <img src="assets/coupa-logo-blue.svg" alt="coupa"><span>Supplier Portal</span>
      </a>
      <div class="csp-right">
        <button class="csp-upgrade" data-stub>Upgrade</button>
        <button class="csp-icon bell" data-stub aria-label="Notifications">${CSP_ICONS.bell}<span class="dot"></span></button>
        <button class="csp-icon" data-stub aria-label="Help">${CSP_ICONS.help}</button>
        <button class="csp-avatar" data-stub aria-label="Account">IE</button>
      </div>
    </div>
    <nav class="csp-nav">
      <a class="home" href="#" data-stub aria-label="Home">${CSP_ICONS.home}</a>
      ${links.map(link).join('')}
      <a href="#" data-stub class="more">More ${CSP_ICONS.chevron}</a>
    </nav>
    <nav class="csp-tabs">${CSP_TABS.map(([label, href]) => label === tab
      ? `<a href="${href}" class="selected" aria-current="page">${esc(label)}</a>`
      : `<a href="${href}">${esc(label)}</a>`).join('')}</nav>
  </header>`);
  document.body.insertAdjacentHTML('beforeend', `
  <footer class="csp-foot">
    <span class="lang">${CSP_ICONS.translate}English (India) ${CSP_ICONS.chevron}</span>
    <a href="#" data-stub>Terms of Use</a><i></i><a href="#" data-stub>Privacy Policy</a>
    <span class="copy">© 2006-2026 Coupa Software Incorporated</span>
  </footer>
  <button class="csp-ai" data-stub aria-label="Navi AI assistant"><img src="assets/ai-sparkle.svg" alt=""></button>`);
}

// Toast for pages without the classic .classic container
function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------------------------------------------------------------- Classic footer */
function renderFooter({ logo = true } = {}) {
  document.body.insertAdjacentHTML('beforeend', `
  <footer class="classic-foot">
    ${logo ? '<img src="assets/coupa-logo-blue.svg" alt="coupa">' : ''}
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

/* ---------------------------------------------------------------- Warehouse store */
// Warehouses live in localStorage; Laughlin Nevada is the seeded sample from the screengrab.
const WH_KEY = 'vmi.warehouses';
const SAMPLE_WAREHOUSES = [{
  id: 'laughlin', name: 'Laughlin Nevada', type: 'Warehouse', description: 'Laughlin Warehouse', currency: 'USD', active: true,
  cf1: '', cf2: 'Test User', cf3: 'Value LookUp User', txbox: 'This is the warehouse king',
  certifications: '', watcher: '', attachments: '',
  locations: [
    { aisle: '1', bin: '1', level: '1', active: true },
    { aisle: '2', bin: '2', level: '2', active: true },
    { aisle: '4', bin: '4', level: '4', active: true },
  ],
}];
const loadWarehouses = () => JSON.parse(localStorage.getItem(WH_KEY) || 'null') || SAMPLE_WAREHOUSES;
const saveWarehouses = list => localStorage.setItem(WH_KEY, JSON.stringify(list));

/* ---------------------------------------------------------------- Stub links */
document.addEventListener('click', e => {
  const stub = e.target.closest('[data-stub]');
  if (!stub) return;
  e.preventDefault();
  document.querySelector('.classic') ? flash('Not part of this prototype flow') : toast('Not part of this prototype flow');
});

function initPage(headerOpts = {}, footerOpts = {}) {
  renderHeader(headerOpts);
  renderFooter(footerOpts);
}
