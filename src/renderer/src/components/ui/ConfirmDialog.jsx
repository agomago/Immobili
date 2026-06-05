import React from 'react'
import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3 mb-5">
        {danger && <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />}
        <p className="text-sm text-slate-600">{message}</p>
      </div>
      <div className="flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onClose}>Annulla</button>
        <button className={danger ? 'btn-danger' : 'btn-primary'} onClick={() => { onConfirm(); onClose() }}>
          Conferma
        </button>
      </div>
    </Modal>
  )
}
