import React, { createContext, useContext, useReducer, useCallback } from 'react'

const DatabaseContext = createContext(null)

const initialState = {
  db: null,
  connection: null,
  isLoaded: false,
  isLoading: false,
  isInitializing: false,
  filename: '',
  tables: [],
  error: null,
}

function databaseReducer(state, action) {
  switch (action.type) {
    case 'SET_DATABASE':
      return {
        ...state,
        db: action.payload.db,
        connection: action.payload.connection,
        isLoaded: true,
        isLoading: false,
        error: null,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error,
      }
    case 'SET_INITIALIZING':
      return {
        ...state,
        isInitializing: action.payload,
      }
    case 'SET_METADATA':
      return {
        ...state,
        filename: action.payload.filename,
        tables: action.payload.tables,
      }
    case 'SET_TABLES':
      return {
        ...state,
        tables: action.payload,
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isLoaded: false,
      }
    case 'RESET':
      return {
        ...initialState,
      }
    default:
      return state
  }
}

export function DatabaseProvider({ children }) {
  const [state, dispatch] = useReducer(databaseReducer, initialState)

  const setDatabase = useCallback((db, connection) => {
    dispatch({ type: 'SET_DATABASE', payload: { db, connection } })
  }, [])

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }, [])

  const setInitializing = useCallback((initializing) => {
    dispatch({ type: 'SET_INITIALIZING', payload: initializing })
  }, [])

  const setMetadata = useCallback((filename, tables) => {
    dispatch({ type: 'SET_METADATA', payload: { filename, tables } })
  }, [])

  const setTables = useCallback((tables) => {
    dispatch({ type: 'SET_TABLES', payload: tables })
  }, [])

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const getTables = useCallback(async () => {
    if (!state.connection) return []
    try {
      const result = await state.connection.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'main'
        ORDER BY table_name
      `)
      const tables = result.toArray().map(row => row.table_name)
      dispatch({ type: 'SET_TABLES', payload: tables })
      return tables
    } catch (error) {
      console.error('Error fetching tables:', error)
      return []
    }
  }, [state.connection])

  const value = {
    state,
    actions: {
      setDatabase,
      setLoading,
      setInitializing,
      setMetadata,
      setTables,
      setError,
      reset,
      getTables,
    },
  }

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  const context = useContext(DatabaseContext)
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider')
  }
  return context
}
