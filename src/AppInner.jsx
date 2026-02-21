import React, { useEffect } from 'react'
import Sidebar from './components/Sidebar'
import DragDropLoader from './components/DragDropLoader'
import { AppRoutes } from './router'
import { useDuckDB } from './hooks/useDuckDB'
import styles from './App.module.css'

export default function AppInner() {
  const { initializeDuckDB } = useDuckDB()

  useEffect(() => {
    initializeDuckDB().catch(err => {
      console.error('Failed to initialize DuckDB:', err)
    })
  }, [])

  return (
    <div className={styles.app}>
      <DragDropLoader />
      <div className={styles.appLayout}>
        <Sidebar />
        <main className={styles.mainContent}>
          <AppRoutes />
        </main>
      </div>
    </div>
  )
}
