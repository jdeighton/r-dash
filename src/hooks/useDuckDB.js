import { useState, useCallback } from 'react'
import * as duckdb from '@duckdb/duckdb-wasm'
import { useDatabase } from '../context/DatabaseContext'

// DuckDB instance (singleton)
let dbInstance = null

export function useDuckDB() {
  const { state, actions } = useDatabase()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const initializeDuckDB = useCallback(async () => {
    if (dbInstance) {
      return dbInstance
    }

    try {
      actions.setInitializing(true)

      // Use jsdelivr CDN for DuckDB files
      const bundle = await duckdb.selectBundle(duckdb.getJsDelivrBundles())

      // Fetch worker code from CDN and create blob URL (required for file:// protocol)
      const workerResponse = await fetch(bundle.mainWorker)
      const workerBlob = await workerResponse.blob()
      const workerUrl = URL.createObjectURL(workerBlob)

      // Instantiate worker from blob URL (same-origin)
      const worker = new Worker(workerUrl)
      const logger = new duckdb.ConsoleLogger()

      // Initialize DuckDB
      const db = new duckdb.AsyncDuckDB(logger, worker)
      await db.instantiate(bundle.mainModule)

      dbInstance = db
      actions.setInitializing(false)

      return db
    } catch (err) {
      const errorMessage = `Failed to initialize DuckDB: ${err.message}`
      setError(errorMessage)
      actions.setError(errorMessage)
      actions.setInitializing(false)
      throw err
    }
  }, [actions])

  const loadDatabase = useCallback(async (file) => {
    try {
      setLoading(true)
      actions.setLoading(true)
      setError(null)

      // Validate file extension
      const validExtensions = ['.db', '.duckdb', '.parquet']
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

      if (!validExtensions.includes(fileExtension)) {
        throw new Error(`Invalid file type. Expected ${validExtensions.join(', ')}`)
      }

      // Initialize DuckDB if not already done
      const db = await initializeDuckDB()

      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // Register file in DuckDB's virtual file system
      await db.registerFileBuffer(file.name, uint8Array)

      // Create connection
      const connection = await db.connect()

      // Attach the database file
      if (fileExtension === '.parquet') {
        await connection.query(`
          CREATE TABLE data AS
          SELECT * FROM parquet_scan('${file.name}')
        `)
      } else {
        await connection.query(`ATTACH '${file.name}' AS db`)
        await connection.query(`USE db`)
      }

      // Store connection and metadata
      actions.setDatabase(db, connection)
      actions.setMetadata(file.name, [])

      // Fetch table list - need to do this directly since state won't have updated yet
      try {
        const result = await connection.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'main'
          ORDER BY table_name
        `)
        const tables = result.toArray().map(row => row.table_name)
        actions.setTables(tables)
      } catch (tableErr) {
        console.error('Error fetching tables:', tableErr)
      }

      setLoading(false)

      return { db, connection }
    } catch (err) {
      const errorMessage = `Failed to load database: ${err.message}`
      setError(errorMessage)
      actions.setError(errorMessage)
      setLoading(false)
      throw err
    }
  }, [actions, initializeDuckDB])

  const query = useCallback(async (sql) => {
    if (!state.connection) {
      const errorMessage = 'No database connection. Please load a database first.'
      setError(errorMessage)
      throw new Error(errorMessage)
    }

    try {
      setLoading(true)
      setError(null)

      const result = await state.connection.query(sql)

      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = `Query failed: ${err.message}`
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }, [state.connection])

  const queryToArray = useCallback(async (sql) => {
    const result = await query(sql)
    return result.toArray()
  }, [query])

  const queryToColumns = useCallback(async (sql) => {
    const result = await query(sql)
    return result.toColumns()
  }, [query])

  const getTableSchema = useCallback(async (tableName) => {
    try {
      const result = await query(`DESCRIBE ${tableName}`)
      return result.toArray()
    } catch (err) {
      console.error(`Failed to get schema for table ${tableName}:`, err)
      throw err
    }
  }, [query])

  const reset = useCallback(() => {
    actions.reset()
    setError(null)
    setLoading(false)
  }, [actions])

  return {
    loading,
    error,
    isLoaded: state.isLoaded,
    isInitializing: state.isInitializing,
    dbMetadata: {
      filename: state.filename,
      tables: state.tables,
    },
    initializeDuckDB,
    loadDatabase,
    query,
    queryToArray,
    queryToColumns,
    getTableSchema,
    reset,
  }
}
