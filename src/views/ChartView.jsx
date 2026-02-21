import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { AgCharts, ModuleRegistry, AllCommunityModule } from 'ag-charts-community'
import { useDuckDB } from '../hooks/useDuckDB'
import { copyChartToClipboard, downloadChart, isClipboardSupported } from '../utils/chartExport'
import styles from './ChartView.module.css'

// Register AG Charts Community modules once
ModuleRegistry.registerModules([AllCommunityModule])

export default function ChartView({ title, query, chartOptions }) {
  const { queryToArray } = useDuckDB()
  const containerRef = useRef(null)
  const chartInstanceRef = useRef(null)

  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copying, setCopying] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await queryToArray(query)

      // Convert DuckDB Arrow proxies to plain JavaScript objects
      const plainData = data.map(row => {
        const plainRow = {}
        for (const key in row) {
          let value = row[key]
          if (typeof value === 'string') {
            value = value.replace(/^"|"$/g, '').replace(/\\"/g, '"')
          }
          plainRow[key] = value
        }
        return plainRow
      })

      setChartData(plainData)
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
      console.error('Failed to load chart data:', err)
    }
  }, [query, queryToArray])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Create/update/destroy chart imperatively
  useEffect(() => {
    if (!chartData.length || !containerRef.current) return

    const options = {
      container: containerRef.current,
      ...chartOptions,
      data: chartData,
    }

    if (chartInstanceRef.current) {
      AgCharts.update(chartInstanceRef.current, options)
    } else {
      chartInstanceRef.current = AgCharts.create(options)
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
        chartInstanceRef.current = null
      }
    }
  }, [chartData, chartOptions])

  const handleCopyToClipboard = useCallback(async () => {
    if (!chartInstanceRef.current) {
      showToast('Chart not ready', 'error')
      return
    }

    try {
      setCopying(true)

      if (!isClipboardSupported()) {
        showToast('Clipboard API not supported. Try downloading instead.', 'warning')
        setCopying(false)
        return
      }

      await copyChartToClipboard(chartInstanceRef.current)
      showToast('Chart copied to clipboard!', 'success')
    } catch (err) {
      console.error('Failed to copy chart:', err)
      showToast(`Failed to copy chart: ${err.message}`, 'error')
    } finally {
      setCopying(false)
    }
  }, [showToast])

  const handleDownload = useCallback(async () => {
    if (!chartInstanceRef.current) {
      showToast('Chart not ready', 'error')
      return
    }

    try {
      const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.png`
      await downloadChart(chartInstanceRef.current, filename)
      showToast('Chart downloaded!', 'success')
    } catch (err) {
      console.error('Failed to download chart:', err)
      showToast('Failed to download chart', 'error')
    }
  }, [title, showToast])

  return (
    <div className={styles.chartView}>
      <div className={styles.chartHeader}>
        <h2 className={styles.chartTitle}>{title}</h2>
        <div className={styles.chartActions}>
          {!loading && !error && chartData.length > 0 && (
            <>
              <button
                onClick={handleCopyToClipboard}
                className={styles.copyButton}
                disabled={copying}
              >
                {copying ? '\uD83D\uDCCB Copying...' : '\uD83D\uDCCB Copy Chart'}
              </button>
              <button
                onClick={handleDownload}
                className={styles.downloadButton}
              >
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
      ) : chartData.length === 0 ? (
        <div className={styles.emptyContainer}>
          <p>No data available for chart</p>
        </div>
      ) : (
        <div className={styles.chartContainer} ref={containerRef} />
      )}
    </div>
  )
}
