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

export default function CustomersTable() {
  return (
    <TableView
      title="Customers"
      query={CUSTOMERS_QUERY}
      tableName="customers"
    />
  )
}
