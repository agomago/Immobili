import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Home, User, Calendar, CheckCircle, Clock, AlertCircle, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import PagaRataModal from '../components/affitti/PagaRataModal'
import clsx from 'clsx'

const CONTRATTO_DEFAULT = {
  unita_id: '', inquilino_id: '', data_inizio: '', data_fine: '',
  canone_mensile: '', deposito: '', giorno_pagamento: 1,
  tipo_contratto: '4+4', stato: 'attivo', genera_rate: true, note: ''
}

export default function Affitti() {
  const [contratti, setContratti] = useState([])
  const [unita, setUnita] = useState([])
  const [inquilini, setInquilini] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(CONTRATTO_DEFAULT)
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [espanso, setEspanso] = useState({})
  const [rate, setRate] = useState({})
  const [pagaModal, setPagaModal] = useState(null)
  const [filtroRate, setFiltroRate] = useState('tutti') // 'tutti', 'scaduti', 'da-pagare', 'pagato'
  // ref per accedere al valore corrente di pagaModal nell'onClose async senza closure stale
  const pagaModalRef = useRef(null)
  const api = window.api

  const load = useCallback(async () => {
    const [c, u, inq] = await Promise.all([
      api.contratti.getAll(),
      api.unita.getAll(),
      api.inquilini.getAll()
    ])
    setContratti(c)
    setUnita(u)
    setInquilini(inq)
  }, [])

  useEffect(() => { load() }, [load])

  // Carica/ricarica le rate di un contratto e aggiorna lo stato
  const loadRate = useCallback(async (contratto_id) => {
    const r = await api.pagamentiAffitto.getByContratto(contratto_id)
    setRate(p => ({ ...p, [contratto_id]: r }))
    return r
  }, [])

  const toggleEspanso = async (id) => {
    if (espanso[id]) {
      setEspanso(p => ({ ...p, [id]: false }))
    } else {
      await loadRate(id)
      setEspanso(p => ({ ...p, [id]: true }))
    }
  }

  const apriForm = (c = null) => {
    setEditing(c)
    setForm(c ? {
      unita_id: c.unita_id, inquilino_id: c.inquilino_id,
      data_inizio: c.data_inizio, data_fine: c.data_fine || '',
      canone_mensile: c.canone_mensile, deposito: c.deposito || '',
      giorno_pagamento: c.giorno_pagamento, tipo_contratto: c.tipo_contratto,
      stato: c.stato, genera_rate: false, note: c.note || ''
    } : CONTRATTO_DEFAULT)
    setModal(true)
  }

  const salva = async () => {
    const data = {
      ...form, unita_id: Number(form.unita_id),
      inquilino_id: Number(form.inquilino_id),
      canone_mensile: parseFloat(form.canone_mensile),
      deposito: form.deposito ? parseFloat(form.deposito) : 0,
      giorno_pagamento: Number(form.giorno_pagamento)
    }
    if (editing) await api.contratti.update(editing.id, data)
    else await api.contratti.create(data)
    setModal(false)
    load()
  }

  const elimina = async (id) => { await api.contratti.delete(id); load() }

  const F = (k) => ({ value: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) })
  const FB = (k) => ({ checked: form[k], onChange: e => setForm(p => ({ ...p, [k]: e.target.checked })) })
  const fmt = (n) => `€ ${parseFloat(n || 0).toFixed(2)}`

  const aprPagaModal = (rata, contratto, isModifica = false) => {
    const val = { rata, contratto, isModifica }
    pagaModalRef.current = val
    setPagaModal(val)
  }

  const filtroRatePerStato = (rateList) => {
    if (filtroRate === 'tutti') return rateList
    return rateList.filter(r => {
      if (filtroRate === 'pagato') return r.stato === 'pagato'
      if (filtroRate === 'scaduti') return r.stato !== 'pagato' && new Date(r.data_scadenza) < new Date()
      if (filtroRate === 'da-pagare') return r.stato !== 'pagato' && new Date(r.data_scadenza) >= new Date()
      return true
    })
  }

  // Callback chiamato da PagaRataModal dopo il pagamento riuscito
  // rata_id e contratto_id vengono passati direttamente — nessuna closure stale
  const onPagamentoRiuscito = useCallback(async (rata_id, contratto_id, datiPagamento) => {
    setPagaModal(null)
    pagaModalRef.current = null

    // Aggiornamento ottimistico immediato: marca la rata come pagata nello stato locale
    setRate(prev => {
      const rateContratto = prev[contratto_id]
      if (!rateContratto) return prev
      return {
        ...prev,
        [contratto_id]: rateContratto.map(r =>
          r.id === rata_id
            ? { ...r, stato: 'pagato', data_pagamento: datiPagamento.data_pagamento, metodo_pagamento: datiPagamento.metodo_pagamento }
            : r
        )
      }
    })

    // Poi ricarica dal DB per confermare (in background, non blocca la UI)
    await loadRate(contratto_id)
  }, [loadRate])

  const statoRata = (r) => {
    if (r.stato === 'pagato') return (
      <span className="badge-green flex items-center gap-1">
        <CheckCircle size={11} />Pagato
      </span>
    )
    if (new Date(r.data_scadenza) < new Date()) return (
      <span className="badge-red flex items-center gap-1">
        <AlertCircle size={11} />Scaduto
      </span>
    )
    return (
      <span className="badge-yellow flex items-center gap-1">
        <Clock size={11} />Da pagare
      </span>
    )
  }

  const contrAtttivi = contratti.filter(c => c.stato === 'attivo')
  const contrtAltri = contratti.filter(c => c.stato !== 'attivo')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{contrAtttivi.length} contratti attivi</p>
        <button className="btn-primary" onClick={() => apriForm()}>
          <Plus size={16} /> Nuovo Contratto
        </button>
      </div>

      {contratti.length === 0 ? (
        <div className="card">
          <EmptyState icon={Home} title="Nessun contratto"
            description="Aggiungi un contratto di affitto per tracciare i pagamenti mensili"
            action={<button className="btn-primary" onClick={() => apriForm()}><Plus size={16} />Aggiungi</button>} />
        </div>
      ) : (
        <div className="space-y-3">
          {[...contrAtttivi, ...contrtAltri].map(c => (
            <div key={c.id} className="card p-0 overflow-hidden">
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50"
                onClick={() => toggleEspanso(c.id)}>
                <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                  c.stato === 'attivo' ? 'bg-green-50' : 'bg-slate-100')}>
                  <Home size={18} className={c.stato === 'attivo' ? 'text-green-600' : 'text-slate-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-slate-800 text-sm">{c.immobile_nome} · {c.unita_nome}</p>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
                      c.stato === 'attivo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')}>
                      {c.stato}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><User size={11} />{c.inquilino_nome}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} />{c.data_inizio} → {c.data_fine || '∞'}</span>
                    <span className="font-semibold text-slate-700">{fmt(c.canone_mensile)}/mese</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"
                      onClick={() => apriForm(c)}><Edit2 size={14} /></button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                      onClick={() => setConfirm(c.id)}><Trash2 size={14} /></button>
                  </div>
                  {espanso[c.id]
                    ? <ChevronDown size={16} className="text-slate-400" />
                    : <ChevronRight size={16} className="text-slate-400" />}
                </div>
              </div>

              {espanso[c.id] && rate[c.id] && (
                <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Rate mensili ({rate[c.id].length})
                    </p>
                    <div className="flex gap-1.5">
                      {['tutti', 'da-pagare', 'scaduti', 'pagato'].map(f => (
                        <button
                          key={f}
                          onClick={() => setFiltroRate(f)}
                          className={clsx(
                            'text-xs px-2.5 py-1 rounded-full font-medium transition-colors',
                            filtroRate === f
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
                          )}>
                          {f === 'tutti' ? 'Tutti' : f === 'da-pagare' ? 'Da pagare' : f === 'scaduti' ? 'Scaduti' : 'Pagati'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    {filtroRatePerStato(rate[c.id]).map(r => (
                      <div key={r.id}
                        className={clsx(
                          'flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-colors',
                          r.stato === 'pagato' ? 'bg-green-50 border border-green-100' : 'bg-white border border-slate-100'
                        )}>
                        <span className="text-slate-600 font-medium w-16">{r.mese_riferimento}</span>
                        <span className="text-slate-400 text-xs w-24">{r.data_scadenza}</span>
                        <span className="font-semibold text-slate-700 w-20 text-right">{fmt(r.importo)}</span>
                        <div className="w-24 flex justify-center">{statoRata(r)}</div>
                        <div className="flex gap-1.5 w-40 justify-end">
                          {r.stato !== 'pagato' ? (
                            <button
                              className="btn-success text-xs py-1 px-3"
                              onClick={e => { e.stopPropagation(); aprPagaModal(r, c, false) }}>
                              <CheckCircle size={11} /> Paga
                            </button>
                          ) : (
                            <>
                              <span className="text-xs text-slate-400 flex-1">
                                {r.data_pagamento}
                                {r.metodo_pagamento ? ` · ${r.metodo_pagamento}` : ''}
                              </span>
                              <button
                                className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"
                                title="Modifica pagamento"
                                onClick={e => { e.stopPropagation(); aprPagaModal(r, c, true) }}>
                                <Edit2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Modifica contratto' : 'Nuovo contratto'} size="md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Unità *</label>
            <select className="input" {...F('unita_id')}>
              <option value="">Seleziona unità</option>
              {unita.map(u => <option key={u.id} value={u.id}>{u.immobile_nome} — {u.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Inquilino *</label>
            <select className="input" {...F('inquilino_id')}>
              <option value="">Seleziona inquilino</option>
              {inquilini.map(i => <option key={i.id} value={i.id}>{i.cognome} {i.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Data inizio *</label>
            <input className="input" type="date" {...F('data_inizio')} />
          </div>
          <div>
            <label className="label">Data fine</label>
            <input className="input" type="date" {...F('data_fine')} />
          </div>
          <div>
            <label className="label">Canone mensile (€) *</label>
            <input className="input" type="number" step="0.01" placeholder="0.00" {...F('canone_mensile')} />
          </div>
          <div>
            <label className="label">Deposito (€)</label>
            <input className="input" type="number" step="0.01" {...F('deposito')} />
          </div>
          <div>
            <label className="label">Giorno pagamento</label>
            <input className="input" type="number" min="1" max="28" {...F('giorno_pagamento')} />
          </div>
          <div>
            <label className="label">Tipo contratto</label>
            <select className="input" {...F('tipo_contratto')}>
              <option value="4+4">4+4</option>
              <option value="3+2">3+2</option>
              <option value="transitorio">Transitorio</option>
              <option value="studenti">Studenti</option>
              <option value="libero">Libero</option>
            </select>
          </div>
          <div>
            <label className="label">Stato</label>
            <select className="input" {...F('stato')}>
              <option value="attivo">Attivo</option>
              <option value="scaduto">Scaduto</option>
              <option value="disdetto">Disdetto</option>
            </select>
          </div>
          {!editing && (
            <div className="flex items-center gap-2 col-span-2">
              <input type="checkbox" id="genera" className="w-4 h-4 accent-blue-600" {...FB('genera_rate')} />
              <label htmlFor="genera" className="text-sm text-slate-600 cursor-pointer">
                Genera automaticamente rate mensili fino alla data fine
              </label>
            </div>
          )}
          <div className="col-span-2">
            <label className="label">Note</label>
            <textarea className="input" rows={2} {...F('note')} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5 pt-4 border-t">
          <button className="btn-secondary" onClick={() => setModal(false)}>Annulla</button>
          <button className="btn-primary" onClick={salva}
            disabled={!form.unita_id || !form.inquilino_id || !form.data_inizio || !form.canone_mensile}>
            Salva
          </button>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={() => elimina(confirm)} title="Elimina contratto"
        message="Eliminare questo contratto e tutte le rate associate?" />

      {pagaModal && (
        <PagaRataModal
          rata={pagaModal.rata}
          contratto={pagaModal.contratto}
          isModifica={pagaModal.isModifica}
          onPagamentoRiuscito={onPagamentoRiuscito}
          onClose={() => { setPagaModal(null); pagaModalRef.current = null }}
        />
      )}
    </div>
  )
}
