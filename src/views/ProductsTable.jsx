import React from 'react'
import TableView from './TableView'
import styles from './ProductsTable.module.css'

const PRODUCTS_QUERY = `
  SELECT
    id,
    name,
    category,
    CAST(price AS DOUBLE) as price,
    stock
  FROM products
  ORDER BY name ASC
`

function ProductFilterBar({ gridApiRef }) {
  const applyStockFilter = (model) => {
    const api = gridApiRef?.current
    if (!api) return
    const current = api.getFilterModel()
    if (model) {
      api.setFilterModel({ ...current, stock: model })
    } else {
      const { stock, ...rest } = current
      api.setFilterModel(rest)
    }
  }

  const applyCategoryFilter = (model) => {
    const api = gridApiRef?.current
    if (!api) return
    const current = api.getFilterModel()
    if (model) {
      api.setFilterModel({ ...current, category: model })
    } else {
      const { category, ...rest } = current
      api.setFilterModel(rest)
    }
  }

  return (
    <>
      <button
        className={`${styles.filterBtn} ${styles.filterBtnHigh}`}
        onClick={() => applyStockFilter({ filterType: 'number', type: 'greaterThanOrEqual', filter: 100 })}
      >
        Stock &ge; 100
      </button>
      <button
        className={`${styles.filterBtn} ${styles.filterBtnLow}`}
        onClick={() => applyStockFilter({ filterType: 'number', type: 'lessThan', filter: 100 })}
      >
        Stock &lt; 100
      </button>
      <button
        className={`${styles.filterBtn} ${styles.filterBtnReset}`}
        onClick={() => applyStockFilter(null)}
      >
        All Stock Levels
      </button>

      <span className={styles.filterSeparator} />

      <button
        className={`${styles.filterBtn} ${styles.filterBtnCategory}`}
        onClick={() => applyCategoryFilter({ filterType: 'text', type: 'contains', filter: '&' })}
      >
        Category contains "&amp;"
      </button>
      <button
        className={`${styles.filterBtn} ${styles.filterBtnCategory}`}
        onClick={() => applyCategoryFilter({ filterType: 'text', type: 'startsWith', filter: 'Bo' })}
      >
        Category starts "Bo"
      </button>
      <button
        className={`${styles.filterBtn} ${styles.filterBtnReset}`}
        onClick={() => applyCategoryFilter(null)}
      >
        All Categories
      </button>
    </>
  )
}

export default function ProductsTable() {
  return (
    <TableView
      title="Products"
      query={PRODUCTS_QUERY}
      tableName="products"
      filterBar={ProductFilterBar}
    />
  )
}
