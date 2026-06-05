import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Home, Receipt, AlertCircle, Bell, TrendingUp } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [scadenze, setScadenze] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const api = window.api

  useEffect(() => {
    if (!api) return
    Promise.all([
      api.dashboard.getSummary(),
      api.spese.getScadenze(14)
    ]).then(([s, sc]) => {
      setSummary(s)
      setScadenze(sc)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  const fmt = (n) => `€ ${parseFloat(n || 0).toFixed(2)}`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Immobili" value={summary.immobili} icon={Building2} color="blue"
          onClick={() => navigate('/immobili')} />
        <StatCard label="Contratti attivi" value={summary.contratti_attivi} icon={Home} color="green"
          onClick={() => navigate('/affitti')} />
        <StatCard label="Spese da pagare" value={summary.spese_da_pagare.n}
          sub={fmt(summary.spese_da_pagare.tot)} icon={Receipt} color="yellow"
          onClick={() => navigate('/spese')} />
        <StatCard label="Affitti da incassare" value={summary.affitti_da_incassare.n}
          sub={fmt(summary.affitti_da_incassare.tot)} icon={TrendingUp} color="purple"
          onClick={() => navigate('/affitti')} />
        <StatCard label="Scadenze 7 giorni" value={summary.scadenze_settimana} icon={AlertCircle} color="red"
          onClick={() => navigate('/spese')} />
        <StatCard label="Alert pendenti" value={summary.alert_pendenti} icon={Bell} color="red"
          onClick={() => navigate('/alert')} />
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <AlertCircle size={18} className="text-amber-500" />
          Scadenze prossimi 14 giorni
        </h2>
        {scadenze.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Nessuna scadenza imminente</p>
        ) : (
          <div className="space-y-2">
            {scadenze.map(s => {
              const scad = new Date(s.data_scadenza)
              const oggi = new Date()
              const diff = Math.round((scad - oggi) / (1000 * 60 * 60 * 24))
              const urgente = diff <= 3
              return (
                <div key={s.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => navigate('/spese')}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: s.colore || '#6b7280' }} />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{s.descrizione}</p>
                      <p className="text-xs text-slate-400">{s.immobile_nome} · {s.categoria_nome}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">{fmt(s.importo)}</p>
                    <p className={`text-xs font-medium ${urgente ? 'text-red-600' : 'text-amber-600'}`}>
                      {diff === 0 ? 'Oggi' : diff < 0 ? `${Math.abs(diff)}g scaduta` : `tra ${diff} giorni`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
