# Vendor Managed Inventory — clickable HTML prototype

A static, clickable prototype of **Vendor Managed Inventory**. Open [`index.html`](index.html) to start.

No build step: plain HTML, CSS and JavaScript.

## Flows

### Inventory Settings — Figma [`2:2`](https://www.figma.com/design/7iUP0blmrcCG6lBzGADb9q/Vendor-Managed-Inventory?node-id=2-2)

| Page | What you can do |
| --- | --- |
| [`index.html`](index.html) | Classic Setup page with Adjustment Codes, Inventory Valuation, Cycle Count, Receipts, On-Hand Balances, Lot Management and Inventory Options. The green **+** adds an adjustment-code row. On-Hand Balances has a new **Allow Vendor Managed Inventory** checkbox (off by default). **Save** validates (a reason needs a code and vice versa; day fields must be whole numbers) and stores the settings in `localStorage`; **Cancel** reverts to the last save. Valuation Method is read-only because an inventory balance exists. |

## Design-system notes

- Colours, spacing, radius, type and shadows use **Clarity** token values
  ([`css/clarity-tokens.css`](css/clarity-tokens.css), copied from the Inventory Optimization prototype).
- Page styles live in [`css/styles.css`](css/styles.css); shared behaviour in [`js/app.js`](js/app.js).
- The classic page body (Helvetica, legacy blues) and global header have no Clarity equivalents; those values are
  literals scoped in the CSS, as in Inventory Optimization.
- Exported Figma icons go in [`assets/`](assets/).
