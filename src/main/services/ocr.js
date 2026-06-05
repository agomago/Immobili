import { createWorker } from 'tesseract.js'
import fs from 'fs'
import path from 'path'

// ── PARSER REGOLE ─────────────────────────────────────────────────────────────

const TIPO_DOC_REGOLE = [
  {
    tipo: 'bolletta_luce',
    label: 'Bolletta Energia Elettrica',
    categoria_id: 1,
    keywords: ['energia elettrica', 'enel', 'a2a', 'iren', 'acea energia', 'kw', 'kwh',
                'fornitura elettrica', 'contatore elettrico', 'pod ']
  },
  {
    tipo: 'bolletta_gas',
    label: 'Bolletta Gas',
    categoria_id: 2,
    keywords: ['gas naturale', 'metano', 'eni gas', 'italgas', 'snam', 'mc gas',
                'fornitura gas', 'pdr ', 'contatore gas', 'mc3']
  },
  {
    tipo: 'bolletta_acqua',
    label: 'Bolletta Acqua',
    categoria_id: 3,
    keywords: ['acquedotto', 'servizio idrico', 'acea ato', 'mm spa', 'hera acqua',
                'mc acqua', 'fornitura idrica', 'utenza idrica', 'consumi idrici']
  },
  {
    tipo: 'bolletta_internet',
    label: 'Fattura Internet/Telefonia',
    categoria_id: 4,
    keywords: ['tim ', 'telecom', 'vodafone', 'fastweb', 'tiscali', 'wind tre',
                'fibra ottica', 'adsl', 'abbonamento internet', 'servizi telco']
  },
  {
    tipo: 'quota_condominio',
    label: 'Quota Condominiale',
    categoria_id: 5,
    keywords: ['condominio', 'amministratore', 'quota condominiale', 'millesimi',
                'spese condominiali', 'assemblea condominiale', 'rendiconto']
  },
  {
    tipo: 'abbonamento',
    label: 'Abbonamento',
    categoria_id: 7,
    keywords: ['netflix', 'amazon prime', 'disney', 'spotify', 'dazn', 'sky',
                'abbonamento mensile', 'rinnovo abbonamento']
  },
  {
    tipo: 'assicurazione',
    label: 'Assicurazione',
    categoria_id: 8,
    keywords: ['assicurazione', 'polizza', 'premio assicurativo', 'unipol', 'generali',
                'allianz', 'axa', 'zurich', 'copertura']
  },
  {
    tipo: 'imu',
    label: 'IMU/Tasse',
    categoria_id: 9,
    keywords: ['imu', 'tasi', 'imposta municipale', 'tari', 'tributo', 'comune di']
  },
  {
    tipo: 'fattura_servizi',
    label: 'Fattura Servizi',
    categoria_id: 10,
    keywords: ['fattura', 'prestazione', 'lavori', 'intervento', 'manutenzione',
                'riparazione', 'idraulico', 'elettricista', 'fabbro']
  }
]

// ── ESTRATTORI ────────────────────────────────────────────────────────────────

function estraiImporto(testo) {
  const patterns = [
    /totale\s+(?:da\s+)?pagare[:\s€]*([0-9]+[.,][0-9]{2})/i,
    /importo\s+(?:da\s+)?pagare[:\s€]*([0-9]+[.,][0-9]{2})/i,
    /da\s+pagare[:\s€]*([0-9]+[.,][0-9]{2})/i,
    /totale\s+fattura[:\s€]*([0-9]+[.,][0-9]{2})/i,
    /€\s*([0-9]+[.,][0-9]{2})\s*(?:da pagare|totale)/i,
    /([0-9]+[.,][0-9]{2})\s*€/i
  ]
  for (const p of patterns) {
    const m = testo.match(p)
    if (m) {
      const val = m[1].replace(',', '.')
      const n = parseFloat(val)
      if (n > 0 && n < 100000) return n
    }
  }
  return null
}

function estraiData(testo) {
  const patterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g,
    /(\d{4})[\/\-\.](\d{2})[\/\-\.](\d{2})/g
  ]
  const mesi = { gennaio:1, febbraio:2, marzo:3, aprile:4, maggio:5, giugno:6,
                 luglio:7, agosto:8, settembre:9, ottobre:10, novembre:11, dicembre:12 }
  const mesiPattern = new RegExp(`(\\d{1,2})\\s+(${Object.keys(mesi).join('|')})\\s+(\\d{4})`, 'i')
  const m = testo.match(mesiPattern)
  if (m) {
    const giorno = m[1].padStart(2,'0')
    const mese = String(mesi[m[2].toLowerCase()]).padStart(2,'0')
    return `${m[3]}-${mese}-${giorno}`
  }
  for (const p of patterns) {
    const match = [...testo.matchAll(p)]
    if (match.length > 0) {
      const [_, a, b, c] = match[0]
      if (c && c.length === 4) return `${c}-${b.padStart(2,'0')}-${a.padStart(2,'0')}`
      if (a && a.length === 4) return `${a}-${b}-${c}`
    }
  }
  return null
}

function estraiFornitore(testo, tipo) {
  const fornitori = [
    'Enel', 'A2A', 'Iren', 'ACEA', 'ENI', 'Italgas', 'Snam',
    'TIM', 'Telecom', 'Vodafone', 'Fastweb', 'Wind Tre', 'Tiscali',
    'Unipol', 'Generali', 'Allianz', 'AXA', 'Zurich',
    'Netflix', 'Amazon', 'Disney', 'Spotify', 'DAZN'
  ]
  for (const f of fornitori) {
    if (testo.toLowerCase().includes(f.toLowerCase())) return f
  }
  const lines = testo.split('\n').slice(0, 5)
  for (const l of lines) {
    const clean = l.trim()
    if (clean.length > 3 && clean.length < 50 && /[A-Z]/.test(clean[0])) return clean
  }
  return null
}

function estraiIban(testo) {
  const m = testo.match(/IT\d{2}[A-Z0-9]{23}/i)
  return m ? m[0].toUpperCase() : null
}

function estraiPeriodoConsumi(testo) {
  const m = testo.match(/(?:periodo|dal|competenza)\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\s+(?:al|fino\s+al)\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i)
  return m ? `${m[1]} - ${m[2]}` : null
}

function estraiConsumo(testo) {
  const kwh = testo.match(/(\d+(?:[.,]\d+)?)\s*(?:kwh|kw\/h)/i)
  const mc = testo.match(/(\d+(?:[.,]\d+)?)\s*mc/i)
  if (kwh) return `${kwh[1]} kWh`
  if (mc) return `${mc[1]} mc`
  return null
}

function estraiRiferimento(testo) {
  const m = testo.match(/(?:n[°\.\s]*fattura|bolletta\s+n[°\.]?|rif(?:erimento)?[:\s]+)([A-Z0-9\/\-]{5,20})/i)
  return m ? m[1] : null
}

// ── RICONOSCIMENTO TIPO ───────────────────────────────────────────────────────

function identificaTipoDocumento(testo) {
  const testoLower = testo.toLowerCase()
  let bestMatch = null
  let bestScore = 0

  for (const regola of TIPO_DOC_REGOLE) {
    let score = 0
    for (const kw of regola.keywords) {
      if (testoLower.includes(kw.toLowerCase())) score++
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = regola
    }
  }

  return bestScore >= 1
    ? { ...bestMatch, confidence: bestScore >= 2 ? 'alta' : 'bassa' }
    : { tipo: 'sconosciuto', label: 'Tipo non riconosciuto', categoria_id: null, confidence: 'nessuna' }
}

// ── OCR PRINCIPALE ────────────────────────────────────────────────────────────

let worker = null

async function getWorker() {
  if (!worker) {
    worker = await createWorker('ita+eng')
  }
  return worker
}

export async function elaboraDocumento(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  let testo = ''

  if (ext === '.pdf') {
    try {
      const pdfParse = (await import('pdf-parse')).default
      const buffer = fs.readFileSync(filePath)
      const data = await pdfParse(buffer)
      testo = data.text
    } catch {
      // PDF non testuale, provo OCR su immagine convertita
      testo = ''
    }
  }

  // Se non ho testo sufficiente (PDF scansionato o immagine), uso Tesseract
  if (testo.trim().length < 50) {
    try {
      const w = await getWorker()
      const { data } = await w.recognize(filePath)
      testo = data.text
    } catch (e) {
      return { errore: `OCR fallito: ${e.message}`, testo: '' }
    }
  }

  const tipoDoc = identificaTipoDocumento(testo)

  return {
    testo,
    tipo_documento: tipoDoc.tipo,
    tipo_documento_label: tipoDoc.label,
    tipo_documento_confidence: tipoDoc.confidence,
    categoria_id: tipoDoc.categoria_id,
    importo: estraiImporto(testo),
    data: estraiData(testo),
    fornitore: estraiFornitore(testo, tipoDoc.tipo),
    periodo: estraiPeriodoConsumi(testo),
    iban: estraiIban(testo),
    consumo: estraiConsumo(testo),
    riferimento: estraiRiferimento(testo)
  }
}

export async function terminaWorker() {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}
