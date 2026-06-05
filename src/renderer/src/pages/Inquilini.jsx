import React, { useEffect, useState, useCallback } from 'react'
import {
  Plus, User, Phone, Mail, Edit2, Trash2, CreditCard,
  CheckCircle, Clock, AlertCircle, ChevronRight, X,
  TrendingDown, TrendingUp, Calendar, Home, Euro
} from 'lucide-react'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import PhotoUpload from '../components/ui/PhotoUpload'
import clsx from 'clsx'

const DEFAULT = {
  nome: '', cognome: '', codice_fiscale: '', telefono: '',
  email: '', tipo_documento: 'carta_identita', numero_documento: '',
  foto_path: null, metodo_pagamento_default: 'contanti', note: ''
}

const METODI = [
  { value: 'contanti',  label: 'Contanti' },
  { value: 'bonifico',  label: 'Bonifico bancario' },
  { value: 'rid',       label: 'Addebito diretto (RID/SDD)' },
  { value: 'carta',     label: 'Carta di credito/debito' },
  { value: 'assegno',   label: 'Assegno' },
  { value: 'paypal',    label: 'PayPal' },
  { value: 'crypto',    label: 'Crypto' },
]

const TIPO_DOC = {
  carta_identita: "C.I.", passaporto: "Passaporto",
  patente: "Patente", permesso_soggiorno: "Permesso"
}

const fmt = (n) => `€ ${parseFloat(n || 0).toFixed(2)}`

// ── PANNELLO FINANZIARIO INQUILINO ────────────────────────────────────────────

function PannelloFinanziario({ inquilino, onClose }) {
  const [rate, setRate] = useState([])
  const [loading, setLoading] = useState(true)
  const [trimestre, setTrimestre] = useState(3)
  const api = window.api

  const load = useCallback(async () => {
    setLoading(true)
    const dati = await api.pagamentiAffitto.getByInquilino(inquilino.id, trimestre)
    setRate(dati)
    setLoading(false)
  }, [inquilino.id, trimestre])

  useEffect(() => { load() }, [load])

  const pagate   = rate.filter(r => r.stato === 'pagato')
  const daSaldare = rate.filter(r => r.stato !== 'pagato')
  const totPagato = pagate.reduce((a, r) => a + parseFloat(r.importo), 0)
  const totDovuto = daSaldare.reduce((a, r) => a + parseFloat(r.importo), 0)
  const oggi = new Date()

  const statoChip = (r) => {
    if (r.stato === 'pagato') return (
      <span className="badge-green flex items-center gap-1 text-xs">
        <CheckCircle size={10} />Pagato
      </span>
    )
    const scad = new Date(r.data_scadenza)
    if (scad < oggi) return (
      <span className="badge-red flex items-center gap-1 text-xs">
        <AlertCircle size={10} />Scaduto
      </span>
    )
    return (
      <span className="badge-yellow flex items-center gap-1 text-xs">
        <Clock size={10} />Da pagare
      </span>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Pannello laterale */}
      <div className="w-[480px] bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header inquilino */}
        <div className="bg-slate-900 text-white px-6 py-5 shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-700 border-2 border-slate-600 shrink-0 flex items-center justify-center">
                {inquilino.foto_path
                  ? <img src={`file://${inquilino.foto_path}`} className="w-full h-full object-cover" />
                  : <User size={24} className="text-slate-400" />}
              </div>
              <div>
                <h2 className="font-bold text-lg">{inquilino.cognome} {inquilino.nome}</h2>
                {inquilino.codice_fiscale && (
                  <p className="text-xs font-mono text-slate-400">{inquilino.codice_fiscale}</p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="flex gap-4 text-xs text-slate-400">
            {inquilino.telefono && (
              <a href={`tel:${inquilino.telefono}`} className="flex items-center gap-1 hover:text-white">
                <Phone size={11} />{inquilino.telefono}
              </a>
            )}
            {inquilino.email && (
              <a href={`mailto:${inquilino.email}`} className="flex items-center gap-1 hover:text-white">
                <Mail size={11} />{inquilino.email}
              </a>
            )}
          </div>
        </div>

        {/* Filtro periodo */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-sm font-medium text-slate-700">Situazione pagamenti</span>
          <div className="flex gap-1">
            {[1, 3, 6, 12].map(m => (
              <button key={m}
                className={clsx('px-2.5 py-1 rounded-lg text-xs font-medium transition-colors',
                  trimestre === m
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
                onClick={() => setTrimestre(m)}>
                {m === 1 ? '1 mese' : m === 12 ? '1 anno' : `${m} mesi`}
              </button>
            ))}
          </div>
        </div>

        {/* Riepilogo totali */}
        {!loading && rate.length > 0 && (
          <div className="px-6 py-4 grid grid-cols-2 gap-3 shrink-0 border-b border-slate-100">
            <div className="bg-green-50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <TrendingUp size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-green-600 font-medium">Pagato</p>
                <p className="font-bold text-green-800">{fmt(totPagato)}</p>
                <p className="text-xs text-green-500">{pagate.length} rate</p>
              </div>
            </div>
            <div className={clsx('rounded-xl p-3 flex items-center gap-3',
              totDovuto > 0 ? 'bg-red-50' : 'bg-slate-50')}>
              <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                totDovuto > 0 ? 'bg-red-100' : 'bg-slate-100')}>
                <TrendingDown size={18} className={totDovuto > 0 ? 'text-red-600' : 'text-slate-400'} />
              </div>
              <div>
                <p className={clsx('text-xs font-medium', totDovuto > 0 ? 'text-red-600' : 'text-slate-500')}>
                  Da saldare
                </p>
                <p className={clsx('font-bold', totDovuto > 0 ? 'text-red-800' : 'text-slate-500')}>
                  {fmt(totDovuto)}
                </p>
                <p className={clsx('text-xs', totDovuto > 0 ? 'text-red-400' : 'text-slate-400')}>
                  {daSaldare.length} rate
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lista rate */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          ) : rate.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Calendar size={32} className="text-slate-200 mb-3" />
              <p className="text-sm text-slate-500">Nessun pagamento nel periodo selezionato</p>
              <p className="text-xs text-slate-400 mt-1">Prova ad allargare il periodo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Da saldare */}
              {daSaldare.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <AlertCircle size={12} /> Da saldare ({daSaldare.length})
                  </h3>
                  <div className="space-y-1.5">
                    {daSaldare.map(r => (
                      <RataRow key={r.id} rata={r} statoChip={statoChip} fmt={fmt} oggi={oggi} />
                    ))}
                  </div>
                </div>
              )}

              {/* Pagate */}
              {pagate.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <CheckCircle size={12} /> Pagate ({pagate.length})
                  </h3>
                  <div className="space-y-1.5">
                    {pagate.map(r => (
                      <RataRow key={r.id} rata={r} statoChip={statoChip} fmt={fmt} oggi={oggi} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RataRow({ rata, statoChip, fmt, oggi }) {
  const scad = new Date(rata.data_scadenza)
  const inRitardo = rata.stato !== 'pagato' && scad < oggi
  const giorniRitardo = inRitardo ? Math.round((oggi - scad) / (1000 * 60 * 60 * 24)) : null

  return (
    <div className={clsx(
      'rounded-lg border p-3 text-sm',
      rata.stato === 'pagato' ? 'bg-green-50/50 border-green-100' : inRitardo ? 'bg-red-50/50 border-red-100' : 'bg-white border-slate-100'
    )}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-500">
            <Home size={11} />
            <span className="text-xs">{rata.immobile_nome}</span>
          </div>
          <span className="text-slate-300">·</span>
          <span className="text-xs text-slate-500">{rata.unita_nome}</span>
        </div>
        {statoChip(rata)}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="font-semibold text-slate-800">{rata.mese_riferimento}</span>
          <span className="text-xs text-slate-400 ml-2">scad. {rata.data_scadenza}</span>
        </div>
        <span className="font-bold text-slate-800">{fmt(rata.importo)}</span>
      </div>
      {rata.stato === 'pagato' && rata.data_pagamento && (
        <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
          <CheckCircle size={10} />
          Pagato il {rata.data_pagamento}
          {rata.metodo_pagamento ? ` · ${rata.metodo_pagamento}` : ''}
        </div>
      )}
      {inRitardo && (
        <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
          <AlertCircle size={10} />
          In ritardo di {giorniRitardo} giorni
        </div>
      )}
    </div>
  )
}

// ── PAGINA PRINCIPALE ─────────────────────────────────────────────────────────

export default function Inquilini() {
  const [lista, setLista] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(DEFAULT)
  const [confirm, setConfirm] = useState(null)
  const [pannello, setPannello] = useState(null) // inquilino selezionato per vista finanziaria
  const api = window.api

  const load = () => api?.inquilini.getAll().then(setLista)
  useEffect(() => { load() }, [])

  const apriForm = (inq = null) => {
    setEditing(inq)
    setForm(inq ? {
      nome: inq.nome, cognome: inq.cognome, codice_fiscale: inq.codice_fiscale || '',
      telefono: inq.telefono || '', email: inq.email || '',
      tipo_documento: inq.tipo_documento || 'carta_identita',
      numero_documento: inq.numero_documento || '',
      foto_path: inq.foto_path || null,
      metodo_pagamento_default: inq.metodo_pagamento_default || 'contanti',
      note: inq.note || ''
    } : DEFAULT)
    setModal(true)
  }

  const salva = async () => {
    let foto_path = form.foto_path
    if (foto_path && !foto_path.includes('foto_inq_')) {
      const id = editing?.id || Date.now()
      foto_path = await api.inquilini.uploadFoto(foto_path, id)
    }
    const data = { ...form, foto_path }
    if (editing) await api.inquilini.update(editing.id, data)
    else await api.inquilini.create(data)
    setModal(false)
    load()
  }

  const elimina = async (id) => { await api.inquilini.delete(id); load() }
  const F = (k) => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{lista.length} inquilini registrati</p>
        <button className="btn-primary" onClick={() => apriForm()}>
          <Plus size={16} /> Nuovo Inquilino
        </button>
      </div>

      {lista.length === 0 ? (
        <div className="card">
          <EmptyState icon={User} title="Nessun inquilino"
            description="Aggiungi l'anagrafica degli inquilini per gestire i contratti"
            action={<button className="btn-primary" onClick={() => apriForm()}><Plus size={16} />Aggiungi</button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {lista.map(inq => (
            <div key={inq.id}
              className="card cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group relative"
              onClick={() => setPannello(inq)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                    {inq.foto_path ? (
                      <img src={`file://${inq.foto_path}`} alt={inq.nome}
                        className="w-full h-full object-cover" />
                    ) : (
                      <User size={22} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{inq.cognome} {inq.nome}</h3>
                    {inq.codice_fiscale && (
                      <p className="text-xs text-slate-400 font-mono">{inq.codice_fiscale}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={e => e.stopPropagation()}>
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"
                    onClick={() => apriForm(inq)}><Edit2 size={14} /></button>
                  <button className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                    onClick={() => setConfirm(inq.id)}><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-500">
                {inq.telefono && <p className="flex items-center gap-1.5"><Phone size={11} />{inq.telefono}</p>}
                {inq.email && <p className="flex items-center gap-1.5"><Mail size={11} />{inq.email}</p>}
                {inq.numero_documento && (
                  <p className="flex items-center gap-1.5">
                    <CreditCard size={11} />
                    {TIPO_DOC[inq.tipo_documento] || inq.tipo_documento}: {inq.numero_documento}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Metodo preferito: {METODI.find(m => m.value === inq.metodo_pagamento_default)?.label || 'Contanti'}
                </span>
                <span className="text-xs text-blue-500 flex items-center gap-0.5 font-medium">
                  Vedi pagamenti <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pannello finanziario laterale */}
      {pannello && (
        <PannelloFinanziario
          inquilino={pannello}
          onClose={() => setPannello(null)}
        />
      )}

      {/* Modal form inquilino */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editing ? 'Modifica inquilino' : 'Nuovo inquilino'} size="lg">
        <div className="space-y-5">
          <div>
            <label className="label">Fotografia</label>
            <PhotoUpload size="lg"
              value={form.foto_path}
              onChange={(p) => setForm(f => ({ ...f, foto_path: p }))} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nome *</label>
              <input className="input" {...F('nome')} />
            </div>
            <div>
              <label className="label">Cognome *</label>
              <input className="input" {...F('cognome')} />
            </div>
            <div className="col-span-2">
              <label className="label">Codice Fiscale</label>
              <input className="input font-mono uppercase" placeholder="RSSMRA80A01H501Z"
                value={form.codice_fiscale}
                onChange={e => setForm(p => ({ ...p, codice_fiscale: e.target.value.toUpperCase() }))} />
            </div>
            <div>
              <label className="label">Telefono</label>
              <input className="input" type="tel" {...F('telefono')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" {...F('email')} />
            </div>
            <div>
              <label className="label">Tipo documento</label>
              <select className="input" {...F('tipo_documento')}>
                <option value="carta_identita">Carta d'identità</option>
                <option value="passaporto">Passaporto</option>
                <option value="patente">Patente</option>
                <option value="permesso_soggiorno">Permesso di soggiorno</option>
              </select>
            </div>
            <div>
              <label className="label">Numero documento</label>
              <input className="input" {...F('numero_documento')} />
            </div>
            <div>
              <label className="label">Metodo pagamento preferito</label>
              <select className="input" value={form.metodo_pagamento_default}
                onChange={e => setForm(p => ({ ...p, metodo_pagamento_default: e.target.value }))}>
                {METODI.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">&nbsp;</label>
              <p className="text-xs text-slate-400 pt-2">Pre-selezionato nei modali di pagamento</p>
            </div>
            <div className="col-span-2">
              <label className="label">Note</label>
              <textarea className="input" rows={2} {...F('note')} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-4 border-t">
          <button className="btn-secondary" onClick={() => setModal(false)}>Annulla</button>
          <button className="btn-primary" onClick={salva} disabled={!form.nome || !form.cognome}>Salva</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={() => elimina(confirm)} title="Elimina inquilino"
        message="Eliminare questo inquilino? I contratti associati rimarranno." />
    </div>
  )
}
