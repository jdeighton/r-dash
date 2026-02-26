import React from 'react'
import TableView from './TableView'

const CUSTOMERS_QUERY = `
  SELECT
    id,
    name,
    email,
    city,
    total_orders
  FROM customers
  ORDER BY total_orders DESC
`

function CustomerIdCellRenderer({ value }) {
  return (
    <a href={`#/charts/monthly-sales-by-customer/${value}`}>
      {value}
    </a>
  )
}

const COLUMN_OVERRIDES = {
  id: { cellRenderer: CustomerIdCellRenderer },
}

export default function CustomersTable() {
  return (
    <TableView
      title="Customers"
      query={CUSTOMERS_QUERY}
      tableName="customers"
      columnOverrides={COLUMN_OVERRIDES}
    />
  )
}
