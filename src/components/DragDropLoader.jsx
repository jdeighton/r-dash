import React, { useState, useRef, useCallback } from 'react'
import { useDuckDB } from '../hooks/useDuckDB'
import { useDatabase } from '../context/DatabaseContext'
import styles from './DragDropLoader.module.css'

export default function DragDropLoader() {
  const { loadDatabase, loading } = useDuckDB()
  const { state } = useDatabase()

  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0)
  const [loadingMessage, setLoadingMessage] = useState('Loading database...')
  const [error, setError] = useState(null)

  const isLoaded = state.isLoaded
  const isLoading = state.isLoading || loading

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    dragCounter.current++
    setIsDragOver(true)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const processFile = useCallback(async (file) => {
    setError(null)

    const validExtensions = ['.db', '.duckdb', '.parquet']
    const fileName = file.name.toLowerCase()
    const isValid = validExtensions.some(ext => fileName.endsWith(ext))

    if (!isValid) {
      setError(`Invalid file type. Please select a file with one of these extensions: ${validExtensions.join(', ')}`)
      return
    }

    try {
      setLoadingMessage(`Loading ${file.name}...`)
      await loadDatabase(file)
      setLoadingMessage('Database loaded successfully!')
    } catch (err) {
      setError(err.message || 'Failed to load database file')
    }
  }, [loadDatabase])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    dragCounter.current = 0

    const files = e.dataTransfer.files
    if (files.length === 0) return
    processFile(files[0])
  }, [processFile])

  const handleFileInput = useCallback((e) => {
    const files = e.target.files
    if (files.length === 0) return
    processFile(files[0])
  }, [processFile])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  if (isLoaded && !isDragOver) return null

  const overlayClass = `${styles.overlay} ${isDragOver ? styles.dragOver : ''}`

  return (
    <div
      className={overlayClass}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.dropZone}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>{loadingMessage}</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <div className={styles.errorIcon}>{'\u26A0\uFE0F'}</div>
            <p className={styles.errorMessage}>{error}</p>
            <button onClick={clearError} className={styles.retryButton}>
              Try Again
            </button>
          </div>
        ) : (
          <div className={styles.dropPrompt}>
            <div className={styles.dropIcon}>{'\uD83D\uDCC1'}</div>
            <h2>Drop Database File Here</h2>
            <p className={styles.dropDescription}>
              Drag and drop a DuckDB database file to get started
            </p>
            <p className={styles.supportedFormats}>
              Supported formats: .db, .duckdb, .parquet
            </p>
            <div className={styles.orDivider}>or</div>
            <label className={styles.fileInputLabel}>
              <input
                type="file"
                accept=".db,.duckdb,.parquet"
                onChange={handleFileInput}
                className={styles.fileInput}
              />
              <span className={styles.fileButton}>Browse Files</span>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
