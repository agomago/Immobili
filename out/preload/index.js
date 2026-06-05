"use strict";
const electron = require("electron");
const api = {
  utenze: {
    getByImmobile: (id) => electron.ipcRenderer.invoke("utenze:getByImmobile", id),
    getByTipo: (immobile_id, tipo) => electron.ipcRenderer.invoke("utenze:getByTipo", { immobile_id, tipo }),
    upsert: (data) => electron.ipcRenderer.invoke("utenze:upsert", data),
    delete: (id) => electron.ipcRenderer.invoke("utenze:delete", id)
  },
  comuni: {
    search: (q) => electron.ipcRenderer.invoke("comuni:search", q),
    getProvince: () => electron.ipcRenderer.invoke("comuni:getProvince"),
    getRegioni: () => electron.ipcRenderer.invoke("comuni:getRegioni"),
    count: () => electron.ipcRenderer.invoke("comuni:count"),
    importCsv: () => electron.ipcRenderer.invoke("comuni:importCsv")
  },
  immobili: {
    getAll: () => electron.ipcRenderer.invoke("immobili:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("immobili:getById", id),
    create: (data) => electron.ipcRenderer.invoke("immobili:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("immobili:update", { id, data }),
    delete: (id) => electron.ipcRenderer.invoke("immobili:delete", id)
  },
  unita: {
    getByImmobile: (id) => electron.ipcRenderer.invoke("unita:getByImmobile", id),
    getAll: () => electron.ipcRenderer.invoke("unita:getAll"),
    create: (data) => electron.ipcRenderer.invoke("unita:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("unita:update", { id, data }),
    delete: (id) => electron.ipcRenderer.invoke("unita:delete", id)
  },
  inquilini: {
    getAll: () => electron.ipcRenderer.invoke("inquilini:getAll"),
    getById: (id) => electron.ipcRenderer.invoke("inquilini:getById", id),
    create: (data) => electron.ipcRenderer.invoke("inquilini:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("inquilini:update", { id, data }),
    delete: (id) => electron.ipcRenderer.invoke("inquilini:delete", id),
    uploadFoto: (filePath, inquilino_id) => electron.ipcRenderer.invoke("inquilini:uploadFoto", { filePath, inquilino_id }),
    sceglieFoto: () => electron.ipcRenderer.invoke("inquilini:sceglieFoto")
  },
  contratti: {
    getAll: () => electron.ipcRenderer.invoke("contratti:getAll"),
    getByUnita: (id) => electron.ipcRenderer.invoke("contratti:getByUnita", id),
    create: (data) => electron.ipcRenderer.invoke("contratti:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("contratti:update", { id, data }),
    delete: (id) => electron.ipcRenderer.invoke("contratti:delete", id)
  },
  pagamentiAffitto: {
    getById: (id) => electron.ipcRenderer.invoke("pagamentiAffitto:getById", id),
    getAll: (filtri) => electron.ipcRenderer.invoke("pagamentiAffitto:getAll", filtri),
    aggiorna: (id, data) => electron.ipcRenderer.invoke("pagamentiAffitto:aggiorna", { id, data }),
    annullaPagamento: (id) => electron.ipcRenderer.invoke("pagamentiAffitto:annullaPagamento", id),
    getByContratto: (id) => electron.ipcRenderer.invoke("pagamentiAffitto:getByContratto", id),
    getByInquilino: (inquilino_id, mesi) => electron.ipcRenderer.invoke("pagamentiAffitto:getByInquilino", { inquilino_id, mesi }),
    getScaduti: () => electron.ipcRenderer.invoke("pagamentiAffitto:getScaduti"),
    pagaRata: (id, data) => electron.ipcRenderer.invoke("pagamentiAffitto:pagaRata", { id, data }),
    create: (data) => electron.ipcRenderer.invoke("pagamentiAffitto:create", data)
  },
  categorie: {
    getAll: () => electron.ipcRenderer.invoke("categorie:getAll")
  },
  spese: {
    getAll: (immobile_id) => electron.ipcRenderer.invoke("spese:getAll", immobile_id),
    getById: (id) => electron.ipcRenderer.invoke("spese:getById", id),
    getScadenze: (giorni) => electron.ipcRenderer.invoke("spese:getScadenze", giorni),
    create: (data) => electron.ipcRenderer.invoke("spese:create", data),
    update: (id, data) => electron.ipcRenderer.invoke("spese:update", { id, data }),
    pagaSpesa: (id, data) => electron.ipcRenderer.invoke("spese:pagaSpesa", { id, data }),
    delete: (id) => electron.ipcRenderer.invoke("spese:delete", id)
  },
  documenti: {
    getBySpesa: (id) => electron.ipcRenderer.invoke("documenti:getBySpesa", id),
    upload: (data) => electron.ipcRenderer.invoke("documenti:upload", data),
    elaboraOcr: (doc_id, percorso_file) => electron.ipcRenderer.invoke("documenti:elaboraOcr", { doc_id, percorso_file }),
    apri: (percorso) => electron.ipcRenderer.invoke("documenti:apri", percorso),
    scegli: () => electron.ipcRenderer.invoke("documenti:scegli"),
    delete: (id) => electron.ipcRenderer.invoke("documenti:delete", id)
  },
  alert: {
    getPendenti: () => electron.ipcRenderer.invoke("alert:getPendenti"),
    segnaLetto: (id) => electron.ipcRenderer.invoke("alert:segnaLetto", id),
    onUpdate: (cb) => electron.ipcRenderer.on("alert:update", (_, data) => cb(data))
  },
  dashboard: {
    getSummary: () => electron.ipcRenderer.invoke("dashboard:getSummary")
  },
  report: {
    excel: (params) => electron.ipcRenderer.invoke("report:excel", params),
    pdf: (params) => electron.ipcRenderer.invoke("report:pdf", params),
    mensiliPerCategoria: (immobile_id, anno) => electron.ipcRenderer.invoke("report:mensiliPerCategoria", { immobile_id, anno }),
    totaliMensili: (immobile_id, anno) => electron.ipcRenderer.invoke("report:totaliMensili", { immobile_id, anno })
  },
  backup: {
    esegui: () => electron.ipcRenderer.invoke("backup:esegui"),
    restore: () => electron.ipcRenderer.invoke("backup:restore")
  },
  app: {
    getDocsPath: () => electron.ipcRenderer.invoke("app:getDocsPath"),
    getVersion: () => electron.ipcRenderer.invoke("app:getVersion"),
    apriFile: (p) => electron.ipcRenderer.invoke("app:apriFile", p)
  }
};
electron.contextBridge.exposeInMainWorld("api", api);
