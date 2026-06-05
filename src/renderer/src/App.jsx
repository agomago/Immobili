import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import Immobili from './pages/Immobili'
import ImmobileDetail from './pages/ImmobileDetail'
import Spese from './pages/Spese'
import SpeseForm from './pages/SpeseForm'
import Affitti from './pages/Affitti'
import Inquilini from './pages/Inquilini'
import Report from './pages/Report'
import Alert from './pages/Alert'
import Backup from './pages/Backup'
import ReportGrafico from './pages/ReportGrafico'

export default function App() {
  const [alertCount, setAlertCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const api = window.api
    if (!api) return
    api.alert.getPendenti().then(a => setAlertCount(a.length))
    api.alert.onUpdate(alerts => setAlertCount(alerts.length))
  }, [])

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar open={sidebarOpen} alertCount={alertCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(o => !o)} alertCount={alertCount} />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/immobili" element={<Immobili />} />
            <Route path="/immobili/:id" element={<ImmobileDetail />} />
            <Route path="/spese" element={<Spese />} />
            <Route path="/spese/nuova" element={<SpeseForm />} />
            <Route path="/spese/:id/modifica" element={<SpeseForm />} />
            <Route path="/affitti" element={<Affitti />} />
            <Route path="/inquilini" element={<Inquilini />} />
            <Route path="/report" element={<Report />} />
            <Route path="/alert" element={<Alert onRead={() => setAlertCount(c => Math.max(0, c - 1))} />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/grafici" element={<ReportGrafico />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
