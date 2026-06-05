import React, { useEffect, useState } from 'react'
import { BarChart2, Download, FileSpreadsheet, FileText } from 'lucide-react'

export default function Report() {
  const [immobili, setImmobili] = useState([])
  const [params, setParams] = useState({
    tipo: 'tutto',
    anno: new Date().getFullYear(),
    immobile_id: ''
  })
  const [loading, setLoading] = useState(null)
  const api = window.api

  useEffect(() => { api?.immobili.getAll().then(setImmobili) }, [])

  const esporta = async (formato) => {
    setLoading(formato)
    const p = {
      tipo: params.tipo,
      anno: Number(params.anno),
      immobile_id: params.immobile_id ? Number(params.immobile_id) : null,
      immobile_nome: immobili.find(i => i.id === Number(params.immobile_id))?.nome || null
    }
    try {
      const path = formato === 'excel' ? await api.report.excel(p) : await api.report.pdf(p)
      if (path) {
        // File salvato con successo
      }
    } finally {
      setLoading(null)
    }
  }

  const anni = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="max-w-2xl space-y-6">
      <div className="card space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <BarChart2 size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Genera Report</h2>
            <p className="text-xs text-slate-500">Esporta i dati in formato Excel o PDF</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Tipo report</label>
            <select className="input" value={params.tipo}
              onChange={e => setParams(p => ({ ...p, tipo: e.target.value }))}>
              <option value="tutto">Completo (spese + affitti)</option>
              <option value="spese">Solo spese</option>
              <option value="affitti">Solo affitti</option>
            </select>
          </div>
          <div>
            <label className="label">Anno</label>
            <select className="input" value={params.anno}
              onChange={e => setParams(p => ({ ...p, anno: e.target.value }))}>
              {anni.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Immobile</label>
            <select className="input" value={params.immobile_id}
              onChange={e => setParams(p => ({ ...p, immobile_id: e.target.value }))}>
              <option value="">Tutti</option>
              {immobili.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button className="btn-primary" onClick={() => esporta('excel')} disabled={!!loading}>
            <FileSpreadsheet size={16} />
            {loading === 'excel' ? 'Generazione...' : 'Esporta Excel (.xlsx)'}
          </button>
          <button className="btn-secondary" onClick={() => esporta('pdf')} disabled={!!loading}>
            <FileText size={16} />
            {loading === 'pdf' ? 'Generazione...' : 'Esporta PDF'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-700 mb-3">Cosa include il report</h3>
        <div className="space-y-2 text-sm text-slate-600">
          {[
            ['Spese e bollette', 'Data, immobile, categoria, fornitore, importo, stato pagamento'],
            ['Affitti', 'Mese, unità, inquilino, importo, data scadenza, stato'],
            ['Totali', 'Somme per categoria e per mese nell\'anno selezionato']
          ].map(([t, d]) => (
            <div key={t} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
              <Download size={15} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-700">{t}</p>
                <p className="text-xs text-slate-400">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
