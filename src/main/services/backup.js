import fs from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { app, dialog } from 'electron'
import { getDb } from '../db/database.js'

// ── UTILITÀ ────────────────────────────────────────────────────────────────────

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDirRecursive(s, d)
    else fs.copyFileSync(s, d)
  }
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0
  let n = 0
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? countFiles(path.join(dir, e.name)) : 1
  }
  return n
}

function runPowerShell(cmd) {
  return new Promise((resolve, reject) => {
    execFile('powershell.exe', ['-NoProfile', '-Command', cmd], { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message))
      else resolve(stdout)
    })
  })
}

// ── BACKUP ────────────────────────────────────────────────────────────────────

export async function eseguiBackup() {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Salva backup',
    defaultPath: `ImmobiliBackup_${new Date().toISOString().split('T')[0]}.backup`,
    filters: [{ name: 'Backup Immobili', extensions: ['backup'] }]
  })
  if (!filePath) return null

  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'immobili.db')
  const docsPath = path.join(userDataPath, 'documenti')
  const fotosPath = path.join(userDataPath, 'foto')

  const tempDir = path.join(userDataPath, '_backup_tmp')
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true })
  fs.mkdirSync(tempDir, { recursive: true })

  try { getDb().exec('PRAGMA wal_checkpoint(TRUNCATE)') } catch {}
  fs.copyFileSync(dbPath, path.join(tempDir, 'immobili.db'))
  copyDirRecursive(docsPath, path.join(tempDir, 'documenti'))
  copyDirRecursive(fotosPath, path.join(tempDir, 'foto'))

  const manifest = {
    version: app.getVersion(),
    creato_il: new Date().toISOString(),
    num_documenti: countFiles(docsPath),
    num_foto: countFiles(fotosPath)
  }
  fs.writeFileSync(path.join(tempDir, 'manifest.json'), JSON.stringify(manifest, null, 2))

  // Usa .zip temporaneo poi rinomina in .backup
  const zipPath = filePath.replace(/\.backup$/, '') + '_tmp.zip'
  await runPowerShell(`Compress-Archive -Path "${tempDir}\\*" -DestinationPath "${zipPath}" -Force`)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  fs.renameSync(zipPath, filePath)
  fs.rmSync(tempDir, { recursive: true })

  return { filePath, manifest }
}

// ── RESTORE ───────────────────────────────────────────────────────────────────

export async function eseguiRestore() {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    title: 'Seleziona file di backup',
    filters: [{ name: 'Backup Immobili', extensions: ['backup'] }],
    properties: ['openFile']
  })
  if (canceled || !filePaths?.length) return null

  const backupFile = filePaths[0]
  const userDataPath = app.getPath('userData')
  const tempDir = path.join(userDataPath, '_restore_tmp')

  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true })
  fs.mkdirSync(tempDir, { recursive: true })

  await runPowerShell(`Expand-Archive -Path "${backupFile}" -DestinationPath "${tempDir}" -Force`)

  const manifestPath = path.join(tempDir, 'manifest.json')
  if (!fs.existsSync(manifestPath)) {
    fs.rmSync(tempDir, { recursive: true })
    throw new Error('File di backup non valido — manifest mancante')
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))

  // Backup sicuro del DB corrente
  const dbPath = path.join(userDataPath, 'immobili.db')
  if (fs.existsSync(dbPath)) fs.copyFileSync(dbPath, dbPath + '.pre-restore')

  const newDb = path.join(tempDir, 'immobili.db')
  if (fs.existsSync(newDb)) fs.copyFileSync(newDb, dbPath)

  const docsPath = path.join(userDataPath, 'documenti')
  const newDocs = path.join(tempDir, 'documenti')
  if (fs.existsSync(newDocs)) {
    if (fs.existsSync(docsPath)) fs.rmSync(docsPath, { recursive: true })
    copyDirRecursive(newDocs, docsPath)
  }

  const fotosPath = path.join(userDataPath, 'foto')
  const newFotos = path.join(tempDir, 'foto')
  if (fs.existsSync(newFotos)) {
    if (fs.existsSync(fotosPath)) fs.rmSync(fotosPath, { recursive: true })
    copyDirRecursive(newFotos, fotosPath)
  }

  fs.rmSync(tempDir, { recursive: true })
  return { manifest, richiedeRiavvio: true }
}
