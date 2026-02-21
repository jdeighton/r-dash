import React, { useMemo } from 'react'
import ChartView from './ChartView'

const SALES_BY_CATEGORY_QUERY = `
  SELECT
    p.category,
    CAST(SUM(s.amount) AS DOUBLE) as total_sales,
    COUNT(s.id) as num_transactions
  FROM sales s
  JOIN products p ON s.product_id = p.id
  GROUP BY p.category
  ORDER BY total_sales DESC
`

export default function SalesByCategoryChart() {
  const chartOptions = useMemo(() => ({
    title: {
      text: 'Total Sales by Product Category',
    },
    series: [
      {
        type: 'bar',
        xKey: 'category',
        yKey: 'total_sales',
        yName: 'Total Sales',
        fill: '#3b82f6',
        strokeWidth: 0,
        label: {
          enabled: true,
          color: 'white',
          fontWeight: 'bold',
          formatter: (params) => {
            return '$' + params.value.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })
          },
        },
      },
    ],
  }), [])

  return (
    <ChartView
      title="Sales by Category"
      query={SALES_BY_CATEGORY_QUERY}
      chartOptions={chartOptions}
    />
  )
}
