/* Item tables shared by the Supplier Portal (Items, Stock Levels → Stock Balances) and Enterprise On-Hand Balances
 * (On-Hand Balances, Vendor Stock Balances). Page sets window.ITEMS_PAGE = { tab }; everything else
 * (shell, columns, labels, editing, menu) follows from TABS below. */
const TABS = {
  'Items':                 { shell: 'csp', primary: 'Items', file: 'supplier-items.html', cols: 'csp-items', actions: 'menu', menu: 'full' },
  'Stock Balances':        { shell: 'csp', primary: 'Stock Levels', file: 'supplier-stock-location.html', cols: 'stock', actions: 'edit', menu: 'full' },
  'On-Hand Balances':      { shell: 'enterprise', file: 'ohb.html', cols: 'ohb', actions: null, menu: 'exports' },
  'Item Supply and Demand Reports': { shell: 'enterprise', file: null },
  'Vendor Stock Balances': { shell: 'enterprise', file: 'ohb-vendor-stock.html', cols: 'vendor', actions: null, menu: 'exports' },
};
const PAGE = window.ITEMS_PAGE || { tab: 'Items' };
const CFG = TABS[PAGE.tab];
const IS_CSP = CFG.shell === 'csp';
const IS_STOCK = CFG.cols === 'stock' || CFG.cols === 'vendor';   // supplier-maintained stock view
const EDITABLE = CFG.actions === 'edit';                          // only the supplier edits inline

if (IS_CSP) renderCspHeader({ primary: CFG.primary, tab: PAGE.tab });
else { renderHeader({ primary: 'Inventory', sub: 'On-Hand Balances' }); renderFooter(); }

// Page-level tabs under the title — Enterprise only (the Supplier Portal uses its header sub-tabs)
const TAB_SET = ['On-Hand Balances', 'Item Supply and Demand Reports', 'Vendor Stock Balances'];
if (!IS_CSP) document.querySelector('.csp-main h1').insertAdjacentHTML('afterend', `
  <nav class="page-tabs ${IS_CSP ? '' : 'ent'}" aria-label="${IS_CSP ? 'Items' : 'On-Hand Balances'} views">
    ${TAB_SET.map(l => {
      const on = l === PAGE.tab, f = TABS[l].file;
      return `<a href="${f || '#'}" ${f ? '' : 'data-stub'} class="${on ? 'selected' : ''}" ${on ? 'aria-current="page"' : ''}>${l}</a>`;
    }).join('')}
  </nav>`);

const VIEWS = {
  'All': () => true,
  'Low Availability': i => i.atp <= i.reorder,
  'Out of Stock': i => i.atp <= 0,
};
const KEBAB = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>';
const money = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------------------------------------------------------------- Columns */
const LOW = i => i.atp <= i.reorder ? `<span class="low" title="At or below reorder point (${i.reorder})">${num(i.atp)}</span>` : num(i.atp);
const C = {
  num: { label: 'Item #', html: i => esc(i.num) },
  name: { label: 'Name', cls: 'name', html: i => `${esc(i.name)}<span class="sub">${esc(i.pack)}</span>`, csv: i => i.name },
  warehouse: { label: 'Warehouse', html: i => esc(i.warehouse) },
  supplier: { label: 'Supplier', html: () => esc(SUPPLIER_NAME), csv: () => SUPPLIER_NAME, sortVal: () => SUPPLIER_NAME },
  location: { label: 'Stock Location', html: i => `<a href="#" class="loc-link" data-loc="${esc(i.location)}">${esc(i.location)}</a>`, csv: i => i.location },
  ouom: { label: 'UOM', html: i => `<abbr title="Order UoM · consumption UoM ${esc(i.cuom)} (1 ${esc(i.ouom)} = ${i.per} ${esc(i.cuom)})">${esc(i.ouom)}</abbr>`, csv: i => i.ouom },
  qoh: { label: 'Quantity on Hand', num: true },
  reserved: { label: 'Reserved Quantity', num: true },
  atp: { label: IS_STOCK ? 'Unrestricted Quantity' : 'Available to Promise', num: true, html: LOW },
  incoming: { label: 'Incoming Stock Qty', num: true },
  counted: { label: 'Last Cycle Count Date', html: i => fmtDate(i.counted), csv: i => fmtDate(i.counted) },
  aisle: { label: 'Aisle' }, bin: { label: 'Bin' }, level: { label: 'Level' },
  createdOn: { label: 'Created On', html: i => fmtDateTime(i.createdOn), csv: i => fmtDateTime(i.createdOn) },
  createdBy: { label: 'Created By' },
  updatedBy: { label: 'Updated By' },
  updatedOn: { label: 'Last Updated', html: i => fmtDateTime(i.updatedOn), csv: i => fmtDateTime(i.updatedOn) },
  price: { label: 'Unit Price', num: true, html: i => money(i.price), csv: i => i.price.toFixed(2) },
  value: { label: 'Stock Value', num: true, html: i => money(i.value), csv: i => i.value.toFixed(2) },
  currency: { label: 'Currency', html: () => 'USD', csv: () => 'USD' },
};
// On-Hand Balances uses the enterprise OHB vocabulary
if (CFG.cols === 'ohb') { C.qoh.label = 'Qty'; C.reserved.label = 'Allocated'; C.atp.label = 'Available'; }
const COL_SETS = {
  'csp-items': ['num', 'name', 'warehouse', 'qoh', 'reserved', 'atp', 'counted', 'aisle', 'bin', 'level'],
  stock: ['num', 'name', 'warehouse', 'ouom', 'atp', 'incoming', 'counted', 'aisle', 'bin', 'level', 'createdOn', 'createdBy', 'updatedBy', 'updatedOn'],
  vendor: ['num', 'name', 'supplier', 'warehouse', 'ouom', 'atp', 'incoming', 'counted', 'aisle', 'bin', 'level', 'createdOn', 'createdBy', 'updatedBy', 'updatedOn'],
  ohb: ['num', 'name', 'warehouse', 'qoh', 'reserved', 'atp', 'ouom', 'price', 'value', 'currency', 'aisle', 'bin', 'level'],
};
const COLS = COL_SETS[CFG.cols];
const SHOW_ACTIONS = !!CFG.actions; // Items: ⋮ row menu · Stock Location: pinned edit column · Enterprise: read-only
const cellHtml = (k, i) => C[k].html ? C[k].html(i) : C[k].num ? num(i[k]) : esc(i[k]);
const cellCsv = (k, i) => C[k].csv ? C[k].csv(i) : i[k];

document.getElementById('head').innerHTML = COLS.map(k =>
  `<th data-sort="${k}" class="${C[k].num ? 'num' : ''}">${C[k].label}</th>`).join('') + (SHOW_ACTIONS ? `<th class="${EDITABLE ? 'act' : ''}">Actions</th>` : '');

/* ---------------------------------------------------------------- Render */
const state = { customer: 'Buyer Demo Company', view: 'All', q: '', warehouses: new Set(), sort: 'num', dir: 1, userSorted: false, editing: null, editErr: '' };

function visible() {
  const q = state.q.toLowerCase();
  return itemsFor(state.customer).map(i => ({ ...i, value: i.qoh * i.price, supplier: SUPPLIER_NAME }))
    .filter(VIEWS[state.view])
    .filter(i => !state.warehouses.size || state.warehouses.has(i.warehouse))
    .filter(i => !q || [i.num, i.name, i.warehouse, i.location, i.aisle, i.bin, i.level].some(v => v.toLowerCase().includes(q)))
    .sort((a, b) => {
      const x = a[state.sort], y = b[state.sort];
      return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true })) * state.dir;
    });
}

/* ---------------------------------------------------------------- Inline edit (Stock Location)
 * The pencil makes Unrestricted Quantity editable in place, entered in the item's order UoM (the UOM column).
 * On save: Quantity on Hand = unrestricted + reserved; Updated By / Last Updated are stamped. */
const ICO = {
  pencil: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M4 20l1-4.2L15.6 5.2a2 2 0 012.8 0l.4.4a2 2 0 010 2.8L8.2 19 4 20zM13.5 7.3l3.2 3.2"/></svg>',
  // cancel: circled ✕ · save: floppy disk (per design)
  cancel: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9.2"/><path d="M8.8 8.8l6.4 6.4M15.2 8.8l-6.4 6.4"/></svg>',
  save: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4.5 6.5a2 2 0 012-2h9.6l3.4 3.4v9.6a2 2 0 01-2 2h-11a2 2 0 01-2-2z"/><path d="M8.5 4.5v4h6v-4"/><circle cx="12" cy="14.6" r="2" fill="currentColor" stroke="none"/></svg>',
};
function editCell(i) {
  // Quantity only — entered in the item's order UoM (shown in the UOM column)
  return `<span class="inl">
      <input type="text" inputmode="numeric" class="inl-qty" value="${esc(state.editVal ?? i.atp)}" aria-label="Unrestricted Quantity for ${esc(i.num)} in ${esc(i.ouom)}" aria-invalid="${!!state.editErr}">
    </span>${state.editErr ? `<span class="inl-err" role="alert">${esc(state.editErr)}</span>` : `<span class="inl-hint">in ${esc(i.ouom)}</span>`}`;
}
function saveEdit(tr) {
  const i = itemsFor(state.customer).find(x => x.num === state.editing);
  const raw = tr.querySelector('.inl-qty').value.trim(), uom = i.ouom;
  const res = validateRow([i.num, i.location, raw, uom], { [i.num]: i }, 0);
  if (res.error) { state.editErr = res.error.replace(/^Row 0: /, ''); state.editVal = raw; render(); focusEdit(); return; }
  const qoh = res.ok.qoh + i.reserved;
  saveBalances(state.customer, [{ num: i.num, qoh }]);
  state.editing = null; state.editErr = ''; state.editVal = null;
  render();
  toast(`${i.num}: Unrestricted Quantity updated to ${num(res.ok.qoh)} ${i.ouom}`);
}
function focusEdit(uom) {
  const tr = document.querySelector('tr.editing');
  if (!tr) return;

  const inp = tr.querySelector('.inl-qty'); inp.focus(); inp.select();
}

function render() {
  const rows = visible();
  const span = COLS.length + (SHOW_ACTIONS ? 1 : 0);
  document.getElementById('rows').innerHTML = rows.length ? rows.map(i => `<tr class="${state.editing === i.num ? 'editing' : ''}" data-num="${esc(i.num)}">
      ${COLS.map(k => `<td class="${[C[k].cls, C[k].num ? 'num' : ''].filter(Boolean).join(' ')}">${EDITABLE && k === 'atp' && state.editing === i.num ? editCell(i) : cellHtml(k, i)}</td>`).join('')}
      ${!SHOW_ACTIONS ? '' : EDITABLE ? `<td class="act">${state.editing === i.num
        ? `<button class="row-act cancel" data-edit="cancel" aria-label="Cancel editing ${esc(i.num)}">${ICO.cancel}</button><button class="row-act save" data-edit="save" aria-label="Save ${esc(i.num)}">${ICO.save}</button>`
        : `<button class="row-act" data-edit="start" aria-label="Edit ${esc(i.num)}" ${state.editing ? 'disabled' : ''}>${ICO.pencil}</button>`}</td>`
        : `<td><button class="row-act" aria-label="Actions for ${esc(i.num)}" aria-haspopup="menu">${KEBAB}</button></td>`}
    </tr>`).join('')
    : `<tr class="empty"><td colspan="${span}">No results found</td></tr>`;
  document.getElementById('view-name').textContent = state.view;
  document.querySelectorAll('.items th[data-sort]').forEach(th => {
    const on = state.userSorted && th.dataset.sort === state.sort;
    th.setAttribute('aria-sort', on ? (state.dir > 0 ? 'ascending' : 'descending') : 'none');
    th.querySelector('.arrow')?.remove();
    if (on) th.insertAdjacentHTML('beforeend', `<span class="arrow">${state.dir > 0 ? '↑' : '↓'}</span>`);
  });
  const fb = document.getElementById('filter-btn');
  fb.classList.toggle('on', state.warehouses.size > 0);
  fb.querySelector('.count')?.remove();
  if (state.warehouses.size) fb.insertAdjacentHTML('beforeend', `<span class="count">${state.warehouses.size}</span>`);
}

/* ---------------------------------------------------------------- Menus */
let openMenu = null;
function closeMenu() {
  if (!openMenu) return;
  openMenu.trigger.setAttribute('aria-expanded', 'false');
  openMenu.el.remove();
  openMenu = null;
}
function showMenu(trigger, html, align = 'left') {
  const same = openMenu?.trigger === trigger;
  closeMenu();
  if (same) return null;
  const el = document.createElement('div');
  el.className = 'menu';
  el.setAttribute('role', 'menu');
  el.innerHTML = html;
  document.body.appendChild(el);
  const r = trigger.getBoundingClientRect();
  el.style.top = `${r.bottom + window.scrollY + 4}px`;
  el.style.left = align === 'right' ? `${r.right + window.scrollX - el.offsetWidth}px` : `${r.left + window.scrollX}px`;
  trigger.setAttribute('aria-expanded', 'true');
  openMenu = { trigger, el };
  return el;
}
document.addEventListener('click', e => {
  if (openMenu && !openMenu.el.contains(e.target) && !openMenu.trigger.contains(e.target)) closeMenu();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

document.getElementById('views-btn').addEventListener('click', e => {
  const m = showMenu(e.currentTarget, Object.keys(VIEWS).map(v =>
    `<button role="menuitem" data-view="${v}" class="${v === state.view ? 'on' : ''}">${v}</button>`).join(''));
  m?.addEventListener('click', ev => {
    const b = ev.target.closest('[data-view]');
    if (!b) return;
    state.view = b.dataset.view;
    closeMenu(); render();
  });
});

document.getElementById('filter-btn').addEventListener('click', e => {
  const whs = [...new Set(SEED[state.customer].map(i => i.warehouse))];
  const m = showMenu(e.currentTarget, `<h4>Warehouse</h4>` + (whs.length ? whs.map(w =>
    `<label><input type="checkbox" value="${esc(w)}" ${state.warehouses.has(w) ? 'checked' : ''}> ${esc(w)}</label>`).join('')
    : '<label>No warehouses</label>'), 'right');
  m?.addEventListener('change', ev => {
    ev.target.checked ? state.warehouses.add(ev.target.value) : state.warehouses.delete(ev.target.value);
    render();
  });
});

/* Toolbar ⋮ menu (Coupa list-page menu): Load from file → Bulk Load Inventory Balance; exports; Schedule report */
const MI = {
  load: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M14 3H7a2 2 0 00-2 2v4M14 3l5 5M14 3v5h5M19 8v11a2 2 0 01-2 2H7a2 2 0 01-2-2v-2"/><path d="M12 13H2.5M6 9.5L2.5 13 6 16.5" stroke-linecap="round"/></svg>',
  exp: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M14 3H7a2 2 0 00-2 2v4M14 3l5 5M14 3v5h5M19 8v2M5 17v2a2 2 0 002 2h10a2 2 0 002-2v-2"/><path d="M8 13h13.5M18 9.5l3.5 3.5-3.5 3.5" stroke-linecap="round"/></svg>',
  send: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M3.5 4.5l17 7.5-17 7.5 2.5-7.5zM6 12h7" stroke-linecap="round"/></svg>',
  sched: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 9A8 8 0 1112 20a8 8 0 01-7.6-5.5"/><path d="M4 4v5h5M12 8v4.5l3 2"/></svg>',
};
const MENU = [
  ['load', 'Load from file', 'load'], '-',
  ['csv-cur', 'Export as CSV Plain Text (Current Columns)', 'exp'],
  ['xls-cur', 'Export as CSV for Excel (Current Columns)', 'exp'],
  ['xlsx-cur', 'Export as XLSX (Current Columns)', 'exp'],
  ['csv-tpl', 'Export as CSV Plain Text (Template Columns)', 'exp'],
  ['xls-tpl', 'Export as CSV for Excel (Template Columns)', 'exp'], '-',
  ['sched', 'Schedule report', 'sched'],
  ['send', 'Send on-hand balance report to Supplier', 'send'],
];
const BASE = { 'csp-items': 'items', stock: 'stock-locations', ohb: 'on-hand-balances', vendor: 'vendor-stock-balances' }[CFG.cols];
// Enterprise is read-only for vendor stock: exports + schedule only (no Load from file / send to supplier)
const PAGE_MENU = CFG.menu === 'full' ? MENU : [...MENU.filter(x => x !== '-' && x[0].endsWith('-cur')), '-', MENU.find(x => x[0] === 'sched')];
// Current columns = what the table shows (numbers stay numeric for XLSX); template = bulk-load columns
const currentRows = () => [COLS.map(k => C[k].label), ...visible().map(i => COLS.map(k => C[k].num ? i[k] : cellCsv(k, i)))];
const templateExport = () => [TEMPLATE_HEAD, ...templateRows(visible())];

document.getElementById('more-btn').addEventListener('click', e => {
  const m = showMenu(e.currentTarget, PAGE_MENU.map(x => x === '-' ? '<hr>' :
    `<button role="menuitem" data-act="${x[0]}">${MI[x[2]]}<span>${x[1]}</span></button>`).join(''), 'right');
  if (m) { m.classList.add('menu-lg'); const r = e.currentTarget.getBoundingClientRect(); m.style.left = `${r.right + scrollX - m.offsetWidth}px`; }
  m?.addEventListener('click', ev => {
    const act = ev.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    closeMenu();
    const from = CFG.cols === 'stock' ? 'stock-location' : 'items';
    if (act === 'load') { location.href = `supplier-bulk-load.html?from=${from}&customer=${encodeURIComponent(state.customer)}`; return; }
    if (act === 'sched') { toast('Schedule report isn\'t part of this prototype yet'); return; }
    if (act === 'send') { toast(`On-hand balance report for ${state.customer} sent to Supplier (prototype — no email is sent)`); return; }
    const tpl = act.endsWith('-tpl'), rows = tpl ? templateExport() : currentRows(), name = tpl ? `${BASE}-template` : BASE;
    if (act.startsWith('csv')) exportCsvPlain(name, rows);
    else if (act.startsWith('xlsx')) exportXlsx(name, rows);
    else exportCsvExcel(name, rows);
    toast(`Exported ${name}.${act.startsWith('xlsx') ? 'xlsx' : 'csv'}`);
  });
});

document.getElementById('rows').addEventListener('click', e => {
  const link = e.target.closest('.loc-link');
  if (link) { e.preventDefault(); toast(`Stock Location ${link.dataset.loc} — detail page isn't part of this prototype yet`); return; }
  const ed = e.target.closest('[data-edit]');
  if (ed) {
    const tr = ed.closest('tr');
    if (ed.dataset.edit === 'start') { closeMenu(); state.editing = tr.dataset.num; state.editErr = ''; state.editVal = null; render(); focusEdit(); }
    else if (ed.dataset.edit === 'cancel') { state.editing = null; state.editErr = ''; render(); }
    else saveEdit(tr);
    return;
  }
  const b = e.target.closest('.row-act');
  if (!b) return;
  showMenu(b, `<button role="menuitem" data-stub>View item details</button>
    <button role="menuitem" data-stub>Create ASN</button>
    <button role="menuitem" data-stub>View cycle count history</button>`, 'right');
});

document.querySelector('.items thead').addEventListener('click', e => {
  const th = e.target.closest('th[data-sort]');
  if (!th) return;
  state.dir = state.sort === th.dataset.sort ? -state.dir : 1;
  state.sort = th.dataset.sort;
  state.userSorted = true;
  render();
});
document.getElementById('search').addEventListener('input', e => { state.q = e.target.value.trim(); render(); });
document.getElementById('customer')?.addEventListener('change', e => {
  state.customer = e.target.value;
  state.warehouses.clear();
  closeMenu(); render();
});

const preQ = new URLSearchParams(location.search).get('q');
if (preQ) { state.q = preQ; document.getElementById('search').value = preQ; }

render();
document.getElementById('rows').addEventListener('keydown', e => {
  const tr = e.target.closest('tr.editing');
  if (!tr) return;
  if (e.key === 'Enter') { e.preventDefault(); saveEdit(tr); }
  if (e.key === 'Escape') { state.editing = null; state.editErr = ''; render(); }
});
