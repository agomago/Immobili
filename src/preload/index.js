import { contextBridge, ipcRenderer } from 'electron'

const api = {
  utenze: {
    getByImmobile: (id) => ipcRenderer.invoke('utenze:getByImmobile', id),
    getByTipo: (immobile_id, tipo) => ipcRenderer.invoke('utenze:getByTipo', { immobile_id, tipo }),
    upsert: (data) => ipcRenderer.invoke('utenze:upsert', data),
    delete: (id) => ipcRenderer.invoke('utenze:delete', id)
  },
  comuni: {
    search: (q) => ipcRenderer.invoke('comuni:search', q),
    getProvince: () => ipcRenderer.invoke('comuni:getProvince'),
    getRegioni: () => ipcRenderer.invoke('comuni:getRegioni'),
    count: () => ipcRenderer.invoke('comuni:count'),
    importCsv: () => ipcRenderer.invoke('comuni:importCsv')
  },
  immobili: {
    getAll: () => ipcRenderer.invoke('immobili:getAll'),
    getById: (id) => ipcRenderer.invoke('immobili:getById', id),
    create: (data) => ipcRenderer.invoke('immobili:create', data),
    update: (id, data) => ipcRenderer.invoke('immobili:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('immobili:delete', id)
  },
  unita: {
    getByImmobile: (id) => ipcRenderer.invoke('unita:getByImmobile', id),
    getAll: () => ipcRenderer.invoke('unita:getAll'),
    create: (data) => ipcRenderer.invoke('unita:create', data),
    update: (id, data) => ipcRenderer.invoke('unita:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('unita:delete', id)
  },
  inquilini: {
    getAll: () => ipcRenderer.invoke('inquilini:getAll'),
    getById: (id) => ipcRenderer.invoke('inquilini:getById', id),
    create: (data) => ipcRenderer.invoke('inquilini:create', data),
    update: (id, data) => ipcRenderer.invoke('inquilini:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('inquilini:delete', id),
    uploadFoto: (filePath, inquilino_id) => ipcRenderer.invoke('inquilini:uploadFoto', { filePath, inquilino_id }),
    sceglieFoto: () => ipcRenderer.invoke('inquilini:sceglieFoto')
  },
  contratti: {
    getAll: () => ipcRenderer.invoke('contratti:getAll'),
    getByUnita: (id) => ipcRenderer.invoke('contratti:getByUnita', id),
    create: (data) => ipcRenderer.invoke('contratti:create', data),
    update: (id, data) => ipcRenderer.invoke('contratti:update', { id, data }),
    delete: (id) => ipcRenderer.invoke('contratti:delete', id)
  },
  pagamentiAffitto: {
    getById: (id) => ipcRenderer.invoke('pagamentiAffitto:getById', id),
    getAll: (filtri) => ipcRenderer.invoke('pagamentiAffitto:getAll', filtri),
    aggiorna: (id, data) => ipcRenderer.invoke('pagamentiAffitto:aggiorna', { id, data }),
    annullaPagamento: (id) => ipcRenderer.invoke('pagamentiAffitto:annullaPagamento', id),
    getByContratto: (id) => ipcRenderer.invoke('pagamentiAffitto:getByContratto', id),
    getByInquilino: (inquilino_id, mesi) => ipcRenderer.invoke('pagamentiAffitto:getByInquilino', { inquilino_id, mesi }),
    getScaduti: () => ipcRenderer.invoke('pagamentiAffitto:getScaduti'),
    pagaRata: (id, data) => ipcRenderer.invoke('pagamentiAffitto:pagaRata', { id, data }),
    create: (data) => ipcRenderer.invoke('pagamentiAffitto:create', data)
  },
  categorie: {
    getAll: () => ipcRenderer.invoke('categorie:getAll')
  },
  spese: {
    getAll: (immobile_id) => ipcRenderer.invoke('spese:getAll', immobile_id),
    getById: (id) => ipcRenderer.invoke('spese:getById', id),
    getScadenze: (giorni) => ipcRenderer.invoke('spese:getScadenze', giorni),
    create: (data) => ipcRenderer.invoke('spese:create', data),
    update: (id, data) => ipcRenderer.invoke('spese:update', { id, data }),
    pagaSpesa: (id, data) => ipcRenderer.invoke('spese:pagaSpesa', { id, data }),
    delete: (id) => ipcRenderer.invoke('spese:delete', id)
  },
  documenti: {
    getBySpesa: (id) => ipcRenderer.invoke('documenti:getBySpesa', id),
    upload: (data) => ipcRenderer.invoke('documenti:upload', data),
    elaboraOcr: (doc_id, percorso_file) => ipcRenderer.invoke('documenti:elaboraOcr', { doc_id, percorso_file }),
    apri: (percorso) => ipcRenderer.invoke('documenti:apri', percorso),
    scegli: () => ipcRenderer.invoke('documenti:scegli'),
    delete: (id) => ipcRenderer.invoke('documenti:delete', id)
  },
  alert: {
    getPendenti: () => ipcRenderer.invoke('alert:getPendenti'),
    segnaLetto: (id) => ipcRenderer.invoke('alert:segnaLetto', id),
    onUpdate: (cb) => ipcRenderer.on('alert:update', (_, data) => cb(data))
  },
  dashboard: {
    getSummary: () => ipcRenderer.invoke('dashboard:getSummary')
  },
  report: {
    excel: (params) => ipcRenderer.invoke('report:excel', params),
    pdf: (params) => ipcRenderer.invoke('report:pdf', params),
    mensiliPerCategoria: (immobile_id, anno) => ipcRenderer.invoke('report:mensiliPerCategoria', { immobile_id, anno }),
    totaliMensili: (immobile_id, anno) => ipcRenderer.invoke('report:totaliMensili', { immobile_id, anno })
  },
  backup: {
    esegui: () => ipcRenderer.invoke('backup:esegui'),
    restore: () => ipcRenderer.invoke('backup:restore')
  },
  app: {
    getDocsPath: () => ipcRenderer.invoke('app:getDocsPath'),
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    apriFile: (p) => ipcRenderer.invoke('app:apriFile', p)
  }
}

contextBridge.exposeInMainWorld('api', api)
