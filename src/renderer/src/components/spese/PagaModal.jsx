import React, { useState } from 'react'
import Modal from '../ui/Modal'
import { CheckCircle, AlertCircle, Loader } from 'lucide-react'

const METODI = [
  { value: 'bonifico',  label: 'Bonifico bancario' },
  { value: 'rid',       label: 'Addebito diretto (RID/SDD)' },
  { value: 'carta',     label: 'Carta di credito/debito' },
  { value: 'contanti',  label: 'Contanti' },
  { value: 'assegno',   label: 'Assegno' },
  { value: 'paypal',    label: 'PayPal' },
  { value: 'crypto',    label: 'Crypto' },
]

export default function PagaModal({ spesa, onClose }) {
  const [form, setForm] = useState({
    data_pagamento: new Date().toISOString().split('T')[0],
    metodo_pagamento: 'contanti'
  })
  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState(null)
  const api = window.api

  const salva = async () => {
    setLoading(true)
    setErrore(null)
    try {
      await api.spese.pagaSpesa(spesa.id, form)
      onClose()
    } catch (e) {
      setErrore(e?.message || 'Errore durante il salvataggio')
    } finally {
      setLoading(false)
    }
  }

  const F = (k) => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) })

  return (
    <Modal open title={`Registra pagamento`} onClose={onClose} size="sm">
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg mb-4">
        <CheckCircle size={18} className="text-green-600 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">{spesa.descrizione}</p>
          <p className="text-xs text-green-600">
            Importo: <strong>€ {parseFloat(spesa.importo).toFixed(2)}</strong>
            {spesa.fornitore ? ` · ${spesa.fornitore}` : ''}
          </p>
        </div>
      </div>

      {errore && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg mb-3 text-xs text-red-700">
          <AlertCircle size={14} className="shrink-0" /> {errore}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="label">Data pagamento</label>
          <input className="input" type="date" {...F('data_pagamento')} />
        </div>
        <div>
          <label className="label">Metodo di pagamento</label>
          <select className="input" {...F('metodo_pagamento')}>
            {METODI.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
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
