import React, { useState, useEffect, useRef } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export default function CityAutocomplete({ value, onChange, onProvinceChange, placeholder = 'Cerca città...', className }) {
  const [query, setQuery] = useState(value || '')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)
  const timer = useRef(null)
  const api = window.api

  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const search = (q) => {
    clearTimeout(timer.current)
    if (!q || q.length < 2) { setResults([]); setOpen(false); return }
    timer.current = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await api.comuni.search(q)
        setResults(r)
        setOpen(r.length > 0)
      } finally { setLoading(false) }
    }, 200)
  }

  const seleziona = (comune) => {
    setQuery(comune.nome)
    setOpen(false)
    onChange(comune.nome, comune)
    if (onProvinceChange) onProvinceChange(comune.sigla_prov, comune)
  }

  const handleChange = (e) => {
    const q = e.target.value
    setQuery(q)
    if (!q) { onChange('', null); if (onProvinceChange) onProvinceChange('', null) }
    search(q)
  }

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <div className="relative">
        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-8"
          value={query}
          onChange={handleChange}
          onFocus={() => query.length >= 2 && results.length > 0 && setOpen(true)}
          placeholder={placeholder}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {results.map(c => (
            <button key={c.codice} className="w-full text-left px-3 py-2 hover:bg-blue-50 flex items-center justify-between gap-2 transition-colors"
              onClick={() => seleziona(c)}>
              <div>
                <span className="text-sm font-medium text-slate-800">{c.nome}</span>
                <span className="text-xs text-slate-400 ml-2">{c.nome_prov}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{c.sigla_prov}</span>
                {c.cap && <span className="text-xs text-slate-400">{c.cap}</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
