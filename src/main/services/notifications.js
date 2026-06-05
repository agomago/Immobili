import notifier from 'node-notifier'
import schedule from 'node-schedule'
import path from 'path'
import { alertDb, spese, pagamentiAffitto, contratti } from '../db/queries.js'
import { app, BrowserWindow } from 'electron'

const APP_NAME = 'Immobili Manager'

function inviaNotifica(titolo, messaggio, urgente = false) {
  notifier.notify({
    title: APP_NAME,
    message: messaggio,
    subtitle: titolo,
    icon: path.join(app.getAppPath(), 'resources', 'icon.png'),
    sound: urgente,
    wait: false,
    appID: 'com.immobili.manager'
  })
}

function aggiornaBadge() {
  const wins = BrowserWindow.getAllWindows()
  if (wins.length > 0) {
    const pendenti = alertDb.getPendenti()
    wins[0].webContents.send('alert:update', pendenti)
  }
}

function controllaScadenze() {
  const oggi = new Date()

  // ── Spese in scadenza nei prossimi 7 giorni ──────────────────────────────────
  for (const s of spese.getScadenze(7)) {
    // INSERT OR IGNORE: il UNIQUE INDEX su (tipo, entita_tipo, entita_id)
    // impedisce automaticamente i duplicati — nessun check manuale necessario
    alertDb.creaAlert({
      tipo: 'scadenza_spesa',
      entita_tipo: 'spesa',
      entita_id: s.id,
      titolo: `Scadenza: ${s.descrizione}`,
      messaggio: `${s.categoria_nome || 'Spesa'} di €${s.importo.toFixed(2)} scade il ${s.data_scadenza}`,
      data_scadenza: s.data_scadenza,
      giorni_anticipo: 7
    })
  }

  // ── Affitti scaduti e non pagati ─────────────────────────────────────────────
  for (const a of pagamentiAffitto.getScaduti()) {
    alertDb.creaAlert({
      tipo: 'affitto_scaduto',
      entita_tipo: 'affitto',
      entita_id: a.id,
      titolo: `Affitto non pagato: ${a.unita_nome}`,
      messaggio: `${a.inquilino_nome} - rata di €${a.importo.toFixed(2)} scaduta il ${a.data_scadenza}`,
      data_scadenza: a.data_scadenza,
      giorni_anticipo: 0
    })
  }

  // ── Contratti in scadenza nei prossimi 60 giorni ──────────────────────────────
  for (const c of contratti.getAll()) {
    if (c.stato !== 'attivo' || !c.data_fine) continue
    const diff = Math.round((new Date(c.data_fine) - oggi) / (1000 * 60 * 60 * 24))
    if (diff <= 60 && diff >= 0) {
      alertDb.creaAlert({
        tipo: 'contratto_scadenza',
        entita_tipo: 'contratto',
        entita_id: c.id,
        titolo: `Contratto in scadenza`,
        messaggio: `Contratto ${c.unita_nome} (${c.inquilino_nome}) scade il ${c.data_fine}`,
        data_scadenza: c.data_fine,
        giorni_anticipo: 60
      })
    }
  }

  // ── Invia notifiche Windows solo per gli alert non ancora inviati ─────────────
  for (const a of alertDb.getPerNotifica()) {
    inviaNotifica(a.titolo, a.messaggio, a.tipo === 'affitto_scaduto')
    alertDb.segnaInviato(a.id)
  }

  aggiornaBadge()
}

let job = null

export function avviaScheduler() {
  job = schedule.scheduleJob('0 8 * * *', controllaScadenze)
  // Primo controllo 5 secondi dopo l'avvio
  setTimeout(controllaScadenze, 5000)
}

export function fermaScheduler() {
  if (job) job.cancel()
}
