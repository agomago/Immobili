"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
const electron = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
const fs = require("fs");
const tesseract_js = require("tesseract.js");
const ExcelJS = require("exceljs");
const jspdf = require("jspdf");
require("jspdf-autotable");
const child_process = require("child_process");
const notifier = require("node-notifier");
const schedule = require("node-schedule");
const SCHEMA = `
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
`;
const COMUNI_ISTAT = [
  // =========================================================================
  // PIEMONTE
  // =========================================================================
  // Torino (TO)
  { codice: "001272", nome: "Torino", sigla_prov: "TO", nome_prov: "Torino", nome_reg: "Piemonte", cap: "10100" },
  { codice: "001001", nome: "Agliè", sigla_prov: "TO", nome_prov: "Torino", nome_reg: "Piemonte", cap: "10011" },
  { codice: "001025", nome: "Beinasco", sigla_prov: "TO", nome_prov: "Torino", nome_reg: "Piemonte", cap: "10092" },
  { codice: "001037", nome: "Borgaro Torinese", sigla_prov: "TO", nome_prov: "Torino", nome_reg: "Piemonte", cap: "10071" },
  { codice: "001091", nome: "Collegno", sigla_prov: "TO", nome_prov: "Torino", nome_reg: "Piemonte", cap: "10093" },
  { codice: "001169", nome: "Moncalieri", sigla_prov: "TO", nome_prov: "Torino", nome_reg: "Piemonte", cap: "10024" },
  { codice: "001206", nome: "Orbassano", sigla_prov: "TO", nome_prov: "Torino", nome_reg: "Piemonte", cap: "10043" },
  { codice: "001251", nome: "Rivoli", sigla_prov: "TO", nome_prov: "Torino", nome_reg: "Piemonte", cap: "10098" },
  { codice: "001289", nome: "Venaria Reale", sigla_prov: "TO", nome_prov: "Torino", nome_reg: "Piemonte", cap: "10078" },
  // Vercelli (VC)
  { codice: "002158", nome: "Vercelli", sigla_prov: "VC", nome_prov: "Vercelli", nome_reg: "Piemonte", cap: "13100" },
  { codice: "002010", nome: "Borgosesia", sigla_prov: "VC", nome_prov: "Vercelli", nome_reg: "Piemonte", cap: "13011" },
  { codice: "002048", nome: "Gattinara", sigla_prov: "VC", nome_prov: "Vercelli", nome_reg: "Piemonte", cap: "13045" },
  // Novara (NO)
  { codice: "003113", nome: "Novara", sigla_prov: "NO", nome_prov: "Novara", nome_reg: "Piemonte", cap: "28100" },
  { codice: "003011", nome: "Arona", sigla_prov: "NO", nome_prov: "Novara", nome_reg: "Piemonte", cap: "28041" },
  { codice: "003062", nome: "Galliate", sigla_prov: "NO", nome_prov: "Novara", nome_reg: "Piemonte", cap: "28066" },
  { codice: "003149", nome: "Trecate", sigla_prov: "NO", nome_prov: "Novara", nome_reg: "Piemonte", cap: "28069" },
  // Cuneo (CN)
  { codice: "004078", nome: "Cuneo", sigla_prov: "CN", nome_prov: "Cuneo", nome_reg: "Piemonte", cap: "12100" },
  { codice: "004003", nome: "Alba", sigla_prov: "CN", nome_prov: "Cuneo", nome_reg: "Piemonte", cap: "12051" },
  { codice: "004017", nome: "Bra", sigla_prov: "CN", nome_prov: "Cuneo", nome_reg: "Piemonte", cap: "12042" },
  { codice: "004123", nome: "Mondovì", sigla_prov: "CN", nome_prov: "Cuneo", nome_reg: "Piemonte", cap: "12084" },
  { codice: "004156", nome: "Saluzzo", sigla_prov: "CN", nome_prov: "Cuneo", nome_reg: "Piemonte", cap: "12037" },
  { codice: "004167", nome: "Savigliano", sigla_prov: "CN", nome_prov: "Cuneo", nome_reg: "Piemonte", cap: "12038" },
  // Asti (AT)
  { codice: "005015", nome: "Asti", sigla_prov: "AT", nome_prov: "Asti", nome_reg: "Piemonte", cap: "14100" },
  { codice: "005069", nome: "Nizza Monferrato", sigla_prov: "AT", nome_prov: "Asti", nome_reg: "Piemonte", cap: "14049" },
  { codice: "005074", nome: "Canelli", sigla_prov: "AT", nome_prov: "Asti", nome_reg: "Piemonte", cap: "14053" },
  // Alessandria (AL)
  { codice: "006003", nome: "Alessandria", sigla_prov: "AL", nome_prov: "Alessandria", nome_reg: "Piemonte", cap: "15100" },
  { codice: "006021", nome: "Casale Monferrato", sigla_prov: "AL", nome_prov: "Alessandria", nome_reg: "Piemonte", cap: "15033" },
  { codice: "006072", nome: "Novi Ligure", sigla_prov: "AL", nome_prov: "Alessandria", nome_reg: "Piemonte", cap: "15067" },
  { codice: "006096", nome: "Tortona", sigla_prov: "AL", nome_prov: "Alessandria", nome_reg: "Piemonte", cap: "15057" },
  // Biella (BI)
  { codice: "096006", nome: "Biella", sigla_prov: "BI", nome_prov: "Biella", nome_reg: "Piemonte", cap: "13900" },
  { codice: "096010", nome: "Cossato", sigla_prov: "BI", nome_prov: "Biella", nome_reg: "Piemonte", cap: "13836" },
  { codice: "096048", nome: "Valdilana", sigla_prov: "BI", nome_prov: "Biella", nome_reg: "Piemonte", cap: "13835" },
  // Verbano-Cusio-Ossola (VB)
  { codice: "103055", nome: "Verbania", sigla_prov: "VB", nome_prov: "Verbano-Cusio-Ossola", nome_reg: "Piemonte", cap: "28900" },
  { codice: "103003", nome: "Domodossola", sigla_prov: "VB", nome_prov: "Verbano-Cusio-Ossola", nome_reg: "Piemonte", cap: "28845" },
  { codice: "103048", nome: "Omegna", sigla_prov: "VB", nome_prov: "Verbano-Cusio-Ossola", nome_reg: "Piemonte", cap: "28887" },
  // =========================================================================
  // VALLE D'AOSTA
  // =========================================================================
  { codice: "007003", nome: "Aosta", sigla_prov: "AO", nome_prov: "Aosta", nome_reg: "Valle d'Aosta", cap: "11100" },
  { codice: "007005", nome: "Brissogne", sigla_prov: "AO", nome_prov: "Aosta", nome_reg: "Valle d'Aosta", cap: "11020" },
  { codice: "007026", nome: "Courmayeur", sigla_prov: "AO", nome_prov: "Aosta", nome_reg: "Valle d'Aosta", cap: "11013" },
  { codice: "007047", nome: "Gressan", sigla_prov: "AO", nome_prov: "Aosta", nome_reg: "Valle d'Aosta", cap: "11020" },
  // =========================================================================
  // LIGURIA
  // =========================================================================
  // Genova (GE)
  { codice: "010025", nome: "Genova", sigla_prov: "GE", nome_prov: "Genova", nome_reg: "Liguria", cap: "16100" },
  { codice: "010003", nome: "Arenzano", sigla_prov: "GE", nome_prov: "Genova", nome_reg: "Liguria", cap: "16011" },
  { codice: "010010", nome: "Bogliasco", sigla_prov: "GE", nome_prov: "Genova", nome_reg: "Liguria", cap: "16031" },
  { codice: "010018", nome: "Camogli", sigla_prov: "GE", nome_prov: "Genova", nome_reg: "Liguria", cap: "16032" },
  { codice: "010043", nome: "Rapallo", sigla_prov: "GE", nome_prov: "Genova", nome_reg: "Liguria", cap: "16035" },
  { codice: "010054", nome: "Sestri Levante", sigla_prov: "GE", nome_prov: "Genova", nome_reg: "Liguria", cap: "16039" },
  // Savona (SV)
  { codice: "009056", nome: "Savona", sigla_prov: "SV", nome_prov: "Savona", nome_reg: "Liguria", cap: "17100" },
  { codice: "009006", nome: "Albenga", sigla_prov: "SV", nome_prov: "Savona", nome_reg: "Liguria", cap: "17031" },
  { codice: "009026", nome: "Finale Ligure", sigla_prov: "SV", nome_prov: "Savona", nome_reg: "Liguria", cap: "17024" },
  // Imperia (IM)
  { codice: "008032", nome: "Imperia", sigla_prov: "IM", nome_prov: "Imperia", nome_reg: "Liguria", cap: "18100" },
  { codice: "008052", nome: "Sanremo", sigla_prov: "IM", nome_prov: "Imperia", nome_reg: "Liguria", cap: "18038" },
  { codice: "008059", nome: "Ventimiglia", sigla_prov: "IM", nome_prov: "Imperia", nome_reg: "Liguria", cap: "18039" },
  // La Spezia (SP)
  { codice: "011015", nome: "La Spezia", sigla_prov: "SP", nome_prov: "La Spezia", nome_reg: "Liguria", cap: "19100" },
  { codice: "011005", nome: "Brugnato", sigla_prov: "SP", nome_prov: "La Spezia", nome_reg: "Liguria", cap: "19020" },
  { codice: "011014", nome: "Sarzana", sigla_prov: "SP", nome_prov: "La Spezia", nome_reg: "Liguria", cap: "19038" },
  // =========================================================================
  // LOMBARDIA
  // =========================================================================
  // Milano (MI)
  { codice: "015146", nome: "Milano", sigla_prov: "MI", nome_prov: "Milano", nome_reg: "Lombardia", cap: "20100" },
  { codice: "015002", nome: "Abbiategrasso", sigla_prov: "MI", nome_prov: "Milano", nome_reg: "Lombardia", cap: "20081" },
  { codice: "015017", nome: "Bollate", sigla_prov: "MI", nome_prov: "Milano", nome_reg: "Lombardia", cap: "20021" },
  { codice: "015041", nome: "Cernusco sul Naviglio", sigla_prov: "MI", nome_prov: "Milano", nome_reg: "Lombardia", cap: "20063" },
  { codice: "015093", nome: "Legnano", sigla_prov: "MI", nome_prov: "Milano", nome_reg: "Lombardia", cap: "20025" },
  { codice: "015122", nome: "Magenta", sigla_prov: "MI", nome_prov: "Milano", nome_reg: "Lombardia", cap: "20013" },
  { codice: "015182", nome: "Rho", sigla_prov: "MI", nome_prov: "Milano", nome_reg: "Lombardia", cap: "20017" },
  { codice: "015199", nome: "Sesto San Giovanni", sigla_prov: "MI", nome_prov: "Milano", nome_reg: "Lombardia", cap: "20099" },
  { codice: "015237", nome: "Cinisello Balsamo", sigla_prov: "MI", nome_prov: "Milano", nome_reg: "Lombardia", cap: "20092" },
  // Bergamo (BG)
  { codice: "016024", nome: "Bergamo", sigla_prov: "BG", nome_prov: "Bergamo", nome_reg: "Lombardia", cap: "24100" },
  { codice: "016009", nome: "Albino", sigla_prov: "BG", nome_prov: "Bergamo", nome_reg: "Lombardia", cap: "24021" },
  { codice: "016044", nome: "Dalmine", sigla_prov: "BG", nome_prov: "Bergamo", nome_reg: "Lombardia", cap: "24044" },
  { codice: "016202", nome: "Seriate", sigla_prov: "BG", nome_prov: "Bergamo", nome_reg: "Lombardia", cap: "24068" },
  { codice: "016105", nome: "Lovere", sigla_prov: "BG", nome_prov: "Bergamo", nome_reg: "Lombardia", cap: "24065" },
  // Brescia (BS)
  { codice: "017029", nome: "Brescia", sigla_prov: "BS", nome_prov: "Brescia", nome_reg: "Lombardia", cap: "25100" },
  { codice: "017004", nome: "Breno", sigla_prov: "BS", nome_prov: "Brescia", nome_reg: "Lombardia", cap: "25043" },
  { codice: "017058", nome: "Desenzano del Garda", sigla_prov: "BS", nome_prov: "Brescia", nome_reg: "Lombardia", cap: "25015" },
  { codice: "017182", nome: "Salo'", sigla_prov: "BS", nome_prov: "Brescia", nome_reg: "Lombardia", cap: "25087" },
  { codice: "017143", nome: "Palazzolo sull'Oglio", sigla_prov: "BS", nome_prov: "Brescia", nome_reg: "Lombardia", cap: "25036" },
  // Como (CO)
  { codice: "013075", nome: "Como", sigla_prov: "CO", nome_prov: "Como", nome_reg: "Lombardia", cap: "22100" },
  { codice: "013036", nome: "Cantù", sigla_prov: "CO", nome_prov: "Como", nome_reg: "Lombardia", cap: "22063" },
  { codice: "013122", nome: "Mariano Comense", sigla_prov: "CO", nome_prov: "Como", nome_reg: "Lombardia", cap: "22066" },
  // Cremona (CR)
  { codice: "019036", nome: "Cremona", sigla_prov: "CR", nome_prov: "Cremona", nome_reg: "Lombardia", cap: "26100" },
  { codice: "019087", nome: "Crema", sigla_prov: "CR", nome_prov: "Cremona", nome_reg: "Lombardia", cap: "26013" },
  { codice: "019049", nome: "Casalmaggiore", sigla_prov: "CR", nome_prov: "Cremona", nome_reg: "Lombardia", cap: "26041" },
  // Lecco (LC)
  { codice: "097046", nome: "Lecco", sigla_prov: "LC", nome_prov: "Lecco", nome_reg: "Lombardia", cap: "23900" },
  { codice: "097013", nome: "Calolziocorte", sigla_prov: "LC", nome_prov: "Lecco", nome_reg: "Lombardia", cap: "23801" },
  { codice: "097016", nome: "Casatenovo", sigla_prov: "LC", nome_prov: "Lecco", nome_reg: "Lombardia", cap: "23880" },
  // Lodi (LO)
  { codice: "098033", nome: "Lodi", sigla_prov: "LO", nome_prov: "Lodi", nome_reg: "Lombardia", cap: "26900" },
  { codice: "098004", nome: "Casalpusterlengo", sigla_prov: "LO", nome_prov: "Lodi", nome_reg: "Lombardia", cap: "26841" },
  // Mantova (MN)
  { codice: "020030", nome: "Mantova", sigla_prov: "MN", nome_prov: "Mantova", nome_reg: "Lombardia", cap: "46100" },
  { codice: "020008", nome: "Castiglione delle Stiviere", sigla_prov: "MN", nome_prov: "Mantova", nome_reg: "Lombardia", cap: "46043" },
  { codice: "020051", nome: "Suzzara", sigla_prov: "MN", nome_prov: "Mantova", nome_reg: "Lombardia", cap: "46029" },
  // Monza e Brianza (MB)
  { codice: "108033", nome: "Monza", sigla_prov: "MB", nome_prov: "Monza e della Brianza", nome_reg: "Lombardia", cap: "20900" },
  { codice: "108019", nome: "Desio", sigla_prov: "MB", nome_prov: "Monza e della Brianza", nome_reg: "Lombardia", cap: "20832" },
  { codice: "108040", nome: "Seregno", sigla_prov: "MB", nome_prov: "Monza e della Brianza", nome_reg: "Lombardia", cap: "20831" },
  { codice: "108042", nome: "Cesano Maderno", sigla_prov: "MB", nome_prov: "Monza e della Brianza", nome_reg: "Lombardia", cap: "20811" },
  // Pavia (PV)
  { codice: "018110", nome: "Pavia", sigla_prov: "PV", nome_prov: "Pavia", nome_reg: "Lombardia", cap: "27100" },
  { codice: "018024", nome: "Broni", sigla_prov: "PV", nome_prov: "Pavia", nome_reg: "Lombardia", cap: "27043" },
  { codice: "018158", nome: "Vigevano", sigla_prov: "PV", nome_prov: "Pavia", nome_reg: "Lombardia", cap: "27029" },
  { codice: "018108", nome: "Mortara", sigla_prov: "PV", nome_prov: "Pavia", nome_reg: "Lombardia", cap: "27036" },
  // Sondrio (SO)
  { codice: "014059", nome: "Sondrio", sigla_prov: "SO", nome_prov: "Sondrio", nome_reg: "Lombardia", cap: "23100" },
  { codice: "014013", nome: "Bormio", sigla_prov: "SO", nome_prov: "Sondrio", nome_reg: "Lombardia", cap: "23032" },
  { codice: "014052", nome: "Morbegno", sigla_prov: "SO", nome_prov: "Sondrio", nome_reg: "Lombardia", cap: "23017" },
  // Varese (VA)
  { codice: "012133", nome: "Varese", sigla_prov: "VA", nome_prov: "Varese", nome_reg: "Lombardia", cap: "21100" },
  { codice: "012006", nome: "Busto Arsizio", sigla_prov: "VA", nome_prov: "Varese", nome_reg: "Lombardia", cap: "21052" },
  { codice: "012037", nome: "Gallarate", sigla_prov: "VA", nome_prov: "Varese", nome_reg: "Lombardia", cap: "21013" },
  { codice: "012068", nome: "Luino", sigla_prov: "VA", nome_prov: "Varese", nome_reg: "Lombardia", cap: "21016" },
  { codice: "012092", nome: "Saronno", sigla_prov: "VA", nome_prov: "Varese", nome_reg: "Lombardia", cap: "21047" },
  // =========================================================================
  // TRENTINO-ALTO ADIGE
  // =========================================================================
  // Trento (TN)
  { codice: "022205", nome: "Trento", sigla_prov: "TN", nome_prov: "Trento", nome_reg: "Trentino-Alto Adige", cap: "38100" },
  { codice: "022013", nome: "Arco", sigla_prov: "TN", nome_prov: "Trento", nome_reg: "Trentino-Alto Adige", cap: "38062" },
  { codice: "022069", nome: "Pergine Valsugana", sigla_prov: "TN", nome_prov: "Trento", nome_reg: "Trentino-Alto Adige", cap: "38057" },
  { codice: "022093", nome: "Riva del Garda", sigla_prov: "TN", nome_prov: "Trento", nome_reg: "Trentino-Alto Adige", cap: "38066" },
  { codice: "022168", nome: "Rovereto", sigla_prov: "TN", nome_prov: "Trento", nome_reg: "Trentino-Alto Adige", cap: "38068" },
  // Bolzano/Bozen (BZ)
  { codice: "021008", nome: "Bolzano", sigla_prov: "BZ", nome_prov: "Bolzano", nome_reg: "Trentino-Alto Adige", cap: "39100" },
  { codice: "021016", nome: "Bressanone", sigla_prov: "BZ", nome_prov: "Bolzano", nome_reg: "Trentino-Alto Adige", cap: "39042" },
  { codice: "021050", nome: "Merano", sigla_prov: "BZ", nome_prov: "Bolzano", nome_reg: "Trentino-Alto Adige", cap: "39012" },
  { codice: "021062", nome: "Brunico", sigla_prov: "BZ", nome_prov: "Bolzano", nome_reg: "Trentino-Alto Adige", cap: "39031" },
  // =========================================================================
  // VENETO
  // =========================================================================
  // Venezia (VE)
  { codice: "027042", nome: "Venezia", sigla_prov: "VE", nome_prov: "Venezia", nome_reg: "Veneto", cap: "30100" },
  { codice: "027004", nome: "Chioggia", sigla_prov: "VE", nome_prov: "Venezia", nome_reg: "Veneto", cap: "30015" },
  { codice: "027006", nome: "Dolo", sigla_prov: "VE", nome_prov: "Venezia", nome_reg: "Veneto", cap: "30031" },
  { codice: "027028", nome: "Mestre", sigla_prov: "VE", nome_prov: "Venezia", nome_reg: "Veneto", cap: "30170" },
  { codice: "027032", nome: "Mira", sigla_prov: "VE", nome_prov: "Venezia", nome_reg: "Veneto", cap: "30034" },
  // Verona (VR)
  { codice: "023091", nome: "Verona", sigla_prov: "VR", nome_prov: "Verona", nome_reg: "Veneto", cap: "37100" },
  { codice: "023003", nome: "Bardolino", sigla_prov: "VR", nome_prov: "Verona", nome_reg: "Veneto", cap: "37011" },
  { codice: "023022", nome: "Bussolengo", sigla_prov: "VR", nome_prov: "Verona", nome_reg: "Veneto", cap: "37012" },
  { codice: "023064", nome: "Peschiera del Garda", sigla_prov: "VR", nome_prov: "Verona", nome_reg: "Veneto", cap: "37019" },
  { codice: "023070", nome: "San Bonifacio", sigla_prov: "VR", nome_prov: "Verona", nome_reg: "Veneto", cap: "37047" },
  // Padova (PD)
  { codice: "028060", nome: "Padova", sigla_prov: "PD", nome_prov: "Padova", nome_reg: "Veneto", cap: "35100" },
  { codice: "028001", nome: "Abano Terme", sigla_prov: "PD", nome_prov: "Padova", nome_reg: "Veneto", cap: "35031" },
  { codice: "028025", nome: "Cittadella", sigla_prov: "PD", nome_prov: "Padova", nome_reg: "Veneto", cap: "35013" },
  { codice: "028036", nome: "Este", sigla_prov: "PD", nome_prov: "Padova", nome_reg: "Veneto", cap: "35042" },
  // Vicenza (VI)
  { codice: "024116", nome: "Vicenza", sigla_prov: "VI", nome_prov: "Vicenza", nome_reg: "Veneto", cap: "36100" },
  { codice: "024011", nome: "Bassano del Grappa", sigla_prov: "VI", nome_prov: "Vicenza", nome_reg: "Veneto", cap: "36061" },
  { codice: "024041", nome: "Marostica", sigla_prov: "VI", nome_prov: "Vicenza", nome_reg: "Veneto", cap: "36063" },
  { codice: "024049", nome: "Schio", sigla_prov: "VI", nome_prov: "Vicenza", nome_reg: "Veneto", cap: "36015" },
  { codice: "024112", nome: "Thiene", sigla_prov: "VI", nome_prov: "Vicenza", nome_reg: "Veneto", cap: "36016" },
  // Treviso (TV)
  { codice: "026080", nome: "Treviso", sigla_prov: "TV", nome_prov: "Treviso", nome_reg: "Veneto", cap: "31100" },
  { codice: "026006", nome: "Castelfranco Veneto", sigla_prov: "TV", nome_prov: "Treviso", nome_reg: "Veneto", cap: "31033" },
  { codice: "026039", nome: "Conegliano", sigla_prov: "TV", nome_prov: "Treviso", nome_reg: "Veneto", cap: "31015" },
  { codice: "026041", nome: "Montebelluna", sigla_prov: "TV", nome_prov: "Treviso", nome_reg: "Veneto", cap: "31044" },
  { codice: "026076", nome: "Vittorio Veneto", sigla_prov: "TV", nome_prov: "Treviso", nome_reg: "Veneto", cap: "31029" },
  // Belluno (BL)
  { codice: "025008", nome: "Belluno", sigla_prov: "BL", nome_prov: "Belluno", nome_reg: "Veneto", cap: "32100" },
  { codice: "025019", nome: "Cortina d'Ampezzo", sigla_prov: "BL", nome_prov: "Belluno", nome_reg: "Veneto", cap: "32043" },
  { codice: "025029", nome: "Feltre", sigla_prov: "BL", nome_prov: "Belluno", nome_reg: "Veneto", cap: "32032" },
  // Rovigo (RO)
  { codice: "029036", nome: "Rovigo", sigla_prov: "RO", nome_prov: "Rovigo", nome_reg: "Veneto", cap: "45100" },
  { codice: "029006", nome: "Adria", sigla_prov: "RO", nome_prov: "Rovigo", nome_reg: "Veneto", cap: "45011" },
  { codice: "029048", nome: "Porto Viro", sigla_prov: "RO", nome_prov: "Rovigo", nome_reg: "Veneto", cap: "45014" },
  // =========================================================================
  // FRIULI-VENEZIA GIULIA
  // =========================================================================
  // Trieste (TS)
  { codice: "032006", nome: "Trieste", sigla_prov: "TS", nome_prov: "Trieste", nome_reg: "Friuli-Venezia Giulia", cap: "34100" },
  { codice: "032002", nome: "Duino Aurisina", sigla_prov: "TS", nome_prov: "Trieste", nome_reg: "Friuli-Venezia Giulia", cap: "34011" },
  { codice: "032003", nome: "Monrupino", sigla_prov: "TS", nome_prov: "Trieste", nome_reg: "Friuli-Venezia Giulia", cap: "34016" },
  // Udine (UD)
  { codice: "030129", nome: "Udine", sigla_prov: "UD", nome_prov: "Udine", nome_reg: "Friuli-Venezia Giulia", cap: "33100" },
  { codice: "030009", nome: "Cividale del Friuli", sigla_prov: "UD", nome_prov: "Udine", nome_reg: "Friuli-Venezia Giulia", cap: "33043" },
  { codice: "030074", nome: "Codroipo", sigla_prov: "UD", nome_prov: "Udine", nome_reg: "Friuli-Venezia Giulia", cap: "33033" },
  { codice: "030118", nome: "Tolmezzo", sigla_prov: "UD", nome_prov: "Udine", nome_reg: "Friuli-Venezia Giulia", cap: "33028" },
  // Gorizia (GO)
  { codice: "031007", nome: "Gorizia", sigla_prov: "GO", nome_prov: "Gorizia", nome_reg: "Friuli-Venezia Giulia", cap: "34170" },
  { codice: "031017", nome: "Monfalcone", sigla_prov: "GO", nome_prov: "Gorizia", nome_reg: "Friuli-Venezia Giulia", cap: "34074" },
  // Pordenone (PN)
  { codice: "093033", nome: "Pordenone", sigla_prov: "PN", nome_prov: "Pordenone", nome_reg: "Friuli-Venezia Giulia", cap: "33170" },
  { codice: "093007", nome: "Sacile", sigla_prov: "PN", nome_prov: "Pordenone", nome_reg: "Friuli-Venezia Giulia", cap: "33077" },
  { codice: "093004", nome: "San Vito al Tagliamento", sigla_prov: "PN", nome_prov: "Pordenone", nome_reg: "Friuli-Venezia Giulia", cap: "33078" },
  // =========================================================================
  // EMILIA-ROMAGNA
  // =========================================================================
  // Bologna (BO)
  { codice: "037006", nome: "Bologna", sigla_prov: "BO", nome_prov: "Bologna", nome_reg: "Emilia-Romagna", cap: "40100" },
  { codice: "037001", nome: "Imola", sigla_prov: "BO", nome_prov: "Bologna", nome_reg: "Emilia-Romagna", cap: "40026" },
  { codice: "037062", nome: "San Lazzaro di Savena", sigla_prov: "BO", nome_prov: "Bologna", nome_reg: "Emilia-Romagna", cap: "40068" },
  { codice: "037040", nome: "Casalecchio di Reno", sigla_prov: "BO", nome_prov: "Bologna", nome_reg: "Emilia-Romagna", cap: "40033" },
  // Modena (MO)
  { codice: "036023", nome: "Modena", sigla_prov: "MO", nome_prov: "Modena", nome_reg: "Emilia-Romagna", cap: "41100" },
  { codice: "036004", nome: "Carpi", sigla_prov: "MO", nome_prov: "Modena", nome_reg: "Emilia-Romagna", cap: "41012" },
  { codice: "036014", nome: "Sassuolo", sigla_prov: "MO", nome_prov: "Modena", nome_reg: "Emilia-Romagna", cap: "41049" },
  { codice: "036007", nome: "Formigine", sigla_prov: "MO", nome_prov: "Modena", nome_reg: "Emilia-Romagna", cap: "41043" },
  // Parma (PR)
  { codice: "034027", nome: "Parma", sigla_prov: "PR", nome_prov: "Parma", nome_reg: "Emilia-Romagna", cap: "43100" },
  { codice: "034004", nome: "Fidenza", sigla_prov: "PR", nome_prov: "Parma", nome_reg: "Emilia-Romagna", cap: "43036" },
  { codice: "034006", nome: "Salsomaggiore Terme", sigla_prov: "PR", nome_prov: "Parma", nome_reg: "Emilia-Romagna", cap: "43039" },
  // Reggio Emilia (RE)
  { codice: "035033", nome: "Reggio nell'Emilia", sigla_prov: "RE", nome_prov: "Reggio nell'Emilia", nome_reg: "Emilia-Romagna", cap: "42100" },
  { codice: "035007", nome: "Correggio", sigla_prov: "RE", nome_prov: "Reggio nell'Emilia", nome_reg: "Emilia-Romagna", cap: "42015" },
  { codice: "035031", nome: "Scandiano", sigla_prov: "RE", nome_prov: "Reggio nell'Emilia", nome_reg: "Emilia-Romagna", cap: "42019" },
  // Ferrara (FE)
  { codice: "038008", nome: "Ferrara", sigla_prov: "FE", nome_prov: "Ferrara", nome_reg: "Emilia-Romagna", cap: "44100" },
  { codice: "038004", nome: "Cento", sigla_prov: "FE", nome_prov: "Ferrara", nome_reg: "Emilia-Romagna", cap: "44042" },
  { codice: "038015", nome: "Comacchio", sigla_prov: "FE", nome_prov: "Ferrara", nome_reg: "Emilia-Romagna", cap: "44022" },
  // Forlì-Cesena (FC)
  { codice: "040015", nome: "Forlì", sigla_prov: "FC", nome_prov: "Forlì-Cesena", nome_reg: "Emilia-Romagna", cap: "47100" },
  { codice: "040007", nome: "Cesena", sigla_prov: "FC", nome_prov: "Forlì-Cesena", nome_reg: "Emilia-Romagna", cap: "47521" },
  { codice: "040044", nome: "Cesenatico", sigla_prov: "FC", nome_prov: "Forlì-Cesena", nome_reg: "Emilia-Romagna", cap: "47042" },
  // Ravenna (RA)
  { codice: "039014", nome: "Ravenna", sigla_prov: "RA", nome_prov: "Ravenna", nome_reg: "Emilia-Romagna", cap: "48100" },
  { codice: "039004", nome: "Faenza", sigla_prov: "RA", nome_prov: "Ravenna", nome_reg: "Emilia-Romagna", cap: "48018" },
  { codice: "039009", nome: "Lugo", sigla_prov: "RA", nome_prov: "Ravenna", nome_reg: "Emilia-Romagna", cap: "48022" },
  // Rimini (RN)
  { codice: "099028", nome: "Rimini", sigla_prov: "RN", nome_prov: "Rimini", nome_reg: "Emilia-Romagna", cap: "47900" },
  { codice: "099002", nome: "Cattolica", sigla_prov: "RN", nome_prov: "Rimini", nome_reg: "Emilia-Romagna", cap: "47841" },
  { codice: "099015", nome: "Riccione", sigla_prov: "RN", nome_prov: "Rimini", nome_reg: "Emilia-Romagna", cap: "47838" },
  { codice: "099034", nome: "Santarcangelo di Romagna", sigla_prov: "RN", nome_prov: "Rimini", nome_reg: "Emilia-Romagna", cap: "47822" },
  // Piacenza (PC)
  { codice: "033036", nome: "Piacenza", sigla_prov: "PC", nome_prov: "Piacenza", nome_reg: "Emilia-Romagna", cap: "29100" },
  { codice: "033005", nome: "Castel San Giovanni", sigla_prov: "PC", nome_prov: "Piacenza", nome_reg: "Emilia-Romagna", cap: "29015" },
  { codice: "033027", nome: "Fiorenzuola d'Arda", sigla_prov: "PC", nome_prov: "Piacenza", nome_reg: "Emilia-Romagna", cap: "29017" },
  // =========================================================================
  // TOSCANA
  // =========================================================================
  // Firenze (FI)
  { codice: "048017", nome: "Firenze", sigla_prov: "FI", nome_prov: "Firenze", nome_reg: "Toscana", cap: "50100" },
  { codice: "048001", nome: "Bagno a Ripoli", sigla_prov: "FI", nome_prov: "Firenze", nome_reg: "Toscana", cap: "50012" },
  { codice: "048008", nome: "Campi Bisenzio", sigla_prov: "FI", nome_prov: "Firenze", nome_reg: "Toscana", cap: "50013" },
  { codice: "048038", nome: "Scandicci", sigla_prov: "FI", nome_prov: "Firenze", nome_reg: "Toscana", cap: "50018" },
  { codice: "048046", nome: "Sesto Fiorentino", sigla_prov: "FI", nome_prov: "Firenze", nome_reg: "Toscana", cap: "50019" },
  // Siena (SI)
  { codice: "052032", nome: "Siena", sigla_prov: "SI", nome_prov: "Siena", nome_reg: "Toscana", cap: "53100" },
  { codice: "052007", nome: "Chiusi", sigla_prov: "SI", nome_prov: "Siena", nome_reg: "Toscana", cap: "53043" },
  { codice: "052011", nome: "Colle di Val d'Elsa", sigla_prov: "SI", nome_prov: "Siena", nome_reg: "Toscana", cap: "53034" },
  { codice: "052026", nome: "Montepulciano", sigla_prov: "SI", nome_prov: "Siena", nome_reg: "Toscana", cap: "53045" },
  // Arezzo (AR)
  { codice: "051002", nome: "Arezzo", sigla_prov: "AR", nome_prov: "Arezzo", nome_reg: "Toscana", cap: "52100" },
  { codice: "051011", nome: "Cortona", sigla_prov: "AR", nome_prov: "Arezzo", nome_reg: "Toscana", cap: "52044" },
  { codice: "051030", nome: "Sansepolcro", sigla_prov: "AR", nome_prov: "Arezzo", nome_reg: "Toscana", cap: "52037" },
  // Pistoia (PT)
  { codice: "047014", nome: "Pistoia", sigla_prov: "PT", nome_prov: "Pistoia", nome_reg: "Toscana", cap: "51100" },
  { codice: "047024", nome: "Montecatini-Terme", sigla_prov: "PT", nome_prov: "Pistoia", nome_reg: "Toscana", cap: "51016" },
  // Prato (PO)
  { codice: "100003", nome: "Prato", sigla_prov: "PO", nome_prov: "Prato", nome_reg: "Toscana", cap: "59100" },
  // Lucca (LU)
  { codice: "046017", nome: "Lucca", sigla_prov: "LU", nome_prov: "Lucca", nome_reg: "Toscana", cap: "55100" },
  { codice: "046003", nome: "Camaiore", sigla_prov: "LU", nome_prov: "Lucca", nome_reg: "Toscana", cap: "55041" },
  { codice: "046028", nome: "Viareggio", sigla_prov: "LU", nome_prov: "Lucca", nome_reg: "Toscana", cap: "55049" },
  // Pisa (PI)
  { codice: "050026", nome: "Pisa", sigla_prov: "PI", nome_prov: "Pisa", nome_reg: "Toscana", cap: "56100" },
  { codice: "050009", nome: "Cascina", sigla_prov: "PI", nome_prov: "Pisa", nome_reg: "Toscana", cap: "56021" },
  { codice: "050023", nome: "Pontedera", sigla_prov: "PI", nome_prov: "Pisa", nome_reg: "Toscana", cap: "56025" },
  // Livorno (LI)
  { codice: "049009", nome: "Livorno", sigla_prov: "LI", nome_prov: "Livorno", nome_reg: "Toscana", cap: "57100" },
  { codice: "049005", nome: "Cecina", sigla_prov: "LI", nome_prov: "Livorno", nome_reg: "Toscana", cap: "57023" },
  { codice: "049019", nome: "Piombino", sigla_prov: "LI", nome_prov: "Livorno", nome_reg: "Toscana", cap: "57025" },
  // Grosseto (GR)
  { codice: "053012", nome: "Grosseto", sigla_prov: "GR", nome_prov: "Grosseto", nome_reg: "Toscana", cap: "58100" },
  { codice: "053019", nome: "Follonica", sigla_prov: "GR", nome_prov: "Grosseto", nome_reg: "Toscana", cap: "58022" },
  { codice: "053027", nome: "Orbetello", sigla_prov: "GR", nome_prov: "Grosseto", nome_reg: "Toscana", cap: "58015" },
  // Massa-Carrara (MS)
  { codice: "045011", nome: "Massa", sigla_prov: "MS", nome_prov: "Massa-Carrara", nome_reg: "Toscana", cap: "54100" },
  { codice: "045003", nome: "Carrara", sigla_prov: "MS", nome_prov: "Massa-Carrara", nome_reg: "Toscana", cap: "54033" },
  // =========================================================================
  // UMBRIA
  // =========================================================================
  // Perugia (PG)
  { codice: "054039", nome: "Perugia", sigla_prov: "PG", nome_prov: "Perugia", nome_reg: "Umbria", cap: "06100" },
  { codice: "054002", nome: "Assisi", sigla_prov: "PG", nome_prov: "Perugia", nome_reg: "Umbria", cap: "06081" },
  { codice: "054026", nome: "Foligno", sigla_prov: "PG", nome_prov: "Perugia", nome_reg: "Umbria", cap: "06034" },
  { codice: "054052", nome: "Spoleto", sigla_prov: "PG", nome_prov: "Perugia", nome_reg: "Umbria", cap: "06049" },
  { codice: "054061", nome: "Città di Castello", sigla_prov: "PG", nome_prov: "Perugia", nome_reg: "Umbria", cap: "06012" },
  // Terni (TR)
  { codice: "055032", nome: "Terni", sigla_prov: "TR", nome_prov: "Terni", nome_reg: "Umbria", cap: "05100" },
  { codice: "055004", nome: "Amelia", sigla_prov: "TR", nome_prov: "Terni", nome_reg: "Umbria", cap: "05022" },
  { codice: "055018", nome: "Narni", sigla_prov: "TR", nome_prov: "Terni", nome_reg: "Umbria", cap: "05035" },
  { codice: "055021", nome: "Orvieto", sigla_prov: "TR", nome_prov: "Terni", nome_reg: "Umbria", cap: "05018" },
  // =========================================================================
  // MARCHE
  // =========================================================================
  // Ancona (AN)
  { codice: "042002", nome: "Ancona", sigla_prov: "AN", nome_prov: "Ancona", nome_reg: "Marche", cap: "60100" },
  { codice: "042008", nome: "Falconara Marittima", sigla_prov: "AN", nome_prov: "Ancona", nome_reg: "Marche", cap: "60015" },
  { codice: "042024", nome: "Jesi", sigla_prov: "AN", nome_prov: "Ancona", nome_reg: "Marche", cap: "60035" },
  { codice: "042042", nome: "Senigallia", sigla_prov: "AN", nome_prov: "Ancona", nome_reg: "Marche", cap: "60019" },
  // Pesaro e Urbino (PU)
  { codice: "041038", nome: "Pesaro", sigla_prov: "PU", nome_prov: "Pesaro e Urbino", nome_reg: "Marche", cap: "61100" },
  { codice: "041063", nome: "Urbino", sigla_prov: "PU", nome_prov: "Pesaro e Urbino", nome_reg: "Marche", cap: "61029" },
  { codice: "041014", nome: "Fano", sigla_prov: "PU", nome_prov: "Pesaro e Urbino", nome_reg: "Marche", cap: "61032" },
  // Macerata (MC)
  { codice: "043022", nome: "Macerata", sigla_prov: "MC", nome_prov: "Macerata", nome_reg: "Marche", cap: "62100" },
  { codice: "043016", nome: "Civitanova Marche", sigla_prov: "MC", nome_prov: "Macerata", nome_reg: "Marche", cap: "62012" },
  { codice: "043028", nome: "Porto Recanati", sigla_prov: "MC", nome_prov: "Macerata", nome_reg: "Marche", cap: "62017" },
  // Ascoli Piceno (AP)
  { codice: "044003", nome: "Ascoli Piceno", sigla_prov: "AP", nome_prov: "Ascoli Piceno", nome_reg: "Marche", cap: "63100" },
  { codice: "044049", nome: "San Benedetto del Tronto", sigla_prov: "AP", nome_prov: "Ascoli Piceno", nome_reg: "Marche", cap: "63074" },
  // Fermo (FM)
  { codice: "109013", nome: "Fermo", sigla_prov: "FM", nome_prov: "Fermo", nome_reg: "Marche", cap: "63900" },
  { codice: "109001", nome: "Amandola", sigla_prov: "FM", nome_prov: "Fermo", nome_reg: "Marche", cap: "63857" },
  { codice: "109027", nome: "Porto San Giorgio", sigla_prov: "FM", nome_prov: "Fermo", nome_reg: "Marche", cap: "63822" },
  // =========================================================================
  // LAZIO
  // =========================================================================
  // Roma (RM)
  { codice: "058091", nome: "Roma", sigla_prov: "RM", nome_prov: "Roma", nome_reg: "Lazio", cap: "00100" },
  { codice: "058014", nome: "Civitavecchia", sigla_prov: "RM", nome_prov: "Roma", nome_reg: "Lazio", cap: "00053" },
  { codice: "058007", nome: "Velletri", sigla_prov: "RM", nome_prov: "Roma", nome_reg: "Lazio", cap: "00049" },
  { codice: "058006", nome: "Guidonia Montecelio", sigla_prov: "RM", nome_prov: "Roma", nome_reg: "Lazio", cap: "00012" },
  { codice: "058108", nome: "Tivoli", sigla_prov: "RM", nome_prov: "Roma", nome_reg: "Lazio", cap: "00019" },
  { codice: "058097", nome: "Anzio", sigla_prov: "RM", nome_prov: "Roma", nome_reg: "Lazio", cap: "00042" },
  // Viterbo (VT)
  { codice: "056059", nome: "Viterbo", sigla_prov: "VT", nome_prov: "Viterbo", nome_reg: "Lazio", cap: "01100" },
  { codice: "056029", nome: "Montefiascone", sigla_prov: "VT", nome_prov: "Viterbo", nome_reg: "Lazio", cap: "01027" },
  { codice: "056032", nome: "Tarquinia", sigla_prov: "VT", nome_prov: "Viterbo", nome_reg: "Lazio", cap: "01016" },
  // Rieti (RI)
  { codice: "057052", nome: "Rieti", sigla_prov: "RI", nome_prov: "Rieti", nome_reg: "Lazio", cap: "02100" },
  { codice: "057021", nome: "Fara in Sabina", sigla_prov: "RI", nome_prov: "Rieti", nome_reg: "Lazio", cap: "02032" },
  // Latina (LT)
  { codice: "059012", nome: "Latina", sigla_prov: "LT", nome_prov: "Latina", nome_reg: "Lazio", cap: "04100" },
  { codice: "059009", nome: "Aprilia", sigla_prov: "LT", nome_prov: "Latina", nome_reg: "Lazio", cap: "04011" },
  { codice: "059021", nome: "Formia", sigla_prov: "LT", nome_prov: "Latina", nome_reg: "Lazio", cap: "04023" },
  { codice: "059028", nome: "Terracina", sigla_prov: "LT", nome_prov: "Latina", nome_reg: "Lazio", cap: "04019" },
  // Frosinone (FR)
  { codice: "060038", nome: "Frosinone", sigla_prov: "FR", nome_prov: "Frosinone", nome_reg: "Lazio", cap: "03100" },
  { codice: "060020", nome: "Cassino", sigla_prov: "FR", nome_prov: "Frosinone", nome_reg: "Lazio", cap: "03043" },
  { codice: "060057", nome: "Sora", sigla_prov: "FR", nome_prov: "Frosinone", nome_reg: "Lazio", cap: "03039" },
  // =========================================================================
  // ABRUZZO
  // =========================================================================
  // L'Aquila (AQ)
  { codice: "066049", nome: "L'Aquila", sigla_prov: "AQ", nome_prov: "L'Aquila", nome_reg: "Abruzzo", cap: "67100" },
  { codice: "066001", nome: "Avezzano", sigla_prov: "AQ", nome_prov: "L'Aquila", nome_reg: "Abruzzo", cap: "67051" },
  { codice: "066087", nome: "Sulmona", sigla_prov: "AQ", nome_prov: "L'Aquila", nome_reg: "Abruzzo", cap: "67039" },
  // Teramo (TE)
  { codice: "067041", nome: "Teramo", sigla_prov: "TE", nome_prov: "Teramo", nome_reg: "Abruzzo", cap: "64100" },
  { codice: "067006", nome: "Giulianova", sigla_prov: "TE", nome_prov: "Teramo", nome_reg: "Abruzzo", cap: "64021" },
  { codice: "067038", nome: "Roseto degli Abruzzi", sigla_prov: "TE", nome_prov: "Teramo", nome_reg: "Abruzzo", cap: "64026" },
  // Pescara (PE)
  { codice: "068028", nome: "Pescara", sigla_prov: "PE", nome_prov: "Pescara", nome_reg: "Abruzzo", cap: "65100" },
  { codice: "068003", nome: "Montesilvano", sigla_prov: "PE", nome_prov: "Pescara", nome_reg: "Abruzzo", cap: "65015" },
  // Chieti (CH)
  { codice: "069021", nome: "Chieti", sigla_prov: "CH", nome_prov: "Chieti", nome_reg: "Abruzzo", cap: "66100" },
  { codice: "069006", nome: "Francavilla al Mare", sigla_prov: "CH", nome_prov: "Chieti", nome_reg: "Abruzzo", cap: "66023" },
  { codice: "069073", nome: "Ortona", sigla_prov: "CH", nome_prov: "Chieti", nome_reg: "Abruzzo", cap: "66026" },
  { codice: "069044", nome: "Lanciano", sigla_prov: "CH", nome_prov: "Chieti", nome_reg: "Abruzzo", cap: "66034" },
  { codice: "069098", nome: "Vasto", sigla_prov: "CH", nome_prov: "Chieti", nome_reg: "Abruzzo", cap: "66054" },
  // =========================================================================
  // MOLISE
  // =========================================================================
  // Campobasso (CB)
  { codice: "070006", nome: "Campobasso", sigla_prov: "CB", nome_prov: "Campobasso", nome_reg: "Molise", cap: "86100" },
  { codice: "070019", nome: "Isernia", sigla_prov: "IS", nome_prov: "Isernia", nome_reg: "Molise", cap: "86170" },
  { codice: "070009", nome: "Termoli", sigla_prov: "CB", nome_prov: "Campobasso", nome_reg: "Molise", cap: "86039" },
  // Isernia (IS)
  { codice: "094023", nome: "Venafro", sigla_prov: "IS", nome_prov: "Isernia", nome_reg: "Molise", cap: "86079" },
  // =========================================================================
  // CAMPANIA
  // =========================================================================
  // Napoli (NA)
  { codice: "063049", nome: "Napoli", sigla_prov: "NA", nome_prov: "Napoli", nome_reg: "Campania", cap: "80100" },
  { codice: "063001", nome: "Acerra", sigla_prov: "NA", nome_prov: "Napoli", nome_reg: "Campania", cap: "80011" },
  { codice: "063021", nome: "Ercolano", sigla_prov: "NA", nome_prov: "Napoli", nome_reg: "Campania", cap: "80056" },
  { codice: "063041", nome: "Giugliano in Campania", sigla_prov: "NA", nome_prov: "Napoli", nome_reg: "Campania", cap: "80014" },
  { codice: "063044", nome: "Portici", sigla_prov: "NA", nome_prov: "Napoli", nome_reg: "Campania", cap: "80055" },
  { codice: "063061", nome: "Pozzuoli", sigla_prov: "NA", nome_prov: "Napoli", nome_reg: "Campania", cap: "80078" },
  { codice: "063066", nome: "Torre del Greco", sigla_prov: "NA", nome_prov: "Napoli", nome_reg: "Campania", cap: "80059" },
  // Salerno (SA)
  { codice: "065108", nome: "Salerno", sigla_prov: "SA", nome_prov: "Salerno", nome_reg: "Campania", cap: "84100" },
  { codice: "065009", nome: "Battipaglia", sigla_prov: "SA", nome_prov: "Salerno", nome_reg: "Campania", cap: "84091" },
  { codice: "065091", nome: "Nocera Inferiore", sigla_prov: "SA", nome_prov: "Salerno", nome_reg: "Campania", cap: "84014" },
  // Caserta (CE)
  { codice: "061023", nome: "Caserta", sigla_prov: "CE", nome_prov: "Caserta", nome_reg: "Campania", cap: "81100" },
  { codice: "061014", nome: "Aversa", sigla_prov: "CE", nome_prov: "Caserta", nome_reg: "Campania", cap: "81031" },
  { codice: "061041", nome: "Mondragone", sigla_prov: "CE", nome_prov: "Caserta", nome_reg: "Campania", cap: "81034" },
  // Avellino (AV)
  { codice: "064007", nome: "Avellino", sigla_prov: "AV", nome_prov: "Avellino", nome_reg: "Campania", cap: "83100" },
  { codice: "064002", nome: "Ariano Irpino", sigla_prov: "AV", nome_prov: "Avellino", nome_reg: "Campania", cap: "83031" },
  // Benevento (BN)
  { codice: "062009", nome: "Benevento", sigla_prov: "BN", nome_prov: "Benevento", nome_reg: "Campania", cap: "82100" },
  // =========================================================================
  // PUGLIA
  // =========================================================================
  // Bari (BA)
  { codice: "072006", nome: "Bari", sigla_prov: "BA", nome_prov: "Bari", nome_reg: "Puglia", cap: "70100" },
  { codice: "072003", nome: "Altamura", sigla_prov: "BA", nome_prov: "Bari", nome_reg: "Puglia", cap: "70022" },
  { codice: "072009", nome: "Bitonto", sigla_prov: "BA", nome_prov: "Bari", nome_reg: "Puglia", cap: "70032" },
  { codice: "072018", nome: "Modugno", sigla_prov: "BA", nome_prov: "Bari", nome_reg: "Puglia", cap: "70026" },
  { codice: "072019", nome: "Mola di Bari", sigla_prov: "BA", nome_prov: "Bari", nome_reg: "Puglia", cap: "70042" },
  // Taranto (TA)
  { codice: "073027", nome: "Taranto", sigla_prov: "TA", nome_prov: "Taranto", nome_reg: "Puglia", cap: "74100" },
  { codice: "073003", nome: "Grottaglie", sigla_prov: "TA", nome_prov: "Taranto", nome_reg: "Puglia", cap: "74023" },
  { codice: "073013", nome: "Manduria", sigla_prov: "TA", nome_prov: "Taranto", nome_reg: "Puglia", cap: "74024" },
  // Lecce (LE)
  { codice: "075036", nome: "Lecce", sigla_prov: "LE", nome_prov: "Lecce", nome_reg: "Puglia", cap: "73100" },
  { codice: "075016", nome: "Gallipoli", sigla_prov: "LE", nome_prov: "Lecce", nome_reg: "Puglia", cap: "73014" },
  { codice: "075058", nome: "Nardò", sigla_prov: "LE", nome_prov: "Lecce", nome_reg: "Puglia", cap: "73048" },
  { codice: "075067", nome: "Galatina", sigla_prov: "LE", nome_prov: "Lecce", nome_reg: "Puglia", cap: "73013" },
  // Foggia (FG)
  { codice: "071024", nome: "Foggia", sigla_prov: "FG", nome_prov: "Foggia", nome_reg: "Puglia", cap: "71100" },
  { codice: "071005", nome: "Cerignola", sigla_prov: "FG", nome_prov: "Foggia", nome_reg: "Puglia", cap: "71042" },
  { codice: "071022", nome: "Manfredonia", sigla_prov: "FG", nome_prov: "Foggia", nome_reg: "Puglia", cap: "71043" },
  { codice: "071048", nome: "Lucera", sigla_prov: "FG", nome_prov: "Foggia", nome_reg: "Puglia", cap: "71036" },
  // Brindisi (BR)
  { codice: "074002", nome: "Brindisi", sigla_prov: "BR", nome_prov: "Brindisi", nome_reg: "Puglia", cap: "72100" },
  { codice: "074001", nome: "Fasano", sigla_prov: "BR", nome_prov: "Brindisi", nome_reg: "Puglia", cap: "72015" },
  { codice: "074008", nome: "Ostuni", sigla_prov: "BR", nome_prov: "Brindisi", nome_reg: "Puglia", cap: "72017" },
  // Barletta-Andria-Trani (BT)
  { codice: "110001", nome: "Andria", sigla_prov: "BT", nome_prov: "Barletta-Andria-Trani", nome_reg: "Puglia", cap: "76123" },
  { codice: "110002", nome: "Barletta", sigla_prov: "BT", nome_prov: "Barletta-Andria-Trani", nome_reg: "Puglia", cap: "76121" },
  { codice: "110009", nome: "Trani", sigla_prov: "BT", nome_prov: "Barletta-Andria-Trani", nome_reg: "Puglia", cap: "76125" },
  // =========================================================================
  // BASILICATA
  // =========================================================================
  // Potenza (PZ)
  { codice: "076063", nome: "Potenza", sigla_prov: "PZ", nome_prov: "Potenza", nome_reg: "Basilicata", cap: "85100" },
  { codice: "076095", nome: "Melfi", sigla_prov: "PZ", nome_prov: "Potenza", nome_reg: "Basilicata", cap: "85025" },
  { codice: "076079", nome: "Lagonegro", sigla_prov: "PZ", nome_prov: "Potenza", nome_reg: "Basilicata", cap: "85042" },
  // Matera (MT)
  { codice: "077014", nome: "Matera", sigla_prov: "MT", nome_prov: "Matera", nome_reg: "Basilicata", cap: "75100" },
  { codice: "077004", nome: "Bernalda", sigla_prov: "MT", nome_prov: "Matera", nome_reg: "Basilicata", cap: "75012" },
  { codice: "077025", nome: "Pisticci", sigla_prov: "MT", nome_prov: "Matera", nome_reg: "Basilicata", cap: "75015" },
  // =========================================================================
  // CALABRIA
  // =========================================================================
  // Reggio Calabria (RC)
  { codice: "080063", nome: "Reggio Calabria", sigla_prov: "RC", nome_prov: "Reggio di Calabria", nome_reg: "Calabria", cap: "89100" },
  { codice: "080006", nome: "Gioia Tauro", sigla_prov: "RC", nome_prov: "Reggio di Calabria", nome_reg: "Calabria", cap: "89013" },
  { codice: "080072", nome: "Locri", sigla_prov: "RC", nome_prov: "Reggio di Calabria", nome_reg: "Calabria", cap: "89044" },
  // Catanzaro (CZ)
  { codice: "079023", nome: "Catanzaro", sigla_prov: "CZ", nome_prov: "Catanzaro", nome_reg: "Calabria", cap: "88100" },
  { codice: "079100", nome: "Lamezia Terme", sigla_prov: "CZ", nome_prov: "Catanzaro", nome_reg: "Calabria", cap: "88046" },
  { codice: "079028", nome: "Soverato", sigla_prov: "CZ", nome_prov: "Catanzaro", nome_reg: "Calabria", cap: "88068" },
  // Cosenza (CS)
  { codice: "078042", nome: "Cosenza", sigla_prov: "CS", nome_prov: "Cosenza", nome_reg: "Calabria", cap: "87100" },
  { codice: "078084", nome: "Corigliano-Rossano", sigla_prov: "CS", nome_prov: "Cosenza", nome_reg: "Calabria", cap: "87064" },
  { codice: "078152", nome: "Rende", sigla_prov: "CS", nome_prov: "Cosenza", nome_reg: "Calabria", cap: "87036" },
  { codice: "078068", nome: "Paola", sigla_prov: "CS", nome_prov: "Cosenza", nome_reg: "Calabria", cap: "87027" },
  // Vibo Valentia (VV)
  { codice: "102044", nome: "Vibo Valentia", sigla_prov: "VV", nome_prov: "Vibo Valentia", nome_reg: "Calabria", cap: "89900" },
  { codice: "102028", nome: "Pizzo", sigla_prov: "VV", nome_prov: "Vibo Valentia", nome_reg: "Calabria", cap: "89812" },
  // Crotone (KR)
  { codice: "101011", nome: "Crotone", sigla_prov: "KR", nome_prov: "Crotone", nome_reg: "Calabria", cap: "88900" },
  { codice: "101004", nome: "Cirò Marina", sigla_prov: "KR", nome_prov: "Crotone", nome_reg: "Calabria", cap: "88811" },
  // =========================================================================
  // SICILIA
  // =========================================================================
  // Palermo (PA)
  { codice: "082053", nome: "Palermo", sigla_prov: "PA", nome_prov: "Palermo", nome_reg: "Sicilia", cap: "90100" },
  { codice: "082002", nome: "Bagheria", sigla_prov: "PA", nome_prov: "Palermo", nome_reg: "Sicilia", cap: "90011" },
  { codice: "082022", nome: "Carini", sigla_prov: "PA", nome_prov: "Palermo", nome_reg: "Sicilia", cap: "90044" },
  { codice: "082054", nome: "Marsala", sigla_prov: "TP", nome_prov: "Trapani", nome_reg: "Sicilia", cap: "91025" },
  { codice: "082061", nome: "Monreale", sigla_prov: "PA", nome_prov: "Palermo", nome_reg: "Sicilia", cap: "90046" },
  // Catania (CT)
  { codice: "087015", nome: "Catania", sigla_prov: "CT", nome_prov: "Catania", nome_reg: "Sicilia", cap: "95100" },
  { codice: "087002", nome: "Acireale", sigla_prov: "CT", nome_prov: "Catania", nome_reg: "Sicilia", cap: "95024" },
  { codice: "087009", nome: "Biancavilla", sigla_prov: "CT", nome_prov: "Catania", nome_reg: "Sicilia", cap: "95033" },
  { codice: "087011", nome: "Caltagirone", sigla_prov: "CT", nome_prov: "Catania", nome_reg: "Sicilia", cap: "95041" },
  { codice: "087057", nome: "Paternò", sigla_prov: "CT", nome_prov: "Catania", nome_reg: "Sicilia", cap: "95047" },
  // Messina (ME)
  { codice: "083048", nome: "Messina", sigla_prov: "ME", nome_prov: "Messina", nome_reg: "Sicilia", cap: "98100" },
  { codice: "083002", nome: "Milazzo", sigla_prov: "ME", nome_prov: "Messina", nome_reg: "Sicilia", cap: "98057" },
  { codice: "083029", nome: "Barcellona Pozzo di Gotto", sigla_prov: "ME", nome_prov: "Messina", nome_reg: "Sicilia", cap: "98051" },
  // Agrigento (AG)
  { codice: "084002", nome: "Agrigento", sigla_prov: "AG", nome_prov: "Agrigento", nome_reg: "Sicilia", cap: "92100" },
  { codice: "084003", nome: "Canicattì", sigla_prov: "AG", nome_prov: "Agrigento", nome_reg: "Sicilia", cap: "92024" },
  { codice: "084025", nome: "Licata", sigla_prov: "AG", nome_prov: "Agrigento", nome_reg: "Sicilia", cap: "92027" },
  { codice: "084033", nome: "Porto Empedocle", sigla_prov: "AG", nome_prov: "Agrigento", nome_reg: "Sicilia", cap: "92014" },
  // Ragusa (RG)
  { codice: "088009", nome: "Ragusa", sigla_prov: "RG", nome_prov: "Ragusa", nome_reg: "Sicilia", cap: "97100" },
  { codice: "088003", nome: "Comiso", sigla_prov: "RG", nome_prov: "Ragusa", nome_reg: "Sicilia", cap: "97013" },
  { codice: "088010", nome: "Vittoria", sigla_prov: "RG", nome_prov: "Ragusa", nome_reg: "Sicilia", cap: "97019" },
  // Siracusa (SR)
  { codice: "089018", nome: "Siracusa", sigla_prov: "SR", nome_prov: "Siracusa", nome_reg: "Sicilia", cap: "96100" },
  { codice: "089005", nome: "Augusta", sigla_prov: "SR", nome_prov: "Siracusa", nome_reg: "Sicilia", cap: "96011" },
  { codice: "089011", nome: "Noto", sigla_prov: "SR", nome_prov: "Siracusa", nome_reg: "Sicilia", cap: "96017" },
  // Trapani (TP)
  { codice: "081021", nome: "Trapani", sigla_prov: "TP", nome_prov: "Trapani", nome_reg: "Sicilia", cap: "91100" },
  { codice: "081003", nome: "Alcamo", sigla_prov: "TP", nome_prov: "Trapani", nome_reg: "Sicilia", cap: "91011" },
  { codice: "081010", nome: "Mazara del Vallo", sigla_prov: "TP", nome_prov: "Trapani", nome_reg: "Sicilia", cap: "91026" },
  // Caltanissetta (CL)
  { codice: "085006", nome: "Caltanissetta", sigla_prov: "CL", nome_prov: "Caltanissetta", nome_reg: "Sicilia", cap: "93100" },
  { codice: "085007", nome: "Gela", sigla_prov: "CL", nome_prov: "Caltanissetta", nome_reg: "Sicilia", cap: "93012" },
  { codice: "085005", nome: "Mussomeli", sigla_prov: "CL", nome_prov: "Caltanissetta", nome_reg: "Sicilia", cap: "93014" },
  // Enna (EN)
  { codice: "086010", nome: "Enna", sigla_prov: "EN", nome_prov: "Enna", nome_reg: "Sicilia", cap: "94100" },
  { codice: "086015", nome: "Nicosia", sigla_prov: "EN", nome_prov: "Enna", nome_reg: "Sicilia", cap: "94014" },
  { codice: "086017", nome: "Piazza Armerina", sigla_prov: "EN", nome_prov: "Enna", nome_reg: "Sicilia", cap: "94015" },
  // =========================================================================
  // SARDEGNA
  // =========================================================================
  // Cagliari (CA)
  { codice: "092009", nome: "Cagliari", sigla_prov: "CA", nome_prov: "Cagliari", nome_reg: "Sardegna", cap: "09100" },
  { codice: "092010", nome: "Capoterra", sigla_prov: "CA", nome_prov: "Cagliari", nome_reg: "Sardegna", cap: "09012" },
  { codice: "092072", nome: "Quartucciu", sigla_prov: "CA", nome_prov: "Cagliari", nome_reg: "Sardegna", cap: "09044" },
  { codice: "092090", nome: "Selargius", sigla_prov: "CA", nome_prov: "Cagliari", nome_reg: "Sardegna", cap: "09047" },
  // Sassari (SS)
  { codice: "090064", nome: "Sassari", sigla_prov: "SS", nome_prov: "Sassari", nome_reg: "Sardegna", cap: "07100" },
  { codice: "090012", nome: "Alghero", sigla_prov: "SS", nome_prov: "Sassari", nome_reg: "Sardegna", cap: "07041" },
  { codice: "090019", nome: "Porto Torres", sigla_prov: "SS", nome_prov: "Sassari", nome_reg: "Sardegna", cap: "07046" },
  { codice: "090038", nome: "Olbia", sigla_prov: "OT", nome_prov: "Olbia-Tempio", nome_reg: "Sardegna", cap: "07026" },
  // Nuoro (NU)
  { codice: "091056", nome: "Nuoro", sigla_prov: "NU", nome_prov: "Nuoro", nome_reg: "Sardegna", cap: "08100" },
  { codice: "091014", nome: "Dorgali", sigla_prov: "NU", nome_prov: "Nuoro", nome_reg: "Sardegna", cap: "08022" },
  { codice: "091088", nome: "Siniscola", sigla_prov: "NU", nome_prov: "Nuoro", nome_reg: "Sardegna", cap: "08029" },
  // Oristano (OR)
  { codice: "095044", nome: "Oristano", sigla_prov: "OR", nome_prov: "Oristano", nome_reg: "Sardegna", cap: "09170" },
  { codice: "095072", nome: "Cabras", sigla_prov: "OR", nome_prov: "Oristano", nome_reg: "Sardegna", cap: "09072" },
  // Sud Sardegna (SU)
  { codice: "111102", nome: "Carbonia", sigla_prov: "SU", nome_prov: "Sud Sardegna", nome_reg: "Sardegna", cap: "09013" },
  { codice: "111048", nome: "Iglesias", sigla_prov: "SU", nome_prov: "Sud Sardegna", nome_reg: "Sardegna", cap: "09016" },
  // Olbia-Tempio (OT)
  { codice: "104017", nome: "Tempio Pausania", sigla_prov: "OT", nome_prov: "Olbia-Tempio", nome_reg: "Sardegna", cap: "07029" },
  // Medio Campidano / Ogliastra
  { codice: "106011", nome: "Sanluri", sigla_prov: "VS", nome_prov: "Medio Campidano", nome_reg: "Sardegna", cap: "09025" },
  { codice: "105008", nome: "Lanusei", sigla_prov: "OG", nome_prov: "Ogliastra", nome_reg: "Sardegna", cap: "08045" }
];
function seedComuniIstat(db2) {
  const row = db2.prepare("SELECT COUNT(*) AS cnt FROM comuni_istat").get();
  if (row && row.cnt > 0) {
    console.log(`[istat-seed] comuni_istat already populated (${row.cnt} rows). Skipping seed.`);
    return 0;
  }
  const insert = db2.prepare(`
    INSERT OR IGNORE INTO comuni_istat
      (codice, nome, sigla_prov, nome_prov, nome_reg, cap)
    VALUES
      (@codice, @nome, @sigla_prov, @nome_prov, @nome_reg, @cap)
  `);
  const insertMany = db2.transaction((comuni2) => {
    for (const c of comuni2) {
      insert.run(c);
    }
  });
  insertMany(COMUNI_ISTAT);
  const inserted = COMUNI_ISTAT.length;
  console.log(`[istat-seed] Inserted ${inserted} comuni into comuni_istat.`);
  return inserted;
}
async function importComuniFromCsv(db2, csvPath) {
  const fs2 = await import("fs");
  const path2 = await import("path");
  if (!fs2.existsSync(csvPath)) {
    throw new Error(`[istat-seed] CSV file not found: ${csvPath}`);
  }
  const raw = fs2.readFileSync(csvPath, "utf-8");
  const firstLine = raw.split(/\r?\n/)[0];
  const sep = firstLine.includes(";") ? ";" : ",";
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("[istat-seed] CSV file has no data rows.");
  }
  const headers = lines[0].split(sep).map((h) => h.trim().replace(/^["']|["']$/g, "").toUpperCase());
  const colIndex = (candidates) => {
    for (const c of candidates) {
      const idx = headers.indexOf(c);
      if (idx !== -1) return idx;
    }
    return -1;
  };
  const iCodice = colIndex(["CODICE_COMUNE", "CODICE", "COD_COMUNE", "codice"]);
  const iNome = colIndex(["DENOMINAZIONE_COMUNE", "NOME", "DENOMINAZIONE", "COMUNE"]);
  const iSigla = colIndex(["sigla_prov", "SIGLA_PROV", "SIGLA", "PROV"]);
  const iNomeProv = colIndex(["DENOMINAZIONE_PROVINCIA", "nome_prov", "NOME_PROV", "PROVINCIA"]);
  const iNomeReg = colIndex(["DENOMINAZIONE_REGIONE", "nome_reg", "NOME_REG", "REGIONE"]);
  const iCap = colIndex(["CAP"]);
  if (iCodice === -1 || iNome === -1) {
    throw new Error(
      `[istat-seed] Could not find required columns (CODICE_COMUNE, DENOMINAZIONE_COMUNE) in CSV header: ${headers.join(", ")}`
    );
  }
  function parseCsvLine(line, separator) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === separator && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }
  const upsert = db2.prepare(`
    INSERT INTO comuni_istat
      (codice, nome, sigla_prov, nome_prov, nome_reg, cap)
    VALUES
      (@codice, @nome, @sigla_prov, @nome_prov, @nome_reg, @cap)
    ON CONFLICT(codice) DO UPDATE SET
      nome           = excluded.nome,
      sigla_prov = excluded.sigla_prov,
      nome_prov  = excluded.nome_prov,
      nome_reg    = excluded.nome_reg,
      cap             = excluded.cap
  `);
  const get = (fields, idx) => idx !== -1 && fields[idx] !== void 0 ? fields[idx] : "";
  const importMany = db2.transaction((dataLines2) => {
    let count2 = 0;
    for (const line of dataLines2) {
      if (!line.trim()) continue;
      const fields = parseCsvLine(line, sep);
      const record = {
        codice: get(fields, iCodice).padStart(6, "0"),
        nome: get(fields, iNome),
        sigla_prov: get(fields, iSigla),
        nome_prov: get(fields, iNomeProv),
        nome_reg: get(fields, iNomeReg),
        cap: get(fields, iCap)
      };
      if (!record.codice || !record.nome) continue;
      upsert.run(record);
      count2++;
    }
    return count2;
  });
  const dataLines = lines.slice(1);
  const count = importMany(dataLines);
  console.log(`[istat-seed] Imported ${count} comuni from ${path2.basename(csvPath)}.`);
  return count;
}
let db;
let _docsPath;
function getDb() {
  if (!db) throw new Error("Database non inizializzato");
  return db;
}
function getDocsPath() {
  return _docsPath;
}
function initDb() {
  const userDataPath = electron.app.getPath("userData");
  const dbPath = path.join(userDataPath, "immobili.db");
  const docsPath = path.join(userDataPath, "documenti");
  const fotosPath2 = path.join(userDataPath, "foto");
  if (!fs.existsSync(docsPath)) fs.mkdirSync(docsPath, { recursive: true });
  if (!fs.existsSync(fotosPath2)) fs.mkdirSync(fotosPath2, { recursive: true });
  _docsPath = docsPath;
  db = new Database(dbPath);
  db.exec(SCHEMA);
  try {
    db.exec(`ALTER TABLE immobili ADD COLUMN sigla_prov TEXT`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE immobili ADD COLUMN lat REAL`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE immobili ADD COLUMN lng REAL`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE spese ADD COLUMN pod TEXT`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE spese ADD COLUMN pdr TEXT`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE spese ADD COLUMN tipo_versamento TEXT DEFAULT 'saldo'`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE inquilini ADD COLUMN foto_path TEXT`);
  } catch {
  }
  try {
    db.exec(`ALTER TABLE inquilini ADD COLUMN metodo_pagamento_default TEXT DEFAULT 'contanti'`);
  } catch {
  }
  db.exec(`
    DELETE FROM alert WHERE id NOT IN (
      SELECT MIN(id) FROM alert GROUP BY tipo, entita_tipo, entita_id
    )
  `);
  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_alert_no_duplicati
    ON alert(tipo, entita_tipo, entita_id)
  `);
  seedComuniIstat(db);
  return { db, docsPath, fotosPath: fotosPath2, dbPath };
}
const database = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getDb,
  getDocsPath,
  initDb
}, Symbol.toStringTag, { value: "Module" }));
const comuni = {
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
};
const immobili = {
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
    `);
    return stmt.run(data);
  },
  update: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE immobili SET nome=@nome, indirizzo=@indirizzo, citta=@citta,
        cap=@cap, sigla_prov=@sigla_prov, tipo=@tipo, superficie_mq=@superficie_mq,
        valore_acquisto=@valore_acquisto, data_acquisto=@data_acquisto,
        lat=@lat, lng=@lng, note=@note, aggiornato_il=datetime('now')
      WHERE id=@id
    `);
    return stmt.run({ ...data, id });
  },
  delete: (id) => getDb().prepare(`DELETE FROM immobili WHERE id = ?`).run(id)
};
const utenze = {
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
    `);
    return stmt.run(data);
  },
  delete: (id) => getDb().prepare(`DELETE FROM immobili_utenze WHERE id = ?`).run(id)
};
const unita = {
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
    `);
    return stmt.run(data);
  },
  update: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE unita SET nome=@nome, tipo=@tipo, piano=@piano,
        superficie_mq=@superficie_mq, num_locali=@num_locali, descrizione=@descrizione
      WHERE id=@id
    `);
    return stmt.run({ ...data, id });
  },
  delete: (id) => getDb().prepare(`DELETE FROM unita WHERE id = ?`).run(id)
};
const inquilini = {
  getAll: () => getDb().prepare(`SELECT * FROM inquilini ORDER BY cognome, nome`).all(),
  getById: (id) => getDb().prepare(`SELECT * FROM inquilini WHERE id = ?`).get(id),
  create: (data) => {
    const stmt = getDb().prepare(`
      INSERT INTO inquilini (nome, cognome, codice_fiscale, telefono, email,
        tipo_documento, numero_documento, foto_path, metodo_pagamento_default, note)
      VALUES (@nome, @cognome, @codice_fiscale, @telefono, @email,
        @tipo_documento, @numero_documento, @foto_path, @metodo_pagamento_default, @note)
    `);
    return stmt.run(data);
  },
  update: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE inquilini SET nome=@nome, cognome=@cognome,
        codice_fiscale=@codice_fiscale, telefono=@telefono, email=@email,
        tipo_documento=@tipo_documento, numero_documento=@numero_documento,
        foto_path=@foto_path, metodo_pagamento_default=@metodo_pagamento_default, note=@note
      WHERE id=@id
    `);
    return stmt.run({ ...data, id });
  },
  delete: (id) => getDb().prepare(`DELETE FROM inquilini WHERE id = ?`).run(id)
};
const contratti = {
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
    `);
    return stmt.run(data);
  },
  update: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE contratti SET data_fine=@data_fine, canone_mensile=@canone_mensile,
        deposito=@deposito, giorno_pagamento=@giorno_pagamento,
        tipo_contratto=@tipo_contratto, stato=@stato, note=@note
      WHERE id=@id
    `);
    return stmt.run({ ...data, id });
  },
  delete: (id) => getDb().prepare(`DELETE FROM contratti WHERE id = ?`).run(id)
};
const pagamentiAffitto = {
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
    const conds = [];
    const params = [];
    if (filtri.immobile_id) {
      conds.push("i.id = ?");
      params.push(filtri.immobile_id);
    }
    if (filtri.anno) {
      conds.push("strftime('%Y', pa.data_scadenza) = ?");
      params.push(String(filtri.anno));
    }
    if (filtri.mese) {
      conds.push("strftime('%m', pa.data_scadenza) = ?");
      params.push(filtri.mese.padStart(2, "0"));
    }
    if (filtri.stato) {
      conds.push("pa.stato = ?");
      params.push(filtri.stato);
    }
    if (filtri.contratto_id) {
      conds.push("pa.contratto_id = ?");
      params.push(filtri.contratto_id);
    }
    const where = conds.length ? "WHERE " + conds.join(" AND ") : "";
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
    `).all(...params);
  },
  aggiorna: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE pagamenti_affitto
      SET importo=@importo, data_pagamento=@data_pagamento,
          metodo_pagamento=@metodo_pagamento, stato=@stato, note=@note
      WHERE id=@id
    `);
    return stmt.run({ ...data, id });
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
    `);
    return stmt.run(data);
  },
  pagaRata: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE pagamenti_affitto SET stato='pagato', data_pagamento=@data_pagamento,
        metodo_pagamento=@metodo_pagamento, note=@note
      WHERE id=@id
    `);
    return stmt.run({ ...data, id });
  },
  generaMensili: (contratto_id, mesi) => {
    const insert = getDb().prepare(`
      INSERT OR IGNORE INTO pagamenti_affitto
        (contratto_id, mese_riferimento, importo, data_scadenza, stato)
      VALUES (@contratto_id, @mese_riferimento, @importo, @data_scadenza, @stato)
    `);
    const insertMany = getDb().transaction((rows) => rows.forEach((r) => insert.run(r)));
    insertMany(mesi);
  },
  getIncassiMensiliPerAnno: (anno, immobile_id = null) => {
    const conds = [`strftime('%Y', pa.data_pagamento) = ?`];
    const params = [String(anno)];
    if (immobile_id) {
      conds.push("i.id = ?");
      params.push(immobile_id);
    }
    const where = conds.length ? "WHERE " + conds.join(" AND ") : "WHERE " + conds[0];
    return getDb().prepare(`
      SELECT 
        strftime('%m', pa.data_pagamento) as mese,
        SUM(pa.importo) as totale_incassato,
        COUNT(*) as num_rate,
        GROUP_CONCAT(DISTINCT u.nome || ' (' || i.nome || ')') as unita_info
      FROM pagamenti_affitto pa
      JOIN contratti c ON c.id = pa.contratto_id
      JOIN unita u ON u.id = c.unita_id
      JOIN immobili i ON i.id = u.immobile_id
      ${where}
      AND pa.stato = 'pagato'
      GROUP BY strftime('%m', pa.data_pagamento)
      ORDER BY mese
    `).all(...params);
  }
};
const categorieSpese = {
  getAll: () => getDb().prepare(`SELECT * FROM categorie_spese ORDER BY tipo, nome`).all()
};
const spese = {
  getAll: (immobile_id) => {
    const sql = immobile_id ? `SELECT s.*, c.nome as categoria_nome, c.icona, c.colore,
           COUNT(d.id) as num_documenti
         FROM spese s
         LEFT JOIN categorie_spese c ON c.id = s.categoria_id
         LEFT JOIN documenti d ON d.spesa_id = s.id
         WHERE s.immobile_id = ?
         GROUP BY s.id ORDER BY s.data_scadenza DESC` : `SELECT s.*, c.nome as categoria_nome, c.icona, c.colore,
           i.nome as immobile_nome, COUNT(d.id) as num_documenti
         FROM spese s
         LEFT JOIN categorie_spese c ON c.id = s.categoria_id
         LEFT JOIN immobili i ON i.id = s.immobile_id
         LEFT JOIN documenti d ON d.spesa_id = s.id
         GROUP BY s.id ORDER BY s.data_scadenza DESC`;
    return immobile_id ? getDb().prepare(sql).all(immobile_id) : getDb().prepare(sql).all();
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
    `);
    return stmt.run(data);
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
    `);
    return stmt.run({ ...data, id });
  },
  pagaSpesa: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE spese SET stato='pagata', data_pagamento=@data_pagamento,
        metodo_pagamento=@metodo_pagamento
      WHERE id=@id
    `);
    return stmt.run({ ...data, id });
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
};
const documenti = {
  getBySpesa: (spesa_id) => getDb().prepare(`SELECT * FROM documenti WHERE spesa_id = ? ORDER BY caricato_il DESC`).all(spesa_id),
  create: (data) => {
    const stmt = getDb().prepare(`
      INSERT INTO documenti (spesa_id, contratto_id, nome_file, percorso_file,
        tipo_file, ocr_testo, ocr_tipo_documento, ocr_importo, ocr_data,
        ocr_fornitore, ocr_periodo, ocr_iban, ocr_consumo, ocr_riferimento, ocr_completato)
      VALUES (@spesa_id, @contratto_id, @nome_file, @percorso_file,
        @tipo_file, @ocr_testo, @ocr_tipo_documento, @ocr_importo, @ocr_data,
        @ocr_fornitore, @ocr_periodo, @ocr_iban, @ocr_consumo, @ocr_riferimento, @ocr_completato)
    `);
    return stmt.run(data);
  },
  aggiornaOcr: (id, data) => {
    const stmt = getDb().prepare(`
      UPDATE documenti SET ocr_testo=@ocr_testo, ocr_tipo_documento=@ocr_tipo_documento,
        ocr_importo=@ocr_importo, ocr_data=@ocr_data, ocr_fornitore=@ocr_fornitore,
        ocr_periodo=@ocr_periodo, ocr_iban=@ocr_iban, ocr_consumo=@ocr_consumo,
        ocr_riferimento=@ocr_riferimento, ocr_completato=1
      WHERE id=@id
    `);
    return stmt.run({ ...data, id });
  },
  delete: (id) => getDb().prepare(`DELETE FROM documenti WHERE id = ?`).run(id)
};
const alertDb = {
  getPendenti: () => getDb().prepare(`
    SELECT * FROM alert WHERE letto = 0 ORDER BY data_scadenza ASC
  `).all(),
  creaAlert: (data) => {
    const stmt = getDb().prepare(`
      INSERT OR IGNORE INTO alert (tipo, entita_tipo, entita_id, titolo, messaggio,
        data_scadenza, giorni_anticipo)
      VALUES (@tipo, @entita_tipo, @entita_id, @titolo, @messaggio,
        @data_scadenza, @giorni_anticipo)
    `);
    return stmt.run(data);
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
};
const dashboard = {
  getSummary: () => {
    const db2 = getDb();
    return {
      immobili: db2.prepare(`SELECT COUNT(*) as n FROM immobili`).get().n,
      contratti_attivi: db2.prepare(`SELECT COUNT(*) as n FROM contratti WHERE stato='attivo'`).get().n,
      spese_da_pagare: db2.prepare(`SELECT COUNT(*) as n, COALESCE(SUM(importo),0) as tot FROM spese WHERE stato='da_pagare'`).get(),
      affitti_da_incassare: db2.prepare(`SELECT COUNT(*) as n, COALESCE(SUM(importo),0) as tot FROM pagamenti_affitto WHERE stato='da_pagare'`).get(),
      scadenze_settimana: db2.prepare(`
        SELECT COUNT(*) as n FROM spese
        WHERE stato='da_pagare' AND data_scadenza BETWEEN date('now') AND date('now','+7 days')
      `).get().n,
      alert_pendenti: db2.prepare(`SELECT COUNT(*) as n FROM alert WHERE letto=0`).get().n
    };
  }
};
const reportGrafici = {
  // Dati mensili per categoria (importo + consumi) per immobile+anno
  mensiliPerCategoria: (immobile_id, anno) => {
    const where = immobile_id ? `WHERE s.immobile_id = ${immobile_id} AND strftime('%Y', COALESCE(s.data_scadenza, s.data_documento)) = '${anno}'` : `WHERE strftime('%Y', COALESCE(s.data_scadenza, s.data_documento)) = '${anno}'`;
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
    `).all();
  },
  // Totale importi per mese (tutti i mesi dell'anno, anche senza dati)
  totaliMensili: (immobile_id, anno) => {
    const where = immobile_id ? `WHERE s.immobile_id = ${immobile_id} AND strftime('%Y', COALESCE(s.data_scadenza, s.data_documento)) = '${anno}'` : `WHERE strftime('%Y', COALESCE(s.data_scadenza, s.data_documento)) = '${anno}'`;
    return getDb().prepare(`
      SELECT
        strftime('%m', COALESCE(s.data_scadenza, s.data_documento)) as mese,
        SUM(s.importo) as totale,
        SUM(s.consumo_kwh) as tot_kwh,
        SUM(s.consumo_mc) as tot_mc
      FROM spese s
      ${where}
      GROUP BY mese ORDER BY mese
    `).all();
  }
};
const report = {
  speseAnnuali: (anno, immobile_id) => {
    let sql = `
      SELECT s.*, c.nome as categoria_nome, i.nome as immobile_nome
      FROM spese s
      LEFT JOIN categorie_spese c ON c.id = s.categoria_id
      JOIN immobili i ON i.id = s.immobile_id
      WHERE strftime('%Y', COALESCE(s.data_scadenza, s.data_documento)) = ?
    `;
    const params = [String(anno)];
    if (immobile_id) {
      sql += ` AND s.immobile_id = ?`;
      params.push(immobile_id);
    }
    return getDb().prepare(sql + ` ORDER BY s.data_scadenza`).all(...params);
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
    `;
    const params = [String(anno)];
    if (immobile_id) {
      sql += ` AND i.id = ?`;
      params.push(immobile_id);
    }
    return getDb().prepare(sql + ` ORDER BY pa.data_scadenza`).all(...params);
  }
};
const TIPO_DOC_REGOLE = [
  {
    tipo: "bolletta_luce",
    label: "Bolletta Energia Elettrica",
    categoria_id: 1,
    keywords: [
      "energia elettrica",
      "enel",
      "a2a",
      "iren",
      "acea energia",
      "kw",
      "kwh",
      "fornitura elettrica",
      "contatore elettrico",
      "pod "
    ]
  },
  {
    tipo: "bolletta_gas",
    label: "Bolletta Gas",
    categoria_id: 2,
    keywords: [
      "gas naturale",
      "metano",
      "eni gas",
      "italgas",
      "snam",
      "mc gas",
      "fornitura gas",
      "pdr ",
      "contatore gas",
      "mc3"
    ]
  },
  {
    tipo: "bolletta_acqua",
    label: "Bolletta Acqua",
    categoria_id: 3,
    keywords: [
      "acquedotto",
      "servizio idrico",
      "acea ato",
      "mm spa",
      "hera acqua",
      "mc acqua",
      "fornitura idrica",
      "utenza idrica",
      "consumi idrici"
    ]
  },
  {
    tipo: "bolletta_internet",
    label: "Fattura Internet/Telefonia",
    categoria_id: 4,
    keywords: [
      "tim ",
      "telecom",
      "vodafone",
      "fastweb",
      "tiscali",
      "wind tre",
      "fibra ottica",
      "adsl",
      "abbonamento internet",
      "servizi telco"
    ]
  },
  {
    tipo: "quota_condominio",
    label: "Quota Condominiale",
    categoria_id: 5,
    keywords: [
      "condominio",
      "amministratore",
      "quota condominiale",
      "millesimi",
      "spese condominiali",
      "assemblea condominiale",
      "rendiconto"
    ]
  },
  {
    tipo: "abbonamento",
    label: "Abbonamento",
    categoria_id: 7,
    keywords: [
      "netflix",
      "amazon prime",
      "disney",
      "spotify",
      "dazn",
      "sky",
      "abbonamento mensile",
      "rinnovo abbonamento"
    ]
  },
  {
    tipo: "assicurazione",
    label: "Assicurazione",
    categoria_id: 8,
    keywords: [
      "assicurazione",
      "polizza",
      "premio assicurativo",
      "unipol",
      "generali",
      "allianz",
      "axa",
      "zurich",
      "copertura"
    ]
  },
  {
    tipo: "imu",
    label: "IMU/Tasse",
    categoria_id: 9,
    keywords: ["imu", "tasi", "imposta municipale", "tari", "tributo", "comune di"]
  },
  {
    tipo: "fattura_servizi",
    label: "Fattura Servizi",
    categoria_id: 10,
    keywords: [
      "fattura",
      "prestazione",
      "lavori",
      "intervento",
      "manutenzione",
      "riparazione",
      "idraulico",
      "elettricista",
      "fabbro"
    ]
  }
];
function estraiImporto(testo) {
  const patterns = [
    /totale\s+(?:da\s+)?pagare[:\s€]*([0-9]+[.,][0-9]{2})/i,
    /importo\s+(?:da\s+)?pagare[:\s€]*([0-9]+[.,][0-9]{2})/i,
    /da\s+pagare[:\s€]*([0-9]+[.,][0-9]{2})/i,
    /totale\s+fattura[:\s€]*([0-9]+[.,][0-9]{2})/i,
    /€\s*([0-9]+[.,][0-9]{2})\s*(?:da pagare|totale)/i,
    /([0-9]+[.,][0-9]{2})\s*€/i
  ];
  for (const p of patterns) {
    const m = testo.match(p);
    if (m) {
      const val = m[1].replace(",", ".");
      const n = parseFloat(val);
      if (n > 0 && n < 1e5) return n;
    }
  }
  return null;
}
function estraiData(testo) {
  const patterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/g,
    /(\d{4})[\/\-\.](\d{2})[\/\-\.](\d{2})/g
  ];
  const mesi = {
    gennaio: 1,
    febbraio: 2,
    marzo: 3,
    aprile: 4,
    maggio: 5,
    giugno: 6,
    luglio: 7,
    agosto: 8,
    settembre: 9,
    ottobre: 10,
    novembre: 11,
    dicembre: 12
  };
  const mesiPattern = new RegExp(`(\\d{1,2})\\s+(${Object.keys(mesi).join("|")})\\s+(\\d{4})`, "i");
  const m = testo.match(mesiPattern);
  if (m) {
    const giorno = m[1].padStart(2, "0");
    const mese = String(mesi[m[2].toLowerCase()]).padStart(2, "0");
    return `${m[3]}-${mese}-${giorno}`;
  }
  for (const p of patterns) {
    const match = [...testo.matchAll(p)];
    if (match.length > 0) {
      const [_, a, b, c] = match[0];
      if (c && c.length === 4) return `${c}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`;
      if (a && a.length === 4) return `${a}-${b}-${c}`;
    }
  }
  return null;
}
function estraiFornitore(testo, tipo) {
  const fornitori = [
    "Enel",
    "A2A",
    "Iren",
    "ACEA",
    "ENI",
    "Italgas",
    "Snam",
    "TIM",
    "Telecom",
    "Vodafone",
    "Fastweb",
    "Wind Tre",
    "Tiscali",
    "Unipol",
    "Generali",
    "Allianz",
    "AXA",
    "Zurich",
    "Netflix",
    "Amazon",
    "Disney",
    "Spotify",
    "DAZN"
  ];
  for (const f of fornitori) {
    if (testo.toLowerCase().includes(f.toLowerCase())) return f;
  }
  const lines = testo.split("\n").slice(0, 5);
  for (const l of lines) {
    const clean = l.trim();
    if (clean.length > 3 && clean.length < 50 && /[A-Z]/.test(clean[0])) return clean;
  }
  return null;
}
function estraiIban(testo) {
  const m = testo.match(/IT\d{2}[A-Z0-9]{23}/i);
  return m ? m[0].toUpperCase() : null;
}
function estraiPeriodoConsumi(testo) {
  const m = testo.match(/(?:periodo|dal|competenza)\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\s+(?:al|fino\s+al)\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  return m ? `${m[1]} - ${m[2]}` : null;
}
function estraiConsumo(testo) {
  const kwh = testo.match(/(\d+(?:[.,]\d+)?)\s*(?:kwh|kw\/h)/i);
  const mc = testo.match(/(\d+(?:[.,]\d+)?)\s*mc/i);
  if (kwh) return `${kwh[1]} kWh`;
  if (mc) return `${mc[1]} mc`;
  return null;
}
function estraiRiferimento(testo) {
  const m = testo.match(/(?:n[°\.\s]*fattura|bolletta\s+n[°\.]?|rif(?:erimento)?[:\s]+)([A-Z0-9\/\-]{5,20})/i);
  return m ? m[1] : null;
}
function identificaTipoDocumento(testo) {
  const testoLower = testo.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  for (const regola of TIPO_DOC_REGOLE) {
    let score = 0;
    for (const kw of regola.keywords) {
      if (testoLower.includes(kw.toLowerCase())) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = regola;
    }
  }
  return bestScore >= 1 ? { ...bestMatch, confidence: bestScore >= 2 ? "alta" : "bassa" } : { tipo: "sconosciuto", label: "Tipo non riconosciuto", categoria_id: null, confidence: "nessuna" };
}
let worker = null;
async function getWorker() {
  if (!worker) {
    worker = await tesseract_js.createWorker("ita+eng");
  }
  return worker;
}
async function elaboraDocumento(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let testo = "";
  if (ext === ".pdf") {
    try {
      const pdfParse = (await import("pdf-parse")).default;
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      testo = data.text;
    } catch {
      testo = "";
    }
  }
  if (testo.trim().length < 50) {
    try {
      const w = await getWorker();
      const { data } = await w.recognize(filePath);
      testo = data.text;
    } catch (e) {
      return { errore: `OCR fallito: ${e.message}`, testo: "" };
    }
  }
  const tipoDoc = identificaTipoDocumento(testo);
  return {
    testo,
    tipo_documento: tipoDoc.tipo,
    tipo_documento_label: tipoDoc.label,
    tipo_documento_confidence: tipoDoc.confidence,
    categoria_id: tipoDoc.categoria_id,
    importo: estraiImporto(testo),
    data: estraiData(testo),
    fornitore: estraiFornitore(testo),
    periodo: estraiPeriodoConsumi(testo),
    iban: estraiIban(testo),
    consumo: estraiConsumo(testo),
    riferimento: estraiRiferimento(testo)
  };
}
function formatEuro(n) {
  return n != null ? `€ ${parseFloat(n).toFixed(2)}` : "-";
}
async function esportaExcel({ tipo, anno, immobile_id, immobile_nome }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Immobili Manager";
  if (tipo === "spese" || tipo === "tutto") {
    const spese2 = report.speseAnnuali(anno, immobile_id);
    const ws = wb.addWorksheet("Spese");
    ws.columns = [
      { header: "Data", key: "data", width: 14 },
      { header: "Immobile", key: "immobile", width: 22 },
      { header: "Categoria", key: "categoria", width: 20 },
      { header: "Descrizione", key: "descrizione", width: 30 },
      { header: "Fornitore", key: "fornitore", width: 20 },
      { header: "Importo €", key: "importo", width: 14 },
      { header: "Stato", key: "stato", width: 14 },
      { header: "Pagata il", key: "pagata", width: 14 }
    ];
    ws.getRow(1).font = { bold: true };
    ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    spese2.forEach((s) => {
      ws.addRow({
        data: s.data_scadenza || s.data_documento || "",
        immobile: s.immobile_nome || "",
        categoria: s.categoria_nome || "",
        descrizione: s.descrizione,
        fornitore: s.fornitore || "",
        importo: parseFloat(s.importo) || 0,
        stato: s.stato,
        pagata: s.data_pagamento || ""
      });
    });
    const totRow = ws.addRow({ descrizione: "TOTALE", importo: spese2.reduce((a, s) => a + (parseFloat(s.importo) || 0), 0) });
    totRow.font = { bold: true };
    ws.getColumn("importo").numFmt = "€#,##0.00";
  }
  if (tipo === "affitti" || tipo === "tutto") {
    const affitti = report.affittiAnnuali(anno, immobile_id);
    const ws = wb.addWorksheet("Affitti");
    ws.columns = [
      { header: "Mese", key: "mese", width: 14 },
      { header: "Immobile", key: "immobile", width: 22 },
      { header: "Unità", key: "unita", width: 18 },
      { header: "Inquilino", key: "inquilino", width: 24 },
      { header: "Importo €", key: "importo", width: 14 },
      { header: "Scadenza", key: "scadenza", width: 14 },
      { header: "Pagata il", key: "pagata", width: 14 },
      { header: "Stato", key: "stato", width: 14 }
    ];
    ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF065F46" } };
    affitti.forEach((a) => {
      ws.addRow({
        mese: a.mese_riferimento,
        immobile: a.immobile_nome,
        unita: a.unita_nome,
        inquilino: a.inquilino_nome,
        importo: parseFloat(a.importo),
        scadenza: a.data_scadenza,
        pagata: a.data_pagamento || "",
        stato: a.stato
      });
    });
    ws.getColumn("importo").numFmt = "€#,##0.00";
  }
  const { filePath } = await electron.dialog.showSaveDialog({
    title: "Salva report Excel",
    defaultPath: `Report_Immobili_${anno}.xlsx`,
    filters: [{ name: "Excel", extensions: ["xlsx"] }]
  });
  if (!filePath) return null;
  await wb.xlsx.writeFile(filePath);
  return filePath;
}
async function esportaPdf({ tipo, anno, immobile_id, immobile_nome }) {
  const doc = new jspdf.jsPDF({ orientation: "landscape" });
  const titolo = `Report ${tipo === "spese" ? "Spese" : tipo === "affitti" ? "Affitti" : "Completo"} ${anno}`;
  const sottotitolo = immobile_nome ? `Immobile: ${immobile_nome}` : "Tutti gli immobili";
  doc.setFontSize(18);
  doc.text(titolo, 14, 15);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(sottotitolo, 14, 23);
  let y = 30;
  if (tipo === "spese" || tipo === "tutto") {
    const spese2 = report.speseAnnuali(anno, immobile_id);
    doc.autoTable({
      startY: y,
      head: [["Data", "Immobile", "Categoria", "Descrizione", "Fornitore", "Importo", "Stato"]],
      body: spese2.map((s) => [
        s.data_scadenza || s.data_documento || "-",
        s.immobile_nome || "-",
        s.categoria_nome || "-",
        s.descrizione,
        s.fornitore || "-",
        formatEuro(s.importo),
        s.stato
      ]),
      foot: [["", "", "", "", "TOTALE", formatEuro(spese2.reduce((a, s) => a + (parseFloat(s.importo) || 0), 0)), ""]],
      headStyles: { fillColor: [30, 58, 138] },
      footStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: "bold" }
    });
    y = doc.lastAutoTable.finalY + 10;
  }
  if (tipo === "affitti" || tipo === "tutto") {
    const affitti = report.affittiAnnuali(anno, immobile_id);
    if (tipo === "tutto" && y > 160) {
      doc.addPage();
      y = 15;
    }
    doc.autoTable({
      startY: y,
      head: [["Mese", "Immobile", "Unità", "Inquilino", "Importo", "Scadenza", "Stato"]],
      body: affitti.map((a) => [
        a.mese_riferimento,
        a.immobile_nome,
        a.unita_nome,
        a.inquilino_nome,
        formatEuro(a.importo),
        a.data_scadenza,
        a.stato
      ]),
      headStyles: { fillColor: [6, 95, 70] }
    });
  }
  const { filePath } = await electron.dialog.showSaveDialog({
    title: "Salva report PDF",
    defaultPath: `Report_Immobili_${anno}.pdf`,
    filters: [{ name: "PDF", extensions: ["pdf"] }]
  });
  if (!filePath) return null;
  const buffer = Buffer.from(doc.output("arraybuffer"));
  fs.writeFileSync(filePath, buffer);
  return filePath;
}
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}
function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? countFiles(path.join(dir, e.name)) : 1;
  }
  return n;
}
function runPowerShell(cmd) {
  return new Promise((resolve, reject) => {
    child_process.execFile("powershell.exe", ["-NoProfile", "-Command", cmd], { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(new Error(stderr || err.message));
      else resolve(stdout);
    });
  });
}
async function eseguiBackup() {
  const { filePath } = await electron.dialog.showSaveDialog({
    title: "Salva backup",
    defaultPath: `ImmobiliBackup_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.backup`,
    filters: [{ name: "Backup Immobili", extensions: ["backup"] }]
  });
  if (!filePath) return null;
  const userDataPath = electron.app.getPath("userData");
  const dbPath = path.join(userDataPath, "immobili.db");
  const docsPath = path.join(userDataPath, "documenti");
  const fotosPath2 = path.join(userDataPath, "foto");
  const tempDir = path.join(userDataPath, "_backup_tmp");
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });
  try {
    getDb().exec("PRAGMA wal_checkpoint(TRUNCATE)");
  } catch {
  }
  fs.copyFileSync(dbPath, path.join(tempDir, "immobili.db"));
  copyDirRecursive(docsPath, path.join(tempDir, "documenti"));
  copyDirRecursive(fotosPath2, path.join(tempDir, "foto"));
  const manifest = {
    version: electron.app.getVersion(),
    creato_il: (/* @__PURE__ */ new Date()).toISOString(),
    num_documenti: countFiles(docsPath),
    num_foto: countFiles(fotosPath2)
  };
  fs.writeFileSync(path.join(tempDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  const zipPath = filePath.replace(/\.backup$/, "") + "_tmp.zip";
  await runPowerShell(`Compress-Archive -Path "${tempDir}\\*" -DestinationPath "${zipPath}" -Force`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  fs.renameSync(zipPath, filePath);
  fs.rmSync(tempDir, { recursive: true });
  return { filePath, manifest };
}
async function eseguiRestore() {
  const { filePaths, canceled } = await electron.dialog.showOpenDialog({
    title: "Seleziona file di backup",
    filters: [{ name: "Backup Immobili", extensions: ["backup"] }],
    properties: ["openFile"]
  });
  if (canceled || !filePaths?.length) return null;
  const backupFile = filePaths[0];
  const userDataPath = electron.app.getPath("userData");
  const tempDir = path.join(userDataPath, "_restore_tmp");
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });
  await runPowerShell(`Expand-Archive -Path "${backupFile}" -DestinationPath "${tempDir}" -Force`);
  const manifestPath = path.join(tempDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    fs.rmSync(tempDir, { recursive: true });
    throw new Error("File di backup non valido — manifest mancante");
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const dbPath = path.join(userDataPath, "immobili.db");
  if (fs.existsSync(dbPath)) fs.copyFileSync(dbPath, dbPath + ".pre-restore");
  const newDb = path.join(tempDir, "immobili.db");
  if (fs.existsSync(newDb)) fs.copyFileSync(newDb, dbPath);
  const docsPath = path.join(userDataPath, "documenti");
  const newDocs = path.join(tempDir, "documenti");
  if (fs.existsSync(newDocs)) {
    if (fs.existsSync(docsPath)) fs.rmSync(docsPath, { recursive: true });
    copyDirRecursive(newDocs, docsPath);
  }
  const fotosPath2 = path.join(userDataPath, "foto");
  const newFotos = path.join(tempDir, "foto");
  if (fs.existsSync(newFotos)) {
    if (fs.existsSync(fotosPath2)) fs.rmSync(fotosPath2, { recursive: true });
    copyDirRecursive(newFotos, fotosPath2);
  }
  fs.rmSync(tempDir, { recursive: true });
  return { manifest, richiedeRiavvio: true };
}
let fotosPath;
function registraHandlers(docsDir, fotosDir) {
  fotosPath = fotosDir;
  electron.ipcMain.handle("comuni:search", (_, q) => comuni.search(q || ""));
  electron.ipcMain.handle("comuni:getProvince", () => comuni.getProvince());
  electron.ipcMain.handle("comuni:getRegioni", () => comuni.getRegioni());
  electron.ipcMain.handle("comuni:count", () => comuni.count());
  electron.ipcMain.handle("comuni:importCsv", async () => {
    const { filePaths, canceled } = await electron.dialog.showOpenDialog({
      title: "Importa CSV ISTAT comuni",
      filters: [{ name: "CSV", extensions: ["csv"] }],
      properties: ["openFile"]
    });
    if (canceled || !filePaths?.length) return null;
    const db2 = (await Promise.resolve().then(() => database)).getDb();
    return importComuniFromCsv(db2, filePaths[0]);
  });
  electron.ipcMain.handle("utenze:getByImmobile", (_, id) => utenze.getByImmobile(id));
  electron.ipcMain.handle("utenze:getByTipo", (_, { immobile_id, tipo }) => utenze.getByTipo(immobile_id, tipo));
  electron.ipcMain.handle("utenze:upsert", (_, data) => utenze.upsert(data));
  electron.ipcMain.handle("utenze:delete", (_, id) => utenze.delete(id));
  electron.ipcMain.handle("immobili:getAll", () => immobili.getAll());
  electron.ipcMain.handle("immobili:getById", (_, id) => immobili.getById(id));
  electron.ipcMain.handle("immobili:create", (_, data) => immobili.create(data));
  electron.ipcMain.handle("immobili:update", (_, { id, data }) => immobili.update(id, data));
  electron.ipcMain.handle("immobili:delete", (_, id) => immobili.delete(id));
  electron.ipcMain.handle("unita:getByImmobile", (_, id) => unita.getByImmobile(id));
  electron.ipcMain.handle("unita:getAll", () => unita.getAll());
  electron.ipcMain.handle("unita:create", (_, data) => unita.create(data));
  electron.ipcMain.handle("unita:update", (_, { id, data }) => unita.update(id, data));
  electron.ipcMain.handle("unita:delete", (_, id) => unita.delete(id));
  electron.ipcMain.handle("inquilini:getAll", () => inquilini.getAll());
  electron.ipcMain.handle("inquilini:getById", (_, id) => inquilini.getById(id));
  electron.ipcMain.handle("inquilini:create", (_, data) => inquilini.create(data));
  electron.ipcMain.handle("inquilini:update", (_, { id, data }) => inquilini.update(id, data));
  electron.ipcMain.handle("inquilini:delete", (_, id) => inquilini.delete(id));
  electron.ipcMain.handle("inquilini:uploadFoto", async (_, { filePath: srcPath, inquilino_id }) => {
    const ext = path.extname(srcPath).toLowerCase();
    const nomeFile = `foto_inq_${inquilino_id || Date.now()}${ext}`;
    const destPath = path.join(fotosPath, nomeFile);
    fs.copyFileSync(srcPath, destPath);
    return destPath;
  });
  electron.ipcMain.handle("inquilini:sceglieFoto", async () => {
    const { filePaths, canceled } = await electron.dialog.showOpenDialog({
      title: "Seleziona foto inquilino",
      filters: [{ name: "Immagini", extensions: ["jpg", "jpeg", "png", "webp"] }],
      properties: ["openFile"]
    });
    return canceled ? null : filePaths[0];
  });
  electron.ipcMain.handle("contratti:getAll", () => contratti.getAll());
  electron.ipcMain.handle("contratti:getByUnita", (_, id) => contratti.getByUnita(id));
  electron.ipcMain.handle("contratti:create", (_, data) => {
    const result = contratti.create(data);
    const contratto_id = result.lastInsertRowid;
    if (data.genera_rate && data.data_inizio) {
      generaRateContratto(contratto_id, data);
    }
    return result;
  });
  electron.ipcMain.handle("contratti:update", (_, { id, data }) => contratti.update(id, data));
  electron.ipcMain.handle("contratti:delete", (_, id) => contratti.delete(id));
  electron.ipcMain.handle("pagamentiAffitto:getByContratto", (_, id) => pagamentiAffitto.getByContratto(id));
  electron.ipcMain.handle("pagamentiAffitto:getById", (_, id) => pagamentiAffitto.getById(id));
  electron.ipcMain.handle("pagamentiAffitto:getAll", (_, filtri) => pagamentiAffitto.getAll(filtri || {}));
  electron.ipcMain.handle("pagamentiAffitto:aggiorna", (_, { id, data }) => pagamentiAffitto.aggiorna(id, data));
  electron.ipcMain.handle("pagamentiAffitto:annullaPagamento", (_, id) => pagamentiAffitto.annullaPagamento(id));
  electron.ipcMain.handle("pagamentiAffitto:getByInquilino", (_, { inquilino_id, mesi }) => pagamentiAffitto.getByInquilino(inquilino_id, mesi || 3));
  electron.ipcMain.handle("pagamentiAffitto:getScaduti", () => pagamentiAffitto.getScaduti());
  electron.ipcMain.handle("pagamentiAffitto:pagaRata", (_, { id, data }) => pagamentiAffitto.pagaRata(id, data));
  electron.ipcMain.handle("pagamentiAffitto:create", (_, data) => pagamentiAffitto.create(data));
  electron.ipcMain.handle("pagamentiAffitto:getIncassiMensiliPerAnno", (_, { anno, immobile_id }) => pagamentiAffitto.getIncassiMensiliPerAnno(anno, immobile_id));
  electron.ipcMain.handle("categorie:getAll", () => categorieSpese.getAll());
  electron.ipcMain.handle("spese:getAll", (_, immobile_id) => spese.getAll(immobile_id || null));
  electron.ipcMain.handle("spese:getById", (_, id) => spese.getById(id));
  electron.ipcMain.handle("spese:getScadenze", (_, giorni) => spese.getScadenze(giorni));
  electron.ipcMain.handle("spese:create", (_, data) => spese.create(data));
  electron.ipcMain.handle("spese:update", (_, { id, data }) => spese.update(id, data));
  electron.ipcMain.handle("spese:pagaSpesa", (_, { id, data }) => spese.pagaSpesa(id, data));
  electron.ipcMain.handle("spese:delete", (_, id) => spese.delete(id));
  electron.ipcMain.handle("documenti:getBySpesa", (_, spesa_id) => documenti.getBySpesa(spesa_id));
  electron.ipcMain.handle("documenti:delete", (_, id) => documenti.delete(id));
  electron.ipcMain.handle("documenti:upload", async (_, { filePath: srcPath, spesa_id, contratto_id }) => {
    const docsDir2 = getDocsPath();
    const ext = path.extname(srcPath);
    const nomeFile = `doc_${Date.now()}${ext}`;
    const destPath = path.join(docsDir2, nomeFile);
    fs.copyFileSync(srcPath, destPath);
    const tipoFile = ext.toLowerCase() === ".pdf" ? "pdf" : "immagine";
    const result = documenti.create({
      spesa_id: spesa_id || null,
      contratto_id: contratto_id || null,
      nome_file: path.basename(srcPath),
      percorso_file: destPath,
      tipo_file: tipoFile,
      ocr_testo: null,
      ocr_tipo_documento: null,
      ocr_importo: null,
      ocr_data: null,
      ocr_fornitore: null,
      ocr_periodo: null,
      ocr_iban: null,
      ocr_consumo: null,
      ocr_riferimento: null,
      ocr_completato: 0
    });
    return { id: result.lastInsertRowid, percorso_file: destPath, nome_file: path.basename(srcPath) };
  });
  electron.ipcMain.handle("documenti:elaboraOcr", async (_, { doc_id, percorso_file }) => {
    try {
      const risultato = await elaboraDocumento(percorso_file);
      if (!risultato.errore) {
        documenti.aggiornaOcr(doc_id, {
          ocr_testo: risultato.testo,
          ocr_tipo_documento: risultato.tipo_documento,
          ocr_importo: risultato.importo,
          ocr_data: risultato.data,
          ocr_fornitore: risultato.fornitore,
          ocr_periodo: risultato.periodo,
          ocr_iban: risultato.iban,
          ocr_consumo: risultato.consumo,
          ocr_riferimento: risultato.riferimento
        });
      }
      return risultato;
    } catch (e) {
      return { errore: e.message };
    }
  });
  electron.ipcMain.handle("documenti:apri", (_, percorso) => electron.shell.openPath(percorso));
  electron.ipcMain.handle("documenti:scegli", async () => {
    const { filePaths, canceled } = await electron.dialog.showOpenDialog({
      title: "Seleziona documento",
      filters: [{ name: "Documenti", extensions: ["pdf", "jpg", "jpeg", "png", "webp"] }],
      properties: ["openFile"]
    });
    return canceled ? null : filePaths[0];
  });
  electron.ipcMain.handle("alert:getPendenti", () => alertDb.getPendenti());
  electron.ipcMain.handle("alert:segnaLetto", (_, id) => alertDb.segnaLetto(id));
  electron.ipcMain.handle("dashboard:getSummary", () => dashboard.getSummary());
  electron.ipcMain.handle("report:excel", (_, params) => esportaExcel(params));
  electron.ipcMain.handle("report:pdf", (_, params) => esportaPdf(params));
  electron.ipcMain.handle("report:mensiliPerCategoria", (_, { immobile_id, anno }) => reportGrafici.mensiliPerCategoria(immobile_id || null, anno));
  electron.ipcMain.handle("report:totaliMensili", (_, { immobile_id, anno }) => reportGrafici.totaliMensili(immobile_id || null, anno));
  electron.ipcMain.handle("backup:esegui", () => eseguiBackup());
  electron.ipcMain.handle("backup:restore", async () => {
    const result = await eseguiRestore();
    if (result?.richiedeRiavvio) {
      setTimeout(() => {
        electron.app.relaunch();
        electron.app.exit(0);
      }, 1500);
    }
    return result;
  });
  electron.ipcMain.handle("app:getDocsPath", () => getDocsPath());
  electron.ipcMain.handle("app:getVersion", () => electron.app.getVersion());
  electron.ipcMain.handle("app:apriFile", (_, p) => electron.shell.openPath(p));
}
function generaRateContratto(contratto_id, data) {
  const inizio = new Date(data.data_inizio);
  const fine = data.data_fine ? new Date(data.data_fine) : new Date(inizio.getFullYear() + 1, inizio.getMonth(), inizio.getDate());
  const rate = [];
  const cur = new Date(inizio);
  while (cur <= fine) {
    const mese = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`;
    const giorno = data.giorno_pagamento || 1;
    const scadenza = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}-${String(giorno).padStart(2, "0")}`;
    rate.push({ contratto_id, mese_riferimento: mese, importo: data.canone_mensile, data_scadenza: scadenza, stato: "da_pagare" });
    cur.setMonth(cur.getMonth() + 1);
  }
  pagamentiAffitto.generaMensili(contratto_id, rate);
}
const APP_NAME = "Immobili Manager";
function inviaNotifica(titolo, messaggio, urgente = false) {
  notifier.notify({
    title: APP_NAME,
    message: messaggio,
    subtitle: titolo,
    icon: path.join(electron.app.getAppPath(), "resources", "icon.png"),
    sound: urgente,
    wait: false,
    appID: "com.immobili.manager"
  });
}
function aggiornaBadge() {
  const wins = electron.BrowserWindow.getAllWindows();
  if (wins.length > 0) {
    const pendenti = alertDb.getPendenti();
    wins[0].webContents.send("alert:update", pendenti);
  }
}
function controllaScadenze() {
  const oggi = /* @__PURE__ */ new Date();
  for (const s of spese.getScadenze(7)) {
    alertDb.creaAlert({
      tipo: "scadenza_spesa",
      entita_tipo: "spesa",
      entita_id: s.id,
      titolo: `Scadenza: ${s.descrizione}`,
      messaggio: `${s.categoria_nome || "Spesa"} di €${s.importo.toFixed(2)} scade il ${s.data_scadenza}`,
      data_scadenza: s.data_scadenza,
      giorni_anticipo: 7
    });
  }
  for (const a of pagamentiAffitto.getScaduti()) {
    alertDb.creaAlert({
      tipo: "affitto_scaduto",
      entita_tipo: "affitto",
      entita_id: a.id,
      titolo: `Affitto non pagato: ${a.unita_nome}`,
      messaggio: `${a.inquilino_nome} - rata di €${a.importo.toFixed(2)} scaduta il ${a.data_scadenza}`,
      data_scadenza: a.data_scadenza,
      giorni_anticipo: 0
    });
  }
  for (const c of contratti.getAll()) {
    if (c.stato !== "attivo" || !c.data_fine) continue;
    const diff = Math.round((new Date(c.data_fine) - oggi) / (1e3 * 60 * 60 * 24));
    if (diff <= 60 && diff >= 0) {
      alertDb.creaAlert({
        tipo: "contratto_scadenza",
        entita_tipo: "contratto",
        entita_id: c.id,
        titolo: `Contratto in scadenza`,
        messaggio: `Contratto ${c.unita_nome} (${c.inquilino_nome}) scade il ${c.data_fine}`,
        data_scadenza: c.data_fine,
        giorni_anticipo: 60
      });
    }
  }
  for (const a of alertDb.getPerNotifica()) {
    inviaNotifica(a.titolo, a.messaggio, a.tipo === "affitto_scaduto");
    alertDb.segnaInviato(a.id);
  }
  aggiornaBadge();
}
let job = null;
function avviaScheduler() {
  job = schedule.scheduleJob("0 8 * * *", controllaScadenze);
  setTimeout(controllaScadenze, 5e3);
}
function fermaScheduler() {
  if (job) job.cancel();
}
let mainWindow;
let tray;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    title: "Immobili Manager",
    backgroundColor: "#f8fafc",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  });
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.on("close", (e) => {
    if (!electron.app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}
function createTray() {
  const iconPath = path.join(__dirname, "../../resources/tray-icon.png");
  const icon = electron.nativeImage.createFromPath(iconPath);
  tray = new electron.Tray(icon.isEmpty() ? electron.nativeImage.createEmpty() : icon);
  const menu = electron.Menu.buildFromTemplate([
    { label: "Apri Immobili Manager", click: () => {
      mainWindow.show();
      mainWindow.focus();
    } },
    { type: "separator" },
    { label: "Esci", click: () => {
      electron.app.isQuitting = true;
      electron.app.quit();
    } }
  ]);
  tray.setToolTip("Immobili Manager");
  tray.setContextMenu(menu);
  tray.on("double-click", () => {
    mainWindow.show();
    mainWindow.focus();
  });
}
electron.app.whenReady().then(() => {
  const { docsPath, fotosPath: fotosPath2 } = initDb();
  registraHandlers(docsPath, fotosPath2);
  createWindow();
  createTray();
  avviaScheduler();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("before-quit", () => {
  electron.app.isQuitting = true;
  fermaScheduler();
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") ;
});
