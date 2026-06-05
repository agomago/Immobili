import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Upload, CheckCircle, AlertCircle, Loader, Info } from 'lucide-react'
import clsx from 'clsx'

// Mappa categoria → tipo di campi da mostrare
const CAT_CONFIG = {
  1: { tipo: 'luce',     label: 'Energia Elettrica', mostraKwh: true, mostraMc: false, mostraPod: true,  mostraPdr: false, mostraConsumo: true },
  2: { tipo: 'gas',      label: 'Gas',               mostraKwh: false,mostraMc: true,  mostraPod: false, mostraPdr: true,  mostraConsumo: true },
  3: { tipo: 'acqua',    label: 'Acqua',             mostraKwh: false,mostraMc: true,  mostraPod: false, mostraPdr: false, mostraConsumo: true },
  4: { tipo: 'internet', label: 'Internet',          mostraKwh: false,mostraMc: false, mostraPod: false, mostraPdr: false, mostraConsumo: false },
  5: { tipo: 'cond',     label: 'Condominio',        mostraKwh: false,mostraMc: false, mostraPod: false, mostraPdr: false, mostraConsumo: false },
}
// Default per categorie non mappate (abbonamenti, assicurazioni, ecc.)
const CAT_DEFAULT = { mostraKwh: false, mostraMc: false, mostraPod: false, mostraPdr: false, mostraConsumo: false }

const DEFAULT = {
  immobile_id: '', categoria_id: '', descrizione: '', fornitore: '',
  importo: '', data_documento: '', data_scadenza: '', tipo_versamento: 'saldo',
  ricorrente: false, frequenza_ricorrenza: 'mensile', periodo_consumo_inizio: '',
  periodo_consumo_fine: '', consumo_kwh: '', consumo_mc: '',
  pod: '', pdr: '', iban: '', riferimento_bolletta: '',
  stato: 'da_pagare', ripartizione_stanze: false, note: ''
}

export default function SpeseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(DEFAULT)
  const [immobili, setImmobili] = useState([])
  const [categorie, setCategorie] = useState([])
  const [ocrPending, setOcrPending] = useState(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrResult, setOcrResult] = useState(null)
  const [podPdrInfo, setPodPdrInfo] = useState(null) // dati utenza dall'immobile
  const api = window.api

  useEffect(() => {
    Promise.all([api.immobili.getAll(), api.categorie.getAll()]).then(([imm, cat]) => {
      setImmobili(imm)
      setCategorie(cat)
    })
    if (id) {
      api.spese.getById(Number(id)).then(s => {
        if (s) setForm({
          immobile_id: s.immobile_id, categoria_id: s.categoria_id || '',
          descrizione: s.descrizione, fornitore: s.fornitore || '',
          importo: s.importo, data_documento: s.data_documento || '',
          data_scadenza: s.data_scadenza || '', tipo_versamento: s.tipo_versamento || 'saldo',
          ricorrente: !!s.ricorrente,
          frequenza_ricorrenza: s.frequenza_ricorrenza || 'mensile',
          periodo_consumo_inizio: s.periodo_consumo_inizio || '',
          periodo_consumo_fine: s.periodo_consumo_fine || '',
          consumo_kwh: s.consumo_kwh || '', consumo_mc: s.consumo_mc || '',
          pod: s.pod || '', pdr: s.pdr || '',
          iban: s.iban || '', riferimento_bolletta: s.riferimento_bolletta || '',
          stato: s.stato, ripartizione_stanze: !!s.ripartizione_stanze, note: s.note || ''
        })
      })
    }
  }, [id])

  // Carica POD/PDR dall'anagrafica utenze immobile quando cambia immobile o categoria
  const caricaPodPdr = useCallback(async (immobile_id, categoria_id) => {
    if (!immobile_id || !categoria_id) { setPodPdrInfo(null); return }
    const cfg = CAT_CONFIG[Number(categoria_id)]
    if (!cfg || (!cfg.mostraPod && !cfg.mostraPdr)) { setPodPdrInfo(null); return }
    const tipoUtenza = cfg.tipo === 'luce' ? 'luce' : cfg.tipo === 'gas' ? 'gas' : cfg.tipo === 'acqua' ? 'acqua' : null
    if (!tipoUtenza) { setPodPdrInfo(null); return }
    const dati = await api.utenze.getByTipo(Number(immobile_id), tipoUtenza)
    setPodPdrInfo(dati || null)
    if (dati) {
      setForm(f => ({
        ...f,
        pod: dati.pod || f.pod,
        pdr: dati.pdr || f.pdr,
        fornitore: f.fornitore || dati.fornitore_attuale || ''
      }))
    }
  }, [])

  const setField = (k, v) => setForm(p => {
    const next = { ...p, [k]: v }
    if (k === 'immobile_id' || k === 'categoria_id') {
      const immId = k === 'immobile_id' ? v : p.immobile_id
      const catId = k === 'categoria_id' ? v : p.categoria_id
      // Reset campi consumo quando cambia categoria
      if (k === 'categoria_id') {
        next.pod = ''; next.pdr = ''; next.consumo_kwh = ''; next.consumo_mc = ''
      }
      caricaPodPdr(immId, catId)
    }
    return next
  })

  const catCfg = CAT_CONFIG[Number(form.categoria_id)] || CAT_DEFAULT

  const caricaDocumentoOcr = async () => {
    const filePath = await api.documenti.scegli()
    if (!filePath) return
    setOcrLoading(true)
    setOcrResult(null)
    const { id: doc_id, percorso_file } = await api.documenti.upload({ filePath, spesa_id: null })
    const risultato = await api.documenti.elaboraOcr(doc_id, percorso_file)
    setOcrLoading(false)
    setOcrPending({ doc_id, percorso_file })
    setOcrResult(risultato)
    if (!risultato.errore) {
      setForm(p => ({
        ...p,
        importo: risultato.importo || p.importo,
        data_documento: risultato.data || p.data_documento,
        data_scadenza: risultato.data || p.data_scadenza,
        fornitore: risultato.fornitore || p.fornitore,
        iban: risultato.iban || p.iban,
        riferimento_bolletta: risultato.riferimento || p.riferimento_bolletta,
        consumo_kwh: risultato.consumo?.includes('kWh') ? risultato.consumo.replace(' kWh', '') : p.consumo_kwh,
        consumo_mc: risultato.consumo?.includes('mc') ? risultato.consumo.replace(' mc', '') : p.consumo_mc,
        categoria_id: risultato.categoria_id || p.categoria_id,
        descrizione: p.descrizione || risultato.tipo_documento_label || p.descrizione
      }))
    }
  }

  const salva = async () => {
    const data = {
      ...form,
      immobile_id: Number(form.immobile_id),
      categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
      importo: parseFloat(form.importo) || 0,
      ricorrente: form.ricorrente ? 1 : 0,
      ripartizione_stanze: form.ripartizione_stanze ? 1 : 0,
      consumo_kwh: form.consumo_kwh ? parseFloat(form.consumo_kwh) : null,
      consumo_mc: form.consumo_mc ? parseFloat(form.consumo_mc) : null,
      tipo_versamento: form.tipo_versamento || 'saldo',
      pod: form.pod || null, pdr: form.pdr || null,
      prossima_scadenza: form.ricorrente ? form.data_scadenza : null,
      periodo_consumo_inizio: form.periodo_consumo_inizio || null,
      periodo_consumo_fine: form.periodo_consumo_fine || null,
      data_documento: form.data_documento || null,
      data_scadenza: form.data_scadenza || null,
      iban: form.iban || null, riferimento_bolletta: form.riferimento_bolletta || null,
      fornitore: form.fornitore || null, note: form.note || null,
      consumo_mc3: null
    }
    if (id) await api.spese.update(Number(id), data)
    else { const r = await api.spese.create(data) }
    navigate('/spese')
  }

  const F = (k) => ({
    value: form[k],
    onChange: e => setField(k, e.target.value)
  })
  const FB = (k) => ({
    checked: form[k],
    onChange: e => setForm(p => ({ ...p, [k]: e.target.checked }))
  })

  const catOrdinarie = categorie.filter(c => c.tipo === 'ordinaria')
  const catStraordinarie = categorie.filter(c => c.tipo === 'straordinaria')

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/spese')} className="text-slate-500 hover:text-slate-800">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-slate-900 text-xl">{id ? 'Modifica Spesa' : 'Nuova Spesa'}</h1>
      </div>

      {/* OCR */}
      {!id && (
        <div className="card border-2 border-dashed border-blue-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-800 text-sm">Riconoscimento automatico documento</p>
              <p className="text-xs text-blue-600 mt-0.5">Carica PDF o immagine — i dati verranno estratti automaticamente</p>
            </div>
            <button className="btn-primary" onClick={caricaDocumentoOcr} disabled={ocrLoading}>
              {ocrLoading ? <Loader size={15} className="animate-spin" /> : <Upload size={15} />}
              {ocrLoading ? 'Analisi...' : 'Carica documento'}
            </button>
          </div>
          {ocrResult && (
            <div className={clsx('mt-3 p-3 rounded-lg text-xs', ocrResult.errore ? 'bg-red-50 text-red-700' : 'bg-white text-slate-600')}>
              {ocrResult.errore ? (
                <span className="flex items-center gap-1"><AlertCircle size={12} />{ocrResult.errore}</span>
              ) : (
                <span className="flex items-center gap-1 text-green-700">
                  <CheckCircle size={12} />
                  Tipo rilevato: <strong>{ocrResult.tipo_documento_label}</strong>
                  {ocrResult.importo ? ` · € ${ocrResult.importo.toFixed(2)}` : ''}
                  {ocrResult.fornitore ? ` · ${ocrResult.fornitore}` : ''}
                  <span className="ml-2 text-slate-400">(Confidenza: {ocrResult.tipo_documento_confidence})</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dati principali */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Informazioni principali</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Immobile *</label>
            <select className="input" value={form.immobile_id}
              onChange={e => setField('immobile_id', e.target.value)}>
              <option value="">Seleziona immobile</option>
              {immobili.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Categoria</label>
            <select className="input" value={form.categoria_id}
              onChange={e => setField('categoria_id', e.target.value)}>
              <option value="">Seleziona categoria</option>
              <optgroup label="Spese ordinarie">
                {catOrdinarie.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </optgroup>
              <optgroup label="Spese straordinarie">
                {catStraordinarie.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </optgroup>
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Descrizione *</label>
            <input className="input" placeholder="Es. Bolletta Enel luglio 2024" {...F('descrizione')} />
          </div>
          <div>
            <label className="label">Fornitore</label>
            <input className="input" placeholder="Es. Enel, A2A, TIM..." {...F('fornitore')} />
          </div>
          <div>
            <label className="label">Importo (€) *</label>
            <input className="input" type="number" step="0.01" placeholder="0.00" {...F('importo')} />
          </div>
          <div>
            <label className="label">Data documento</label>
            <input className="input" type="date" {...F('data_documento')} />
          </div>
          <div>
            <label className="label">Data scadenza</label>
            <input className="input" type="date" {...F('data_scadenza')} />
          </div>
          <div>
            <label className="label">Tipo versamento</label>
            <div className="flex gap-2">
              {[
                { value: 'saldo',   label: 'Saldo',   desc: 'Pagamento totale' },
                { value: 'acconto', label: 'Acconto', desc: 'Pagamento parziale' },
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setForm(p => ({ ...p, tipo_versamento: opt.value }))}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors text-center ${
                    form.tipo_versamento === opt.value
                      ? opt.value === 'saldo'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-amber-500 border-amber-500 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                  {opt.label}
                  <span className="block text-xs font-normal opacity-70">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sezione consumi — visibile solo per utenze con misuratori */}
      {catCfg.mostraConsumo && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Consumi</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Periodo — Dal</label>
              <input className="input" type="date" {...F('periodo_consumo_inizio')} />
            </div>
            <div>
              <label className="label">Al</label>
              <input className="input" type="date" {...F('periodo_consumo_fine')} />
            </div>
            {catCfg.mostraKwh && (
              <div>
                <label className="label">Consumo kWh</label>
                <input className="input" type="number" step="0.01" placeholder="0" {...F('consumo_kwh')} />
              </div>
            )}
            {catCfg.mostraMc && (
              <div>
                <label className="label">Consumo mc (metri cubi)</label>
                <input className="input" type="number" step="0.01" placeholder="0" {...F('consumo_mc')} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* POD / PDR — solo per Luce e Gas */}
      {(catCfg.mostraPod || catCfg.mostraPdr) && (
        <div className="card space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
              {catCfg.mostraPod ? 'POD — Punto di Prelievo' : 'PDR — Punto di Riconsegna'}
            </h2>
            {podPdrInfo && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle size={10} /> Auto-compilato dall'anagrafica immobile
              </span>
            )}
          </div>

          {!podPdrInfo && form.immobile_id && (
            <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-3">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>
                Nessun codice trovato per questo immobile.
                Puoi aggiungerlo nella <strong>scheda immobile → Codici Fornitura Utenze</strong>, oppure inserirlo manualmente qui sotto.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {catCfg.mostraPod && (
              <div className="col-span-2">
                <label className="label">POD (Punto di Prelievo elettrico)</label>
                <input className="input font-mono" placeholder="IT001E12345678901234567K" {...F('pod')} />
                <p className="text-xs text-slate-400 mt-1">Codice univoco dell'impianto — invariato al cambio fornitore</p>
              </div>
            )}
            {catCfg.mostraPdr && (
              <div className="col-span-2">
                <label className="label">PDR (Punto di Riconsegna gas)</label>
                <input className="input font-mono" placeholder="01234567890123456" {...F('pdr')} />
                <p className="text-xs text-slate-400 mt-1">Codice univoco dell'impianto — invariato al cambio fornitore</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagamento */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Riferimento pagamento</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">IBAN addebito</label>
            <input className="input font-mono text-xs" placeholder="IT00X0000000000000000000000" {...F('iban')} />
          </div>
          <div>
            <label className="label">N° Fattura / Bolletta</label>
            <input className="input" placeholder="Riferimento documento" {...F('riferimento_bolletta')} />
          </div>
        </div>
      </div>

      {/* Opzioni */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">Opzioni</h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-blue-600" {...FB('ricorrente')} />
            <div>
              <p className="text-sm font-medium text-slate-700">Spesa ricorrente</p>
              <p className="text-xs text-slate-400">Genera automaticamente la prossima scadenza</p>
            </div>
          </label>
          {form.ricorrente && (
            <div className="ml-7">
              <label className="label">Frequenza</label>
              <select className="input w-48" {...F('frequenza_ricorrenza')}>
                <option value="mensile">Mensile</option>
                <option value="bimestrale">Bimestrale</option>
                <option value="trimestrale">Trimestrale</option>
                <option value="semestrale">Semestrale</option>
                <option value="annuale">Annuale</option>
              </select>
            </div>
          )}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-blue-600" {...FB('ripartizione_stanze')} />
            <div>
              <p className="text-sm font-medium text-slate-700">Ripartisci tra stanze/unità</p>
              <p className="text-xs text-slate-400">Dividi il costo proporzionalmente tra le unità dell'immobile</p>
            </div>
          </label>
        </div>
        <div>
          <label className="label">Note</label>
          <textarea className="input" rows={2} {...F('note')} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="btn-secondary" onClick={() => navigate('/spese')}>Annulla</button>
        <button className="btn-primary" onClick={salva}
          disabled={!form.immobile_id || !form.descrizione || !form.importo}>
          <Save size={15} /> Salva spesa
        </button>
      </div>
    </div>
  )
}
