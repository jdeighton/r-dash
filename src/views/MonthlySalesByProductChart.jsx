import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AgCharts, ModuleRegistry, AllCommunityModule } from 'ag-charts-community'
import { useDuckDB } from '../hooks/useDuckDB'
import { copyChartToClipboard, downloadChart, isClipboardSupported } from '../utils/chartExport'
import styles from './ChartView.module.css'

ModuleRegistry.registerModules([AllCommunityModule])

const QUERY = `
  SELECT
    strftime(date, '%Y-%m') AS month,
    product_id,
    CAST(SUM(amount) AS DOUBLE) AS total
  FROM sales
  GROUP BY month, product_id
  ORDER BY month, product_id
`

export default function MonthlySalesByProductChart() {
  const { queryToArray } = useDuckDB()
  const containerRef = useRef(null)
  const chartRef = useRef(null)

  const [chartConfig, setChartConfig] = useState(null) // { data, series } once loaded
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copying, setCopying] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleCopyToClipboard = useCallback(async () => {
    if (!chartRef.current) return
    try {
      setCopying(true)
      if (!isClipboardSupported()) {
        showToast('Clipboard API not supported. Try downloading instead.', 'warning')
        return
      }
      await copyChartToClipboard(chartRef.current)
      showToast('Chart copied to clipboard!', 'success')
    } catch (err) {
      showToast(`Failed to copy chart: ${err.message}`, 'error')
    } finally {
      setCopying(false)
    }
  }, [showToast])

  const handleDownload = useCallback(async () => {
    if (!chartRef.current) return
    try {
      await downloadChart(chartRef.current, `monthly_sales_by_product_${Date.now()}.png`)
      showToast('Chart downloaded!', 'success')
    } catch (err) {
      showToast('Failed to download chart', 'error')
    }
  }, [showToast])

  // Effect 1: load and pivot the data, then store config in state.
  // The state change causes a re-render that mounts the container div.
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const raw = await queryToArray(QUERY)

      const rows = raw.map(row => {
        const plain = {}
        for (const key in row) {
          let value = row[key]
          if (typeof value === 'string') {
            value = value.replace(/^"|"$/g, '').replace(/\\"/g, '"')
          }
          plain[key] = value
        }
        return plain
      })

      if (rows.length === 0) {
        setLoading(false)
        return
      }

      // Collect distinct product IDs in ascending order
      const productIds = [...new Set(rows.map(r => Number(r.product_id)))].sort((a, b) => a - b)

      // Pivot to wide format: { month, p_1: total, p_2: total, ... }
      const monthMap = new Map()
      for (const { month, product_id, total } of rows) {
        if (!monthMap.has(month)) monthMap.set(month, { month })
        monthMap.get(month)[`p_${Number(product_id)}`] = total
      }
      const data = Array.from(monthMap.values())

      const series = productIds.map(id => ({
        type: 'bar',
        xKey: 'month',
        yKey: `p_${id}`,
        yName: `Product ${id}`,
        stacked: true,
      }))

      setChartConfig({ data, series })
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
      console.error('Failed to load monthly sales chart:', err)
    }
  }, [queryToArray])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Effect 2: create or update the chart once chartConfig is in state and the
  // container div has been committed to the DOM by the preceding re-render.
  useEffect(() => {
    if (!chartConfig || !containerRef.current) return

    const { data, series } = chartConfig

    const options = {
      container: containerRef.current,
      title: { text: 'Monthly Sales by Product' },
      data,
      series,
      axes: {
        x: {
          type: 'category',
          label: { rotation: -45 },
        },
        y: {
          type: 'number',
          label: {
            formatter: ({ value }) =>
              '$' + Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 }),
          },
        },
      },
      legend: { enabled: true, position: 'bottom' },
    }

    if (chartRef.current) {
      AgCharts.update(chartRef.current, options)
    } else {
      chartRef.current = AgCharts.create(options)
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [chartConfig])

  return (
    <div className={styles.chartView}>
      <div className={styles.chartHeader}>
        <h2 className={styles.chartTitle}>Monthly Sales by Product</h2>
        <div className={styles.chartActions}>
          {chartConfig && (
            <>
              <button
                onClick={handleCopyToClipboard}
                className={styles.copyButton}
                disabled={copying}
              >
                {copying ? '\uD83D\uDCCB Copying...' : '\uD83D\uDCCB Copy Chart'}
              </button>
              <button onClick={handleDownload} className={styles.downloadButton}>
                {'\uD83D\uDCBE'} Download
              </button>
            </>
          )}
        </div>
      </div>

      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.message}
        </div>
      )}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading chart data...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      ) : !chartConfig ? (
        <div className={styles.emptyContainer}>
          <p>No data available for chart</p>
        </div>
      ) : (
        <div className={styles.chartContainer} ref={containerRef} />
      )}
    </div>
  )
}
