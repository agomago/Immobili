import React, { useEffect, useState } from 'react'
import { BarChart2, Download, FileSpreadsheet, FileText, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'

export default function Report() {
  const [immobili, setImmobili] = useState([])
  const [params, setParams] = useState({
    tipo: 'tutto',
    anno: new Date().getFullYear(),
    immobile_id: ''
  })
  const [loading, setLoading] = useState(null)
  const [incassiMensili, setIncassiMensili] = useState([])
  const [loadingIncassi, setLoadingIncassi] = useState(false)
  const api = window.api

  const MESI_LABEL = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']
  const MESI_NUM = ['01','02','03','04','05','06','07','08','09','10','11','12']

  useEffect(() => { 
    api?.immobili.getAll().then(setImmobili)
  }, [])

  useEffect(() => {
    const caricaIncassi = async () => {
      setLoadingIncassi(true)
      try {
        const dati = await api.pagamentiAffitto.getIncassiMensiliPerAnno(
          Number(params.anno),
          params.immobile_id ? Number(params.immobile_id) : null
        )
        // Costruisci array 12 mesi
        const mesiCompleti = MESI_NUM.map((m, idx) => {
          const dato = dati.find(d => d.mese === m)
          return {
            mese: m,
            label: MESI_LABEL[idx],
            incasso: dato ? parseFloat(dato.totale_incassato) : 0,
            rate: dato ? dato.num_rate : 0
          }
        })
        setIncassiMensili(mesiCompleti)
      } finally {
        setLoadingIncassi(false)
      }
    }
    caricaIncassi()
  }, [params.anno, params.immobile_id])

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
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Incassi Mensili</h2>
            <p className="text-xs text-slate-500">Pagamenti affitti per mese — {params.anno}</p>
          </div>
        </div>

        {loadingIncassi ? (
          <div className="text-center py-8 text-slate-500">Caricamento dati...</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incassiMensili} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} 
                  tickFormatter={(v) => `€ ${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => `€ ${parseFloat(value).toFixed(2)}`}
                  labelStyle={{ color: '#000' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '13px' }} />
                <Bar dataKey="incasso" fill="#10b981" name="Incasso (€)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs text-green-600 font-semibold uppercase mb-1">Incasso Totale {params.anno}</p>
                <p className="text-2xl font-bold text-green-700">
                  € {incassiMensili.reduce((a, m) => a + m.incasso, 0).toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Media Mensile</p>
                <p className="text-2xl font-bold text-blue-700">
                  € {(incassiMensili.reduce((a, m) => a + m.incasso, 0) / 12).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-6 text-xs text-slate-500">
              <p>Dati filtrati per immobile: <strong>{params.immobile_id ? immobili.find(i => i.id === Number(params.immobile_id))?.nome : 'Tutti'}</strong></p>
            </div>
          </>
        )}
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
