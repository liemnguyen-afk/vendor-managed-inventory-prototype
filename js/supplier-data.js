/* Supplier Portal shared data + file helpers (Items, Stock Location, Bulk Load Inventory Balance). */
/* ---------------------------------------------------------------- Data
 * Sample VMI stock the supplier manages at each customer's warehouses.
 * ouom = order UoM, cuom = consumption UoM, per = cuom units in one ouom.
 * Unrestricted (ATP) = on hand − reserved; "low" = at or below the reorder point.
 * incoming = open ordered quantity on this supplier's incoming orders (in ouom). */
const WH_CODE = { 'Laughlin Nevada': 'LAU', 'Reno DC': 'RNO', 'Phoenix DC': 'PHX' };
const SEED = {
  'Buyer Demo Company': [
    { num: 'VMI-10021', openPo: 0, price: 18.50, name: 'Nitrile Exam Gloves, Large', pack: 'Box of 100', ouom: 'BX', cuom: 'EA', per: 100, warehouse: 'Laughlin Nevada', qoh: 480, reserved: 120, incoming: 200, reorder: 150, counted: '2026-10-14', aisle: '1', bin: '1', level: '1', createdOn: '2026-03-02T09:14', createdBy: 'Ines Ellis', updatedBy: 'Marcus Lee', updatedOn: '2026-10-14T16:42' },
    { num: 'VMI-10022', openPo: 400, price: 18.50, name: 'Nitrile Exam Gloves, Medium', pack: 'Box of 100', ouom: 'BX', cuom: 'EA', per: 100, warehouse: 'Laughlin Nevada', qoh: 95, reserved: 60, incoming: 300, reorder: 150, counted: '2026-10-14', aisle: '1', bin: '1', level: '2', createdOn: '2026-03-02T09:16', createdBy: 'Ines Ellis', updatedBy: 'Marcus Lee', updatedOn: '2026-10-14T16:45' },
    { num: 'VMI-10045', openPo: 0, price: 6.25, name: 'Safety Glasses, Clear Anti-Fog', pack: 'Each', ouom: 'EA', cuom: 'EA', per: 1, warehouse: 'Laughlin Nevada', qoh: 320, reserved: 40, incoming: 0, reorder: 100, counted: '2026-10-02', aisle: '2', bin: '2', level: '2', createdOn: '2026-04-11T13:05', createdBy: 'Priya Nair', updatedBy: 'Ines Ellis', updatedOn: '2026-10-02T10:20' },
    { num: 'VMI-10078', openPo: 0, price: 9.80, name: 'Hex Bolt M8 x 40mm, Zinc', pack: 'Bag of 50', ouom: 'BG', cuom: 'EA', per: 50, warehouse: 'Laughlin Nevada', qoh: 1250, reserved: 300, incoming: 500, reorder: 400, counted: '2026-09-28', aisle: '4', bin: '4', level: '4', createdOn: '2026-01-19T08:30', createdBy: 'Priya Nair', updatedBy: 'Priya Nair', updatedOn: '2026-09-28T14:02' },
    { num: 'VMI-10079', openPo: 0, price: 5.40, name: 'Hex Nut M8, Zinc', pack: 'Bag of 100', ouom: 'BG', cuom: 'EA', per: 100, warehouse: 'Laughlin Nevada', qoh: 860, reserved: 0, incoming: 0, reorder: 300, counted: '2026-09-28', aisle: '4', bin: '4', level: '4', createdOn: '2026-01-19T08:34', createdBy: 'Priya Nair', updatedBy: 'Priya Nair', updatedOn: '2026-09-28T14:05' },
    { num: 'VMI-20113', openPo: 0, price: 32.00, name: 'Shrink Wrap Film, 18" x 1500\'', pack: 'Roll', ouom: 'RL', cuom: 'RL', per: 1, warehouse: 'Reno DC', qoh: 64, reserved: 24, incoming: 40, reorder: 30, counted: '2026-10-20', aisle: 'B', bin: '12', level: '1', createdOn: '2026-05-06T11:48', createdBy: 'Ines Ellis', updatedBy: 'Dana Brooks', updatedOn: '2026-10-20T09:31' },
    { num: 'VMI-20117', openPo: 150, price: 21.75, name: 'Corrugated Box, 12x12x12', pack: 'Bundle of 25', ouom: 'BDL', cuom: 'EA', per: 25, warehouse: 'Reno DC', qoh: 210, reserved: 210, incoming: 120, reorder: 80, counted: '2026-10-20', aisle: 'B', bin: '14', level: '2', createdOn: '2026-05-06T11:52', createdBy: 'Ines Ellis', updatedBy: 'Dana Brooks', updatedOn: '2026-10-21T07:58' },
    { num: 'VMI-20140', openPo: 0, price: 54.00, name: 'Packing Tape, 2" Clear', pack: 'Case of 36', ouom: 'CS', cuom: 'RL', per: 36, warehouse: 'Reno DC', qoh: 42, reserved: 6, incoming: 0, reorder: 20, counted: '2026-10-06', aisle: 'C', bin: '03', level: '1', createdOn: '2026-06-23T15:10', createdBy: 'Dana Brooks', updatedBy: 'Dana Brooks', updatedOn: '2026-10-06T12:44' },
    { num: 'VMI-30302', openPo: 10, price: 64.90, name: 'Hydraulic Oil ISO 46', pack: '5 gal Pail', ouom: 'PL', cuom: 'GAL', per: 5, warehouse: 'Phoenix DC', qoh: 18, reserved: 4, incoming: 10, reorder: 12, counted: '2026-08-30', aisle: '7', bin: '2', level: '1', createdOn: '2026-02-14T10:00', createdBy: 'Marcus Lee', updatedBy: 'Ines Ellis', updatedOn: '2026-08-30T17:25' },
    { num: 'VMI-30318', openPo: 0, price: 38.60, name: 'Industrial Wipes, Lint-Free', pack: 'Case of 12', ouom: 'CS', cuom: 'PK', per: 12, warehouse: 'Phoenix DC', qoh: 140, reserved: 20, incoming: 0, reorder: 40, counted: '2026-10-09', aisle: '7', bin: '5', level: '3', createdOn: '2026-02-14T10:06', createdBy: 'Marcus Lee', updatedBy: 'Marcus Lee', updatedOn: '2026-10-09T08:12' },
    { num: 'VMI-30355', openPo: 48, price: 11.20, name: 'AA Alkaline Battery', pack: 'Pack of 24', ouom: 'PK', cuom: 'EA', per: 24, warehouse: 'Phoenix DC', qoh: 36, reserved: 30, incoming: 48, reorder: 25, counted: '2026-10-09', aisle: '9', bin: '1', level: '2', createdOn: '2026-07-01T09:40', createdBy: 'Ines Ellis', updatedBy: 'Marcus Lee', updatedOn: '2026-10-09T08:19' },
    { num: 'VMI-30390', openPo: 40, price: 27.30, name: 'Earplugs, Foam NRR 32', pack: 'Box of 200', ouom: 'BX', cuom: 'PR', per: 200, warehouse: 'Phoenix DC', qoh: 0, reserved: 0, incoming: 20, reorder: 10, counted: '2026-10-22', aisle: '9', bin: '3', level: '1', createdOn: '2026-07-01T09:44', createdBy: 'Ines Ellis', updatedBy: 'Ines Ellis', updatedOn: '2026-10-22T13:03' },
  ],
  'Coupa Demo Co': [],
};
const CURRENT_USER = 'Ines Ellis';

/* ---------------------------------------------------------------- Supplier stock locations (R48)
 * Supplier-owned locations (separate from buyer warehouses), per customer. Each has storage locations
 * (aisle / bin / level). createdBy 'Buyer' locations are read-only for the supplier. */
const STOCK_LOCATIONS = {
  'Buyer Demo Company': [
    { code: 'LAU', name: 'Laughlin Nevada', description: 'Northwind VMI stock for Buyer Demo Company — Laughlin', address: '2100 Casino Dr, Laughlin, NV 89029, US', attention: 'Ines Ellis', email: 'ines.ellis@northwind-supply.example', type: 'OWN', active: true, createdBy: 'Supplier', createdOn: '2026-01-12T10:02' },
    { code: 'RNO', name: 'Reno DC', description: 'Northwind distribution center — Reno', address: '850 E Greg St, Sparks, NV 89431, US', attention: 'Dana Brooks', email: 'dana.brooks@northwind-supply.example', type: 'OWN', active: true, createdBy: 'Supplier', createdOn: '2026-05-04T08:40' },
    { code: 'PHX', name: 'Phoenix DC', description: 'Created by Buyer Demo Company for Northwind', address: '4300 E Broadway Rd, Phoenix, AZ 85040, US', attention: 'Marcus Lee', email: 'marcus.lee@northwind-supply.example', type: 'OWN', active: true, createdBy: 'Buyer', createdOn: '2026-02-10T14:15' },
  ],
  'Coupa Demo Co': [],
};
// Supplier profile setting on the buyer side (Allow Supplier to upload Stock levels → Update frequency)
const UPLOAD_FREQUENCY = { 'Buyer Demo Company': 'Weekly', 'Coupa Demo Co': 'Weekly', ...JSON.parse(localStorage.getItem('vmi.uploadFreq') || '{}') };
const FREQ_DAYS = { Daily: 1, Weekly: 7, Monthly: 30 };
const UPLOAD_KEY = 'vmi.lastUpload';
const SEED_UPLOAD = { 'Buyer Demo Company': { on: '2026-10-26T09:14', by: 'Ines Ellis', file: 'stock-upload-2026-10-26.csv', rows: 12 } };
function lastUpload(customer) { return (JSON.parse(localStorage.getItem(UPLOAD_KEY) || '{}')[customer]) || SEED_UPLOAD[customer] || null; }
function recordUpload(customer, file, rows) {
  const all = JSON.parse(localStorage.getItem(UPLOAD_KEY) || '{}');
  const now = new Date(), p = n => String(n).padStart(2, '0');
  all[customer] = { on: `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}T${p(now.getHours())}:${p(now.getMinutes())}`, by: CURRENT_USER, file, rows };
  localStorage.setItem(UPLOAD_KEY, JSON.stringify(all));
}
function nextUploadDue(customer) {
  const u = lastUpload(customer); if (!u) return null;
  const d = new Date(u.on.slice(0, 10) + 'T00:00'); d.setDate(d.getDate() + FREQ_DAYS[UPLOAD_FREQUENCY[customer] || 'Weekly']);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// The VMI supplier (Supplier Portal user Ines Ellis) as the buyer sees it on Enterprise
const SUPPLIER_NAME = 'Northwind Supply Co.';
// Uploaded stock persists across both pages: { customer: { itemNum: { qoh, updatedBy, updatedOn } } }
const STOCK_KEY = 'vmi.supplierStock';
const loadOverrides = () => JSON.parse(localStorage.getItem(STOCK_KEY) || '{}');
function itemsFor(customer) {
  const o = loadOverrides()[customer] || {};
  return SEED[customer].map(i => ({ ...i, ...(o[i.num] || {}) }))
    .map(i => ({ ...i, atp: i.qoh - i.reserved, location: `${WH_CODE[i.warehouse]}-${i.aisle}-${i.bin}-${i.level}` }));
}


const fmtDate = d => { const [y, m, day] = d.slice(0, 10).split('-'); return `${m}/${day}/${y}`; };
function fmtDateTime(d) {
  const [h, min] = d.slice(11, 16).split(':').map(Number);
  return `${fmtDate(d)} ${String(h % 12 || 12).padStart(2, '0')}:${String(min).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
const num = n => n.toLocaleString('en-US');

/* ---------------------------------------------------------------- CSV / XLSX */
const toCsv = rows => rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
function saveBlob(name, blob) {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
// Plain text: UTF-8, no BOM. "For Excel": UTF-8 BOM so Excel detects the encoding.
const exportCsvPlain = (name, rows) => saveBlob(`${name}.csv`, new Blob([toCsv(rows)], { type: 'text/csv' }));
const exportCsvExcel = (name, rows) => saveBlob(`${name}.csv`, new Blob(['﻿' + toCsv(rows)], { type: 'text/csv' }));

// Minimal XLSX writer: one sheet, inline strings, uncompressed ZIP (store).
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = bytes => { let c = 0xffffffff; for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function zipStore(files) {
  const enc = new TextEncoder(), parts = [], central = []; let offset = 0;
  const u16 = n => [n & 255, (n >> 8) & 255], u32 = n => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];
  for (const [name, text] of files) {
    const nameB = enc.encode(name), data = enc.encode(text), crc = crc32(data);
    const head = [...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nameB.length), ...u16(0)];
    parts.push(new Uint8Array(head), nameB, data);
    central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nameB.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), nameB);
    offset += head.length + nameB.length + data.length;
  }
  const cdSize = central.reduce((s, a) => s + a.length, 0);
  const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cdSize), ...u32(offset), ...u16(0)]);
  return new Blob([...parts, ...central, end], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
function exportXlsx(name, rows) {
  const x = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const col = i => { let s = ''; i++; while (i) { s = String.fromCharCode(65 + ((i - 1) % 26)) + s; i = Math.floor((i - 1) / 26); } return s; };
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${
    rows.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => typeof v === 'number'
      ? `<c r="${col(ci)}${ri + 1}"><v>${v}</v></c>`
      : `<c r="${col(ci)}${ri + 1}" t="inlineStr"><is><t>${x(v)}</t></is></c>`).join('')}</row>`).join('')}</sheetData></worksheet>`;
  saveBlob(`${name}.xlsx`, zipStore([
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'],
    ['xl/worksheets/sheet1.xml', sheet],
  ]));
}
function parseCsv(text) {
  return text.replace(/^﻿/, '').trim().split(/\r?\n/).filter(l => l.trim()).map(line => {
    const out = []; let cur = '', q = false;
    for (let k = 0; k < line.length; k++) {
      const ch = line[k];
      if (q) { if (ch === '"' && line[k + 1] === '"') { cur += '"'; k++; } else if (ch === '"') q = false; else cur += ch; }
      else if (ch === '"') q = true; else if (ch === ',') { out.push(cur); cur = ''; } else cur += ch;
    }
    out.push(cur);
    return out.map(s => s.trim());
  });
}

/* ---------------------------------------------------------------- Bulk load template
 * Template columns (mandatory marked *). Quantity is accepted only in the item's order UoM (OUOM)
 * or consumption UoM (CUOM); CUOM converts to OUOM and must be whole OUOM units. */
const TEMPLATE_HEAD = ['Item #*', 'Stock Location*', 'Quantity*', 'UoM*'];
const templateRows = items => items.map(i => [i.num, i.location, i.qoh, i.ouom]);

function validateRow(row, items, line) {
  const [itemNum, loc, qtyRaw, uomRaw] = row.map(v => v ?? '');
  const it = items[itemNum];
  const uom = uomRaw.toUpperCase();
  if (!itemNum) return { error: `Row ${line}: Item # is mandatory.` };
  if (!it) return { error: `Row ${line}: Item ${itemNum} isn't managed for this customer.` };
  if (!loc) return { error: `Row ${line}: Stock Location is mandatory.` };
  if (loc !== it.location) return { error: `Row ${line}: Stock Location ${loc} doesn't match ${it.num} (expected ${it.location}).` };
  if (!/^\d+$/.test(qtyRaw)) return { error: `Row ${line}: Quantity "${qtyRaw}" must be a whole number.` };
  if (!uomRaw) return { error: `Row ${line}: UoM is mandatory.` };
  if (uom !== it.ouom && uom !== it.cuom) {
    return { error: `Row ${line}: UoM "${uomRaw}" isn't valid for ${it.num}. Stock can only be uploaded in the order UoM (${it.ouom}) or consumption UoM (${it.cuom}).` };
  }
  const qty = Number(qtyRaw);
  if (uom === it.cuom && it.cuom !== it.ouom) {
    if (qty % it.per) return { error: `Row ${line}: ${num(qty)} ${it.cuom} isn't a whole number of ${it.ouom} (1 ${it.ouom} = ${it.per} ${it.cuom}).` };
    return { ok: { num: it.num, qoh: qty / it.per, note: `${num(qty)} ${it.cuom} → ${num(qty / it.per)} ${it.ouom}` } };
  }
  return { ok: { num: it.num, qoh: qty, note: `${num(qty)} ${it.ouom}` } };
}

function saveBalances(customer, okRows) {
  const all = loadOverrides();
  const mine = all[customer] = all[customer] || {};
  const now = new Date(), p = n => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}T${p(now.getHours())}:${p(now.getMinutes())}`;
  // merge, so an inline edit of one field never discards another (e.g. an earlier bulk-loaded balance)
  okRows.forEach(({ num, note, ...fields }) => { mine[num] = { ...mine[num], ...fields, updatedBy: CURRENT_USER, updatedOn: stamp }; });
  localStorage.setItem(STOCK_KEY, JSON.stringify(all));
}


/* ---------------------------------------------------------------- Replenishment run (R48)
 * Buyer item warehouses on Min/Max that fell below Min in the 06:00 job. Replenishment quantity is
 * calculated as today (max − on hand). New: before creating requisitions, check the item-warehouse
 * supplier's vendor stock (Unrestricted Quantity):
 *   - vendor stock maintained → Req to that supplier for min(qty, vendor stock); remainder → Req without supplier
 *   - no vendor stock entries  → one Req for the full qty to the item-warehouse supplier (unchanged behaviour) */
const RUN = { on: '2026-10-29T06:00', id: 'RPL-2026-1029-0600' };
const REPL_LINES = [
  { item: 'VMI-10021', name: 'Nitrile Exam Gloves, Large', warehouse: 'Main Plant', min: 400, max: 800, onHand: 380, supplier: 'Northwind Supply Co.', uom: 'BX' },
  { item: 'VMI-10022', name: 'Nitrile Exam Gloves, Medium', warehouse: 'Main Plant', min: 300, max: 600, onHand: 100, supplier: 'Northwind Supply Co.', uom: 'BX' },
  { item: 'VMI-20117', name: 'Corrugated Box, 12x12x12', warehouse: 'Main Plant', min: 100, max: 220, onHand: 100, supplier: 'Northwind Supply Co.', uom: 'BDL' },
  { item: 'VMI-30355', name: 'AA Alkaline Battery', warehouse: 'Main Plant', min: 40, max: 90, onHand: 40, supplier: 'Northwind Supply Co.', uom: 'PK' },
  { item: 'PPE-2201', name: 'Hard Hat, Type I, White', warehouse: 'Main Plant', min: 50, max: 130, onHand: 50, supplier: 'Acme Safety Supply', uom: 'EA' },
];
function replenishmentRun(customer = 'Buyer Demo Company') {
  const vendor = Object.fromEntries(itemsFor(customer).map(i => [i.num, i]));
  let reqNo = 4501;
  return REPL_LINES.map(l => {
    const qty = l.max - l.onHand, v = l.supplier === SUPPLIER_NAME ? vendor[l.item] : null;
    const reqs = [];
    if (v) {
      const fromVendor = Math.max(0, Math.min(qty, v.atp));
      if (fromVendor) reqs.push({ no: reqNo++, qty: fromVendor, supplier: l.supplier });
      if (qty - fromVendor) reqs.push({ no: reqNo++, qty: qty - fromVendor, supplier: null });
    } else reqs.push({ no: reqNo++, qty, supplier: l.supplier });
    return { ...l, qty, vendorStock: v ? v.atp : null, vendorUpdated: v ? v.updatedOn : null, reqs };
  });
}
