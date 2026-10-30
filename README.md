# Vendor Managed Inventory — clickable HTML prototype

A static, clickable prototype of **Vendor Managed Inventory**.

**▶ View the live prototype: https://liemnguyen-afk.github.io/vendor-managed-inventory-prototype/**

To run it locally, open [`index.html`](index.html) — it opens the Supplier Portal **Stock Levels → Stock Balances** page.

No build step: plain HTML, CSS and JavaScript.

## Flows

### Inventory Settings — Figma [`2:2`](https://www.figma.com/design/7iUP0blmrcCG6lBzGADb9q/Vendor-Managed-Inventory?node-id=2-2)

| Page | What you can do |
| --- | --- |
| [`inventory-settings.html`](inventory-settings.html) | Classic Setup page with Adjustment Codes, Inventory Valuation, Cycle Count, Receipts, On-Hand Balances, Lot Management and Inventory Options. The green **+** adds an adjustment-code row. On-Hand Balances has a new **Allow Vendor Managed Inventory** checkbox (off by default). **Save** validates (a reason needs a code and vice versa; day fields must be whole numbers) and stores the settings in `localStorage`; **Cancel** reverts to the last save. Valuation Method is read-only because an inventory balance exists. |

### Warehouses — Figma [`11:14`](https://www.figma.com/design/7iUP0blmrcCG6lBzGADb9q/Vendor-Managed-Inventory?node-id=11-14)

| Page | What you can do |
| --- | --- |
| [`warehouse-create.html`](warehouse-create.html) | **Warehouse Create** form — Figma [`12:14`](https://www.figma.com/design/7iUP0blmrcCG6lBzGADb9q/Vendor-Managed-Inventory?node-id=12-14). Name, Description and Country/Region are required (duplicate names are rejected). The Address block uses Clarity tokens; **+ Address Line 3** reveals a third line, picking a State fills its ISO code, **Add Tax Registration** adds a country + tax ID row, and **Add location** adds rows to Warehouse Locations. **Standalone** creates one blank location if none are entered. **Create** saves the warehouse and opens its detail page. |
| [`warehouse.html`](warehouse.html) | Warehouse detail page (`?id=` picks a saved warehouse; defaults to the **Laughlin Nevada** sample) (classic blue header). The Locations table filters by **View** (All / Active / Inactive) and **Search** (aisle, bin or level), switches **Per page** between 15 / 45 / 90, and highlights the row you click. Create, Load from file, Export, Advanced search, the edit pencils and Edit Laughlin Nevada are not part of this flow yet. |

### Supplier Portal — Items — Figma [`33:18892`](https://www.figma.com/design/7iUP0blmrcCG6lBzGADb9q/Vendor-Managed-Inventory?node-id=33-18892)

| Page | What you can do |
| --- | --- |
| [`supplier-items.html`](supplier-items.html) | **Items** tab — the supplier's view of VMI stock they manage at a customer's warehouses (Coupa Supplier Portal → Items). Twelve sample items across Laughlin Nevada, Reno DC and Phoenix DC; **Available to Promise** = on hand − reserved, shown in red at or below the item's reorder point. **Select Customer** switches data (*Coupa Demo Co* has no items, which shows the empty state from the screengrab). **Views** filters All / Low Availability / Out of Stock, **Search** matches item #, name, warehouse or location, the **filter** button filters by warehouse, column headers sort, and the toolbar **⋮** exports the visible rows to CSV. Row **⋮** menus (View item details, Create ASN, View cycle count history) are not part of this flow yet. |
| [`supplier-stock-locations.html`](supplier-stock-locations.html) | **Stock Levels → Stock Locations** (R48 concept S4): one row per supplier stock location for the selected customer — name/code, description, address, attention + email, Stock Management Type (OWN / SCON), number of storage locations, created by, active. The chevron expands a row to its storage locations (aisle / bin / level) with a link to the items stored there. **Create** opens the create form; locations created by the buyer show a lock and are read-only. ⋮ exports to CSV (location / storage-location loads are not built). |
| [`supplier-stock-location-new.html`](supplier-stock-location-new.html) | **Create Stock Location** (S5): General, Address and Storage Locations sections. Name, Address Line 1 and at least one storage location are required; duplicate names per customer are rejected. Saves to `localStorage` and returns to the list. |
| [`supplier-stock-location.html`](supplier-stock-location.html) | **Stock Levels → Stock Balances** (Figma [`41:1075`](https://www.figma.com/design/7iUP0blmrcCG6lBzGADb9q/542-Vendor-Managed-Inventory-INV-CORE?node-id=41-1075)). Columns: Item #, Name, Warehouse, **UOM** (order UoM), **Unrestricted Quantity** (on hand − reserved), **Incoming Stock Qty** (open ordered quantity on this supplier's incoming orders), Last Cycle Count Date, Aisle, Bin, Level, **Created On / Created By / Updated By / Last Updated**. The table scrolls horizontally; the **Actions** column is pinned at the right — its **pencil** edits **Unrestricted Quantity** and **Incoming Stock Qty** inline (number boxes in the item's order UoM; whole numbers only, errors shown under the field; cancel ⊗ left, save 💾 right; Enter saves, Esc cancels) and stamps Updated By / Last Updated. A strip above the table shows the **last upload** and when the **next update is due** (from the supplier's update frequency; red when overdue). `?q=` pre-fills the search. |
| [`supplier-bulk-load.html`](supplier-bulk-load.html) | **Bulk Load Inventory Balance** — reached from the toolbar **⋮ → Load from file** on either tab. **Download ▾** gives the CSV template; **Export To ▾** exports the current balances (CSV, CSV for Excel, XLSX). **Start Upload** verifies the first 6 rows and loads the file only if they're error-free; a UoM other than the item's OUOM or CUOM is rejected with a validation message. The prototype box offers a sample file with a UoM error and an all-valid one. |
| Toolbar **⋮** (both tabs) | Load from file · Export as CSV Plain Text / CSV for Excel / XLSX (Current Columns) · Export as CSV Plain Text / CSV for Excel (Template Columns) · Schedule report (not built) · Send on-hand balance report to Supplier (confirmation only — no email is sent). |

### Enterprise (buyer) — On-Hand Balances — Figma section [`Enterprise`](https://www.figma.com/design/7iUP0blmrcCG6lBzGADb9q/542-Vendor-Managed-Inventory-INV-CORE?node-id=37-16504)

| Page | What you can do |
| --- | --- |
| [`ohb.html`](ohb.html) | Inventory → **On-Hand Balances** (Figma [`90:7266`](https://www.figma.com/design/7iUP0blmrcCG6lBzGADb9q/542-Vendor-Managed-Inventory-INV-CORE?node-id=90-7266)). The buyer's stock: Item #, Name, Warehouse, Qty, Allocated, Available, UOM, Unit Price, Stock Value, Currency, Aisle, Bin, Level. Views, search, warehouse filter, sorting and ⋮ exports work as on the Supplier Portal. |
| [`ohb-vendor-stock.html`](ohb-vendor-stock.html) | New **Vendor Stock Balances** tab (Figma [`89:6073`](https://www.figma.com/design/7iUP0blmrcCG6lBzGADb9q/542-Vendor-Managed-Inventory-INV-CORE?node-id=89-6073)) — the same data as the Supplier Portal **Stock Balances** tab, plus **Supplier** and **Open Order Quantity** columns, a Supplier filter and the last-upload / next-update strip, read-only for the buyer. It reads the same saved balances, so a supplier's inline edit or bulk load shows up here. Item Supply and Demand Reports is a placeholder tab. |

### R48 concept — end-to-end flow — Figma page [`133:7488`](https://www.figma.com/design/7iUP0blmrcCG6lBzGADb9q/542-Vendor-Managed-Inventory-INV-CORE?node-id=133-7488)

Proposed from the Confluence requirements **[R48][R49] Vendor Managed Inventory**. The Figma page has the swimlane flow (buyer admin → supplier → Coupa → buyer), open questions, and screens S1–S12. Use the **Prototype ▾** panel (bottom left) to jump between steps.

| Page | What you can do |
| --- | --- |
| [`item-vmi.html`](item-vmi.html) | Classic **Edit Item** (S2) with **Allow Supplier to upload stock levels for this item in CSP** (off by default) and the item's supplier items. |
| [`supplier-vmi.html`](supplier-vmi.html) | Classic **Edit Supplier** (S3) with **Allow Supplier to upload Stock levels** and **Update frequency** (Daily / Weekly / Monthly), which drives the "next update due" date shown to both sides. |
| [`replenishment-report.html`](replenishment-report.html) | **Replenishment Report** (S10) for run RPL-2026-1029-0600: KPI cards and one row per item warehouse. If the supplier reports vendor stock, a requisition goes to that supplier for min(qty, vendor stock) and the remainder goes on a requisition without a supplier; other items get one requisition, as today. |
| [`email-replenishment.html`](email-replenishment.html) | The **replenishment notification email** (S11), listing requisitions created with and without a supplier. |
| [`requisitions.html`](requisitions.html) | **Requisitions** from the run (S12): edit quantities, assign a supplier to the uncovered remainder, and **Submit** → Approved with a PO number. |

## Design-system notes

- Colours, spacing, radius, type and shadows use **Clarity** token values
  ([`css/clarity-tokens.css`](css/clarity-tokens.css), copied from the Inventory Optimization prototype).
- Page styles live in [`css/styles.css`](css/styles.css); shared behaviour in [`js/app.js`](js/app.js).
- The Supplier Portal and Enterprise On-Hand Balances pages are Clarity-styled (Nunito Sans + tokens), tables included,
  so they match the Figma frames (the original Supplier Portal screengrab used Helvetica in the table).
- The classic page body (Helvetica, legacy blues) and global header have no Clarity equivalents; those values are
  literals scoped in the CSS, as in Inventory Optimization.
- Exported Figma icons go in [`assets/`](assets/).
