import React, { useMemo } from 'react'
import ChartView from './ChartView'

const TOP_PRODUCTS_QUERY = `
  SELECT
    p.name as product,
    CAST(SUM(s.amount) AS DOUBLE) as revenue
  FROM sales s
  JOIN products p ON s.product_id = p.id
  GROUP BY p.name
  ORDER BY revenue DESC
  LIMIT 10
`

export default function TopProductsChart() {
  const chartOptions = useMemo(() => ({
    title: {
      text: 'Top 10 Products by Revenue',
    },
    series: [
      {
        type: 'donut',
        angleKey: 'revenue',
        calloutLabelKey: 'product',
        innerRadiusRatio: 0.6,
        sectorSpacing: 2,
        calloutLabel: {
          enabled: true,
        },
        sectorLabel: {
          enabled: true,
          color: 'white',
          fontWeight: 'bold',
          formatter: ({ value }) => {
            return '$' + value.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })
          },
        },
      },
    ],
  }), [])

  return (
    <ChartView
      title="Top Products"
      query={TOP_PRODUCTS_QUERY}
      chartOptions={chartOptions}
    />
  )
}
