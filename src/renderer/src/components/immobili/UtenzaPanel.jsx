import React, { useEffect, useState } from 'react'
import { Zap, Flame, Droplets, Plus, Edit2, Save, X, Info } from 'lucide-react'
import clsx from 'clsx'

const TIPI = [
  {
    tipo: 'luce',
    label: 'Energia Elettrica',
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    campi: [
      { key: 'pod', label: 'POD', placeholder: 'IT001E12345678901234567K', mono: true, desc: 'Punto di Prelievo — identifica il contatore elettrico' },
      { key: 'matricola_contatore', label: 'Matricola contatore', placeholder: 'es. A1234567', mono: true },
      { key: 'fornitore_attuale', label: 'Fornitore attuale', placeholder: 'es. Enel Energia' },
    ]
  },
  {
    tipo: 'gas',
    label: 'Gas Naturale',
    icon: Flame,
    color: 'text-red-500',
    bg: 'bg-red-50',
    campi: [
      { key: 'pdr', label: 'PDR', placeholder: '01234567890123456', mono: true, desc: 'Punto di Riconsegna — identifica il contatore gas' },
      { key: 'matricola_contatore', label: 'Matricola contatore', placeholder: 'es. G12345678', mono: true },
      { key: 'fornitore_attuale', label: 'Fornitore attuale', placeholder: 'es. ENI Gas' },
    ]
  },
  {
    tipo: 'acqua',
    label: 'Acqua / Idrico',
    icon: Droplets,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    campi: [
      { key: 'matricola_contatore', label: 'Matricola contatore', placeholder: 'es. W987654321', mono: true },
      { key: 'fornitore_attuale', label: 'Gestore idrico', placeholder: 'es. ACEA, MM S.p.A.' },
    ]
  },
]

function UtenzaCard({ tipo, dati, immobile_id, unita_id, onSaved }) {
  const [editing, setEditing] = useState(!dati)
  const [form, setForm] = useState({
    pod: dati?.pod || '',
    pdr: dati?.pdr || '',
    matricola_contatore: dati?.matricola_contatore || '',
    fornitore_attuale: dati?.fornitore_attuale || '',
    note: dati?.note || ''
  })
  const [saving, setSaving] = useState(false)
  const api = window.api
  const Icon = tipo.icon

  const salva = async () => {
    setSaving(true)
    try {
      await api.utenze.upsert({
        immobile_id,
        unita_id: unita_id || null,
        tipo: tipo.tipo,
        pod: form.pod || null,
        pdr: form.pdr || null,
        matricola_contatore: form.matricola_contatore || null,
        fornitore_attuale: form.fornitore_attuale || null,
        note: form.note || null
      })
      setEditing(false)
      onSaved()
    } finally { setSaving(false) }
  }

  const annulla = () => {
    setForm({
      pod: dati?.pod || '', pdr: dati?.pdr || '',
      matricola_contatore: dati?.matricola_contatore || '',
      fornitore_attuale: dati?.fornitore_attuale || '',
      note: dati?.note || ''
    })
    setEditing(false)
  }

  return (
    <div className={clsx('rounded-xl border p-4 space-y-3', editing ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center', tipo.bg)}>
            <Icon size={14} className={tipo.color} />
          </div>
          <span className="font-medium text-slate-700 text-sm">{tipo.label}</span>
        </div>
        {!editing && (
          <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
            onClick={() => setEditing(true)}>
            <Edit2 size={13} />
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          {tipo.campi.map(campo => (
            <div key={campo.key}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                {campo.label}
                {campo.desc && <span className="text-slate-400 font-normal normal-case ml-2">— {campo.desc}</span>}
              </label>
              <input
                className={clsx('w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white', campo.mono && 'font-mono')}
                placeholder={campo.placeholder}
                value={form[campo.key]}
                onChange={e => setForm(p => ({ ...p, [campo.key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button className="btn-primary text-xs py-1.5 px-3" onClick={salva} disabled={saving}>
              <Save size={12} /> {saving ? 'Salvo...' : 'Salva'}
            </button>
            {dati && <button className="btn-secondary text-xs py-1.5 px-3" onClick={annulla}><X size={12} /> Annulla</button>}
          </div>
        </div>
      ) : dati ? (
        <div className="space-y-1.5 text-xs">
          {tipo.campi.map(campo => dati[campo.key] && (
            <div key={campo.key} className="flex gap-2">
              <span className="text-slate-400 shrink-0 w-28">{campo.label}:</span>
              <span className={clsx('text-slate-700 font-medium', campo.mono && 'font-mono')}>{dati[campo.key]}</span>
            </div>
          ))}
          {!tipo.campi.some(c => dati[c.key]) && (
            <p className="text-slate-400 italic">Nessun dato inserito</p>
          )}
        </div>
      ) : (
        <button className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
          onClick={() => setEditing(true)}>
          <Plus size={11} /> Aggiungi dati fornitura
        </button>
      )}
    </div>
  )
}

export default function UtenzaPanel({ immobile_id }) {
  const [utenze, setUtenze] = useState([])
  const api = window.api

  const load = () => api.utenze.getByImmobile(immobile_id).then(setUtenze)
  useEffect(() => { load() }, [immobile_id])

  const getDati = (tipo) => utenze.find(u => u.tipo === tipo && !u.unita_id) || null

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-slate-800">Codici Fornitura Utenze</h2>
        <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
          <Info size={11} /> POD · PDR · Matricola contatore
        </div>
      </div>
      <p className="text-xs text-slate-500">
        I codici fornitura sono legati all'immobile e vengono auto-compilati nelle bollette.
        Rimangono invariati anche al cambio del fornitore.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {TIPI.map(t => (
          <UtenzaCard key={t.tipo} tipo={t}
            dati={getDati(t.tipo)}
            immobile_id={immobile_id}
            onSaved={load} />
        ))}
      </div>
    </div>
  )
}
