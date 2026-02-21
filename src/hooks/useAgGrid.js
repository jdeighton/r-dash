/**
 * AG Grid configuration factory and utilities for React.
 * Unlike the Vue composable, this does not hold refs to gridApi internally.
 * Instead, the calling component manages the API ref via onGridReady.
 */

export function getDefaultGridOptions() {
  return {
    // Use legacy CSS-based themes (compatible with ag-grid.css and ag-theme-alpine.css)
    theme: 'legacy',

    // Pagination
    pagination: true,
    paginationPageSize: 50,
    paginationPageSizeSelector: [20, 50, 100, 200],

    // Row selection (v35+ object format)
    rowSelection: {
      mode: 'multiRow',
    },

    // Auto-size columns
    autoSizeStrategy: {
      type: 'fitCellContents',
    },

    // Default column definition
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100,
    },

  }
}

/**
 * Generate column definitions from data
 */
export function generateColumnDefs(data) {
  if (!data || data.length === 0) {
    return []
  }

  const firstRow = data[0]
  const columns = Object.keys(firstRow).map(key => {
    const value = firstRow[key]
    const colDef = {
      field: key,
      headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    }

    // Check if this looks like a currency column
    const isCurrencyColumn = /amount|total|price|revenue|cost|sales/i.test(key)

    // Check if this looks like a numeric column
    const isNumeric = typeof value === 'number' ||
                     (typeof value === 'string' && !isNaN(parseFloat(value)) && isFinite(value))

    // Add value formatter based on data type
    if (value !== null && value !== undefined) {
      if (isNumeric) {
        colDef.valueFormatter = (params) => {
          if (params.value == null || params.value === '') return ''

          let cleanValue = params.value

          if (typeof cleanValue === 'string') {
            cleanValue = cleanValue.replace(/\\"/g, '').replace(/^"|"$/g, '').trim()
            cleanValue = parseFloat(cleanValue)
          }

          if (isNaN(cleanValue)) return params.value

          if (isCurrencyColumn) {
            return '$' + cleanValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          }

          if (cleanValue % 1 !== 0) {
            return cleanValue.toFixed(2)
          }
          return cleanValue.toLocaleString()
        }
      } else if (value instanceof Date || /date|time/i.test(key)) {
        colDef.valueFormatter = (params) => {
          if (params.value == null) return ''
          const dateValue = params.value instanceof Date ? params.value : new Date(params.value)
          return dateValue.toLocaleDateString()
        }
      } else if (typeof value === 'object') {
        colDef.valueFormatter = (params) => {
          if (params.value == null) return ''
          return JSON.stringify(params.value)
        }
      }
    }

    return colDef
  })

  return columns
}

/**
 * Export grid data to CSV
 */
export function exportToCsv(gridApi, filename = 'export.csv') {
  if (gridApi) {
    gridApi.exportDataAsCsv({ fileName: filename })
  }
}

/**
 * Apply quick filter (search)
 */
export function updateQuickFilter(gridApi, searchText) {
  if (gridApi) {
    gridApi.setGridOption('quickFilterText', searchText)
  }
}
