import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Home, Edit2, Trash2, User, Receipt,
  Phone, Mail, ChevronDown, ChevronRight, CreditCard, Clock, MapPin
} from 'lucide-react'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import MapView from '../components/ui/MapView'
import UtenzaPanel from '../components/immobili/UtenzaPanel'
import clsx from 'clsx'

const UNITA_DEFAULT = {
  nome: '', tipo: 'intera', piano: '', superficie_mq: '', num_locali: '', descrizione: ''
}

export default function ImmobileDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [immobile, setImmobile] = useState(null)
  const [unitaList, setUnitaList] = useState([])
  const [contrattiPerUnita, setContrattiPerUnita] = useState({})
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(UNITA_DEFAULT)
  const [confirm, setConfirm] = useState(null)
  const [espanso, setEspanso] = useState({})
  const api = window.api

  const load = async () => {
    const [imm, units] = await Promise.all([
      api.immobili.getById(Number(id)),
      api.unita.getByImmobile(Number(id))
    ])
    setImmobile(imm)
    setUnitaList(units)
    // Carica contratti attivi per ogni unità
    const cp = {}
    for (const u of units) {
      const contratti = await api.contratti.getByUnita(u.id)
      cp[u.id] = contratti
    }
    setContrattiPerUnita(cp)
  }

  useEffect(() => { load() }, [id])

  const apriForm = (u = null) => {
    setEditing(u)
    setForm(u ? {
      nome: u.nome, tipo: u.tipo, piano: u.piano ?? '',
      superficie_mq: u.superficie_mq ?? '', num_locali: u.num_locali ?? '',
      descrizione: u.descrizione ?? ''
    } : UNITA_DEFAULT)
    setModal(true)
  }

  const salva = async () => {
    const data = {
      ...form, immobile_id: Number(id),
      piano: form.piano !== '' ? Number(form.piano) : null,
      superficie_mq: form.superficie_mq ? parseFloat(form.superficie_mq) : null,
      num_locali: form.num_locali ? Number(form.num_locali) : null
    }
    if (editing) await api.unita.update(editing.id, data)
    else await api.unita.create(data)
    setModal(false)
    load()
  }

  const elimina = async (uid) => { await api.unita.delete(uid); load() }
  const F = (k) => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) })
  const fmt = (n) => `€ ${parseFloat(n || 0).toFixed(2)}`

  if (!immobile) return null

  const toggleEspanso = (uid) => setEspanso(p => ({ ...p, [uid]: !p[uid] }))

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/immobili')} className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-slate-900 text-xl">{immobile.nome}</h1>
          <p className="text-sm text-slate-500">
            {immobile.indirizzo}
            {immobile.citta ? `, ${immobile.citta}` : ''}
            {immobile.sigla_prov ? ` (${immobile.sigla_prov})` : ''}
          </p>
        </div>
        <button className="btn-secondary ml-auto" onClick={() => navigate(`/spese?immobile=${id}`)}>
          <Receipt size={16} /> Spese
        </button>
      </div>

      {/* Info riepilogo */}
      <div className="grid grid-cols-4 gap-4 text-sm">
        {[
          { label: 'Tipo', value: immobile.tipo },
          { label: 'Superficie', value: immobile.superficie_mq ? `${immobile.superficie_mq} m²` : '—' },
          { label: 'Valore', value: immobile.valore_acquisto ? `€ ${Number(immobile.valore_acquisto).toLocaleString('it')}` : '—' },
          { label: 'Unità', value: unitaList.length }
        ].map(({ label, value }) => (
          <div key={label} className="card text-center py-3">
            <p className="text-xs text-slate-400 mb-1">{label}</p>
            <p className="font-semibold text-slate-800 capitalize">{value}</p>
          </div>
        ))}
      </div>

      {/* Mappa */}
      {(immobile.lat && immobile.lng) && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <MapPin size={15} className="text-blue-500" />
            <span className="font-medium text-slate-700 text-sm">
              {immobile.indirizzo}{immobile.citta ? `, ${immobile.citta}` : ''}
              {immobile.sigla_prov ? ` (${immobile.sigla_prov})` : ''}
            </span>
            {immobile.cap && <span className="text-xs text-slate-400 font-mono">{immobile.cap}</span>}
          </div>
          <MapView lat={immobile.lat} lng={immobile.lng} height="260px" zoom={16} />
        </div>
      )}

      {/* Codici fornitura utenze (POD/PDR) */}
      <UtenzaPanel immobile_id={Number(id)} />

      {/* Unità e tenant cards */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-800">Unità / Stanze</h2>
          <button className="btn-primary" onClick={() => apriForm()}>
            <Plus size={15} /> Aggiungi unità
          </button>
        </div>

        {unitaList.length === 0 ? (
          <EmptyState icon={Home} title="Nessuna unità"
            description="Aggiungi stanze o unità locabili a questo immobile"
            action={<button className="btn-primary" onClick={() => apriForm()}><Plus size={15} />Aggiungi</button>} />
        ) : (
          <div className="space-y-3">
            {unitaList.map(u => {
              const contratti = contrattiPerUnita[u.id] || []
              const contrattoAttivo = contratti.find(c => c.stato === 'attivo')
              const altriContratti = contratti.filter(c => c.stato !== 'attivo')
              const isExpanded = espanso[u.id]

              return (
                <div key={u.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  {/* Header unità */}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                    onClick={() => toggleEspanso(u.id)}>
                    <div className="w-9 h-9 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0">
                      <Home size={16} className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 text-sm">{u.nome}</p>
                        <span className="text-xs text-slate-400">
                          {u.tipo === 'intera' ? 'Unità intera' : 'Stanza singola'}
                          {u.superficie_mq ? ` · ${u.superficie_mq} m²` : ''}
                          {u.piano != null ? ` · Piano ${u.piano}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {contrattoAttivo ? (
                        <span className="badge-green text-xs">Occupata</span>
                      ) : (
                        <span className="badge-gray text-xs">Libera</span>
                      )}
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-white"
                          onClick={() => apriForm(u)}><Edit2 size={13} /></button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-white"
                          onClick={() => setConfirm(u.id)}><Trash2 size={13} /></button>
                      </div>
                      {isExpanded
                        ? <ChevronDown size={15} className="text-slate-400" />
                        : <ChevronRight size={15} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Dettaglio espanso con tenant card */}
                  {isExpanded && (
                    <div className="p-4 bg-white space-y-4">
                      {/* Contratto attivo — Tenant Card */}
                      {contrattoAttivo ? (
                        <TenantCard contratto={contrattoAttivo} api={api} fmt={fmt} onRefresh={load} />
                      ) : (
                        <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-slate-200 text-slate-400">
                          <p className="text-sm">Nessun inquilino attuale</p>
                          <button className="btn-primary text-xs py-1.5"
                            onClick={() => navigate('/affitti')}>
                            <Plus size={12} /> Crea contratto
                          </button>
                        </div>
                      )}

                      {/* Storico contratti precedenti */}
                      {altriContratti.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                            Storico ({altriContratti.length})
                          </p>
                          <div className="space-y-1.5">
                            {altriContratti.map(c => (
                              <div key={c.id} className="flex items-center justify-between text-xs text-slate-500 px-3 py-2 bg-slate-50 rounded-lg">
                                <span className="font-medium">{c.inquilino_nome}</span>
                                <span>{c.data_inizio} → {c.data_fine || '∞'}</span>
                                <span>{fmt(c.canone_mensile)}/mese</span>
                                <span className={clsx('px-2 py-0.5 rounded-full font-medium',
                                  c.stato === 'scaduto' ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-600')}>
                                  {c.stato}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal form unità */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Modifica unità' : 'Nuova unità'}>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Nome unità *</label>
            <input className="input" placeholder="Es. Camera A, Appartamento piano 2" {...F('nome')} />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select className="input" {...F('tipo')}>
              <option value="intera">Intera unità</option>
              <option value="stanza">Singola stanza</option>
            </select>
          </div>
          <div>
            <label className="label">Piano</label>
            <input className="input" type="number" placeholder="0 = terra" {...F('piano')} />
          </div>
          <div>
            <label className="label">Superficie (m²)</label>
            <input className="input" type="number" {...F('superficie_mq')} />
          </div>
          <div>
            <label className="label">Numero locali</label>
            <input className="input" type="number" {...F('num_locali')} />
          </div>
          <div className="col-span-2">
            <label className="label">Descrizione</label>
            <textarea className="input" rows={2} {...F('descrizione')} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t">
          <button className="btn-secondary" onClick={() => setModal(false)}>Annulla</button>
          <button className="btn-primary" onClick={salva} disabled={!form.nome}>Salva</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={() => elimina(confirm)} title="Elimina unità"
        message="Eliminare questa unità? Saranno rimossi anche i contratti associati." />
    </div>
  )
}

// ── TENANT CARD ───────────────────────────────────────────────────────────────

function TenantCard({ contratto, api, fmt, onRefresh }) {
  const [inquilino, setInquilino] = useState(null)

  useEffect(() => {
    if (contratto?.inquilino_id) {
      api.inquilini.getById(contratto.inquilino_id).then(setInquilino)
    }
  }, [contratto])

  const oggi = new Date()
  const dataFine = contratto.data_fine ? new Date(contratto.data_fine) : null
  const giorniRimasti = dataFine ? Math.round((dataFine - oggi) / (1000 * 60 * 60 * 24)) : null

  return (
    <div className="rounded-xl border border-green-100 bg-green-50 p-4">
      <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-3">Inquilino attuale</p>
      <div className="flex items-start gap-4">
        {/* Foto */}
        <div className="w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-green-200 shrink-0 flex items-center justify-center">
          {inquilino?.foto_path ? (
            <img src={`file://${inquilino.foto_path}`} alt={inquilino.nome}
              className="w-full h-full object-cover" />
          ) : (
            <User size={22} className="text-slate-300" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          {/* Nome */}
          <div>
            <p className="font-semibold text-slate-800">
              {contratto.inquilino_nome}
            </p>
            {inquilino?.codice_fiscale && (
              <p className="text-xs text-slate-400 font-mono">{inquilino.codice_fiscale}</p>
            )}
          </div>

          {/* Contatti */}
          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
            {inquilino?.telefono && (
              <a href={`tel:${inquilino.telefono}`} className="flex items-center gap-1 hover:text-blue-600">
                <Phone size={11} /> {inquilino.telefono}
              </a>
            )}
            {inquilino?.email && (
              <a href={`mailto:${inquilino.email}`} className="flex items-center gap-1 hover:text-blue-600">
                <Mail size={11} /> {inquilino.email}
              </a>
            )}
            {inquilino?.numero_documento && (
              <span className="flex items-center gap-1 text-slate-400">
                <CreditCard size={11} /> {inquilino.numero_documento}
              </span>
            )}
          </div>

          {/* Periodo & canone */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-2 text-center border border-green-100">
              <p className="text-xs text-slate-400 mb-0.5">Inizio</p>
              <p className="text-xs font-semibold text-slate-700">{contratto.data_inizio}</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center border border-green-100">
              <p className="text-xs text-slate-400 mb-0.5">Fine prevista</p>
              <p className="text-xs font-semibold text-slate-700">{contratto.data_fine || '—'}</p>
            </div>
            <div className="bg-white rounded-lg p-2 text-center border border-green-100">
              <p className="text-xs text-slate-400 mb-0.5">Canone</p>
              <p className="text-xs font-bold text-green-700">{fmt(contratto.canone_mensile)}/mese</p>
            </div>
          </div>

          {/* Alert scadenza */}
          {giorniRimasti !== null && giorniRimasti <= 90 && (
            <div className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
              giorniRimasti <= 30 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700')}>
              <Clock size={11} />
              Contratto scade tra {giorniRimasti} giorni ({contratto.data_fine})
            </div>
          )}

          {/* Deposito */}
          {contratto.deposito > 0 && (
            <p className="text-xs text-slate-400">
              Deposito cauzionale: <span className="font-medium text-slate-600">{fmt(contratto.deposito)}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
