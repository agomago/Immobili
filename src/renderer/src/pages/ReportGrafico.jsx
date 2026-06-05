import React, { useEffect, useState, useMemo, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts'
import { TrendingUp, Zap, Droplets, Flame, BarChart2, Info, Download } from 'lucide-react'
import clsx from 'clsx'

// ── COSTANTI ──────────────────────────────────────────────────────────────────

const MESI_LABEL = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']
const MESI_NUM   = ['01','02','03','04','05','06','07','08','09','10','11','12']

// Categorie principali con colori fissi (per coerenza visiva)
const CAT_COLORI = {
  'Energia Elettrica': '#f59e0b',
  'Gas':               '#ef4444',
  'Acqua':             '#3b82f6',
  'Internet':          '#8b5cf6',
  'Condominio':        '#6b7280',
  'Netflix':           '#dc2626',
  'Amazon Prime':      '#f97316',
  'Assicurazione':     '#10b981',
  'IMU/TASI':          '#0ea5e9',
  'Manutenzione':      '#84cc16',
  'Ristrutturazione':  '#f43f5e',
}

const fmt = (n) => n != null ? `€ ${parseFloat(n).toFixed(0)}` : '—'
const fmtDec = (n) => n != null ? `€ ${parseFloat(n).toFixed(2)}` : '—'

// ── LOGICA PREVISIONE ─────────────────────────────────────────────────────────

/**
 * Costruisce la struttura dati per 12 mesi, inserendo stime per i mesi mancanti.
 * datiAnno    = array { mese, categoria_id, categoria_nome, colore, totale_importo, totale_kwh, totale_mc }
 * datiPrecAnno = stessa struttura per anno-1
 *
 * Ritorna array 12 elementi: { mese, label, <cat1>: importo, ..., _stimato_<cat1>: bool, ... }
 */
function costruisciDatiGrafico(datiAnno, datiPrecAnno, categorie) {
  const mesiAnno = {}
  const mesiPrec = {}

  // Indicizza per mese+categoria
  datiAnno.forEach(r => {
    if (!mesiAnno[r.mese]) mesiAnno[r.mese] = {}
    mesiAnno[r.mese][r.categoria_nome] = {
      importo: parseFloat(r.totale_importo) || 0,
      kwh: parseFloat(r.totale_kwh) || 0,
      mc: parseFloat(r.totale_mc) || 0
    }
  })
  datiPrecAnno.forEach(r => {
    if (!mesiPrec[r.mese]) mesiPrec[r.mese] = {}
    mesiPrec[r.mese][r.categoria_nome] = {
      importo: parseFloat(r.totale_importo) || 0,
      kwh: parseFloat(r.totale_kwh) || 0,
      mc: parseFloat(r.totale_mc) || 0
    }
  })

  const meseCorrente = new Date().getMonth() + 1 // 1-12

  return MESI_NUM.map((m, idx) => {
    const punto = { mese: m, label: MESI_LABEL[idx], _futuoMese: idx + 1 > meseCorrente }
    let hasDatiReali = !!mesiAnno[m]
    let hasStima = false

    categorie.forEach(cat => {
      const reale = mesiAnno[m]?.[cat.nome]
      const prec  = mesiPrec[m]?.[cat.nome]

      if (reale) {
        punto[cat.nome] = reale.importo
        punto[`_kwh_${cat.nome}`] = reale.kwh
        punto[`_mc_${cat.nome}`]  = reale.mc
        punto[`_stima_${cat.nome}`] = false
      } else if (prec && (prec.importo > 0 || prec.kwh > 0 || prec.mc > 0)) {
        // Usa dato anno precedente come stima
        punto[cat.nome] = prec.importo
        punto[`_kwh_${cat.nome}`] = prec.kwh
        punto[`_mc_${cat.nome}`]  = prec.mc
        punto[`_stima_${cat.nome}`] = true
        hasStima = true
      } else {
        punto[cat.nome] = 0
        punto[`_stima_${cat.nome}`] = false
      }
    })

    punto._hasDatiReali = hasDatiReali
    punto._hasStima = hasStima
    punto._totale = categorie.reduce((a, c) => a + (punto[c.nome] || 0), 0)
    punto._totaleKwh = categorie.reduce((a, c) => a + (punto[`_kwh_${c.nome}`] || 0), 0)
    punto._totaleMc  = categorie.reduce((a, c) => a + (punto[`_mc_${c.nome}`] || 0), 0)
    return punto
  })
}

/** Calcola il cumulato mensile (running total) */
function calcolaCumulato(datiGrafico, annoPrec) {
  let cum = 0
  return datiGrafico.map(d => {
    cum += d._totale
    return { ...d, _cumulato: cum }
  })
}

// ── TOOLTIP CUSTOM ────────────────────────────────────────────────────────────

function TooltipSpese({ active, payload, label, categorie }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]?.payload
  const haCat = categorie.filter(c => (entry?.[c.nome] || 0) > 0)

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs min-w-[180px]">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {haCat.map(c => (
        <div key={c.nome} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: c.colore }} />
            <span className="text-slate-600">{c.nome}</span>
            {entry[`_stima_${c.nome}`] && <span className="text-amber-500 text-[10px]">(stima)</span>}
          </div>
          <span className="font-semibold text-slate-800">{fmtDec(entry[c.nome])}</span>
        </div>
      ))}
      {haCat.length > 1 && (
        <div className="border-t border-slate-100 mt-2 pt-2 flex justify-between">
          <span className="font-semibold text-slate-700">Totale</span>
          <span className="font-bold text-slate-900">{fmtDec(entry._totale)}</span>
        </div>
      )}
      {entry._hasStima && (
        <p className="text-amber-500 mt-2 flex items-center gap-1">
          <Info size={10} /> Valori stimati da anno prec.
        </p>
      )}
    </div>
  )
}

function TooltipCumulato({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-500">{p.name}</span>
          </div>
          <span className="font-bold" style={{ color: p.color }}>{fmtDec(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function TooltipConsumi({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.filter(p => p.value > 0).map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-600">{p.name}</span>
          </div>
          <span className="font-semibold">{p.value.toFixed(1)} {p.unit}</span>
        </div>
      ))}
    </div>
  )
}

// ── LEGENDA RIEPILOGO ─────────────────────────────────────────────────────────

function LegendaRiepilogo({ categorie, datiGrafico }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {categorie.map(cat => {
        const totReale = datiGrafico
          .filter(d => !d[`_stima_${cat.nome}`])
          .reduce((a, d) => a + (d[cat.nome] || 0), 0)
        const totStima = datiGrafico
          .filter(d => d[`_stima_${cat.nome}`])
          .reduce((a, d) => a + (d[cat.nome] || 0), 0)
        const tot = totReale + totStima
        if (tot === 0) return null
        return (
          <div key={cat.nome} className="bg-white rounded-xl border border-slate-100 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.colore }} />
              <span className="text-xs font-medium text-slate-600 truncate">{cat.nome}</span>
            </div>
            <p className="text-base font-bold text-slate-800">{fmt(tot)}</p>
            {totStima > 0 && (
              <p className="text-xs text-amber-500">di cui {fmt(totStima)} stimati</p>
            )}
          </div>
        )
      }).filter(Boolean)}
    </div>
  )
}

// ── COMPONENTE PRINCIPALE ─────────────────────────────────────────────────────

export default function ReportGrafico() {
  const [immobili, setImmobili] = useState([])
  const [filtroImmobile, setFiltroImmobile] = useState('')
  const [anno, setAnno] = useState(new Date().getFullYear())
  const [datiAnno, setDatiAnno] = useState([])
  const [datiPrecAnno, setDatiPrecAnno] = useState([])
  const [loading, setLoading] = useState(false)
  const [vista, setVista] = useState('spese') // 'spese' | 'cumulative' | 'consumi'
  const api = window.api

  useEffect(() => { api?.immobili.getAll().then(setImmobili) }, [])

  const caricaDati = useCallback(async () => {
    setLoading(true)
    const immId = filtroImmobile ? Number(filtroImmobile) : null
    const [curr, prec] = await Promise.all([
      api.report.mensiliPerCategoria(immId, anno),
      api.report.mensiliPerCategoria(immId, anno - 1)
    ])
    setDatiAnno(curr)
    setDatiPrecAnno(prec)
    setLoading(false)
  }, [filtroImmobile, anno])

  useEffect(() => { caricaDati() }, [caricaDati])

  // Categorie presenti nei dati (anno corrente + anno prec)
  const categorie = useMemo(() => {
    const map = {}
    ;[...datiAnno, ...datiPrecAnno].forEach(r => {
      if (!map[r.categoria_nome]) {
        map[r.categoria_nome] = {
          nome: r.categoria_nome,
          colore: CAT_COLORI[r.categoria_nome] || r.colore || '#94a3b8',
          tipo: r.tipo_cat
        }
      }
    })
    return Object.values(map).sort((a, b) => a.nome.localeCompare(b.nome))
  }, [datiAnno, datiPrecAnno])

  // Dati 12 mesi con previsioni
  const datiGrafico = useMemo(
    () => categorie.length > 0 ? costruisciDatiGrafico(datiAnno, datiPrecAnno, categorie) : [],
    [datiAnno, datiPrecAnno, categorie]
  )

  // Dati cumulativi: anno corrente vs anno precedente
  const datiCumulativi = useMemo(() => {
    const cumAnno = { curr: 0, prec: 0 }
    const totPrec = {}
    datiPrecAnno.forEach(r => {
      if (!totPrec[r.mese]) totPrec[r.mese] = 0
      totPrec[r.mese] += parseFloat(r.totale_importo) || 0
    })

    return MESI_NUM.map((m, idx) => {
      const totCurr = datiGrafico[idx]?._totale || 0
      const totPrecMese = totPrec[m] || 0
      cumAnno.curr += datiGrafico[idx]?._hasDatiReali ? totCurr : 0
      cumAnno.prec += totPrecMese
      const isStima = datiGrafico[idx]?._hasStima
      const isFuturo = datiGrafico[idx]?._futuoMese
      return {
        label: MESI_LABEL[idx],
        mese: m,
        annoCorrente: totCurr > 0 ? parseFloat(totCurr.toFixed(2)) : null,
        annoPrec: totPrecMese > 0 ? parseFloat(totPrecMese.toFixed(2)) : null,
        cumulatoCorrente: parseFloat(cumAnno.curr.toFixed(2)),
        cumulatoPrec: parseFloat(cumAnno.prec.toFixed(2)),
        _isStima: isStima,
        _isFuturo: isFuturo
      }
    })
  }, [datiGrafico, datiPrecAnno])

  const totAnnuale = datiGrafico.reduce((a, d) => a + d._totale, 0)
  const totKwh = datiGrafico.reduce((a, d) => a + d._totaleKwh, 0)
  const totMc  = datiGrafico.reduce((a, d) => a + d._totaleMc, 0)
  const mesiConStima = datiGrafico.filter(d => d._hasStima).length
  const anni = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="space-y-5">
      {/* Filtri */}
      <div className="flex flex-wrap items-center gap-3">
        <select className="input w-52" value={filtroImmobile}
          onChange={e => setFiltroImmobile(e.target.value)}>
          <option value="">Tutti gli immobili</option>
          {immobili.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
        </select>
        <div className="flex gap-1">
          {anni.map(a => (
            <button key={a}
              className={clsx('px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                anno === a ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')}
              onClick={() => setAnno(a)}>{a}</button>
          ))}
        </div>
        <div className="ml-auto flex gap-1">
          {[
            { k: 'spese',      label: 'Spese mensili' },
            { k: 'cumulative', label: 'Cumulativo' },
            { k: 'consumi',    label: 'Consumi' }
          ].map(v => (
            <button key={v.k}
              className={clsx('px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                vista === v.k ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50')}
              onClick={() => setVista(v.k)}>{v.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : categorie.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <BarChart2 size={40} className="text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">Nessuna spesa registrata per {anno}</p>
          <p className="text-slate-400 text-sm mt-1">Aggiungi delle spese per visualizzare i grafici</p>
        </div>
      ) : (
        <>
          {/* KPI header */}
          <div className="grid grid-cols-4 gap-4">
            <div className="card text-center py-3">
              <p className="text-xs text-slate-400 mb-1">Totale {anno}</p>
              <p className="text-xl font-bold text-slate-800">{fmt(totAnnuale)}</p>
              {mesiConStima > 0 && <p className="text-xs text-amber-500 mt-0.5">{mesiConStima} mesi stimati</p>}
            </div>
            <div className="card text-center py-3">
              <p className="text-xs text-slate-400 mb-1">Media mensile</p>
              <p className="text-xl font-bold text-slate-800">{fmt(totAnnuale / 12)}</p>
            </div>
            <div className="card text-center py-3 flex items-center justify-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <div>
                <p className="text-xs text-slate-400">Energia elettrica</p>
                <p className="text-lg font-bold text-slate-800">{totKwh > 0 ? `${totKwh.toFixed(0)} kWh` : '—'}</p>
              </div>
            </div>
            <div className="card text-center py-3 flex items-center justify-center gap-2">
              <Flame size={16} className="text-red-500" />
              <div>
                <p className="text-xs text-slate-400">Gas / Acqua</p>
                <p className="text-lg font-bold text-slate-800">{totMc > 0 ? `${totMc.toFixed(1)} mc` : '—'}</p>
              </div>
            </div>
          </div>

          {/* Grafico principale */}
          {vista === 'spese' && (
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">Spese mensili per categoria — {anno}</h2>
                {mesiConStima > 0 && (
                  <span className="text-xs text-amber-500 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-full">
                    <Info size={11} /> Barre tratteggiate = stima da {anno - 1}
                  </span>
                )}
              </div>
              <ResponsiveContainer width="100%" height={340}>
                <ComposedChart data={datiGrafico} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `€${v}`} />
                  <Tooltip content={<TooltipSpese categorie={categorie} />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {categorie.map(cat => (
                    <Bar key={cat.nome} dataKey={cat.nome} stackId="a"
                      fill={cat.colore} name={cat.nome} radius={[0, 0, 0, 0]}>
                      {datiGrafico.map((entry, idx) => (
                        <Cell key={idx}
                          fill={cat.colore}
                          fillOpacity={entry[`_stima_${cat.nome}`] ? 0.35 : 1}
                          stroke={entry[`_stima_${cat.nome}`] ? cat.colore : 'none'}
                          strokeWidth={entry[`_stima_${cat.nome}`] ? 1 : 0}
                          strokeDasharray={entry[`_stima_${cat.nome}`] ? '4 2' : '0'}
                        />
                      ))}
                    </Bar>
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {vista === 'cumulative' && (
            <div className="card space-y-4">
              <h2 className="font-semibold text-slate-800">Spesa cumulativa — {anno} vs {anno - 1}</h2>
              <ResponsiveContainer width="100%" height={340}>
                <AreaChart data={datiCumulativi} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradCurr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradPrec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `€${v}`} />
                  <Tooltip content={<TooltipCumulato />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="cumulatoPrec"
                    name={`${anno - 1}`} stroke="#94a3b8" strokeWidth={2}
                    fill="url(#gradPrec)" strokeDasharray="5 5" dot={false} />
                  <Area type="monotone" dataKey="cumulatoCorrente"
                    name={`${anno}`} stroke="#3b82f6" strokeWidth={2.5}
                    fill="url(#gradCurr)" dot={{ r: 3, fill: '#3b82f6' }} />
                </AreaChart>
              </ResponsiveContainer>

              {/* Barchart affiancato mese per mese */}
              <h3 className="font-medium text-slate-700 text-sm pt-2">Confronto mensile</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={datiCumulativi} margin={{ top: 0, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `€${v}`} />
                  <Tooltip content={<TooltipCumulato />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="annoPrec" name={`${anno - 1}`} fill="#cbd5e1" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="annoCorrente" name={`${anno}`} radius={[3, 3, 0, 0]}>
                    {datiCumulativi.map((entry, idx) => (
                      <Cell key={idx}
                        fill={entry._isStima ? '#93c5fd' : '#3b82f6'}
                        fillOpacity={entry._isFuturo && !entry._isStima ? 0.3 : 1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {vista === 'consumi' && (
            <div className="card space-y-6">
              <h2 className="font-semibold text-slate-800">Consumi mensili — {anno}</h2>

              {totKwh > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={16} className="text-amber-500" />
                    <h3 className="text-sm font-medium text-slate-700">Energia Elettrica (kWh)</h3>
                    <span className="text-xs text-slate-400 ml-auto">Totale anno: {totKwh.toFixed(0)} kWh</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={datiGrafico} margin={{ top: 0, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" kWh" />
                      <Tooltip content={<TooltipConsumi />} />
                      <Bar dataKey="_totaleKwh" name="kWh" unit="kWh" radius={[4, 4, 0, 0]}>
                        {datiGrafico.map((entry, idx) => (
                          <Cell key={idx}
                            fill={entry._hasStima ? '#fcd34d' : '#f59e0b'}
                            fillOpacity={entry._hasStima ? 0.5 : 1} />
                        ))}
                      </Bar>
                      <Line type="monotone" dataKey="_totaleKwh" stroke="#d97706"
                        strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Trend" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}

              {totMc > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Flame size={16} className="text-red-500" />
                    <h3 className="text-sm font-medium text-slate-700">Gas / Acqua (mc)</h3>
                    <span className="text-xs text-slate-400 ml-auto">Totale anno: {totMc.toFixed(1)} mc</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={datiGrafico} margin={{ top: 0, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} unit=" mc" />
                      <Tooltip content={<TooltipConsumi />} />
                      <Bar dataKey="_totaleMc" name="Gas/Acqua" unit="mc" radius={[4, 4, 0, 0]}>
                        {datiGrafico.map((entry, idx) => (
                          <Cell key={idx}
                            fill={entry._hasStima ? '#fca5a5' : '#ef4444'}
                            fillOpacity={entry._hasStima ? 0.5 : 1} />
                        ))}
                      </Bar>
                      <Line type="monotone" dataKey="_totaleMc" stroke="#dc2626"
                        strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Trend" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}

              {totKwh === 0 && totMc === 0 && (
                <div className="flex flex-col items-center py-12 text-slate-400">
                  <Droplets size={32} className="mb-3" />
                  <p>Nessun dato di consumo disponibile per {anno}</p>
                  <p className="text-sm mt-1">Inserisci kWh e mc nelle bollette per visualizzare i consumi</p>
                </div>
              )}
            </div>
          )}

          {/* Riepilogo per categoria */}
          <div className="card space-y-3">
            <h2 className="font-semibold text-slate-800 text-sm">Riepilogo per categoria — {anno}</h2>
            <LegendaRiepilogo categorie={categorie} datiGrafico={datiGrafico} />
          </div>

          {/* Nota previsioni */}
          {mesiConStima > 0 && (
            <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <Info size={14} className="shrink-0 mt-0.5" />
              <p>
                <strong>{mesiConStima} mesi</strong> non hanno bollette caricate per {anno}:
                i valori sono stimati automaticamente dallo storico dell'anno precedente ({anno - 1}).
                Le stime appaiono con colore desaturato nei grafici.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
