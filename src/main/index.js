import { app, BrowserWindow, Tray, Menu, nativeImage, shell } from 'electron'
import path from 'path'
import { initDb } from './db/database.js'
import { registraHandlers } from './ipc/handlers.js'
import { avviaScheduler, fermaScheduler } from './services/notifications.js'

let mainWindow
let tray

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: 'Immobili Manager',
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => mainWindow.show())

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })
}

function createTray() {
  const iconPath = path.join(__dirname, '../../resources/tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon)

  const menu = Menu.buildFromTemplate([
    { label: 'Apri Immobili Manager', click: () => { mainWindow.show(); mainWindow.focus() } },
    { type: 'separator' },
    { label: 'Esci', click: () => { app.isQuitting = true; app.quit() } }
  ])

  tray.setToolTip('Immobili Manager')
  tray.setContextMenu(menu)
  tray.on('double-click', () => { mainWindow.show(); mainWindow.focus() })
}

app.whenReady().then(() => {
  const { docsPath, fotosPath } = initDb()
  registraHandlers(docsPath, fotosPath)
  createWindow()
  createTray()
  avviaScheduler()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  app.isQuitting = true
  fermaScheduler()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Non chiudiamo su Windows — resta nel tray
  }
})
