import React, { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import { CheckCircle, AlertCircle, Loader, User } from 'lucide-react'

export const METODI = [
  { value: 'contanti',  label: 'Contanti' },
  { value: 'bonifico',  label: 'Bonifico bancario' },
  { value: 'rid',       label: 'Addebito diretto (RID/SDD)' },
  { value: 'carta',     label: 'Carta di credito/debito' },
  { value: 'assegno',   label: 'Assegno' },
  { value: 'paypal',    label: 'PayPal' },
  { value: 'crypto',    label: 'Crypto' },
]

export default function PagaRataModal({ rata, contratto, onPagamentoRiuscito, onClose }) {
  const [form, setForm] = useState({
    data_pagamento: new Date().toISOString().split('T')[0],
    metodo_pagamento: 'contanti',
    note: ''
  })
  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState(null)
  const [inquilino, setInquilino] = useState(null)
  const api = window.api

  // Carica il metodo di pagamento preferito dell'inquilino
  useEffect(() => {
    if (!contratto?.inquilino_id) return
    api.inquilini.getById(contratto.inquilino_id).then(inq => {
      if (inq) {
        setInquilino(inq)
        setForm(f => ({
          ...f,
          metodo_pagamento: inq.metodo_pagamento_default || 'contanti'
        }))
      }
    })
  }, [contratto?.inquilino_id])

  const salva = async () => {
    setLoading(true)
    setErrore(null)
    // Cattura i valori stabili prima di qualsiasi operazione asincrona
    const rata_id = rata.id
    const contratto_id = contratto.id
    const datiPagamento = { ...form }

    try {
      const result = await api.pagamentiAffitto.pagaRata(rata_id, datiPagamento)
      // Notifica il parent con tutti i dati necessari — nessuna closure stale
      await onPagamentoRiuscito(rata_id, contratto_id, datiPagamento)
    } catch (e) {
      console.error('Errore pagamento:', e)
      setErrore(e?.message || 'Errore durante il salvataggio. Riprova.')
      setLoading(false)
    }
  }

  const F = (k) => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) })

  return (
    <Modal open title={`Registra pagamento — ${rata.mese_riferimento}`} onClose={onClose} size="sm">
      {/* Riepilogo */}
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg mb-4">
        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          {inquilino?.foto_path
            ? <img src={`file://${inquilino.foto_path}`} className="w-full h-full rounded-full object-cover" />
            : <User size={16} className="text-green-600" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-green-800">
            {contratto.immobile_nome} · {contratto.unita_nome}
          </p>
          <p className="text-xs text-green-600">
            {contratto.inquilino_nome} · <strong>€ {parseFloat(rata.importo).toFixed(2)}</strong>
          </p>
        </div>
      </div>

      {errore && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg mb-4 text-xs text-red-700">
          <AlertCircle size={14} className="shrink-0" /> {errore}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="label">Data pagamento</label>
          <div className="flex gap-2">
            <input className="input" type="date" {...F('data_pagamento')} />
            <button
              type="button"
              title={`Imposta data prevista: ${rata.data_scadenza}`}
              className="shrink-0 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-xs font-medium text-slate-600 hover:text-blue-700 transition-colors whitespace-nowrap"
              onClick={() => setForm(f => ({ ...f, data_pagamento: rata.data_scadenza }))}>
              📅 Data prevista
            </button>
          </div>
          {form.data_pagamento === rata.data_scadenza && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle size={11} /> Pagamento regolare alla data di scadenza ({rata.data_scadenza})
            </p>
          )}
        </div>
        <div>
          <label className="label">
            Metodo di pagamento
            {inquilino?.metodo_pagamento_default && (
              <span className="ml-2 text-blue-500 font-normal normal-case">
                (default inquilino: {METODI.find(m => m.value === inquilino.metodo_pagamento_default)?.label})
              </span>
            )}
          </label>
          <select className="input" {...F('metodo_pagamento')}>
            {METODI.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Note</label>
          <input className="input" placeholder="Opzionale..." {...F('note')} />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t">
        <button className="btn-secondary" onClick={onClose} disabled={loading}>Annulla</button>
        <button className="btn-success" onClick={salva} disabled={loading}>
          {loading ? <Loader size={15} className="animate-spin" /> : <CheckCircle size={15} />}
          {loading ? 'Salvataggio...' : 'Conferma pagamento'}
        </button>
      </div>
    </Modal>
  )
}
