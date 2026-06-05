export const SCHEMA = `
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS comuni_istat (
  codice TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  sigla_prov TEXT NOT NULL,
  nome_prov TEXT NOT NULL,
  nome_reg TEXT NOT NULL,
  cap TEXT
);

CREATE TABLE IF NOT EXISTS immobili (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  indirizzo TEXT NOT NULL,
  citta TEXT,
  cap TEXT,
  sigla_prov TEXT,
  tipo TEXT DEFAULT 'appartamento',
  superficie_mq REAL,
  valore_acquisto REAL,
  data_acquisto TEXT,
  note TEXT,
  foto_path TEXT,
  lat REAL,
  lng REAL,
  creato_il TEXT DEFAULT (datetime('now')),
  aggiornato_il TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS immobili_utenze (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  immobile_id INTEGER NOT NULL REFERENCES immobili(id) ON DELETE CASCADE,
  unita_id INTEGER REFERENCES unita(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  pod TEXT,
  pdr TEXT,
  matricola_contatore TEXT,
  fornitore_attuale TEXT,
  note TEXT,
  creato_il TEXT DEFAULT (datetime('now')),
  UNIQUE(immobile_id, unita_id, tipo)
);

CREATE TABLE IF NOT EXISTS unita (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  immobile_id INTEGER NOT NULL REFERENCES immobili(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT 'intera',
  piano INTEGER,
  superficie_mq REAL,
  num_locali INTEGER,
  descrizione TEXT,
  creato_il TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inquilini (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  codice_fiscale TEXT,
  telefono TEXT,
  email TEXT,
  tipo_documento TEXT,
  numero_documento TEXT,
  foto_path TEXT,
  metodo_pagamento_default TEXT DEFAULT 'contanti',
  note TEXT,
  creato_il TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contratti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unita_id INTEGER NOT NULL REFERENCES unita(id) ON DELETE CASCADE,
  inquilino_id INTEGER NOT NULL REFERENCES inquilini(id),
  data_inizio TEXT NOT NULL,
  data_fine TEXT,
  canone_mensile REAL NOT NULL,
  deposito REAL DEFAULT 0,
  giorno_pagamento INTEGER DEFAULT 1,
  tipo_contratto TEXT DEFAULT '4+4',
  stato TEXT DEFAULT 'attivo',
  note TEXT,
  creato_il TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pagamenti_affitto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contratto_id INTEGER NOT NULL REFERENCES contratti(id) ON DELETE CASCADE,
  mese_riferimento TEXT NOT NULL,
  importo REAL NOT NULL,
  data_scadenza TEXT NOT NULL,
  data_pagamento TEXT,
  metodo_pagamento TEXT,
  stato TEXT DEFAULT 'da_pagare',
  note TEXT,
  creato_il TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categorie_spese (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT 'ordinaria',
  icona TEXT DEFAULT 'receipt',
  colore TEXT DEFAULT '#6b7280',
  predefinita INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS spese (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  immobile_id INTEGER NOT NULL REFERENCES immobili(id) ON DELETE CASCADE,
  categoria_id INTEGER REFERENCES categorie_spese(id),
  descrizione TEXT NOT NULL,
  fornitore TEXT,
  importo REAL NOT NULL,
  data_documento TEXT,
  data_scadenza TEXT,
  data_pagamento TEXT,
  ricorrente INTEGER DEFAULT 0,
  frequenza_ricorrenza TEXT,
  prossima_scadenza TEXT,
  periodo_consumo_inizio TEXT,
  periodo_consumo_fine TEXT,
  consumo_kwh REAL,
  consumo_mc REAL,
  pod TEXT,
  pdr TEXT,
  iban TEXT,
  riferimento_bolletta TEXT,
  tipo_versamento TEXT DEFAULT 'saldo',
  stato TEXT DEFAULT 'da_pagare',
  metodo_pagamento TEXT,
  ripartizione_stanze INTEGER DEFAULT 0,
  note TEXT,
  creato_il TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pagamenti_spese (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spesa_id INTEGER NOT NULL REFERENCES spese(id) ON DELETE CASCADE,
  importo REAL NOT NULL,
  data_pagamento TEXT NOT NULL,
  metodo_pagamento TEXT,
  note TEXT,
  creato_il TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documenti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spesa_id INTEGER REFERENCES spese(id) ON DELETE CASCADE,
  contratto_id INTEGER REFERENCES contratti(id) ON DELETE CASCADE,
  nome_file TEXT NOT NULL,
  percorso_file TEXT NOT NULL,
  tipo_file TEXT,
  ocr_testo TEXT,
  ocr_tipo_documento TEXT,
  ocr_importo REAL,
  ocr_data TEXT,
  ocr_fornitore TEXT,
  ocr_periodo TEXT,
  ocr_iban TEXT,
  ocr_consumo TEXT,
  ocr_riferimento TEXT,
  ocr_completato INTEGER DEFAULT 0,
  caricato_il TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ripartizioni_spesa (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spesa_id INTEGER NOT NULL REFERENCES spese(id) ON DELETE CASCADE,
  unita_id INTEGER NOT NULL REFERENCES unita(id),
  percentuale REAL NOT NULL,
  importo_quota REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS alert (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL,
  entita_tipo TEXT NOT NULL,
  entita_id INTEGER NOT NULL,
  titolo TEXT NOT NULL,
  messaggio TEXT NOT NULL,
  data_scadenza TEXT NOT NULL,
  giorni_anticipo INTEGER DEFAULT 7,
  inviato INTEGER DEFAULT 0,
  letto INTEGER DEFAULT 0,
  creato_il TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO categorie_spese (id, nome, tipo, icona, colore, predefinita) VALUES
(1,  'Energia Elettrica', 'ordinaria', 'zap',         '#f59e0b', 1),
(2,  'Gas',               'ordinaria', 'flame',        '#ef4444', 1),
(3,  'Acqua',             'ordinaria', 'droplets',     '#3b82f6', 1),
(4,  'Internet',          'ordinaria', 'wifi',         '#8b5cf6', 1),
(5,  'Condominio',        'ordinaria', 'building',     '#6b7280', 1),
(6,  'Netflix',           'ordinaria', 'tv',           '#dc2626', 1),
(7,  'Amazon Prime',      'ordinaria', 'package',      '#f97316', 1),
(8,  'Assicurazione',     'ordinaria', 'shield',       '#10b981', 1),
(9,  'IMU/TASI',          'ordinaria', 'landmark',     '#0ea5e9', 1),
(10, 'Manutenzione',      'straordinaria', 'wrench',   '#84cc16', 1),
(11, 'Ristrutturazione',  'straordinaria', 'hard-hat', '#f43f5e', 1),
(12, 'Altra Spesa',       'straordinaria', 'circle-dot','#94a3b8', 1);
`
