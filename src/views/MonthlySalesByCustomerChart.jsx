import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ChartView from './ChartView'

export default function MonthlySalesByCustomerChart() {
  const { customerId } = useParams()
  const id = parseInt(customerId, 10)

  const query = useMemo(() => `
    SELECT
      strftime(date, '%Y-%m') AS month,
      CAST(SUM(amount) AS DOUBLE) AS total_sales
    FROM sales
    WHERE customer_id = ${id}
    GROUP BY month
    ORDER BY month
  `, [id])

  const chartOptions = useMemo(() => ({
    title: {
      text: `Monthly Sales — Customer #${customerId}`,
    },
    series: [
      {
        type: 'bar',
        xKey: 'month',
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
  }), [customerId])

  if (isNaN(id)) {
    return <div style={{ padding: '2rem', color: '#ef4444' }}>Invalid customer ID.</div>
  }

  return (
    <ChartView
      title={`Monthly Sales — Customer #${customerId}`}
      query={query}
      chartOptions={chartOptions}
    />
  )
}
