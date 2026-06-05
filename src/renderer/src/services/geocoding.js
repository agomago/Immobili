const NOMINATIM = 'https://nominatim.openstreetmap.org'
const UA = 'ImmobiliManager/1.0 (contact@immobilimanager.local)'

let lastCall = 0
async function throttledFetch(url) {
  const now = Date.now()
  const wait = Math.max(0, 1100 - (now - lastCall))
  if (wait > 0) await new Promise(r => setTimeout(r, wait))
  lastCall = Date.now()
  return fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'it' } })
}

/**
 * Geocodifica un indirizzo completo → { lat, lng, cap, comune, provincia, display_name }
 */
export async function geocodifica(indirizzo, citta, cap) {
  const q = [indirizzo, cap, citta, 'Italy'].filter(Boolean).join(', ')
  const url = `${NOMINATIM}/search?format=json&q=${encodeURIComponent(q)}&limit=1&countrycodes=it&addressdetails=1`
  try {
    const resp = await throttledFetch(url)
    if (!resp.ok) return null
    const data = await resp.json()
    if (!data.length) return null
    const r = data[0]
    const addr = r.address || {}
    return {
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      cap: addr.postcode || cap || null,
      comune: addr.city || addr.town || addr.village || addr.municipality || citta || null,
      provincia: addr.county || addr.state_district || null,
      sigla_prov: null,
      display_name: r.display_name
    }
  } catch { return null }
}

/**
 * Reverse geocoding: { lat, lng } → dati indirizzo
 */
export async function reverseGeocode(lat, lng) {
  const url = `${NOMINATIM}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=it`
  try {
    const resp = await throttledFetch(url)
    if (!resp.ok) return null
    const r = await resp.json()
    const addr = r.address || {}
    return {
      indirizzo: [addr.road, addr.house_number].filter(Boolean).join(' ') || null,
      cap: addr.postcode || null,
      comune: addr.city || addr.town || addr.village || addr.municipality || null,
      display_name: r.display_name
    }
  } catch { return null }
}
