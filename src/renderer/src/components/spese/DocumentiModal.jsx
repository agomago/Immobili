import React, { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { Upload, FileText, Image, ExternalLink, Trash2, Loader, CheckCircle, AlertCircle, Plus } from 'lucide-react'
import clsx from 'clsx'

export default function DocumentiModal({ spesa, onClose }) {
  const [docs, setDocs] = useState([])
  const [ocrLoading, setOcrLoading] = useState(null)
  const [ocrResult, setOcrResult] = useState(null)
  const api = window.api

  const loadDocs = () => api.documenti.getBySpesa(spesa.id).then(setDocs)
  useEffect(() => { loadDocs() }, [spesa.id])

  const caricaFile = async () => {
    const filePath = await api.documenti.scegli()
    if (!filePath) return
    const { id: doc_id, percorso_file } = await api.documenti.upload({ filePath, spesa_id: spesa.id })
    setOcrLoading(doc_id)
    setOcrResult(null)
    const risultato = await api.documenti.elaboraOcr(doc_id, percorso_file)
    setOcrLoading(null)
    setOcrResult({ doc_id, ...risultato })
    loadDocs()
  }

  const elimina = async (id) => { await api.documenti.delete(id); loadDocs() }

  const confidenceColor = (c) => {
    if (c === 'alta') return 'text-green-600'
    if (c === 'bassa') return 'text-amber-600'
    return 'text-slate-400'
  }

  return (
    <Modal open title={`Documenti: ${spesa.descrizione}`} onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-slate-500">{docs.length} documento/i allegato/i</p>
          <button className="btn-primary" onClick={caricaFile}>
            <Plus size={15} /> Carica documento
          </button>
        </div>

        {ocrLoading && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
            <Loader size={18} className="text-blue-600 animate-spin" />
            <div>
              <p className="text-sm font-medium text-blue-800">Analisi OCR in corso...</p>
              <p className="text-xs text-blue-600">Estrazione automatica dei dati dal documento</p>
            </div>
          </div>
        )}

        {ocrResult && !ocrResult.errore && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-sm font-semibold text-slate-700">Dati estratti automaticamente</p>
              <span className={clsx('text-xs font-medium ml-auto', confidenceColor(ocrResult.tipo_documento_confidence))}>
                Confidenza: {ocrResult.tipo_documento_confidence}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['Tipo documento', ocrResult.tipo_documento_label],
                ['Fornitore', ocrResult.fornitore],
                ['Importo', ocrResult.importo ? `€ ${ocrResult.importo.toFixed(2)}` : null],
                ['Data', ocrResult.data],
                ['Periodo', ocrResult.periodo],
                ['Consumo', ocrResult.consumo],
                ['IBAN', ocrResult.iban],
                ['Riferimento', ocrResult.riferimento]
              ].filter(([, v]) => v).map(([label, val]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-slate-400 shrink-0">{label}:</span>
                  <span className="text-slate-700 font-medium truncate">{val}</span>
                </div>
              ))}
            </div>
            {ocrResult.tipo_documento_confidence === 'bassa' && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <AlertCircle size={12} /> Verifica i dati estratti — confidenza bassa
              </p>
            )}
          </div>
        )}

        {docs.length === 0 && !ocrLoading ? (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
            <Upload size={28} className="text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">Nessun documento allegato</p>
            <p className="text-xs text-slate-300 mt-1">Clicca "Carica documento" per aggiungere PDF o immagini</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 group">
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  {doc.tipo_file === 'pdf' ? <FileText size={16} className="text-red-500" /> : <Image size={16} className="text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{doc.nome_file}</p>
                  {doc.ocr_completato ? (
                    <p className="text-xs text-slate-400 truncate">
                      {doc.ocr_tipo_documento_label || doc.ocr_tipo_documento}
                      {doc.ocr_importo ? ` · € ${doc.ocr_importo.toFixed(2)}` : ''}
                      {doc.ocr_fornitore ? ` · ${doc.ocr_fornitore}` : ''}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">Caricato il {doc.caricato_il?.split('T')[0]}</p>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50"
                    onClick={() => api.documenti.apri(doc.percorso_file)} title="Apri file">
                    <ExternalLink size={13} />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                    onClick={() => elimina(doc.id)} title="Elimina">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
