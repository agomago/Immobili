import { getDb } from './database.js'

// ── COMUNI ISTAT ──────────────────────────────────────────────────────────────

export const comuni = {
  search: (q) => getDb().prepare(`
    SELECT * FROM comuni_istat
    WHERE nome LIKE ? OR sigla_prov LIKE ? OR nome_prov LIKE ?
    ORDER BY nome LIMIT 20
  `).all(`${q}%`, `${q}%`, `%${q}%`),

  getByProvincia: (sigla) => getDb().prepare(`
    SELECT * FROM comuni_istat WHERE sigla_prov = ? ORDER BY nome
  `).all(sigla),

  getProvince: () => getDb().prepare(`
    SELECT DISTINCT sigla_prov, nome_prov, nome_reg
    FROM comuni_istat ORDER BY nome_reg, nome_prov
  `).all(),

  getRegioni: () => getDb().prepare(`
    SELECT DISTINCT nome_reg FROM comuni_istat ORDER BY nome_reg
  `).all(),

  count: () => getDb().prepare(`SELECT COUNT(*) as n FROM comuni_istat`).get().n
}

// ── IMMOBILI ──────────────────────────────────────────────────────────────────

export const immobili = {
  getAll: () => getDb().prepare(`
    SELECT i.*, COUNT(DISTINCT u.id) as num_unita,
           COUNT(DISTINCT c.id) as contratti_attivi
    FROM immobili i
    LEFT JOIN unita u ON u.immobile_id = i.id
    LEFT JOIN contratti c ON c.unita_id = u.id AND c.stato = 'attivo'
    GROUP BY i.id ORDER BY i.nome
  `).all(),

  getById: (id) => getDb().prepare(`SELECT * FROM immobili WHERE id = ?`).get(id),

  create: (data) => {
    const stmt = getDb().prepare(`
      INSERT INTO immobili (nome, indirizzo, citta, cap, sigla_prov, tipo, superficie_mq,
        valore_acquisto, data_acquisto, lat, lng, note)
      VALUES (@nome, @indirizzo, @citta, @cap, @sigla_prov, @tipo, @superficie_mq,
        @valore_acquisto, @data_acquisto, @lat, @lng, @note)
    `)
    return stmt.run(data)
  },

  update: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE immobili SET nome=@nome, indirizzo=@indirizzo, citta=@citta,
        cap=@cap, sigla_prov=@sigla_prov, tipo=@tipo, superficie_mq=@superficie_mq,
        valore_acquisto=@valore_acquisto, data_acquisto=@data_acquisto,
        lat=@lat, lng=@lng, note=@note, aggiornato_il=datetime('now')
      WHERE id=@id
    `)
    return stmt.run({ ...data, id })
  },

  delete: (id) => getDb().prepare(`DELETE FROM immobili WHERE id = ?`).run(id)
}

// ── UTENZE IMMOBILI (POD/PDR) ─────────────────────────────────────────────────

export const utenze = {
  getByImmobile: (immobile_id) => getDb().prepare(`
    SELECT u.*, un.nome as unita_nome
    FROM immobili_utenze u
    LEFT JOIN unita un ON un.id = u.unita_id
    WHERE u.immobile_id = ?
    ORDER BY u.tipo, un.nome
  `).all(immobile_id),

  getByTipo: (immobile_id, tipo) => getDb().prepare(`
    SELECT * FROM immobili_utenze WHERE immobile_id = ? AND tipo = ?
  `).get(immobile_id, tipo),

  upsert: (data) => {
    const stmt = getDb().prepare(`
      INSERT INTO immobili_utenze
        (immobile_id, unita_id, tipo, pod, pdr, matricola_contatore, fornitore_attuale, note)
      VALUES (@immobile_id, @unita_id, @tipo, @pod, @pdr, @matricola_contatore, @fornitore_attuale, @note)
      ON CONFLICT(immobile_id, unita_id, tipo) DO UPDATE SET
        pod=excluded.pod, pdr=excluded.pdr,
        matricola_contatore=excluded.matricola_contatore,
        fornitore_attuale=excluded.fornitore_attuale,
        note=excluded.note
    `)
    return stmt.run(data)
  },

  delete: (id) => getDb().prepare(`DELETE FROM immobili_utenze WHERE id = ?`).run(id)
}

// ── UNITÀ ─────────────────────────────────────────────────────────────────────

export const unita = {
  getByImmobile: (immobile_id) => getDb().prepare(`
    SELECT u.*, c.stato as contratto_stato, c.canone_mensile,
           inq.nome || ' ' || inq.cognome as inquilino_nome,
           c.inquilino_id
    FROM unita u
    LEFT JOIN contratti c ON c.unita_id = u.id AND c.stato = 'attivo'
    LEFT JOIN inquilini inq ON inq.id = c.inquilino_id
    WHERE u.immobile_id = ?
    ORDER BY u.nome
  `).all(immobile_id),

  getAll: () => getDb().prepare(`SELECT u.*, i.nome as immobile_nome FROM unita u JOIN immobili i ON i.id = u.immobile_id ORDER BY i.nome, u.nome`).all(),

  create: (data) => {
    const stmt = getDb().prepare(`
      INSERT INTO unita (immobile_id, nome, tipo, piano, superficie_mq, num_locali, descrizione)
      VALUES (@immobile_id, @nome, @tipo, @piano, @superficie_mq, @num_locali, @descrizione)
    `)
    return stmt.run(data)
  },

  update: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE unita SET nome=@nome, tipo=@tipo, piano=@piano,
        superficie_mq=@superficie_mq, num_locali=@num_locali, descrizione=@descrizione
      WHERE id=@id
    `)
    return stmt.run({ ...data, id })
  },

  delete: (id) => getDb().prepare(`DELETE FROM unita WHERE id = ?`).run(id)
}

// ── INQUILINI ─────────────────────────────────────────────────────────────────

export const inquilini = {
  getAll: () => getDb().prepare(`SELECT * FROM inquilini ORDER BY cognome, nome`).all(),

  getById: (id) => getDb().prepare(`SELECT * FROM inquilini WHERE id = ?`).get(id),

  create: (data) => {
    const stmt = getDb().prepare(`
      INSERT INTO inquilini (nome, cognome, codice_fiscale, telefono, email,
        tipo_documento, numero_documento, foto_path, metodo_pagamento_default, note)
      VALUES (@nome, @cognome, @codice_fiscale, @telefono, @email,
        @tipo_documento, @numero_documento, @foto_path, @metodo_pagamento_default, @note)
    `)
    return stmt.run(data)
  },

  update: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE inquilini SET nome=@nome, cognome=@cognome,
        codice_fiscale=@codice_fiscale, telefono=@telefono, email=@email,
        tipo_documento=@tipo_documento, numero_documento=@numero_documento,
        foto_path=@foto_path, metodo_pagamento_default=@metodo_pagamento_default, note=@note
      WHERE id=@id
    `)
    return stmt.run({ ...data, id })
  },

  delete: (id) => getDb().prepare(`DELETE FROM inquilini WHERE id = ?`).run(id)
}

// ── CONTRATTI ─────────────────────────────────────────────────────────────────

export const contratti = {
  getAll: () => getDb().prepare(`
    SELECT c.*, u.nome as unita_nome, i.nome as immobile_nome,
           inq.nome || ' ' || inq.cognome as inquilino_nome,
           inq.telefono as inquilino_telefono
    FROM contratti c
    JOIN unita u ON u.id = c.unita_id
    JOIN immobili i ON i.id = u.immobile_id
    JOIN inquilini inq ON inq.id = c.inquilino_id
    ORDER BY c.stato DESC, c.data_fine ASC
  `).all(),

  getByUnita: (unita_id) => getDb().prepare(`
    SELECT c.*, inq.nome || ' ' || inq.cognome as inquilino_nome
    FROM contratti c JOIN inquilini inq ON inq.id = c.inquilino_id
    WHERE c.unita_id = ?
    ORDER BY c.data_inizio DESC
  `).all(unita_id),

  create: (data) => {
    const stmt = getDb().prepare(`
      INSERT INTO contratti (unita_id, inquilino_id, data_inizio, data_fine,
        canone_mensile, deposito, giorno_pagamento, tipo_contratto, stato, note)
      VALUES (@unita_id, @inquilino_id, @data_inizio, @data_fine,
        @canone_mensile, @deposito, @giorno_pagamento, @tipo_contratto, @stato, @note)
    `)
    return stmt.run(data)
  },

  update: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE contratti SET data_fine=@data_fine, canone_mensile=@canone_mensile,
        deposito=@deposito, giorno_pagamento=@giorno_pagamento,
        tipo_contratto=@tipo_contratto, stato=@stato, note=@note
      WHERE id=@id
    `)
    return stmt.run({ ...data, id })
  },

  delete: (id) => getDb().prepare(`DELETE FROM contratti WHERE id = ?`).run(id)
}

// ── PAGAMENTI AFFITTO ─────────────────────────────────────────────────────────

export const pagamentiAffitto = {
  getByContratto: (contratto_id) => getDb().prepare(`
    SELECT * FROM pagamenti_affitto WHERE contratto_id = ?
    ORDER BY data_scadenza DESC
  `).all(contratto_id),

  getById: (id) => getDb().prepare(`
    SELECT pa.*,
           u.nome as unita_nome, i.nome as immobile_nome,
           inq.nome || ' ' || inq.cognome as inquilino_nome,
           inq.id as inquilino_id, inq.metodo_pagamento_default,
           c.canone_mensile, c.tipo_contratto
    FROM pagamenti_affitto pa
    JOIN contratti c ON c.id = pa.contratto_id
    JOIN unita u ON u.id = c.unita_id
    JOIN immobili i ON i.id = u.immobile_id
    JOIN inquilini inq ON inq.id = c.inquilino_id
    WHERE pa.id = ?
  `).get(id),

  getAll: (filtri = {}) => {
    const conds = []
    const params = []
    if (filtri.immobile_id) { conds.push('i.id = ?'); params.push(filtri.immobile_id) }
    if (filtri.anno)        { conds.push("strftime('%Y', pa.data_scadenza) = ?"); params.push(String(filtri.anno)) }
    if (filtri.mese)        { conds.push("strftime('%m', pa.data_scadenza) = ?"); params.push(filtri.mese.padStart(2,'0')) }
    if (filtri.stato)       { conds.push('pa.stato = ?'); params.push(filtri.stato) }
    if (filtri.contratto_id){ conds.push('pa.contratto_id = ?'); params.push(filtri.contratto_id) }
    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : ''
    return getDb().prepare(`
      SELECT pa.*,
             c.canone_mensile, c.tipo_contratto, c.id as contratto_id,
             u.nome as unita_nome, i.nome as immobile_nome, i.id as immobile_id,
             inq.nome || ' ' || inq.cognome as inquilino_nome,
             inq.id as inquilino_id, inq.foto_path, inq.metodo_pagamento_default
      FROM pagamenti_affitto pa
      JOIN contratti c ON c.id = pa.contratto_id
      JOIN unita u ON u.id = c.unita_id
      JOIN immobili i ON i.id = u.immobile_id
      JOIN inquilini inq ON inq.id = c.inquilino_id
      ${where}
      ORDER BY pa.data_scadenza DESC, i.nome, u.nome
    `).all(...params)
  },

  aggiorna: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE pagamenti_affitto
      SET importo=@importo, data_pagamento=@data_pagamento,
          metodo_pagamento=@metodo_pagamento, stato=@stato, note=@note
      WHERE id=@id
    `)
    return stmt.run({ ...data, id })
  },

  annullaPagamento: (id) => getDb().prepare(`
    UPDATE pagamenti_affitto
    SET stato='da_pagare', data_pagamento=NULL, metodo_pagamento=NULL
    WHERE id=?
  `).run(id),

  getByInquilino: (inquilino_id, mesi = 3) => getDb().prepare(`
    SELECT pa.*,
           u.nome as unita_nome, i.nome as immobile_nome,
           c.canone_mensile, c.tipo_contratto
    FROM pagamenti_affitto pa
    JOIN contratti c ON c.id = pa.contratto_id
    JOIN unita u ON u.id = c.unita_id
    JOIN immobili i ON i.id = u.immobile_id
    WHERE c.inquilino_id = ?
      AND pa.data_scadenza >= date('now', '-' || ? || ' months')
    ORDER BY pa.data_scadenza DESC
  `).all(inquilino_id, mesi),

  getScaduti: () => getDb().prepare(`
    SELECT pa.*, c.canone_mensile,
           u.nome as unita_nome, i.nome as immobile_nome,
           inq.nome || ' ' || inq.cognome as inquilino_nome
    FROM pagamenti_affitto pa
    JOIN contratti c ON c.id = pa.contratto_id
    JOIN unita u ON u.id = c.unita_id
    JOIN immobili i ON i.id = u.immobile_id
    JOIN inquilini inq ON inq.id = c.inquilino_id
    WHERE pa.stato != 'pagato' AND pa.data_scadenza <= date('now')
    ORDER BY pa.data_scadenza
  `).all(),

  create: (data) => {
    const stmt = getDb().prepare(`
      INSERT INTO pagamenti_affitto (contratto_id, mese_riferimento, importo,
        data_scadenza, stato)
      VALUES (@contratto_id, @mese_riferimento, @importo, @data_scadenza, @stato)
    `)
    return stmt.run(data)
  },

  pagaRata: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE pagamenti_affitto SET stato='pagato', data_pagamento=@data_pagamento,
        metodo_pagamento=@metodo_pagamento, note=@note
      WHERE id=@id
    `)
    return stmt.run({ ...data, id })
  },

  generaMensili: (contratto_id, mesi) => {
    const insert = getDb().prepare(`
      INSERT OR IGNORE INTO pagamenti_affitto
        (contratto_id, mese_riferimento, importo, data_scadenza, stato)
      VALUES (@contratto_id, @mese_riferimento, @importo, @data_scadenza, @stato)
    `)
    const insertMany = getDb().transaction((rows) => rows.forEach(r => insert.run(r)))
    insertMany(mesi)
  }
}

// ── CATEGORIE SPESE ───────────────────────────────────────────────────────────

export const categorieSpese = {
  getAll: () => getDb().prepare(`SELECT * FROM categorie_spese ORDER BY tipo, nome`).all()
}

// ── SPESE ─────────────────────────────────────────────────────────────────────

export const spese = {
  getAll: (immobile_id) => {
    const sql = immobile_id
      ? `SELECT s.*, c.nome as categoria_nome, c.icona, c.colore,
           COUNT(d.id) as num_documenti
         FROM spese s
         LEFT JOIN categorie_spese c ON c.id = s.categoria_id
         LEFT JOIN documenti d ON d.spesa_id = s.id
         WHERE s.immobile_id = ?
         GROUP BY s.id ORDER BY s.data_scadenza DESC`
      : `SELECT s.*, c.nome as categoria_nome, c.icona, c.colore,
           i.nome as immobile_nome, COUNT(d.id) as num_documenti
         FROM spese s
         LEFT JOIN categorie_spese c ON c.id = s.categoria_id
         LEFT JOIN immobili i ON i.id = s.immobile_id
         LEFT JOIN documenti d ON d.spesa_id = s.id
         GROUP BY s.id ORDER BY s.data_scadenza DESC`
    return immobile_id
      ? getDb().prepare(sql).all(immobile_id)
      : getDb().prepare(sql).all()
  },

  getScadenze: (giorni = 30) => getDb().prepare(`
    SELECT s.*, c.nome as categoria_nome, c.icona, c.colore, i.nome as immobile_nome
    FROM spese s
    LEFT JOIN categorie_spese c ON c.id = s.categoria_id
    JOIN immobili i ON i.id = s.immobile_id
    WHERE s.stato = 'da_pagare'
      AND s.data_scadenza BETWEEN date('now') AND date('now', '+' || ? || ' days')
    ORDER BY s.data_scadenza
  `).all(giorni),

  getById: (id) => getDb().prepare(`
    SELECT s.*, c.nome as categoria_nome FROM spese s
    LEFT JOIN categorie_spese c ON c.id = s.categoria_id
    WHERE s.id = ?
  `).get(id),

  create: (data) => {
    const stmt = getDb().prepare(`
      INSERT INTO spese (immobile_id, categoria_id, descrizione, fornitore,
        importo, data_documento, data_scadenza, ricorrente, frequenza_ricorrenza,
        prossima_scadenza, periodo_consumo_inizio, periodo_consumo_fine,
        consumo_kwh, consumo_mc, pod, pdr, iban, riferimento_bolletta, tipo_versamento, stato,
        ripartizione_stanze, note)
      VALUES (@immobile_id, @categoria_id, @descrizione, @fornitore,
        @importo, @data_documento, @data_scadenza, @ricorrente, @frequenza_ricorrenza,
        @prossima_scadenza, @periodo_consumo_inizio, @periodo_consumo_fine,
        @consumo_kwh, @consumo_mc, @pod, @pdr, @iban, @riferimento_bolletta, @tipo_versamento, @stato,
        @ripartizione_stanze, @note)
    `)
    return stmt.run(data)
  },

  update: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE spese SET categoria_id=@categoria_id, descrizione=@descrizione,
        fornitore=@fornitore, importo=@importo, data_documento=@data_documento,
        data_scadenza=@data_scadenza, ricorrente=@ricorrente,
        frequenza_ricorrenza=@frequenza_ricorrenza, prossima_scadenza=@prossima_scadenza,
        periodo_consumo_inizio=@periodo_consumo_inizio,
        periodo_consumo_fine=@periodo_consumo_fine,
        consumo_kwh=@consumo_kwh, consumo_mc=@consumo_mc,
        pod=@pod, pdr=@pdr, iban=@iban,
        riferimento_bolletta=@riferimento_bolletta, tipo_versamento=@tipo_versamento,
        stato=@stato, ripartizione_stanze=@ripartizione_stanze, note=@note
      WHERE id=@id
    `)
    return stmt.run({ ...data, id })
  },

  pagaSpesa: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE spese SET stato='pagata', data_pagamento=@data_pagamento,
        metodo_pagamento=@metodo_pagamento
      WHERE id=@id
    `)
    return stmt.run({ ...data, id })
  },

  delete: (id) => getDb().prepare(`DELETE FROM spese WHERE id = ?`).run(id),

  getSummaryByPeriod: (immobile_id, anno) => getDb().prepare(`
    SELECT strftime('%m', COALESCE(data_scadenza, data_documento)) as mese,
           c.nome as categoria, c.colore,
           SUM(importo) as totale, COUNT(*) as num
    FROM spese s
    LEFT JOIN categorie_spese c ON c.id = s.categoria_id
    WHERE s.immobile_id = ?
      AND strftime('%Y', COALESCE(data_scadenza, data_documento)) = ?
    GROUP BY mese, s.categoria_id
    ORDER BY mese, categoria
  `).all(immobile_id, String(anno))
}

// ── DOCUMENTI ─────────────────────────────────────────────────────────────────

export const documenti = {
  getBySpesa: (spesa_id) => getDb().prepare(`SELECT * FROM documenti WHERE spesa_id = ? ORDER BY caricato_il DESC`).all(spesa_id),

  create: (data) => {
    const stmt = getDb().prepare(`
      INSERT INTO documenti (spesa_id, contratto_id, nome_file, percorso_file,
        tipo_file, ocr_testo, ocr_tipo_documento, ocr_importo, ocr_data,
        ocr_fornitore, ocr_periodo, ocr_iban, ocr_consumo, ocr_riferimento, ocr_completato)
      VALUES (@spesa_id, @contratto_id, @nome_file, @percorso_file,
        @tipo_file, @ocr_testo, @ocr_tipo_documento, @ocr_importo, @ocr_data,
        @ocr_fornitore, @ocr_periodo, @ocr_iban, @ocr_consumo, @ocr_riferimento, @ocr_completato)
    `)
    return stmt.run(data)
  },

  aggiornaOcr: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE documenti SET ocr_testo=@ocr_testo, ocr_tipo_documento=@ocr_tipo_documento,
        ocr_importo=@ocr_importo, ocr_data=@ocr_data, ocr_fornitore=@ocr_fornitore,
        ocr_periodo=@ocr_periodo, ocr_iban=@ocr_iban, ocr_consumo=@ocr_consumo,
        ocr_riferimento=@ocr_riferimento, ocr_completato=1
      WHERE id=@id
    `)
    return stmt.run({ ...data, id })
  },

  delete: (id) => getDb().prepare(`DELETE FROM documenti WHERE id = ?`).run(id)
}

// ── ALERT ─────────────────────────────────────────────────────────────────────

export const alertDb = {
  getPendenti: () => getDb().prepare(`
    SELECT * FROM alert WHERE letto = 0 ORDER BY data_scadenza ASC
  `).all(),

  creaAlert: (data) => {
    // INSERT OR IGNORE: se esiste già (tipo+entita_tipo+entita_id), non inserisce
    const stmt = getDb().prepare(`
      INSERT OR IGNORE INTO alert (tipo, entita_tipo, entita_id, titolo, messaggio,
        data_scadenza, giorni_anticipo)
      VALUES (@tipo, @entita_tipo, @entita_id, @titolo, @messaggio,
        @data_scadenza, @giorni_anticipo)
    `)
    return stmt.run(data)
  },

  // Quando un alert viene letto, lo elimina così che possa essere ricreato
  // solo se il problema persiste al prossimo ciclo di notifiche
  segnaLetto: (id) => getDb().prepare(`DELETE FROM alert WHERE id=?`).run(id),

  segnaInviato: (id) => getDb().prepare(`UPDATE alert SET inviato=1 WHERE id=?`).run(id),

  // Cerca alert da notificare: solo non ancora inviati
  getPerNotifica: () => getDb().prepare(`
    SELECT * FROM alert
    WHERE inviato = 0
      AND data_scadenza <= date('now', '+' || giorni_anticipo || ' days')
    ORDER BY data_scadenza
  `).all(),

  deleteByEntita: (entita_tipo, entita_id) => getDb().prepare(`
    DELETE FROM alert WHERE entita_tipo=? AND entita_id=?
  `).run(entita_tipo, entita_id)
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

export const dashboard = {
  getSummary: () => {
    const db = getDb()
    return {
      immobili: db.prepare(`SELECT COUNT(*) as n FROM immobili`).get().n,
      contratti_attivi: db.prepare(`SELECT COUNT(*) as n FROM contratti WHERE stato='attivo'`).get().n,
      spese_da_pagare: db.prepare(`SELECT COUNT(*) as n, COALESCE(SUM(importo),0) as tot FROM spese WHERE stato='da_pagare'`).get(),
      affitti_da_incassare: db.prepare(`SELECT COUNT(*) as n, COALESCE(SUM(importo),0) as tot FROM pagamenti_affitto WHERE stato='da_pagare'`).get(),
      scadenze_settimana: db.prepare(`
        SELECT COUNT(*) as n FROM spese
        WHERE stato='da_pagare' AND data_scadenza BETWEEN date('now') AND date('now','+7 days')
      `).get().n,
      alert_pendenti: db.prepare(`SELECT COUNT(*) as n FROM alert WHERE letto=0`).get().n
    }
  }
}

// ── REPORT GRAFICI ────────────────────────────────────────────────────────────

export const reportGrafici = {
  // Dati mensili per categoria (importo + consumi) per immobile+anno
  mensiliPerCategoria: (immobile_id, anno) => {
    const where = immobile_id
      ? `WHERE s.immobile_id = ${immobile_id} AND strftime('%Y', COALESCE(s.data_scadenza, s.data_documento)) = '${anno}'`
      : `WHERE strftime('%Y', COALESCE(s.data_scadenza, s.data_documento)) = '${anno}'`
    return getDb().prepare(`
      SELECT
        strftime('%m', COALESCE(s.data_scadenza, s.data_documento)) as mese,
        COALESCE(s.categoria_id, 0) as categoria_id,
        COALESCE(c.nome, 'Altro') as categoria_nome,
        COALESCE(c.colore, '#94a3b8') as colore,
        COALESCE(c.tipo, 'ordinaria') as tipo_cat,
        SUM(s.importo) as totale_importo,
        SUM(s.consumo_kwh) as totale_kwh,
        SUM(s.consumo_mc) as totale_mc,
        COUNT(*) as num_bollette
      FROM spese s
      LEFT JOIN categorie_spese c ON c.id = s.categoria_id
      ${where}
        AND s.importo IS NOT NULL
        AND COALESCE(s.data_scadenza, s.data_documento) IS NOT NULL
      GROUP BY mese, s.categoria_id
      ORDER BY mese, categoria_nome
    `).all()
  },

  // Totale importi per mese (tutti i mesi dell'anno, anche senza dati)
  totaliMensili: (immobile_id, anno) => {
    const where = immobile_id
      ? `WHERE s.immobile_id = ${immobile_id} AND strftime('%Y', COALESCE(s.data_scadenza, s.data_documento)) = '${anno}'`
      : `WHERE strftime('%Y', COALESCE(s.data_scadenza, s.data_documento)) = '${anno}'`
    return getDb().prepare(`
      SELECT
        strftime('%m', COALESCE(s.data_scadenza, s.data_documento)) as mese,
        SUM(s.importo) as totale,
        SUM(s.consumo_kwh) as tot_kwh,
        SUM(s.consumo_mc) as tot_mc
      FROM spese s
      ${where}
      GROUP BY mese ORDER BY mese
    `).all()
  }
}

// ── REPORT ────────────────────────────────────────────────────────────────────

export const report = {
  speseAnnuali: (anno, immobile_id) => {
    let sql = `
      SELECT s.*, c.nome as categoria_nome, i.nome as immobile_nome
      FROM spese s
      LEFT JOIN categorie_spese c ON c.id = s.categoria_id
      JOIN immobili i ON i.id = s.immobile_id
      WHERE strftime('%Y', COALESCE(s.data_scadenza, s.data_documento)) = ?
    `
    const params = [String(anno)]
    if (immobile_id) { sql += ` AND s.immobile_id = ?`; params.push(immobile_id) }
    return getDb().prepare(sql + ` ORDER BY s.data_scadenza`).all(...params)
  },

  affittiAnnuali: (anno, immobile_id) => {
    let sql = `
      SELECT pa.*, i.nome as immobile_nome, u.nome as unita_nome,
             inq.nome || ' ' || inq.cognome as inquilino_nome
      FROM pagamenti_affitto pa
      JOIN contratti c ON c.id = pa.contratto_id
      JOIN unita u ON u.id = c.unita_id
      JOIN immobili i ON i.id = u.immobile_id
      JOIN inquilini inq ON inq.id = c.inquilino_id
      WHERE strftime('%Y', pa.data_scadenza) = ?
    `
    const params = [String(anno)]
    if (immobile_id) { sql += ` AND i.id = ?`; params.push(immobile_id) }
    return getDb().prepare(sql + ` ORDER BY pa.data_scadenza`).all(...params)
  }
}
