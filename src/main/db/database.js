import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import { SCHEMA } from './schema.js'
import { seedComuniIstat } from './istat-seed.js'

let db
let _docsPath

export function getDb() {
  if (!db) throw new Error('Database non inizializzato')
  return db
}

export function getDocsPath() {
  return _docsPath
}

export function initDb() {
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'immobili.db')
  const docsPath = path.join(userDataPath, 'documenti')
  const fotosPath = path.join(userDataPath, 'foto')

  if (!fs.existsSync(docsPath)) fs.mkdirSync(docsPath, { recursive: true })
  if (!fs.existsSync(fotosPath)) fs.mkdirSync(fotosPath, { recursive: true })

  _docsPath = docsPath

  db = new Database(dbPath)
  db.exec(SCHEMA)

  // Aggiungi colonne mancanti per migration (DB esistenti)
  try { db.exec(`ALTER TABLE immobili ADD COLUMN sigla_prov TEXT`) } catch {}
  try { db.exec(`ALTER TABLE immobili ADD COLUMN lat REAL`) } catch {}
  try { db.exec(`ALTER TABLE immobili ADD COLUMN lng REAL`) } catch {}
  try { db.exec(`ALTER TABLE spese ADD COLUMN pod TEXT`) } catch {}
  try { db.exec(`ALTER TABLE spese ADD COLUMN pdr TEXT`) } catch {}
  try { db.exec(`ALTER TABLE spese ADD COLUMN tipo_versamento TEXT DEFAULT 'saldo'`) } catch {}
  try { db.exec(`ALTER TABLE inquilini ADD COLUMN foto_path TEXT`) } catch {}
  try { db.exec(`ALTER TABLE inquilini ADD COLUMN metodo_pagamento_default TEXT DEFAULT 'contanti'`) } catch {}

  // Deduplicazione alert: elimina duplicati mantenendo il record più vecchio
  db.exec(`
    DELETE FROM alert WHERE id NOT IN (
      SELECT MIN(id) FROM alert GROUP BY tipo, entita_tipo, entita_id
    )
  `)

  // UNIQUE INDEX per prevenire futuri duplicati
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_alert_no_duplicati
    ON alert(tipo, entita_tipo, entita_id)
  `)

  // Seed comuni ISTAT al primo avvio
  seedComuniIstat(db)

  return { db, docsPath, fotosPath, dbPath }
}
