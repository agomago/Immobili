import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCircle, AlertCircle, Home, Receipt,
  Calendar, X, CreditCard, ExternalLink, Loader
} from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
import PagaRataModal from '../components/affitti/PagaRataModal'
import PagaModal from '../components/spese/PagaModal'
import clsx from 'clsx'

const TIPO_CONFIG = {
  scadenza_spesa:    { icon: Receipt,  bg: 'bg-amber-50',  color: 'text-amber-500',  azione: 'paga_spesa' },
  affitto_scaduto:   { icon: Home,     bg: 'bg-red-50',    color: 'text-red-500',    azione: 'paga_affitto' },
  contratto_scadenza:{ icon: Calendar, bg: 'bg-blue-50',   color: 'text-blue-500',   azione: 'vai_affitti' },
}

export default function Alert({ onRead }) {
  const [alerts, setAlerts] = useState([])
  const [pagaRataModal, setPagaRataModal] = useState(null)  // { rata, contratto }
  const [pagaSpesaModal, setPagaSpesaModal] = useState(null) // spesa object
  const [loadingId, setLoadingId] = useState(null)
  const navigate = useNavigate()
  const api = window.api

  const load = useCallback(() =>
    api?.alert.getPendenti().then(setAlerts), [])

  useEffect(() => { load() }, [load])

  const segnaLetto = async (id) => {
    await api.alert.segnaLetto(id)
    setAlerts(p => p.filter(a => a.id !== id))
    onRead?.()
  }

  const segnaLettoTutti = async () => {
    const count = alerts.length
    await Promise.all(alerts.map(a => api.alert.segnaLetto(a.id)))
    setAlerts([])
    for (let i = 0; i < count; i++) onRead?.()
  }

  // Apre il modal di pagamento adatto al tipo di alert
  const gestisci = async (alert) => {
    setLoadingId(alert.id)
    try {
      if (alert.tipo === 'affitto_scaduto') {
        const rata = await api.pagamentiAffitto.getById(alert.entita_id)
        if (rata) {
          // Costruiamo l'oggetto "contratto" con i campi che PagaRataModal si aspetta
          const contratto = {
            id: rata.contratto_id,
            inquilino_id: rata.inquilino_id,
            inquilino_nome: rata.inquilino_nome,
            immobile_nome: rata.immobile_nome,
            unita_nome: rata.unita_nome,
            canone_mensile: rata.canone_mensile
          }
          setPagaRataModal({ rata, contratto, alert_id: alert.id })
        }
      } else if (alert.tipo === 'scadenza_spesa') {
        const spesa = await api.spese.getById(alert.entita_id)
        if (spesa) setPagaSpesaModal({ spesa, alert_id: alert.id })
      } else if (alert.tipo === 'contratto_scadenza') {
        navigate('/affitti')
      }
    } finally {
      setLoadingId(null)
    }
  }

  const oggi = new Date()
  const urgenti = alerts.filter(a => {
    const diff = (new Date(a.data_scadenza) - oggi) / (1000 * 60 * 60 * 24)
    return diff <= 3
  })
  const altri = alerts.filter(a => {
    const diff = (new Date(a.data_scadenza) - oggi) / (1000 * 60 * 60 * 24)
    return diff > 3
  })

  const AlertItem = ({ a }) => {
    const cfg = TIPO_CONFIG[a.tipo] || { icon: Bell, bg: 'bg-slate-50', color: 'text-slate-500', azione: null }
    const Icon = cfg.icon
    const diff = Math.round((new Date(a.data_scadenza) - oggi) / (1000 * 60 * 60 * 24))
    const isLoading = loadingId === a.id

    const labelAzione = {
      paga_spesa:   { label: 'Paga spesa', icon: CreditCard },
      paga_affitto: { label: 'Paga affitto', icon: CreditCard },
      vai_affitti:  { label: 'Vedi contratto', icon: ExternalLink },
    }[cfg.azione]

    return (
      <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:bg-slate-50/50 group">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
          <Icon size={18} className={cfg.color} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">{a.titolo}</p>
          <p className="text-xs text-slate-500 mt-0.5">{a.messaggio}</p>
          <p className={clsx('text-xs font-medium mt-1',
            diff < 0 ? 'text-red-600' : diff <= 3 ? 'text-amber-600' : 'text-slate-400')}>
            {diff < 0
              ? `Scaduto ${Math.abs(diff)} giorni fa`
              : diff === 0 ? 'Scade oggi'
              : `Scade tra ${diff} giorni (${a.data_scadenza})`}
          </p>
        </div>

        {/* Azioni */}
        <div className="flex items-center gap-2 shrink-0">
          {labelAzione && (
            <button
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                cfg.azione === 'vai_affitti'
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  : 'bg-green-50 hover:bg-green-100 text-green-700'
              )}
              onClick={() => gestisci(a)}
              disabled={isLoading}>
              {isLoading
                ? <Loader size={12} className="animate-spin" />
                : <labelAzione.icon size={12} />}
              {isLoading ? 'Caricamento...' : labelAzione.label}
            </button>
          )}
          <button
            className="p-1.5 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-slate-100"
            title="Segna come letto"
            onClick={() => segnaLetto(a.id)}>
            <X size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{alerts.length} alert pendenti</p>
        {alerts.length > 0 && (
          <button className="btn-secondary text-xs" onClick={segnaLettoTutti}>
            <CheckCircle size={14} /> Segna tutti come letti
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="card">
          <EmptyState icon={Bell} title="Nessun alert pendente"
            description="Ottimo! Nessuna scadenza o notifica in attesa" />
        </div>
      ) : (
        <div className="space-y-4">
          {urgenti.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <AlertCircle size={13} /> Urgenti (entro 3 giorni) — {urgenti.length}
              </h2>
              <div className="space-y-2">
                {urgenti.map(a => <AlertItem key={a.id} a={a} />)}
              </div>
            </div>
          )}
          {altri.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                Prossimamente — {altri.length}
              </h2>
              <div className="space-y-2">
                {altri.map(a => <AlertItem key={a.id} a={a} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal pagamento affitto */}
      {pagaRataModal && (
        <PagaRataModal
          rata={pagaRataModal.rata}
          contratto={pagaRataModal.contratto}
          onPagamentoRiuscito={async (rata_id, contratto_id, dati) => {
            const alert_id = pagaRataModal.alert_id
            setPagaRataModal(null)
            // Segna automaticamente l'alert come letto dopo il pagamento
            await segnaLetto(alert_id)
          }}
          onClose={() => setPagaRataModal(null)}
        />
      )}

      {/* Modal pagamento spesa */}
      {pagaSpesaModal && (
        <PagaModal
          spesa={pagaSpesaModal.spesa}
          onClose={async () => {
            const alert_id = pagaSpesaModal.alert_id
            setPagaSpesaModal(null)
            // Segna l'alert come letto dopo il pagamento
            await segnaLetto(alert_id)
          }}
        />
      )}
    </div>
  )
}
