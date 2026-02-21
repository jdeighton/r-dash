import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDatabase } from '../context/DatabaseContext'
import { routeConfig } from '../router'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const { state } = useDatabase()

  const tableRoutes = useMemo(
    () => routeConfig.filter(r => r.category === 'Tables'),
    []
  )

  const chartRoutes = useMemo(
    () => routeConfig.filter(r => r.category === 'Charts'),
    []
  )

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Welcome to react-dash</h1>
        <p className={styles.dashboardSubtitle}>
          Business Intelligence Dashboard powered by DuckDB
        </p>
      </div>

      {!state.isLoaded ? (
        <div className={styles.welcomeSection}>
          <div className={styles.welcomeCard}>
            <div className={styles.welcomeIcon}>{'\uD83D\uDCCA'}</div>
            <h2>Get Started</h2>
            <p>
              To begin exploring your data, drag and drop a DuckDB database file
              onto this page.
            </p>
            <div className={styles.supportedFormats}>
              <h3>Supported Formats:</h3>
              <ul>
                <li><code>.db</code> - SQLite/DuckDB database</li>
                <li><code>.duckdb</code> - DuckDB database</li>
                <li><code>.parquet</code> - Apache Parquet files</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.dashboardContent}>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>{'\uD83D\uDCC1'}</div>
              <div className={styles.statInfo}>
                <h3>Database</h3>
                <p className={styles.statValue}>{state.filename}</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>{'\uD83D\uDCCA'}</div>
              <div className={styles.statInfo}>
                <h3>Tables</h3>
                <p className={styles.statValue}>{state.tables.length}</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>{'\u2705'}</div>
              <div className={styles.statInfo}>
                <h3>Status</h3>
                <p className={`${styles.statValue} ${styles.statusConnected}`}>Connected</p>
              </div>
            </div>
          </div>

          <div className={styles.quickLinksSection}>
            <h2>Quick Links</h2>
            <div className={styles.quickLinksGrid}>
              <div className={styles.quickLinksGroup}>
                <h3>{'\uD83D\uDCCA'} Tables</h3>
                {tableRoutes.map(route => (
                  <Link key={route.path} to={route.path} className={styles.quickLink}>
                    {route.title}
                  </Link>
                ))}
              </div>

              <div className={styles.quickLinksGroup}>
                <h3>{'\uD83D\uDCC8'} Charts</h3>
                {chartRoutes.map(route => (
                  <Link key={route.path} to={route.path} className={styles.quickLink}>
                    {route.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {state.tables.length > 0 && (
            <div className={styles.tablesSection}>
              <h2>Available Tables</h2>
              <div className={styles.tablesGrid}>
                {state.tables.map(table => (
                  <div key={table} className={styles.tableCard}>
                    <div className={styles.tableIcon}>{'\uD83D\uDCCB'}</div>
                    <p className={styles.tableName}>{table}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
