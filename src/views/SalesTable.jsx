import React from 'react'
import TableView from './TableView'

const SALES_QUERY = `
  SELECT
    id,
    date,
    product_id,
    customer_id,
    quantity,
    CAST(amount AS DOUBLE) as amount,
    CAST(amount AS DOUBLE) as total
  FROM sales
  ORDER BY date DESC
`

export default function SalesTable() {
  return (
    <TableView
      title="Sales Transactions"
      query={SALES_QUERY}
      tableName="sales"
    />
  )
}
