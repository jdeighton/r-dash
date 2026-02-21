# react-dash — Developer Guide

This document explains how to add new table views, chart views, quick-filter bars, and sidebar navigation categories to the app. It assumes you have already added any new tables to the DuckDB database file your users will drag and drop onto the dashboard.

---

## Table of Contents

1. [Project structure overview](#1-project-structure-overview)
2. [Adding a new Table view](#2-adding-a-new-table-view)
3. [Adding Quick Filter buttons to a Table view](#3-adding-quick-filter-buttons-to-a-table-view)
4. [Adding a new Chart view](#4-adding-a-new-chart-view)
5. [Registering a new view (routing + nav)](#5-registering-a-new-view-routing--nav)
6. [Adding a new sidebar category](#6-adding-a-new-sidebar-category)

---

## 1. Project structure overview

```
src/
├── views/
│   ├── TableView.jsx          # Generic table wrapper (AG Grid)
│   ├── TableView.module.css
│   ├── ChartView.jsx          # Generic chart wrapper (AG Charts)
│   ├── ChartView.module.css
│   │
│   ├── ProductsTable.jsx      # One file per concrete table view
│   ├── ProductsTable.module.css
│   ├── SalesTable.jsx
│   ├── CustomersTable.jsx
│   │
│   ├── RevenueChart.jsx       # One file per concrete chart view
│   ├── SalesByCategoryChart.jsx
│   └── TopProductsChart.jsx
│
├── components/
│   ├── Sidebar.jsx            # Navigation sidebar
│   └── SearchBar.jsx
│
├── hooks/
│   ├── useDuckDB.js           # DuckDB query interface
│   └── useAgGrid.js           # AG Grid helpers (column defs, filters, export)
│
└── router.jsx                 # Single source of truth for all routes + nav titles
```

The pattern is consistent throughout:

- **`router.jsx`** is the single place where routes are declared. The sidebar and dashboard both read from it automatically — you do **not** need to edit those files to add a new view, unless you want a new *category* (section heading) in the nav.
- **`TableView`** and **`ChartView`** are generic host components. Each concrete view is a thin wrapper that supplies a SQL query and display configuration; the host handles data loading, error states, loading spinners, and export buttons.

---

## 2. Adding a new Table view

### Step 1 — Create the view file

Create `src/views/WidgetsTable.jsx` (replace "Widgets" with your table name):

```jsx
import React from 'react'
import TableView from './TableView'

const WIDGETS_QUERY = `
  SELECT
    id,
    name,
    colour,
    CAST(weight_kg AS DOUBLE) as weight_kg,
    warehouse_id
  FROM widgets
  ORDER BY name ASC
`

export default function WidgetsTable() {
  return (
    <TableView
      title="Widgets"
      query={WIDGETS_QUERY}
      tableName="widgets"
    />
  )
}
```

**Things to decide in the query:**

| Decision | Guidance |
|---|---|
| Which columns to show | List them explicitly rather than using `SELECT *` so you control order and naming. |
| Numeric precision | Wrap decimal columns in `CAST(col AS DOUBLE)` so they render as JS numbers rather than BigInt/string proxies from Arrow. |
| Default sort | An `ORDER BY` here is the initial sort; the user can re-sort any column in the grid. |
| Joins / aggregations | Fine to use; this is plain DuckDB SQL. Just make sure every output column has a clean alias. |
| Column header names | `useAgGrid.js` auto-generates headers from column names: underscores become spaces and the first letter is capitalised. If you want something different, rename the column in the SQL with an alias (`warehouse_id AS "Warehouse"`). |

**What `TableView` gives you for free:**

- Sortable, filterable, resizable columns via AG Grid Community
- Pagination (default 50 rows; selector for 20 / 50 / 100 / 200)
- A live search bar (quick-filter across all visible columns)
- CSV export button
- Loading and error states

### Step 2 — Register the route

See [Section 5](#5-registering-a-new-view-routing--nav).

---

## 3. Adding Quick Filter buttons to a Table view

Quick filter buttons appear between the search bar and the grid. They call AG Grid's `setFilterModel` API to apply or clear column-level filters without touching the search bar.

This is only relevant for views that benefit from one-click preset filters. Tables that don't need them require no changes.

### Step 1 — Create a filter bar component

Add a component (in the same file as your table view, or in its own file) that accepts `{ gridApiRef }`:

```jsx
// Inside WidgetsTable.jsx (or a separate WidgetsFilterBar.jsx)

function WidgetsFilterBar({ gridApiRef }) {

  // Helper: merges a new filter for one column into the existing filter model.
  // Pass `null` as the model to clear that column's filter.
  const applyFilter = (column, model) => {
    const api = gridApiRef?.current
    if (!api) return
    const current = api.getFilterModel()
    if (model) {
      api.setFilterModel({ ...current, [column]: model })
    } else {
      const { [column]: _removed, ...rest } = current
      api.setFilterModel(rest)
    }
  }

  return (
    <>
      {/* Number filter examples */}
      <button onClick={() => applyFilter('weight_kg', {
        filterType: 'number', type: 'lessThan', filter: 1
      })}>
        Lightweight (&lt; 1 kg)
      </button>

      <button onClick={() => applyFilter('weight_kg', null)}>
        All Weights
      </button>

      {/* Text filter examples */}
      <button onClick={() => applyFilter('colour', {
        filterType: 'text', type: 'contains', filter: 'red'
      })}>
        Colour contains "red"
      </button>

      <button onClick={() => applyFilter('colour', {
        filterType: 'text', type: 'startsWith', filter: 'bl'
      })}>
        Colour starts "bl"
      </button>

      <button onClick={() => applyFilter('colour', null)}>
        All Colours
      </button>
    </>
  )
}
```

**Important:** use `getFilterModel()` and spread the result before setting. This ensures that applying a stock filter doesn't wipe out an active category filter, and vice versa — each button only owns its own column key.

**AG Grid filter model reference:**

| Filter type | `filterType` | Common `type` values |
|---|---|---|
| Number | `'number'` | `'equals'` `'greaterThan'` `'greaterThanOrEqual'` `'lessThan'` `'lessThanOrEqual'` `'inRange'` |
| Text | `'text'` | `'equals'` `'contains'` `'notContains'` `'startsWith'` `'endsWith'` |

For `'inRange'` (numbers) you also supply `filterTo`:
```js
{ filterType: 'number', type: 'inRange', filter: 10, filterTo: 50 }
```

### Step 2 — Pass the component to TableView

```jsx
export default function WidgetsTable() {
  return (
    <TableView
      title="Widgets"
      query={WIDGETS_QUERY}
      tableName="widgets"
      filterBar={WidgetsFilterBar}   // <-- add this prop
    />
  )
}
```

`TableView` receives this as the `filterBar` prop, renames it to a capitalised `FilterBar`, and renders `<FilterBar gridApiRef={gridApiRef} />` once data has loaded. The ref object (not `.current`) is passed so click handlers always read the live API value.

### Step 3 — Style the buttons

Create `src/views/WidgetsTable.module.css` (or reuse the pattern from `ProductsTable.module.css`):

```css
.filterBtn {
  padding: 0.4rem 0.9rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

/* Add colour variants as needed */
.filterBtnBlue   { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
.filterBtnReset  { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
```

To add a visual separator between button groups, insert:

```jsx
<span className={styles.filterSeparator} />
```

and define in CSS:

```css
.filterSeparator {
  display: inline-block;
  width: 1px;
  height: 1.5rem;
  background: #cbd5e1;
  margin: 0 0.25rem;
  align-self: center;
}
```

---

## 4. Adding a new Chart view

### Step 1 — Create the view file

Create `src/views/WidgetsByColourChart.jsx`:

```jsx
import React, { useMemo } from 'react'
import ChartView from './ChartView'

const WIDGETS_BY_COLOUR_QUERY = `
  SELECT
    colour,
    COUNT(*) as count
  FROM widgets
  GROUP BY colour
  ORDER BY count DESC
`

export default function WidgetsByColourChart() {
  const chartOptions = useMemo(() => ({
    title: { text: 'Widgets by Colour' },
    series: [
      {
        type: 'bar',
        xKey: 'colour',
        yKey: 'count',
        yName: 'Count',
      },
    ],
  }), [])

  return (
    <ChartView
      title="Widgets by Colour"
      query={WIDGETS_BY_COLOUR_QUERY}
      chartOptions={chartOptions}
    />
  )
}
```

**What `ChartView` gives you for free:**

- Data loading from DuckDB with loading/error/empty states
- AG Charts instance lifecycle (create on mount, update on data change, destroy on unmount)
- "Copy to clipboard" and "Download PNG" toolbar buttons

### Step 2 — Configure chartOptions

`chartOptions` is passed directly to AG Charts Community alongside the data. The most important part is the `series` array. Common series types:

| Chart type | `series[].type` | Required keys |
|---|---|---|
| Line | `'line'` | `xKey`, `yKey` |
| Bar (vertical) | `'bar'` | `xKey`, `yKey` |
| Bar (horizontal) | `'bar'` + `direction: 'horizontal'` | `xKey`, `yKey` |
| Pie | `'pie'` | `angleKey`, `calloutLabelKey` |
| Donut | `'donut'` | `angleKey`, `calloutLabelKey`, `innerRadiusRatio` |
| Area | `'area'` | `xKey`, `yKey` |
| Scatter | `'scatter'` | `xKey`, `yKey` |

**The column names in `xKey` / `yKey` must exactly match the column aliases in your SQL query.**

Multiple series (e.g. grouped bars, multi-line) are supported by adding more objects to the `series` array, each with its own `yKey`.

**Tips:**

- Wrap `chartOptions` in `useMemo` (as shown above) to prevent AG Charts from re-creating the chart on every render.
- For currency labels, add a `label.formatter` to the series (see `SalesByCategoryChart.jsx` for an example).
- For time-series x-axes, the `date` column should be a string in a format AG Charts can parse (e.g. `YYYY-MM-DD`). No extra axis configuration is needed for basic cases.
- For a full reference of `chartOptions` see the [AG Charts Community docs](https://www.ag-grid.com/charts/javascript/overview/).

### Step 3 — Register the route

See [Section 5](#5-registering-a-new-view-routing--nav).

---

## 5. Registering a new view (routing + nav)

**`src/router.jsx` is the only file you need to edit** to make a new view appear in the app, the sidebar, and the dashboard quick-links. The sidebar and dashboard both derive their nav links from `routeConfig` automatically.

### Step 1 — Add a lazy import

```jsx
// At the top of router.jsx, with the other lazy imports:
const WidgetsTable = lazy(() => import('./views/WidgetsTable'))
const WidgetsByColourChart = lazy(() => import('./views/WidgetsByColourChart'))
```

### Step 2 — Add entries to routeConfig

```jsx
export const routeConfig = [
  { path: '/', name: 'Dashboard', title: 'Dashboard' },

  // --- existing tables ---
  { path: '/tables/sales',     name: 'SalesTable',     title: 'Sales Transactions', category: 'Tables' },
  { path: '/tables/products',  name: 'ProductsTable',  title: 'Products',           category: 'Tables' },
  { path: '/tables/customers', name: 'CustomersTable', title: 'Customers',          category: 'Tables' },

  // --- new table ---
  { path: '/tables/widgets',   name: 'WidgetsTable',   title: 'Widgets',            category: 'Tables' },

  // --- existing charts ---
  { path: '/charts/revenue',        name: 'RevenueChart',         title: 'Revenue Trend',       category: 'Charts' },
  { path: '/charts/sales-category', name: 'SalesByCategoryChart', title: 'Sales by Category',   category: 'Charts' },
  { path: '/charts/top-products',   name: 'TopProductsChart',     title: 'Top Products',        category: 'Charts' },

  // --- new chart ---
  { path: '/charts/widgets-colour', name: 'WidgetsByColourChart', title: 'Widgets by Colour',   category: 'Charts' },
]
```

The `category` string is what the sidebar and dashboard use as the section heading. It must match one of the category values the sidebar already filters on (`'Tables'` or `'Charts'`), unless you are adding a new section — see Section 6.

### Step 3 — Add Route elements

Inside the `<Routes>` block in the same file:

```jsx
<Route path="/tables/widgets"   element={<WidgetsTable />} />
<Route path="/charts/widgets-colour" element={<WidgetsByColourChart />} />
```

That's it. The sidebar nav link and dashboard quick-link will appear automatically on next render.

---

## 6. Adding a new sidebar category

The sidebar currently renders two hard-coded sections — **Tables** and **Charts** — by filtering `routeConfig` on `category`. To add a third section (e.g. "Reports"):

### Step 1 — Add your routes with the new category

In `router.jsx`, use the new category string:

```jsx
{ path: '/reports/monthly', name: 'MonthlyReport', title: 'Monthly Summary', category: 'Reports' },
```

### Step 2 — Add a section block in Sidebar.jsx

In `src/components/Sidebar.jsx`, add a `useMemo` alongside the existing `tableRoutes` and `chartRoutes`:

```jsx
const reportRoutes = useMemo(
  () => routeConfig.filter(r => r.category === 'Reports'),
  []
)
```

Then add a nav section in the JSX, following the same pattern:

```jsx
<div className={styles.navSection}>
  <h3 className={styles.sectionTitle}>Reports</h3>
  {reportRoutes.map(route => (
    <Link
      key={route.path}
      to={route.path}
      className={`${styles.navLink} ${location.pathname === route.path ? styles.active : ''}`}
    >
      <span className={styles.navIcon}>📄</span>
      <span className={styles.navText}>{route.title}</span>
    </Link>
  ))}
</div>
```

### Step 3 — Add the same section to Dashboard.jsx

`src/views/Dashboard.jsx` renders quick-links in the same category pattern. Add a `useMemo` and a `<div className={styles.quickLinksGroup}>` block, mirroring the existing Tables and Charts groups.

```jsx
const reportRoutes = useMemo(
  () => routeConfig.filter(r => r.category === 'Reports'),
  []
)

// Inside the quickLinksGrid:
<div className={styles.quickLinksGroup}>
  <h3>📄 Reports</h3>
  {reportRoutes.map(route => (
    <Link key={route.path} to={route.path} className={styles.quickLink}>
      {route.title}
    </Link>
  ))}
</div>
```

No CSS changes are needed — the existing `navSection`, `sectionTitle`, and `quickLinksGroup` styles apply to all sections.
