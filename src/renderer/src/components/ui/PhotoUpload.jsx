import React, { useState } from 'react'
import { Camera, User, Trash2 } from 'lucide-react'

export default function PhotoUpload({ value, onChange, size = 'md' }) {
  const [preview, setPreview] = useState(value || null)
  const api = window.api

  const scegli = async () => {
    const filePath = await api.inquilini.sceglieFoto()
    if (!filePath) return
    setPreview(filePath)
    onChange(filePath)
  }

  const rimuovi = () => { setPreview(null); onChange(null) }

  const dim = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16'

  return (
    <div className="flex items-center gap-4">
      <div className={`${dim} rounded-full overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center relative shrink-0`}>
        {preview ? (
          <img src={`file://${preview}`} alt="Foto inquilino"
            className="w-full h-full object-cover" />
        ) : (
          <User size={size === 'lg' ? 28 : 20} className="text-slate-300" />
        )}
      </div>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary text-xs py-1.5 px-3" onClick={scegli}>
          <Camera size={13} /> {preview ? 'Cambia foto' : 'Aggiungi foto'}
        </button>
        {preview && (
          <button type="button" className="btn-danger text-xs py-1.5 px-3" onClick={rimuovi}>
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
