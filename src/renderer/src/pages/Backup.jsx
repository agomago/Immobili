import React, { useState, useEffect } from 'react'
import { HardDrive, Upload, Download, CheckCircle, AlertCircle, Loader, FileArchive, RefreshCw, Info } from 'lucide-react'
import clsx from 'clsx'

export default function Backup() {
  const [loading, setLoading] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [comuniCount, setComuniCount] = useState(0)
  const api = window.api

  useEffect(() => {
    api?.comuni.count().then(setComuniCount)
  }, [])

  const eseguiBackup = async () => {
    setLoading('backup')
    setResult(null)
    setError(null)
    try {
      const r = await api.backup.esegui()
      if (r) setResult({ tipo: 'backup', ...r })
    } catch (e) {
      setError(e.message)
    } finally { setLoading(null) }
  }

  const eseguiRestore = async () => {
    setLoading('restore')
    setResult(null)
    setError(null)
    try {
      const r = await api.backup.restore()
      if (r) setResult({ tipo: 'restore', ...r })
    } catch (e) {
      setError(e.message)
    } finally { setLoading(null) }
  }

  const importaCsv = async () => {
    setLoading('csv')
    setResult(null)
    setError(null)
    try {
      const n = await api.comuni.importCsv()
      if (n != null) {
        setResult({ tipo: 'csv', n })
        const count = await api.comuni.count()
        setComuniCount(count)
      }
    } catch (e) {
      setError(e.message)
    } finally { setLoading(null) }
  }

  return (
    <div className="max-w-2xl space-y-5">

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {result && result.tipo === 'backup' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
          <CheckCircle size={18} className="text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Backup completato</p>
            <p className="text-xs text-green-600">{result.filePath}</p>
            <p className="text-xs text-green-600 mt-0.5">
              {result.manifest.num_documenti} documenti · {result.manifest.num_foto} foto
            </p>
          </div>
        </div>
      )}
      {result && result.tipo === 'restore' && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <RefreshCw size={18} className="text-blue-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Restore completato — Riavvio in corso…</p>
            <p className="text-xs text-blue-600">
              Backup del {result.manifest.creato_il?.split('T')[0]} · versione {result.manifest.version}
            </p>
          </div>
        </div>
      )}
      {result && result.tipo === 'csv' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
          <CheckCircle size={18} className="text-green-600 shrink-0" />
          <p className="text-sm text-green-800">Importati <strong>{result.n}</strong> comuni dal file CSV ISTAT</p>
        </div>
      )}

      {/* Backup & Restore */}
      <div className="card space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <HardDrive size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Backup & Ripristino</h2>
            <p className="text-xs text-slate-500">Salva o ripristina tutti i dati dell'applicazione</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Backup */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Download size={16} className="text-blue-600" />
              <h3 className="font-medium text-slate-700 text-sm">Crea Backup</h3>
            </div>
            <p className="text-xs text-slate-500">
              Esporta database, documenti allegati e foto in un unico file <code className="bg-slate-100 px-1 rounded">.backup</code>
            </p>
            <ul className="text-xs text-slate-400 space-y-1">
              <li className="flex items-center gap-1.5"><CheckCircle size={10} className="text-green-500" /> Database SQLite</li>
              <li className="flex items-center gap-1.5"><CheckCircle size={10} className="text-green-500" /> Documenti allegati (PDF/img)</li>
              <li className="flex items-center gap-1.5"><CheckCircle size={10} className="text-green-500" /> Foto inquilini</li>
            </ul>
            <button className="btn-primary w-full justify-center" onClick={eseguiBackup} disabled={!!loading}>
              {loading === 'backup'
                ? <><Loader size={15} className="animate-spin" /> In corso...</>
                : <><Download size={15} /> Crea backup</>}
            </button>
          </div>

          {/* Restore */}
          <div className="border border-amber-200 rounded-xl p-4 space-y-3 bg-amber-50">
            <div className="flex items-center gap-2">
              <Upload size={16} className="text-amber-600" />
              <h3 className="font-medium text-slate-700 text-sm">Ripristina Backup</h3>
            </div>
            <p className="text-xs text-slate-500">
              Importa un file <code className="bg-amber-100 px-1 rounded">.backup</code> esistente. <strong className="text-amber-700">Sovrascrive i dati attuali.</strong>
            </p>
            <div className="flex items-start gap-1.5 text-xs text-amber-600 bg-amber-100 rounded-lg px-2 py-1.5">
              <Info size={11} className="shrink-0 mt-0.5" />
              L'app si riavvierà automaticamente dopo il ripristino
            </div>
            <button className="w-full justify-center px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 disabled:opacity-50"
              onClick={eseguiRestore} disabled={!!loading}>
              {loading === 'restore'
                ? <><Loader size={15} className="animate-spin" /> In corso...</>
                : <><Upload size={15} /> Ripristina backup</>}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg p-3">
          <Info size={12} className="shrink-0 mt-0.5" />
          <p>Per spostare l'app su un altro PC: crea un backup su questo computer, installa l'app sul nuovo, poi usa "Ripristina backup" per importare tutti i dati.</p>
        </div>
      </div>

      {/* ISTAT Comuni */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
            <FileArchive size={20} className="text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800">Database Comuni ISTAT</h2>
            <p className="text-xs text-slate-500">
              {comuniCount > 0
                ? `${comuniCount} comuni caricati — usati nell'autocomplete delle città`
                : 'Nessun comune caricato'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
          <Info size={12} className="shrink-0 mt-0.5" />
          <div>
            <p>Per aggiornare con i dati ISTAT ufficiali completi (7.900+ comuni), scarica il file CSV dal sito ISTAT
              (<em>Elenco Comuni — Codici e denominazioni</em>) e importalo qui.</p>
            <p className="mt-1">Il file deve avere colonne: <code>CODICE_COMUNE, DENOMINAZIONE_COMUNE, SIGLA_PROVINCIA, DENOMINAZIONE_PROVINCIA, DENOMINAZIONE_REGIONE</code></p>
          </div>
        </div>

        <button className="btn-secondary" onClick={importaCsv} disabled={!!loading}>
          {loading === 'csv'
            ? <><Loader size={15} className="animate-spin" /> Importazione...</>
            : <><Upload size={15} /> Importa CSV ISTAT completo</>}
        </button>
      </div>
    </div>
  )
}
