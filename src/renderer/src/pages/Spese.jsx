import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Receipt, Filter, CheckCircle, Clock, AlertCircle, Trash2, Eye, Upload } from 'lucide-react'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import DocumentiModal from '../components/spese/DocumentiModal'
import PagaModal from '../components/spese/PagaModal'
import clsx from 'clsx'

const STATI = { da_pagare: 'badge-yellow', pagata: 'badge-green', scaduta: 'badge-red' }
const STATI_LABEL = { da_pagare: 'Da pagare', pagata: 'Pagata', scaduta: 'Scaduta' }

export default function Spese() {
  const [spese, setSpese] = useState([])
  const [immobili, setImmobili] = useState([])
  const [filtroImmobile, setFiltroImmobile] = useState('')
  const [filtroStato, setFiltroStato] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [docsModal, setDocsModal] = useState(null)
  const [pagaModal, setPagaModal] = useState(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const api = window.api

  const load = useCallback(async () => {
    const immId = filtroImmobile ? Number(filtroImmobile) : null
    const [s, imm] = await Promise.all([
      api.spese.getAll(immId),
      api.immobili.getAll()
    ])
    setSpese(s)
    setImmobili(imm)
  }, [filtroImmobile])

  useEffect(() => {
    const immId = searchParams.get('immobile')
    if (immId) setFiltroImmobile(immId)
  }, [])

  useEffect(() => { load() }, [load])

  const elimina = async (id) => { await api.spese.delete(id); load() }

  const speseFiltrate = spese.filter(s => !filtroStato || s.stato === filtroStato)

  const totale = speseFiltrate.reduce((a, s) => a + (parseFloat(s.importo) || 0), 0)

  const fmt = (n) => `€ ${parseFloat(n || 0).toFixed(2)}`

  const statoIcon = (s) => {
    if (s === 'pagata') return <CheckCircle size={14} className="text-green-600" />
    if (s === 'scaduta') return <AlertCircle size={14} className="text-red-600" />
    return <Clock size={14} className="text-amber-500" />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select className="input w-48" value={filtroImmobile}
          onChange={e => setFiltroImmobile(e.target.value)}>
          <option value="">Tutti gli immobili</option>
          {immobili.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
        </select>
        <select className="input w-40" value={filtroStato}
          onChange={e => setFiltroStato(e.target.value)}>
          <option value="">Tutti gli stati</option>
          <option value="da_pagare">Da pagare</option>
          <option value="pagata">Pagate</option>
          <option value="scaduta">Scadute</option>
        </select>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {speseFiltrate.length} spese · <strong>{fmt(totale)}</strong>
          </span>
          <button className="btn-primary" onClick={() => navigate('/spese/nuova')}>
            <Plus size={16} /> Nuova Spesa
          </button>
        </div>
      </div>

      {speseFiltrate.length === 0 ? (
        <div className="card">
          <EmptyState icon={Receipt} title="Nessuna spesa"
            description="Aggiungi la prima spesa o carica un documento per il riconoscimento automatico"
            action={<button className="btn-primary" onClick={() => navigate('/spese/nuova')}><Plus size={16} />Aggiungi</button>} />
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Descrizione</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Categoria</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Immobile</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Scadenza</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Importo</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stato</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {speseFiltrate.map(s => (
                <tr key={s.id} className="hover:bg-slate-50 group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.colore || '#94a3b8' }} />
                      <div>
                        <p className="font-medium text-slate-700">{s.descrizione}</p>
                        {s.fornitore && <p className="text-xs text-slate-400">{s.fornitore}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{s.categoria_nome || '-'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{s.immobile_nome || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">
                    <div>{s.data_scadenza || '-'}</div>
                    {s.tipo_versamento && s.tipo_versamento !== 'saldo' && (
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-wide">
                        {s.tipo_versamento}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{fmt(s.importo)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={clsx('inline-flex items-center gap-1', STATI[s.stato] || 'badge-gray')}>
                      {statoIcon(s.stato)}{STATI_LABEL[s.stato] || s.stato}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      {s.num_documenti > 0 && (
                        <span className="text-xs text-slate-400 mr-1">{s.num_documenti} doc</span>
                      )}
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"
                        title="Documenti" onClick={() => setDocsModal(s)}>
                        <Eye size={14} />
                      </button>
                      {s.stato === 'da_pagare' && (
                        <button className="p-1.5 text-slate-400 hover:text-green-600 rounded hover:bg-green-50"
                          title="Registra pagamento" onClick={() => setPagaModal(s)}>
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"
                        title="Modifica" onClick={() => navigate(`/spese/${s.id}/modifica`)}>
                        <Upload size={14} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                        title="Elimina" onClick={() => setConfirm(s.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={() => elimina(confirm)} title="Elimina spesa"
        message="Eliminare questa spesa e tutti i documenti allegati?" />

      {docsModal && (
        <DocumentiModal spesa={docsModal} onClose={() => { setDocsModal(null); load() }} />
      )}

      {pagaModal && (
        <PagaModal spesa={pagaModal} onClose={() => { setPagaModal(null); load() }} />
      )}
    </div>
  )
}
