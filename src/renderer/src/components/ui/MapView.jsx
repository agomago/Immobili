import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Loader, AlertCircle } from 'lucide-react'

// Leaflet viene caricato dinamicamente per evitare SSR issues
let L = null

async function getLeaflet() {
  if (L) return L
  const leaflet = await import('leaflet')
  L = leaflet.default || leaflet
  // Fix icone default (Vite sposta gli asset)
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
  })
  return L
}

/**
 * Mappa stradale Leaflet/OpenStreetMap.
 *
 * Props:
 *   lat, lng          – coordinate centro
 *   onMarkerMove      – callback(lat, lng) quando il marker viene spostato
 *   draggable         – se true il marker è trascinabile
 *   height            – altezza CSS della mappa (default '300px')
 *   zoom              – livello zoom iniziale (default 16)
 */
export default function MapView({ lat, lng, onMarkerMove, draggable = false, height = '300px', zoom = 16 }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)

  // Inizializza mappa
  useEffect(() => {
    if (!containerRef.current || !lat || !lng) return
    let mounted = true

    getLeaflet().then(Leaflet => {
      if (!mounted || !containerRef.current) return
      if (mapRef.current) {
        // Aggiorna se già inizializzata
        mapRef.current.setView([lat, lng], zoom)
        if (markerRef.current) markerRef.current.setLatLng([lat, lng])
        return
      }

      try {
        const map = Leaflet.map(containerRef.current, {
          center: [lat, lng],
          zoom,
          zoomControl: true,
          scrollWheelZoom: true
        })

        Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19
        }).addTo(map)

        const marker = Leaflet.marker([lat, lng], { draggable }).addTo(map)

        if (draggable && onMarkerMove) {
          marker.on('dragend', (e) => {
            const pos = e.target.getLatLng()
            onMarkerMove(pos.lat, pos.lng)
          })
        }

        mapRef.current = map
        markerRef.current = marker
        setReady(true)
      } catch (e) {
        setError(e.message)
      }
    }).catch(e => setError(e.message))

    return () => { mounted = false }
  }, [])

  // Aggiorna posizione quando cambiano le coordinate
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !lat || !lng) return
    const pos = [lat, lng]
    mapRef.current.setView(pos, zoom, { animate: true })
    markerRef.current.setLatLng(pos)
  }, [lat, lng, zoom])

  // Cleanup
  useEffect(() => {
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerRef.current = null }
    }
  }, [])

  if (error) return (
    <div className="flex items-center gap-2 text-xs text-red-500 p-3 bg-red-50 rounded-lg">
      <AlertCircle size={14} /> Impossibile caricare la mappa: {error}
    </div>
  )

  if (!lat || !lng) return (
    <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200"
      style={{ height }}>
      <MapPin size={16} className="text-slate-300" />
      <span>Inserisci indirizzo e città per visualizzare la mappa</span>
    </div>
  )

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200" style={{ height }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
          <Loader size={20} className="animate-spin text-blue-500" />
        </div>
      )}
      {draggable && ready && (
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm text-xs text-slate-500 px-2 py-1 rounded-lg flex items-center gap-1 pointer-events-none">
          <Navigation size={11} /> Trascina il marker per correggere la posizione
        </div>
      )}
    </div>
  )
}
