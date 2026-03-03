import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { AgCharts } from 'ag-charts-react'
import { useDuckDB } from '../hooks/useDuckDB'
import { copyChartToClipboard, downloadChart, isClipboardSupported } from '../utils/chartExport'
import styles from './ChartView.module.css'

const REVENUE_QUERY = `
  SELECT
    date,
    CAST(SUM(amount) AS DOUBLE) as revenue
  FROM sales
  GROUP BY date
  ORDER BY date ASC
`

const EVENTS_QUERY = `
  SELECT start_date, end_date, event_name
  FROM events
  ORDER BY start_date ASC
`

function normaliseRows(raw) {
  return raw.map(row => {
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
}

function buildCrossLines(events) {
  return events.map(({ start_date, end_date, event_name }) => {
    const isRange = end_date != null
    return isRange
      ? {
          type: 'range',
          range: [start_date, end_date],
          fill: '#fbbf24',
          fillOpacity: 0.12,
          stroke: '#f59e0b',
          strokeWidth: 1,
          label: {
            text: event_name,
            position: 'inside-top',
            fontSize: 11,
            color: '#92400e',
          },
        }
      : {
          type: 'line',
          value: start_date,
          stroke: '#ef4444',
          strokeWidth: 2,
          lineDash: [6, 3],
          label: {
            text: event_name,
            position: 'top',
            fontSize: 11,
            color: '#991b1b',
          },
        }
  })
}

export default function RevenueChart() {
  const { queryToArray } = useDuckDB()
  const chartRef = useRef(null)

  const [chartConfig, setChartConfig] = useState(null)
  const [showEvents, setShowEvents] = useState(true)
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
      await downloadChart(chartRef.current, `revenue_trend_${Date.now()}.png`)
      showToast('Chart downloaded!', 'success')
    } catch (err) {
      showToast('Failed to download chart', 'error')
    }
  }, [showToast])

  // Load revenue data and events in parallel.
  // Events query is best-effort — if the table doesn't exist yet the chart
  // still renders without cross lines.
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [rawRevenue, rawEvents] = await Promise.all([
        queryToArray(REVENUE_QUERY),
        queryToArray(EVENTS_QUERY).catch(() => []),
      ])

      const revenueData = normaliseRows(rawRevenue)
      const events = normaliseRows(rawEvents)

      if (revenueData.length === 0) {
        setLoading(false)
        return
      }

      setChartConfig({ revenueData, crossLines: buildCrossLines(events) })
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
      console.error('Failed to load revenue chart:', err)
    }
  }, [queryToArray])

  useEffect(() => {
    loadData()
  }, [loadData])

  const options = useMemo(() => {
    if (!chartConfig) return null

    const { revenueData, crossLines } = chartConfig
    const activeCrossLines = showEvents ? crossLines : []

    return {
      title: { text: 'Daily Revenue Trend' },
      data: revenueData,
      series: [
        {
          type: 'line',
          xKey: 'date',
          yKey: 'revenue',
          yName: 'Revenue',
          stroke: '#3b82f6',
          strokeWidth: 3,
          marker: {
            enabled: true,
            fill: '#3b82f6',
            stroke: '#ffffff',
            strokeWidth: 2,
            size: 6,
          },
        },
      ],
      axes: [
        {
          type: 'time',
          position: 'bottom',
          crossLines: activeCrossLines,
        },
        {
          type: 'number',
          position: 'left',
        },
      ],
    }
  }, [chartConfig, showEvents])

  return (
    <div className={styles.chartView}>
      <div className={styles.chartHeader}>
        <h2 className={styles.chartTitle}>Revenue Trend</h2>
        <div className={styles.chartActions}>
          {chartConfig && chartConfig.crossLines.length > 0 && (
            <button
              onClick={() => setShowEvents(v => !v)}
              className={styles.toggleButton}
              data-active={showEvents}
            >
              {showEvents ? 'Hide Events' : 'Show Events'}
            </button>
          )}
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
        <div className={styles.chartContainer}>
          <AgCharts options={options} ref={chartRef} />
        </div>
      )}
    </div>
  )
}
