import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, MapPin, Home, Edit2, Trash2, Loader, Navigation } from 'lucide-react'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import CityAutocomplete from '../components/ui/CityAutocomplete'
import MapView from '../components/ui/MapView'
import { geocodifica, reverseGeocode } from '../services/geocoding'

const FORM_DEFAULT = {
  nome: '', indirizzo: '', citta: '', cap: '', sigla_prov: '',
  tipo: 'appartamento', superficie_mq: '', valore_acquisto: '',
  data_acquisto: '', lat: null, lng: null, note: ''
}

export default function Immobili() {
  const [lista, setLista] = useState([])
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(FORM_DEFAULT)
  const [confirm, setConfirm] = useState(null)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeMsg, setGeocodeMsg] = useState(null)
  const geoTimer = useRef(null)
  const navigate = useNavigate()
  const api = window.api

  const load = () => api?.immobili.getAll().then(setLista)
  useEffect(() => { load() }, [])

  const apriForm = (imm = null) => {
    setEditing(imm)
    setGeocodeMsg(null)
    setForm(imm ? {
      nome: imm.nome, indirizzo: imm.indirizzo, citta: imm.citta || '',
      cap: imm.cap || '', sigla_prov: imm.sigla_prov || '',
      tipo: imm.tipo || 'appartamento',
      superficie_mq: imm.superficie_mq || '', valore_acquisto: imm.valore_acquisto || '',
      data_acquisto: imm.data_acquisto || '',
      lat: imm.lat || null, lng: imm.lng || null, note: imm.note || ''
    } : FORM_DEFAULT)
    setModal(true)
  }

  // Geocoding con debounce: si attiva quando indirizzo + città sono presenti
  const triggerGeocode = useCallback((indirizzo, citta, cap) => {
    clearTimeout(geoTimer.current)
    if (!indirizzo || indirizzo.length < 5 || !citta) return
    geoTimer.current = setTimeout(async () => {
      setGeocoding(true)
      setGeocodeMsg(null)
      const result = await geocodifica(indirizzo, citta, cap)
      setGeocoding(false)
      if (result) {
        setForm(p => ({
          ...p,
          lat: result.lat,
          lng: result.lng,
          cap: result.cap || p.cap,
        }))
        setGeocodeMsg({ tipo: 'ok', testo: `Posizione trovata: ${result.display_name.substring(0, 80)}…` })
      } else {
        setGeocodeMsg({ tipo: 'warn', testo: 'Indirizzo non trovato su OpenStreetMap — puoi trascinare il marker sulla mappa' })
      }
    }, 900)
  }, [])

  const setField = (k, v) => setForm(p => {
    const next = { ...p, [k]: v }
    if (k === 'indirizzo' || k === 'citta' || k === 'cap') {
      triggerGeocode(next.indirizzo, next.citta, next.cap)
    }
    return next
  })

  const onMarkerMove = async (lat, lng) => {
    setForm(p => ({ ...p, lat, lng }))
    // Reverse geocoding per aggiornare CAP se mancante
    const r = await reverseGeocode(lat, lng)
    if (r) {
      setForm(p => ({
        ...p,
        lat, lng,
        cap: p.cap || r.cap || p.cap,
        indirizzo: p.indirizzo || r.indirizzo || p.indirizzo,
        citta: p.citta || r.comune || p.citta,
      }))
    }
  }

  const salva = async () => {
    const data = {
      ...form,
      superficie_mq: form.superficie_mq ? parseFloat(form.superficie_mq) : null,
      valore_acquisto: form.valore_acquisto ? parseFloat(form.valore_acquisto) : null,
      lat: form.lat || null,
      lng: form.lng || null
    }
    if (editing) await api.immobili.update(editing.id, data)
    else await api.immobili.create(data)
    setModal(false)
    load()
  }

  const elimina = async (id) => { await api.immobili.delete(id); load() }
  const F = (k) => ({
    value: form[k],
    onChange: e => setField(k, e.target.value)
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{lista.length} immobili registrati</p>
        <button className="btn-primary" onClick={() => apriForm()}>
          <Plus size={16} /> Nuovo Immobile
        </button>
      </div>

      {lista.length === 0 ? (
        <div className="card">
          <EmptyState icon={Building2} title="Nessun immobile"
            description="Aggiungi il tuo primo immobile per iniziare"
            action={<button className="btn-primary" onClick={() => apriForm()}><Plus size={16} />Aggiungi</button>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {lista.map(imm => (
            <div key={imm.id} className="card cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => navigate(`/immobili/${imm.id}`)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Building2 size={20} className="text-blue-600" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={e => e.stopPropagation()}>
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    onClick={() => apriForm(imm)}><Edit2 size={14} /></button>
                  <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    onClick={() => setConfirm(imm.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-800 mb-1">{imm.nome}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                <MapPin size={12} />
                {imm.indirizzo}{imm.citta ? `, ${imm.citta}` : ''}
                {imm.sigla_prov ? ` (${imm.sigla_prov})` : ''}
              </p>
              <div className="flex gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Home size={12} /> {imm.num_unita} unità</span>
                {imm.superficie_mq && <span>{imm.superficie_mq} m²</span>}
                {imm.contratti_attivi > 0 && (
                  <span className="badge-green">{imm.contratti_attivi} contratti</span>
                )}
                {imm.lat && <span className="flex items-center gap-0.5 text-blue-400"><MapPin size={10} />GPS</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)}
        title={editing ? 'Modifica Immobile' : 'Nuovo Immobile'} size="xl">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">

          {/* Colonna sinistra — dati */}
          <div className="space-y-4">
            <div>
              <label className="label">Nome immobile *</label>
              <input className="input" placeholder="Es. Appartamento Milano Centro" {...F('nome')} />
            </div>
            <div>
              <label className="label">Indirizzo *</label>
              <input className="input" placeholder="Via Roma 10" {...F('indirizzo')} />
            </div>

            <div>
              <label className="label">Città</label>
              <CityAutocomplete
                value={form.citta}
                onChange={(nome, comune) => {
                  const next = {
                    ...form, citta: nome,
                    cap: comune?.cap || form.cap,
                    sigla_prov: comune?.sigla_prov || form.sigla_prov
                  }
                  setForm(next)
                  triggerGeocode(next.indirizzo, nome, next.cap)
                }}
                placeholder="Cerca comune ISTAT..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Provincia</label>
                <input className="input" placeholder="RM" maxLength={2}
                  value={form.sigla_prov}
                  onChange={e => setForm(p => ({ ...p, sigla_prov: e.target.value.toUpperCase() }))} />
              </div>
              <div>
                <label className="label">CAP</label>
                <input className="input" placeholder="00100" maxLength={5} {...F('cap')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Tipo</label>
                <select className="input" {...F('tipo')}>
                  <option value="appartamento">Appartamento</option>
                  <option value="villa">Villa</option>
                  <option value="ufficio">Ufficio</option>
                  <option value="negozio">Negozio</option>
                  <option value="box">Box / Garage</option>
                  <option value="altro">Altro</option>
                </select>
              </div>
              <div>
                <label className="label">Superficie (m²)</label>
                <input className="input" type="number" placeholder="80" {...F('superficie_mq')} />
              </div>
              <div>
                <label className="label">Valore acquisto (€)</label>
                <input className="input" type="number" {...F('valore_acquisto')} />
              </div>
              <div>
                <label className="label">Data acquisto</label>
                <input className="input" type="date" {...F('data_acquisto')} />
              </div>
            </div>

            <div>
              <label className="label">Note</label>
              <textarea className="input" rows={2} {...F('note')} />
            </div>
          </div>

          {/* Colonna destra — mappa */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="label mb-0">Posizione sulla mappa</label>
              {geocoding && (
                <span className="flex items-center gap-1.5 text-xs text-blue-500">
                  <Loader size={12} className="animate-spin" /> Geocoding...
                </span>
              )}
            </div>

            {geocodeMsg && (
              <div className={`text-xs px-3 py-2 rounded-lg flex items-start gap-1.5 ${
                geocodeMsg.tipo === 'ok'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                <Navigation size={11} className="shrink-0 mt-0.5" />
                {geocodeMsg.testo}
              </div>
            )}

            <MapView
              lat={form.lat}
              lng={form.lng}
              draggable
              onMarkerMove={onMarkerMove}
              height="380px"
              zoom={16}
            />

            {form.lat && (
              <p className="text-xs text-slate-400 text-center font-mono">
                {form.lat.toFixed(6)}, {form.lng.toFixed(6)}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
          <button className="btn-secondary" onClick={() => setModal(false)}>Annulla</button>
          <button className="btn-primary" onClick={salva} disabled={!form.nome || !form.indirizzo}>Salva</button>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={() => elimina(confirm)} title="Elimina immobile"
        message="Eliminare questo immobile? Saranno rimossi anche unità, spese e contratti associati." />
    </div>
  )
}
