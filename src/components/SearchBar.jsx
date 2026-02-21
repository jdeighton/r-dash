import React, { useState, useEffect, useRef, useCallback } from 'react'
import styles from './SearchBar.module.css'

export default function SearchBar({ placeholder = 'Search...', debounceMs = 300, value = '', onSearch }) {
  const [searchTerm, setSearchTerm] = useState(value)
  const debounceTimer = useRef(null)

  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  const handleInput = useCallback((e) => {
    const newValue = e.target.value
    setSearchTerm(newValue)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      if (onSearch) onSearch(newValue)
    }, debounceMs)
  }, [debounceMs, onSearch])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    if (onSearch) onSearch('')
  }, [onSearch])

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchInputWrapper}>
        <span className={styles.searchIcon}>{'\uD83D\uDD0D'}</span>
        <input
          value={searchTerm}
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          onChange={handleInput}
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className={styles.clearButton}
            aria-label="Clear search"
          >
            {'\u2715'}
          </button>
        )}
      </div>
    </div>
  )
}
