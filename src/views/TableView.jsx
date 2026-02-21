import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import SearchBar from '../components/SearchBar'
import { useDuckDB } from '../hooks/useDuckDB'
import { getDefaultGridOptions, generateColumnDefs, exportToCsv, updateQuickFilter } from '../hooks/useAgGrid'
import styles from './TableView.module.css'

// Register AG Grid modules once
ModuleRegistry.registerModules([AllCommunityModule])

export default function TableView({ title, query, tableName, filterBar: FilterBar }) {
  const { queryToArray } = useDuckDB()
  const gridApiRef = useRef(null)

  const [rowData, setRowData] = useState([])
  const [columnDefs, setColumnDefs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const gridOptions = getDefaultGridOptions()

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

      setRowData(plainData)

      if (plainData.length > 0) {
        setColumnDefs(generateColumnDefs(plainData))
      }

      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
      console.error('Failed to load table data:', err)
    }
  }, [query, queryToArray])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onGridReady = useCallback((params) => {
    gridApiRef.current = params.api
  }, [])

  const handleSearch = useCallback((searchValue) => {
    updateQuickFilter(gridApiRef.current, searchValue)
  }, [])

  const handleExport = useCallback(() => {
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`
    exportToCsv(gridApiRef.current, filename)
  }, [title])

  return (
    <div className={styles.tableView}>
      <div className={styles.tableHeader}>
        <h2 className={styles.tableTitle}>{title}</h2>
        <div className={styles.tableActions}>
          {rowData.length > 0 && (
            <button onClick={handleExport} className={styles.exportButton}>
              {'\uD83D\uDCE5'} Export CSV
            </button>
          )}
        </div>
      </div>

      <SearchBar
        placeholder={`Search ${title.toLowerCase()}...`}
        onSearch={handleSearch}
      />

      {FilterBar && rowData.length > 0 && (
        <div className={styles.filterBar}>
          <FilterBar gridApiRef={gridApiRef} />
        </div>
      )}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading data...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      ) : rowData.length === 0 ? (
        <div className={styles.emptyContainer}>
          <p>No data available</p>
        </div>
      ) : (
        <div className={`${styles.gridContainer} ag-theme-alpine`} style={{ width: '100%', height: '100%' }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            {...gridOptions}
            onGridReady={onGridReady}
          />
        </div>
      )}
    </div>
  )
}
