import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  CheckCircle, Clock, AlertCircle, Edit2, Undo2,
  User, Filter, Euro, Calendar, ChevronDown, ChevronUp,
  Save, X, Loader, CreditCard, Building2
} from 'lucide-react'
import clsx from 'clsx'
import PagaRataModal from '../components/affitti/PagaRataModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const METODI = [
  { value: 'contanti',  label: 'Contanti' },
  { value: 'bonifico',  label: 'Bonifico bancario' },
  { value: 'rid',       label: 'Addebito diretto (RID/SDD)' },
  { value: 'carta',     label: 'Carta di credito/debito' },
  { value: 'assegno',   label: 'Assegno' },
  { value: 'paypal',    label: 'PayPal' },
  { value: 'crypto',    label: 'Crypto' },
]

const fmt = (n) => n != null ? `€ ${parseFloat(n).toFixed(2)}` : '—'
const anni = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
const mesiLabel = ['','Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']

// ── RIGA EDITABILE ────────────────────────────────────────────────────────────

function RigaPagamento({ r, onRefresh }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [pagaModal, setPagaModal] = useState(false)
  const [confirmAnnulla, setConfirmAnnulla] = useState(false)
  const api = window.api
  const oggi = new Date()

  const apriEdit = () => {
    setForm({
      importo: r.importo,
      data_pagamento: r.data_pagamento || '',
      metodo_pagamento: r.metodo_pagamento || r.metodo_pagamento_default || 'contanti',
      stato: r.stato,
      note: r.note || ''
    })
    setEditing(true)
  }

  const salva = async () => {
    setSaving(true)
    try {
      await api.pagamentiAffitto.aggiorna(r.id, {
        importo: parseFloat(form.importo) || r.importo,
        data_pagamento: form.data_pagamento || null,
        metodo_pagamento: form.metodo_pagamento || null,
        stato: form.data_pagamento ? 'pagato' : r.stato,
        note: form.note || null
      })
      setEditing(false)
      onRefresh()
    } finally { setSaving(false) }
  }

  const annulla = async () => {
    await api.pagamentiAffitto.annullaPagamento(r.id)
    onRefresh()
  }

  const scad = new Date(r.data_scadenza)
  const isScaduto = r.stato !== 'pagato' && scad < oggi
  const diffGiorni = Math.round((scad - oggi) / (1000 * 60 * 60 * 24))

  const statoChip = () => {
    if (r.stato === 'pagato') return (
      <span className="badge-green flex items-center gap-1 text-xs whitespace-nowrap">
        <CheckCircle size={10} /> Pagato
      </span>
    )
    if (isScaduto) return (
      <span className="badge-red flex items-center gap-1 text-xs whitespace-nowrap">
        <AlertCircle size={10} />
        {Math.abs(diffGiorni)}g scad.
      </span>
    )
    return (
      <span className="badge-yellow flex items-center gap-1 text-xs whitespace-nowrap">
        <Clock size={10} />
        {diffGiorni}g
      </span>
    )
  }

  if (editing) {
    return (
      <tr className="bg-blue-50 border-l-4 border-blue-500">
        <td className="px-3 py-2 text-xs font-medium text-slate-700">{r.mese_riferimento}</td>
        <td className="px-3 py-2 text-xs text-slate-500">{r.immobile_nome} · {r.unita_nome}</td>
        <td className="px-3 py-2 text-xs text-slate-500">{r.inquilino_nome}</td>

        {/* Importo editabile */}
        <td className="px-3 py-2">
          <input className="w-28 border border-blue-300 rounded-lg px-2 py-1 text-xs text-right font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            type="number" step="0.01" value={form.importo}
            onChange={e => setForm(f => ({ ...f, importo: e.target.value }))} />
        </td>

        {/* Data pagamento editabile */}
        <td className="px-3 py-2">
          <div className="flex items-center gap-1">
            <input className="border border-blue-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              type="date" value={form.data_pagamento}
              onChange={e => setForm(f => ({ ...f, data_pagamento: e.target.value }))} />
            <button
              className="text-[10px] text-blue-500 hover:text-blue-700 px-1.5 py-1 rounded bg-blue-100 hover:bg-blue-200 whitespace-nowrap"
              onClick={() => setForm(f => ({ ...f, data_pagamento: r.data_scadenza }))}>
              Prev.
            </button>
          </div>
        </td>

        {/* Metodo editabile */}
        <td className="px-3 py-2">
          <select className="border border-blue-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={form.metodo_pagamento}
            onChange={e => setForm(f => ({ ...f, metodo_pagamento: e.target.value }))}>
            {METODI.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </td>

        {/* Note */}
        <td className="px-3 py-2">
          <input className="w-full border border-blue-300 rounded-lg px-2 py-1 text-xs focus:outline-none bg-white"
            placeholder="Note..." value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
        </td>

        <td className="px-3 py-2">
          <div className="flex gap-1">
            <button className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={salva} disabled={saving}>
              {saving ? <Loader size={13} className="animate-spin" /> : <Save size={13} />}
            </button>
            <button className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors" onClick={() => setEditing(false)}>
              <X size={13} />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <>
      <tr className={clsx(
        'group hover:bg-slate-50 border-b border-slate-50 transition-colors',
        r.stato === 'pagato' ? '' : isScaduto ? 'bg-red-50/30' : ''
      )}>
        <td className="px-3 py-2.5 text-xs font-medium text-slate-700">{r.mese_riferimento}</td>
        <td className="px-3 py-2.5 text-xs text-slate-500">
          <p className="font-medium text-slate-700">{r.immobile_nome}</p>
          <p className="text-slate-400">{r.unita_nome}</p>
        </td>
        <td className="px-3 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            {r.foto_path ? (
              <img src={`file://${r.foto_path}`} className="w-6 h-6 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <User size={11} className="text-slate-400" />
              </div>
            )}
            <span className="text-slate-700">{r.inquilino_nome}</span>
          </div>
        </td>
        <td className="px-3 py-2.5 text-right">
          <span className={clsx('text-sm font-bold', r.stato === 'pagato' ? 'text-green-700' : isScaduto ? 'text-red-700' : 'text-slate-800')}>
            {fmt(r.importo)}
          </span>
          {r.importo !== r.canone_mensile && (
            <p className="text-[10px] text-slate-400">canon. {fmt(r.canone_mensile)}</p>
          )}
        </td>
        <td className="px-3 py-2.5 text-xs text-slate-500">
          <p>{r.data_scadenza}</p>
          {r.stato === 'pagato' && r.data_pagamento && (
            <p className="text-green-600 font-medium">→ {r.data_pagamento}</p>
          )}
        </td>
        <td className="px-3 py-2.5 text-xs text-slate-500">
          {r.metodo_pagamento
            ? METODI.find(m => m.value === r.metodo_pagamento)?.label || r.metodo_pagamento
            : <span className="text-slate-300">—</span>}
        </td>
        <td className="px-3 py-2.5">{statoChip()}</td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {r.stato !== 'pagato' && (
              <button
                className="px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                onClick={() => setPagaModal(true)}>
                <CheckCircle size={11} /> Paga
              </button>
            )}
            <button
              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              title="Modifica" onClick={apriEdit}>
              <Edit2 size={13} />
            </button>
            {r.stato === 'pagato' && (
              <button
                className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                title="Annulla pagamento" onClick={() => setConfirmAnnulla(true)}>
                <Undo2 size={13} />
              </button>
            )}
          </div>
        </td>
      </tr>

      {pagaModal && (
        <PagaRataModal
          rata={r}
          contratto={{ id: r.contratto_id, inquilino_id: r.inquilino_id, inquilino_nome: r.inquilino_nome, immobile_nome: r.immobile_nome, unita_nome: r.unita_nome, canone_mensile: r.canone_mensile }}
          onPagamentoRiuscito={async () => { setPagaModal(false); onRefresh() }}
          onClose={() => setPagaModal(false)}
        />
      )}

      <ConfirmDialog
        open={confirmAnnulla}
        onClose={() => setConfirmAnnulla(false)}
        onConfirm={annulla}
        danger={false}
        title="Annulla pagamento"
        message={`Annullare il pagamento di ${fmt(r.importo)} per ${r.mese_riferimento}? La rata tornerà nello stato "Da pagare".`}
      />
    </>
  )
}

// ── CONSOLE PRINCIPALE ────────────────────────────────────────────────────────

export default function ConsoleAffitti() {
  const [pagamenti, setPagamenti] = useState([])
  const [immobili, setImmobili] = useState([])
  const [loading, setLoading] = useState(false)
  const [sortField, setSortField] = useState('data_scadenza')
  const [sortDir, setSortDir] = useState('desc')

  const annoCorrente = new Date().getFullYear()
  const [filtri, setFiltri] = useState({
    immobile_id: '',
    anno: annoCorrente,
    mese: '',
    stato: ''
  })
  const api = window.api

  const load = useCallback(async () => {
    setLoading(true)
    const f = {
      immobile_id: filtri.immobile_id ? Number(filtri.immobile_id) : null,
      anno: filtri.anno || null,
      mese: filtri.mese || null,
      stato: filtri.stato || null
    }
    const dati = await api.pagamentiAffitto.getAll(f)
    setPagamenti(dati)
    setLoading(false)
  }, [filtri])

  useEffect(() => { api?.immobili.getAll().then(setImmobili) }, [])
  useEffect(() => { load() }, [load])

  const setFiltro = (k, v) => setFiltri(f => ({ ...f, [k]: v }))

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const sorted = [...pagamenti].sort((a, b) => {
    const va = a[sortField] ?? ''
    const vb = b[sortField] ?? ''
    return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
  })

  // Statistiche
  const totPagati  = pagamenti.filter(p => p.stato === 'pagato')
  const totDaPagare = pagamenti.filter(p => p.stato !== 'pagato')
  const sommaPagati  = totPagati.reduce((a, p) => a + parseFloat(p.importo), 0)
  const sommaDaPagare = totDaPagare.reduce((a, p) => a + parseFloat(p.importo), 0)

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronDown size={12} className="text-slate-300" />
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-blue-500" />
      : <ChevronDown size={12} className="text-blue-500" />
  }

  const ThSort = ({ field, children, className = '' }) => (
    <th className={clsx('px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none hover:text-slate-700 transition-colors', className)}
      onClick={() => toggleSort(field)}>
      <div className="flex items-center gap-1">{children}<SortIcon field={field} /></div>
    </th>
  )

  return (
    <div className="space-y-4">
      {/* Filtri */}
      <div className="card py-3">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="label">Immobile</label>
            <select className="input w-48" value={filtri.immobile_id} onChange={e => setFiltro('immobile_id', e.target.value)}>
              <option value="">Tutti</option>
              {immobili.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Anno</label>
            <select className="input w-28" value={filtri.anno} onChange={e => setFiltro('anno', Number(e.target.value))}>
              <option value="">Tutti</option>
              {anni.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Mese</label>
            <select className="input w-28" value={filtri.mese} onChange={e => setFiltro('mese', e.target.value)}>
              <option value="">Tutti</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i+1} value={String(i+1).padStart(2,'0')}>{mesiLabel[i+1]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Stato</label>
            <select className="input w-32" value={filtri.stato} onChange={e => setFiltro('stato', e.target.value)}>
              <option value="">Tutti</option>
              <option value="da_pagare">Da pagare</option>
              <option value="pagato">Pagati</option>
            </select>
          </div>
          <button className="btn-secondary ml-auto" onClick={load} disabled={loading}>
            <Filter size={14} /> {loading ? 'Caricamento...' : 'Aggiorna'}
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-4 gap-3">
        <div className="card py-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Rate trovate</p>
          <p className="text-2xl font-bold text-slate-800">{pagamenti.length}</p>
        </div>
        <div className="card py-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Incassato</p>
          <p className="text-2xl font-bold text-green-700">{fmt(sommaPagati)}</p>
          <p className="text-xs text-slate-400">{totPagati.length} rate</p>
        </div>
        <div className="card py-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Da incassare</p>
          <p className={clsx('text-2xl font-bold', sommaDaPagare > 0 ? 'text-red-600' : 'text-slate-400')}>
            {fmt(sommaDaPagare)}
          </p>
          <p className="text-xs text-slate-400">{totDaPagare.length} rate</p>
        </div>
        <div className="card py-3 text-center">
          <p className="text-xs text-slate-400 mb-1">Totale periodo</p>
          <p className="text-2xl font-bold text-slate-800">{fmt(sommaPagati + sommaDaPagare)}</p>
        </div>
      </div>

      {/* Tabella */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader size={20} className="animate-spin text-blue-500" />
          </div>
        ) : pagamenti.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400">
            <Building2 size={32} className="mb-3 text-slate-200" />
            <p className="font-medium">Nessun pagamento trovato</p>
            <p className="text-sm mt-1">Prova a modificare i filtri</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <ThSort field="mese_riferimento">Mese</ThSort>
                  <ThSort field="immobile_nome">Immobile · Unità</ThSort>
                  <ThSort field="inquilino_nome">Inquilino</ThSort>
                  <ThSort field="importo" className="text-right">Importo</ThSort>
                  <ThSort field="data_scadenza">Scadenza → Pagato</ThSort>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">Metodo</th>
                  <ThSort field="stato">Stato</ThSort>
                  <th className="px-3 py-3 w-32" />
                </tr>
              </thead>
              <tbody>
                {sorted.map(r => (
                  <RigaPagamento key={r.id} r={r} onRefresh={load} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
