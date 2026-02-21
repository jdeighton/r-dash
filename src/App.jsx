import React, { useEffect } from 'react'
import { HashRouter } from 'react-router-dom'
import { DatabaseProvider } from './context/DatabaseContext'
import Sidebar from './components/Sidebar'
import DragDropLoader from './components/DragDropLoader'
import { AppRoutes } from './router'
import AppInner from './AppInner'
import styles from './App.module.css'

export default function App() {
  return (
    <DatabaseProvider>
      <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppInner />
      </HashRouter>
    </DatabaseProvider>
  )
}
