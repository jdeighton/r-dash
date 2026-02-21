import React, { useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useDatabase } from '../context/DatabaseContext'
import { routeConfig } from '../router'
import styles from './Sidebar.module.css'

export default function Sidebar() {
  const location = useLocation()
  const { state } = useDatabase()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const statusClass = state.isLoading
    ? styles.loading
    : state.isLoaded
      ? styles.connected
      : styles.disconnected

  const statusText = state.isLoading
    ? 'Loading...'
    : state.isLoaded
      ? 'Connected'
      : 'No Database'

  const tableRoutes = useMemo(
    () => routeConfig.filter(r => r.category === 'Tables'),
    []
  )

  const chartRoutes = useMemo(
    () => routeConfig.filter(r => r.category === 'Charts'),
    []
  )

  const sidebarClass = `${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`

  return (
    <aside className={sidebarClass}>
      <div className={styles.sidebarHeader}>
        <h1 className={styles.appTitle}>react-dash</h1>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={styles.collapseButton}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? '\u2630' : '\u2715'}
        </button>
      </div>

      <div className={styles.databaseStatus}>
        <div className={`${styles.statusIndicator} ${statusClass}`}>
          <span className={styles.statusDot}></span>
          <span className={styles.statusText}>{statusText}</span>
        </div>
        {state.filename && (
          <p className={styles.dbFilename}>{state.filename}</p>
        )}
      </div>

      <nav className={styles.navMenu}>
        <div className={styles.navSection}>
          <Link
            to="/"
            className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>{'\uD83C\uDFE0'}</span>
            <span className={styles.navText}>Dashboard</span>
          </Link>
        </div>

        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>Tables</h3>
          {tableRoutes.map(route => (
            <Link
              key={route.path}
              to={route.path}
              className={`${styles.navLink} ${location.pathname === route.path ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{'\uD83D\uDCCA'}</span>
              <span className={styles.navText}>{route.title}</span>
            </Link>
          ))}
        </div>

        <div className={styles.navSection}>
          <h3 className={styles.sectionTitle}>Charts</h3>
          {chartRoutes.map(route => (
            <Link
              key={route.path}
              to={route.path}
              className={`${styles.navLink} ${location.pathname === route.path ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{'\uD83D\uDCC8'}</span>
              <span className={styles.navText}>{route.title}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className={styles.sidebarFooter}>
        <p className={styles.footerText}>Powered by DuckDB WASM</p>
      </div>
    </aside>
  )
}
