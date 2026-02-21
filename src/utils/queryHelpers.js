/**
 * Query helper utilities for common SQL patterns
 */

/**
 * Build a SELECT query with optional filters
 * @param {string} tableName - Table name
 * @param {Array<string>} columns - Column names (default: *)
 * @param {Object} options - Query options
 * @returns {string} SQL query
 */
export function buildSelectQuery(tableName, columns = ['*'], options = {}) {
  const {
    where = null,
    orderBy = null,
    limit = null,
    offset = null,
    groupBy = null,
  } = options

  let query = `SELECT ${columns.join(', ')} FROM ${tableName}`

  if (where) {
    query += ` WHERE ${where}`
  }

  if (groupBy) {
    query += ` GROUP BY ${groupBy}`
  }

  if (orderBy) {
    query += ` ORDER BY ${orderBy}`
  }

  if (limit) {
    query += ` LIMIT ${limit}`
  }

  if (offset) {
    query += ` OFFSET ${offset}`
  }

  return query
}

/**
 * Build a date range filter
 * @param {string} columnName - Date column name
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {string} WHERE clause
 */
export function buildDateRangeFilter(columnName, startDate, endDate) {
  return `${columnName} BETWEEN '${startDate}' AND '${endDate}'`
}

/**
 * Build an aggregation query
 * @param {string} tableName - Table name
 * @param {string} groupByColumn - Column to group by
 * @param {Object} aggregations - Aggregation functions (e.g., { total: 'SUM(amount)', count: 'COUNT(*)' })
 * @param {Object} options - Additional query options
 * @returns {string} SQL query
 */
export function buildAggregationQuery(tableName, groupByColumn, aggregations, options = {}) {
  const {
    where = null,
    orderBy = null,
    limit = null,
  } = options

  const aggColumns = Object.entries(aggregations)
    .map(([alias, expr]) => `${expr} as ${alias}`)
    .join(', ')

  let query = `SELECT ${groupByColumn}, ${aggColumns} FROM ${tableName}`

  if (where) {
    query += ` WHERE ${where}`
  }

  query += ` GROUP BY ${groupByColumn}`

  if (orderBy) {
    query += ` ORDER BY ${orderBy}`
  }

  if (limit) {
    query += ` LIMIT ${limit}`
  }

  return query
}

/**
 * Build a JOIN query
 * @param {string} leftTable - Left table name
 * @param {string} rightTable - Right table name
 * @param {string} joinCondition - Join condition (e.g., 'left.id = right.foreign_id')
 * @param {Array<string>} columns - Column names to select
 * @param {Object} options - Additional query options
 * @returns {string} SQL query
 */
export function buildJoinQuery(leftTable, rightTable, joinCondition, columns = ['*'], options = {}) {
  const {
    joinType = 'INNER',
    where = null,
    orderBy = null,
    limit = null,
  } = options

  let query = `SELECT ${columns.join(', ')} FROM ${leftTable}`
  query += ` ${joinType} JOIN ${rightTable} ON ${joinCondition}`

  if (where) {
    query += ` WHERE ${where}`
  }

  if (orderBy) {
    query += ` ORDER BY ${orderBy}`
  }

  if (limit) {
    query += ` LIMIT ${limit}`
  }

  return query
}

/**
 * Build a time series aggregation query
 * @param {string} tableName - Table name
 * @param {string} dateColumn - Date column name
 * @param {string} valueColumn - Value column to aggregate
 * @param {string} interval - Time interval ('day', 'week', 'month', 'year')
 * @param {string} aggregateFunction - Aggregate function (e.g., 'SUM', 'AVG', 'COUNT')
 * @returns {string} SQL query
 */
export function buildTimeSeriesQuery(tableName, dateColumn, valueColumn, interval = 'day', aggregateFunction = 'SUM') {
  const dateFormat = {
    day: '%Y-%m-%d',
    week: '%Y-W%W',
    month: '%Y-%m',
    year: '%Y'
  }[interval] || '%Y-%m-%d'

  return `
    SELECT
      strftime('${dateFormat}', ${dateColumn}) as period,
      ${aggregateFunction}(${valueColumn}) as value
    FROM ${tableName}
    GROUP BY period
    ORDER BY period ASC
  `
}

/**
 * Build a top N query
 * @param {string} tableName - Table name
 * @param {string} valueColumn - Column to measure
 * @param {string} labelColumn - Column for labels
 * @param {number} n - Number of top items
 * @param {string} aggregateFunction - Aggregate function (default: SUM)
 * @param {Object} options - Additional query options
 * @returns {string} SQL query
 */
export function buildTopNQuery(tableName, valueColumn, labelColumn, n = 10, aggregateFunction = 'SUM', options = {}) {
  const {
    where = null,
    orderDirection = 'DESC',
  } = options

  let query = `
    SELECT
      ${labelColumn},
      ${aggregateFunction}(${valueColumn}) as total
    FROM ${tableName}
  `

  if (where) {
    query += ` WHERE ${where}`
  }

  query += `
    GROUP BY ${labelColumn}
    ORDER BY total ${orderDirection}
    LIMIT ${n}
  `

  return query
}

/**
 * Escape single quotes in SQL string values
 * @param {string} value - String value to escape
 * @returns {string} Escaped value
 */
export function escapeSqlString(value) {
  if (typeof value !== 'string') {
    return value
  }
  return value.replace(/'/g, "''")
}

/**
 * Build a parameterized WHERE IN clause
 * @param {string} columnName - Column name
 * @param {Array} values - Array of values
 * @returns {string} WHERE IN clause
 */
export function buildInClause(columnName, values) {
  const escapedValues = values
    .map(v => typeof v === 'string' ? `'${escapeSqlString(v)}'` : v)
    .join(', ')

  return `${columnName} IN (${escapedValues})`
}

/**
 * Build a search filter for multiple columns
 * @param {Array<string>} columns - Column names to search
 * @param {string} searchTerm - Search term
 * @returns {string} WHERE clause with OR conditions
 */
export function buildSearchFilter(columns, searchTerm) {
  const escapedTerm = escapeSqlString(searchTerm)
  const conditions = columns
    .map(col => `${col} LIKE '%${escapedTerm}%'`)
    .join(' OR ')

  return `(${conditions})`
}

/**
 * Build a pagination clause
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {Object} Object with limit and offset
 */
export function buildPagination(page, pageSize) {
  const limit = pageSize
  const offset = (page - 1) * pageSize

  return { limit, offset }
}

/**
 * Format a date for SQL queries
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export function formatDateForSql(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * Get current date range (today, this week, this month, etc.)
 * @param {string} range - Range type ('today', 'week', 'month', 'year')
 * @returns {Object} Object with startDate and endDate
 */
export function getDateRange(range) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let startDate, endDate

  switch (range) {
    case 'today':
      startDate = today
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      break

    case 'week':
      const dayOfWeek = today.getDay()
      startDate = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000)
      endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000 - 1)
      break

    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
      break

    case 'year':
      startDate = new Date(today.getFullYear(), 0, 1)
      endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59)
      break

    default:
      startDate = today
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
  }

  return {
    startDate: formatDateForSql(startDate),
    endDate: formatDateForSql(endDate)
  }
}
