import { ipcMain, shell, dialog, app, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import { initDb, getDocsPath } from '../db/database.js'
import {
  comuni, immobili, unita, inquilini, contratti,
  pagamentiAffitto, categorieSpese, spese,
  documenti, alertDb, dashboard, report, utenze, reportGrafici
} from '../db/queries.js'
import { elaboraDocumento } from '../services/ocr.js'
import { esportaExcel, esportaPdf } from '../services/reports.js'
import { eseguiBackup, eseguiRestore } from '../services/backup.js'
import { importComuniFromCsv } from '../db/istat-seed.js'

let fotosPath

export function registraHandlers(docsDir, fotosDir) {
  fotosPath = fotosDir

  // ── COMUNI ISTAT ─────────────────────────────────────────────────────────────
  ipcMain.handle('comuni:search', (_, q) => comuni.search(q || ''))
  ipcMain.handle('comuni:getProvince', () => comuni.getProvince())
  ipcMain.handle('comuni:getRegioni', () => comuni.getRegioni())
  ipcMain.handle('comuni:count', () => comuni.count())
  ipcMain.handle('comuni:importCsv', async () => {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: 'Importa CSV ISTAT comuni',
      filters: [{ name: 'CSV', extensions: ['csv'] }],
      properties: ['openFile']
    })
    if (canceled || !filePaths?.length) return null
    const db = (await import('../db/database.js')).getDb()
    return importComuniFromCsv(db, filePaths[0])
  })

  // ── UTENZE (POD/PDR) ─────────────────────────────────────────────────────────
  ipcMain.handle('utenze:getByImmobile', (_, id) => utenze.getByImmobile(id))
  ipcMain.handle('utenze:getByTipo', (_, { immobile_id, tipo }) => utenze.getByTipo(immobile_id, tipo))
  ipcMain.handle('utenze:upsert', (_, data) => utenze.upsert(data))
  ipcMain.handle('utenze:delete', (_, id) => utenze.delete(id))

  // ── IMMOBILI ─────────────────────────────────────────────────────────────────
  ipcMain.handle('immobili:getAll', () => immobili.getAll())
  ipcMain.handle('immobili:getById', (_, id) => immobili.getById(id))
  ipcMain.handle('immobili:create', (_, data) => immobili.create(data))
  ipcMain.handle('immobili:update', (_, { id, data }) => immobili.update(id, data))
  ipcMain.handle('immobili:delete', (_, id) => immobili.delete(id))

  // ── UNITÀ ────────────────────────────────────────────────────────────────────
  ipcMain.handle('unita:getByImmobile', (_, id) => unita.getByImmobile(id))
  ipcMain.handle('unita:getAll', () => unita.getAll())
  ipcMain.handle('unita:create', (_, data) => unita.create(data))
  ipcMain.handle('unita:update', (_, { id, data }) => unita.update(id, data))
  ipcMain.handle('unita:delete', (_, id) => unita.delete(id))

  // ── INQUILINI ────────────────────────────────────────────────────────────────
  ipcMain.handle('inquilini:getAll', () => inquilini.getAll())
  ipcMain.handle('inquilini:getById', (_, id) => inquilini.getById(id))
  ipcMain.handle('inquilini:create', (_, data) => inquilini.create(data))
  ipcMain.handle('inquilini:update', (_, { id, data }) => inquilini.update(id, data))
  ipcMain.handle('inquilini:delete', (_, id) => inquilini.delete(id))

  ipcMain.handle('inquilini:uploadFoto', async (_, { filePath: srcPath, inquilino_id }) => {
    const ext = path.extname(srcPath).toLowerCase()
    const nomeFile = `foto_inq_${inquilino_id || Date.now()}${ext}`
    const destPath = path.join(fotosPath, nomeFile)
    fs.copyFileSync(srcPath, destPath)
    return destPath
  })

  ipcMain.handle('inquilini:sceglieFoto', async () => {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: 'Seleziona foto inquilino',
      filters: [{ name: 'Immagini', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
      properties: ['openFile']
    })
    return canceled ? null : filePaths[0]
  })

  // ── CONTRATTI ────────────────────────────────────────────────────────────────
  ipcMain.handle('contratti:getAll', () => contratti.getAll())
  ipcMain.handle('contratti:getByUnita', (_, id) => contratti.getByUnita(id))
  ipcMain.handle('contratti:create', (_, data) => {
    const result = contratti.create(data)
    const contratto_id = result.lastInsertRowid
    if (data.genera_rate && data.data_inizio) {
      generaRateContratto(contratto_id, data)
    }
    return result
  })
  ipcMain.handle('contratti:update', (_, { id, data }) => contratti.update(id, data))
  ipcMain.handle('contratti:delete', (_, id) => contratti.delete(id))

  // ── PAGAMENTI AFFITTO ────────────────────────────────────────────────────────
  ipcMain.handle('pagamentiAffitto:getByContratto', (_, id) => pagamentiAffitto.getByContratto(id))
  ipcMain.handle('pagamentiAffitto:getById', (_, id) => pagamentiAffitto.getById(id))
  ipcMain.handle('pagamentiAffitto:getAll', (_, filtri) => pagamentiAffitto.getAll(filtri || {}))
  ipcMain.handle('pagamentiAffitto:aggiorna', (_, { id, data }) => pagamentiAffitto.aggiorna(id, data))
  ipcMain.handle('pagamentiAffitto:annullaPagamento', (_, id) => pagamentiAffitto.annullaPagamento(id))
  ipcMain.handle('pagamentiAffitto:getByInquilino', (_, { inquilino_id, mesi }) => pagamentiAffitto.getByInquilino(inquilino_id, mesi || 3))
  ipcMain.handle('pagamentiAffitto:getScaduti', () => pagamentiAffitto.getScaduti())
  ipcMain.handle('pagamentiAffitto:pagaRata', (_, { id, data }) => pagamentiAffitto.pagaRata(id, data))
  ipcMain.handle('pagamentiAffitto:create', (_, data) => pagamentiAffitto.create(data))

  // ── SPESE ────────────────────────────────────────────────────────────────────
  ipcMain.handle('categorie:getAll', () => categorieSpese.getAll())
  ipcMain.handle('spese:getAll', (_, immobile_id) => spese.getAll(immobile_id || null))
  ipcMain.handle('spese:getById', (_, id) => spese.getById(id))
  ipcMain.handle('spese:getScadenze', (_, giorni) => spese.getScadenze(giorni))
  ipcMain.handle('spese:create', (_, data) => spese.create(data))
  ipcMain.handle('spese:update', (_, { id, data }) => spese.update(id, data))
  ipcMain.handle('spese:pagaSpesa', (_, { id, data }) => spese.pagaSpesa(id, data))
  ipcMain.handle('spese:delete', (_, id) => spese.delete(id))

  // ── DOCUMENTI ────────────────────────────────────────────────────────────────
  ipcMain.handle('documenti:getBySpesa', (_, spesa_id) => documenti.getBySpesa(spesa_id))
  ipcMain.handle('documenti:delete', (_, id) => documenti.delete(id))

  ipcMain.handle('documenti:upload', async (_, { filePath: srcPath, spesa_id, contratto_id }) => {
    const docsDir = getDocsPath()
    const ext = path.extname(srcPath)
    const nomeFile = `doc_${Date.now()}${ext}`
    const destPath = path.join(docsDir, nomeFile)
    fs.copyFileSync(srcPath, destPath)
    const tipoFile = ext.toLowerCase() === '.pdf' ? 'pdf' : 'immagine'
    const result = documenti.create({
      spesa_id: spesa_id || null, contratto_id: contratto_id || null,
      nome_file: path.basename(srcPath), percorso_file: destPath, tipo_file: tipoFile,
      ocr_testo: null, ocr_tipo_documento: null, ocr_importo: null, ocr_data: null,
      ocr_fornitore: null, ocr_periodo: null, ocr_iban: null, ocr_consumo: null,
      ocr_riferimento: null, ocr_completato: 0
    })
    return { id: result.lastInsertRowid, percorso_file: destPath, nome_file: path.basename(srcPath) }
  })

  ipcMain.handle('documenti:elaboraOcr', async (_, { doc_id, percorso_file }) => {
    try {
      const risultato = await elaboraDocumento(percorso_file)
      if (!risultato.errore) {
        documenti.aggiornaOcr(doc_id, {
          ocr_testo: risultato.testo, ocr_tipo_documento: risultato.tipo_documento,
          ocr_importo: risultato.importo, ocr_data: risultato.data,
          ocr_fornitore: risultato.fornitore, ocr_periodo: risultato.periodo,
          ocr_iban: risultato.iban, ocr_consumo: risultato.consumo,
          ocr_riferimento: risultato.riferimento
        })
      }
      return risultato
    } catch (e) { return { errore: e.message } }
  })

  ipcMain.handle('documenti:apri', (_, percorso) => shell.openPath(percorso))
  ipcMain.handle('documenti:scegli', async () => {
    const { filePaths, canceled } = await dialog.showOpenDialog({
      title: 'Seleziona documento',
      filters: [{ name: 'Documenti', extensions: ['pdf', 'jpg', 'jpeg', 'png', 'webp'] }],
      properties: ['openFile']
    })
    return canceled ? null : filePaths[0]
  })

  // ── ALERT ────────────────────────────────────────────────────────────────────
  ipcMain.handle('alert:getPendenti', () => alertDb.getPendenti())
  ipcMain.handle('alert:segnaLetto', (_, id) => alertDb.segnaLetto(id))

  // ── DASHBOARD ────────────────────────────────────────────────────────────────
  ipcMain.handle('dashboard:getSummary', () => dashboard.getSummary())

  // ── REPORT ───────────────────────────────────────────────────────────────────
  ipcMain.handle('report:excel', (_, params) => esportaExcel(params))
  ipcMain.handle('report:pdf', (_, params) => esportaPdf(params))
  ipcMain.handle('report:mensiliPerCategoria', (_, { immobile_id, anno }) =>
    reportGrafici.mensiliPerCategoria(immobile_id || null, anno))
  ipcMain.handle('report:totaliMensili', (_, { immobile_id, anno }) =>
    reportGrafici.totaliMensili(immobile_id || null, anno))

  // ── BACKUP & RESTORE ─────────────────────────────────────────────────────────
  ipcMain.handle('backup:esegui', () => eseguiBackup())
  ipcMain.handle('backup:restore', async () => {
    const result = await eseguiRestore()
    if (result?.richiedeRiavvio) {
      setTimeout(() => { app.relaunch(); app.exit(0) }, 1500)
    }
    return result
  })

  // ── UTILITY ──────────────────────────────────────────────────────────────────
  ipcMain.handle('app:getDocsPath', () => getDocsPath())
  ipcMain.handle('app:getVersion', () => app.getVersion())
  ipcMain.handle('app:apriFile', (_, p) => shell.openPath(p))
}

function generaRateContratto(contratto_id, data) {
  const inizio = new Date(data.data_inizio)
  const fine = data.data_fine ? new Date(data.data_fine) : new Date(inizio.getFullYear() + 1, inizio.getMonth(), inizio.getDate())
  const rate = []
  const cur = new Date(inizio)
  while (cur <= fine) {
    const mese = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`
    const giorno = data.giorno_pagamento || 1
    const scadenza = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(giorno).padStart(2, '0')}`
    rate.push({ contratto_id, mese_riferimento: mese, importo: data.canone_mensile, data_scadenza: scadenza, stato: 'da_pagare' })
    cur.setMonth(cur.getMonth() + 1)
  }
  pagamentiAffitto.generaMensili(contratto_id, rate)
}
