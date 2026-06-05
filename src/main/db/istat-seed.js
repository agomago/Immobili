/**
 * istat-seed.js
 * Seed data for the comuni_istat table.
 * Contains a comprehensive list of Italian comuni with ISTAT codes,
 * province and region information.
 *
 * Sources: ISTAT codici comuni, ANPR, Ministero dell'Interno.
 * ISTAT codes are 6-digit: first 3 = provincia, last 3 = comune within provincia.
 */

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

/**
 * @type {Array<{codice: string, nome: string, sigla_prov: string, nome_prov: string, nome_reg: string, cap: string}>}
 */
export const COMUNI_ISTAT = [
  // =========================================================================
  // PIEMONTE
  // =========================================================================
  // Torino (TO)
  { codice: "001272", nome: "Torino",            sigla_prov: "TO", nome_prov: "Torino",            nome_reg: "Piemonte", cap: "10100" },
  { codice: "001001", nome: "Agliè",             sigla_prov: "TO", nome_prov: "Torino",            nome_reg: "Piemonte", cap: "10011" },
  { codice: "001025", nome: "Beinasco",          sigla_prov: "TO", nome_prov: "Torino",            nome_reg: "Piemonte", cap: "10092" },
  { codice: "001037", nome: "Borgaro Torinese",  sigla_prov: "TO", nome_prov: "Torino",            nome_reg: "Piemonte", cap: "10071" },
  { codice: "001091", nome: "Collegno",          sigla_prov: "TO", nome_prov: "Torino",            nome_reg: "Piemonte", cap: "10093" },
  { codice: "001169", nome: "Moncalieri",        sigla_prov: "TO", nome_prov: "Torino",            nome_reg: "Piemonte", cap: "10024" },
  { codice: "001206", nome: "Orbassano",         sigla_prov: "TO", nome_prov: "Torino",            nome_reg: "Piemonte", cap: "10043" },
  { codice: "001251", nome: "Rivoli",            sigla_prov: "TO", nome_prov: "Torino",            nome_reg: "Piemonte", cap: "10098" },
  { codice: "001289", nome: "Venaria Reale",     sigla_prov: "TO", nome_prov: "Torino",            nome_reg: "Piemonte", cap: "10078" },
  // Vercelli (VC)
  { codice: "002158", nome: "Vercelli",          sigla_prov: "VC", nome_prov: "Vercelli",          nome_reg: "Piemonte", cap: "13100" },
  { codice: "002010", nome: "Borgosesia",        sigla_prov: "VC", nome_prov: "Vercelli",          nome_reg: "Piemonte", cap: "13011" },
  { codice: "002048", nome: "Gattinara",         sigla_prov: "VC", nome_prov: "Vercelli",          nome_reg: "Piemonte", cap: "13045" },
  // Novara (NO)
  { codice: "003113", nome: "Novara",            sigla_prov: "NO", nome_prov: "Novara",            nome_reg: "Piemonte", cap: "28100" },
  { codice: "003011", nome: "Arona",             sigla_prov: "NO", nome_prov: "Novara",            nome_reg: "Piemonte", cap: "28041" },
  { codice: "003062", nome: "Galliate",          sigla_prov: "NO", nome_prov: "Novara",            nome_reg: "Piemonte", cap: "28066" },
  { codice: "003149", nome: "Trecate",           sigla_prov: "NO", nome_prov: "Novara",            nome_reg: "Piemonte", cap: "28069" },
  // Cuneo (CN)
  { codice: "004078", nome: "Cuneo",             sigla_prov: "CN", nome_prov: "Cuneo",             nome_reg: "Piemonte", cap: "12100" },
  { codice: "004003", nome: "Alba",              sigla_prov: "CN", nome_prov: "Cuneo",             nome_reg: "Piemonte", cap: "12051" },
  { codice: "004017", nome: "Bra",               sigla_prov: "CN", nome_prov: "Cuneo",             nome_reg: "Piemonte", cap: "12042" },
  { codice: "004123", nome: "Mondovì",           sigla_prov: "CN", nome_prov: "Cuneo",             nome_reg: "Piemonte", cap: "12084" },
  { codice: "004156", nome: "Saluzzo",           sigla_prov: "CN", nome_prov: "Cuneo",             nome_reg: "Piemonte", cap: "12037" },
  { codice: "004167", nome: "Savigliano",        sigla_prov: "CN", nome_prov: "Cuneo",             nome_reg: "Piemonte", cap: "12038" },
  // Asti (AT)
  { codice: "005015", nome: "Asti",              sigla_prov: "AT", nome_prov: "Asti",              nome_reg: "Piemonte", cap: "14100" },
  { codice: "005069", nome: "Nizza Monferrato",  sigla_prov: "AT", nome_prov: "Asti",              nome_reg: "Piemonte", cap: "14049" },
  { codice: "005074", nome: "Canelli",           sigla_prov: "AT", nome_prov: "Asti",              nome_reg: "Piemonte", cap: "14053" },
  // Alessandria (AL)
  { codice: "006003", nome: "Alessandria",       sigla_prov: "AL", nome_prov: "Alessandria",       nome_reg: "Piemonte", cap: "15100" },
  { codice: "006021", nome: "Casale Monferrato", sigla_prov: "AL", nome_prov: "Alessandria",       nome_reg: "Piemonte", cap: "15033" },
  { codice: "006072", nome: "Novi Ligure",       sigla_prov: "AL", nome_prov: "Alessandria",       nome_reg: "Piemonte", cap: "15067" },
  { codice: "006096", nome: "Tortona",           sigla_prov: "AL", nome_prov: "Alessandria",       nome_reg: "Piemonte", cap: "15057" },
  // Biella (BI)
  { codice: "096006", nome: "Biella",            sigla_prov: "BI", nome_prov: "Biella",            nome_reg: "Piemonte", cap: "13900" },
  { codice: "096010", nome: "Cossato",           sigla_prov: "BI", nome_prov: "Biella",            nome_reg: "Piemonte", cap: "13836" },
  { codice: "096048", nome: "Valdilana",         sigla_prov: "BI", nome_prov: "Biella",            nome_reg: "Piemonte", cap: "13835" },
  // Verbano-Cusio-Ossola (VB)
  { codice: "103055", nome: "Verbania",          sigla_prov: "VB", nome_prov: "Verbano-Cusio-Ossola", nome_reg: "Piemonte", cap: "28900" },
  { codice: "103003", nome: "Domodossola",       sigla_prov: "VB", nome_prov: "Verbano-Cusio-Ossola", nome_reg: "Piemonte", cap: "28845" },
  { codice: "103048", nome: "Omegna",            sigla_prov: "VB", nome_prov: "Verbano-Cusio-Ossola", nome_reg: "Piemonte", cap: "28887" },

  // =========================================================================
  // VALLE D'AOSTA
  // =========================================================================
  { codice: "007003", nome: "Aosta",             sigla_prov: "AO", nome_prov: "Aosta",             nome_reg: "Valle d'Aosta", cap: "11100" },
  { codice: "007005", nome: "Brissogne",         sigla_prov: "AO", nome_prov: "Aosta",             nome_reg: "Valle d'Aosta", cap: "11020" },
  { codice: "007026", nome: "Courmayeur",        sigla_prov: "AO", nome_prov: "Aosta",             nome_reg: "Valle d'Aosta", cap: "11013" },
  { codice: "007047", nome: "Gressan",           sigla_prov: "AO", nome_prov: "Aosta",             nome_reg: "Valle d'Aosta", cap: "11020" },

  // =========================================================================
  // LIGURIA
  // =========================================================================
  // Genova (GE)
  { codice: "010025", nome: "Genova",            sigla_prov: "GE", nome_prov: "Genova",            nome_reg: "Liguria", cap: "16100" },
  { codice: "010003", nome: "Arenzano",          sigla_prov: "GE", nome_prov: "Genova",            nome_reg: "Liguria", cap: "16011" },
  { codice: "010010", nome: "Bogliasco",         sigla_prov: "GE", nome_prov: "Genova",            nome_reg: "Liguria", cap: "16031" },
  { codice: "010018", nome: "Camogli",           sigla_prov: "GE", nome_prov: "Genova",            nome_reg: "Liguria", cap: "16032" },
  { codice: "010043", nome: "Rapallo",           sigla_prov: "GE", nome_prov: "Genova",            nome_reg: "Liguria", cap: "16035" },
  { codice: "010054", nome: "Sestri Levante",    sigla_prov: "GE", nome_prov: "Genova",            nome_reg: "Liguria", cap: "16039" },
  // Savona (SV)
  { codice: "009056", nome: "Savona",            sigla_prov: "SV", nome_prov: "Savona",            nome_reg: "Liguria", cap: "17100" },
  { codice: "009006", nome: "Albenga",           sigla_prov: "SV", nome_prov: "Savona",            nome_reg: "Liguria", cap: "17031" },
  { codice: "009026", nome: "Finale Ligure",     sigla_prov: "SV", nome_prov: "Savona",            nome_reg: "Liguria", cap: "17024" },
  // Imperia (IM)
  { codice: "008032", nome: "Imperia",           sigla_prov: "IM", nome_prov: "Imperia",           nome_reg: "Liguria", cap: "18100" },
  { codice: "008052", nome: "Sanremo",           sigla_prov: "IM", nome_prov: "Imperia",           nome_reg: "Liguria", cap: "18038" },
  { codice: "008059", nome: "Ventimiglia",       sigla_prov: "IM", nome_prov: "Imperia",           nome_reg: "Liguria", cap: "18039" },
  // La Spezia (SP)
  { codice: "011015", nome: "La Spezia",         sigla_prov: "SP", nome_prov: "La Spezia",         nome_reg: "Liguria", cap: "19100" },
  { codice: "011005", nome: "Brugnato",          sigla_prov: "SP", nome_prov: "La Spezia",         nome_reg: "Liguria", cap: "19020" },
  { codice: "011014", nome: "Sarzana",           sigla_prov: "SP", nome_prov: "La Spezia",         nome_reg: "Liguria", cap: "19038" },

  // =========================================================================
  // LOMBARDIA
  // =========================================================================
  // Milano (MI)
  { codice: "015146", nome: "Milano",            sigla_prov: "MI", nome_prov: "Milano",            nome_reg: "Lombardia", cap: "20100" },
  { codice: "015002", nome: "Abbiategrasso",     sigla_prov: "MI", nome_prov: "Milano",            nome_reg: "Lombardia", cap: "20081" },
  { codice: "015017", nome: "Bollate",           sigla_prov: "MI", nome_prov: "Milano",            nome_reg: "Lombardia", cap: "20021" },
  { codice: "015041", nome: "Cernusco sul Naviglio", sigla_prov: "MI", nome_prov: "Milano",        nome_reg: "Lombardia", cap: "20063" },
  { codice: "015093", nome: "Legnano",           sigla_prov: "MI", nome_prov: "Milano",            nome_reg: "Lombardia", cap: "20025" },
  { codice: "015122", nome: "Magenta",           sigla_prov: "MI", nome_prov: "Milano",            nome_reg: "Lombardia", cap: "20013" },
  { codice: "015182", nome: "Rho",               sigla_prov: "MI", nome_prov: "Milano",            nome_reg: "Lombardia", cap: "20017" },
  { codice: "015199", nome: "Sesto San Giovanni",sigla_prov: "MI", nome_prov: "Milano",            nome_reg: "Lombardia", cap: "20099" },
  { codice: "015237", nome: "Cinisello Balsamo", sigla_prov: "MI", nome_prov: "Milano",            nome_reg: "Lombardia", cap: "20092" },
  // Bergamo (BG)
  { codice: "016024", nome: "Bergamo",           sigla_prov: "BG", nome_prov: "Bergamo",           nome_reg: "Lombardia", cap: "24100" },
  { codice: "016009", nome: "Albino",            sigla_prov: "BG", nome_prov: "Bergamo",           nome_reg: "Lombardia", cap: "24021" },
  { codice: "016044", nome: "Dalmine",           sigla_prov: "BG", nome_prov: "Bergamo",           nome_reg: "Lombardia", cap: "24044" },
  { codice: "016202", nome: "Seriate",           sigla_prov: "BG", nome_prov: "Bergamo",           nome_reg: "Lombardia", cap: "24068" },
  { codice: "016105", nome: "Lovere",            sigla_prov: "BG", nome_prov: "Bergamo",           nome_reg: "Lombardia", cap: "24065" },
  // Brescia (BS)
  { codice: "017029", nome: "Brescia",           sigla_prov: "BS", nome_prov: "Brescia",           nome_reg: "Lombardia", cap: "25100" },
  { codice: "017004", nome: "Breno",             sigla_prov: "BS", nome_prov: "Brescia",           nome_reg: "Lombardia", cap: "25043" },
  { codice: "017058", nome: "Desenzano del Garda", sigla_prov: "BS", nome_prov: "Brescia",         nome_reg: "Lombardia", cap: "25015" },
  { codice: "017182", nome: "Salo'",             sigla_prov: "BS", nome_prov: "Brescia",           nome_reg: "Lombardia", cap: "25087" },
  { codice: "017143", nome: "Palazzolo sull'Oglio", sigla_prov: "BS", nome_prov: "Brescia",        nome_reg: "Lombardia", cap: "25036" },
  // Como (CO)
  { codice: "013075", nome: "Como",              sigla_prov: "CO", nome_prov: "Como",              nome_reg: "Lombardia", cap: "22100" },
  { codice: "013036", nome: "Cantù",             sigla_prov: "CO", nome_prov: "Como",              nome_reg: "Lombardia", cap: "22063" },
  { codice: "013122", nome: "Mariano Comense",   sigla_prov: "CO", nome_prov: "Como",              nome_reg: "Lombardia", cap: "22066" },
  // Cremona (CR)
  { codice: "019036", nome: "Cremona",           sigla_prov: "CR", nome_prov: "Cremona",           nome_reg: "Lombardia", cap: "26100" },
  { codice: "019087", nome: "Crema",             sigla_prov: "CR", nome_prov: "Cremona",           nome_reg: "Lombardia", cap: "26013" },
  { codice: "019049", nome: "Casalmaggiore",     sigla_prov: "CR", nome_prov: "Cremona",           nome_reg: "Lombardia", cap: "26041" },
  // Lecco (LC)
  { codice: "097046", nome: "Lecco",             sigla_prov: "LC", nome_prov: "Lecco",             nome_reg: "Lombardia", cap: "23900" },
  { codice: "097013", nome: "Calolziocorte",     sigla_prov: "LC", nome_prov: "Lecco",             nome_reg: "Lombardia", cap: "23801" },
  { codice: "097016", nome: "Casatenovo",        sigla_prov: "LC", nome_prov: "Lecco",             nome_reg: "Lombardia", cap: "23880" },
  // Lodi (LO)
  { codice: "098033", nome: "Lodi",              sigla_prov: "LO", nome_prov: "Lodi",              nome_reg: "Lombardia", cap: "26900" },
  { codice: "098004", nome: "Casalpusterlengo",  sigla_prov: "LO", nome_prov: "Lodi",              nome_reg: "Lombardia", cap: "26841" },
  // Mantova (MN)
  { codice: "020030", nome: "Mantova",           sigla_prov: "MN", nome_prov: "Mantova",           nome_reg: "Lombardia", cap: "46100" },
  { codice: "020008", nome: "Castiglione delle Stiviere", sigla_prov: "MN", nome_prov: "Mantova",  nome_reg: "Lombardia", cap: "46043" },
  { codice: "020051", nome: "Suzzara",           sigla_prov: "MN", nome_prov: "Mantova",           nome_reg: "Lombardia", cap: "46029" },
  // Monza e Brianza (MB)
  { codice: "108033", nome: "Monza",             sigla_prov: "MB", nome_prov: "Monza e della Brianza", nome_reg: "Lombardia", cap: "20900" },
  { codice: "108019", nome: "Desio",             sigla_prov: "MB", nome_prov: "Monza e della Brianza", nome_reg: "Lombardia", cap: "20832" },
  { codice: "108040", nome: "Seregno",           sigla_prov: "MB", nome_prov: "Monza e della Brianza", nome_reg: "Lombardia", cap: "20831" },
  { codice: "108042", nome: "Cesano Maderno",    sigla_prov: "MB", nome_prov: "Monza e della Brianza", nome_reg: "Lombardia", cap: "20811" },
  // Pavia (PV)
  { codice: "018110", nome: "Pavia",             sigla_prov: "PV", nome_prov: "Pavia",             nome_reg: "Lombardia", cap: "27100" },
  { codice: "018024", nome: "Broni",             sigla_prov: "PV", nome_prov: "Pavia",             nome_reg: "Lombardia", cap: "27043" },
  { codice: "018158", nome: "Vigevano",          sigla_prov: "PV", nome_prov: "Pavia",             nome_reg: "Lombardia", cap: "27029" },
  { codice: "018108", nome: "Mortara",           sigla_prov: "PV", nome_prov: "Pavia",             nome_reg: "Lombardia", cap: "27036" },
  // Sondrio (SO)
  { codice: "014059", nome: "Sondrio",           sigla_prov: "SO", nome_prov: "Sondrio",           nome_reg: "Lombardia", cap: "23100" },
  { codice: "014013", nome: "Bormio",            sigla_prov: "SO", nome_prov: "Sondrio",           nome_reg: "Lombardia", cap: "23032" },
  { codice: "014052", nome: "Morbegno",          sigla_prov: "SO", nome_prov: "Sondrio",           nome_reg: "Lombardia", cap: "23017" },
  // Varese (VA)
  { codice: "012133", nome: "Varese",            sigla_prov: "VA", nome_prov: "Varese",            nome_reg: "Lombardia", cap: "21100" },
  { codice: "012006", nome: "Busto Arsizio",     sigla_prov: "VA", nome_prov: "Varese",            nome_reg: "Lombardia", cap: "21052" },
  { codice: "012037", nome: "Gallarate",         sigla_prov: "VA", nome_prov: "Varese",            nome_reg: "Lombardia", cap: "21013" },
  { codice: "012068", nome: "Luino",             sigla_prov: "VA", nome_prov: "Varese",            nome_reg: "Lombardia", cap: "21016" },
  { codice: "012092", nome: "Saronno",           sigla_prov: "VA", nome_prov: "Varese",            nome_reg: "Lombardia", cap: "21047" },

  // =========================================================================
  // TRENTINO-ALTO ADIGE
  // =========================================================================
  // Trento (TN)
  { codice: "022205", nome: "Trento",            sigla_prov: "TN", nome_prov: "Trento",            nome_reg: "Trentino-Alto Adige", cap: "38100" },
  { codice: "022013", nome: "Arco",              sigla_prov: "TN", nome_prov: "Trento",            nome_reg: "Trentino-Alto Adige", cap: "38062" },
  { codice: "022069", nome: "Pergine Valsugana", sigla_prov: "TN", nome_prov: "Trento",            nome_reg: "Trentino-Alto Adige", cap: "38057" },
  { codice: "022093", nome: "Riva del Garda",    sigla_prov: "TN", nome_prov: "Trento",            nome_reg: "Trentino-Alto Adige", cap: "38066" },
  { codice: "022168", nome: "Rovereto",          sigla_prov: "TN", nome_prov: "Trento",            nome_reg: "Trentino-Alto Adige", cap: "38068" },
  // Bolzano/Bozen (BZ)
  { codice: "021008", nome: "Bolzano",           sigla_prov: "BZ", nome_prov: "Bolzano",           nome_reg: "Trentino-Alto Adige", cap: "39100" },
  { codice: "021016", nome: "Bressanone",        sigla_prov: "BZ", nome_prov: "Bolzano",           nome_reg: "Trentino-Alto Adige", cap: "39042" },
  { codice: "021050", nome: "Merano",            sigla_prov: "BZ", nome_prov: "Bolzano",           nome_reg: "Trentino-Alto Adige", cap: "39012" },
  { codice: "021062", nome: "Brunico",           sigla_prov: "BZ", nome_prov: "Bolzano",           nome_reg: "Trentino-Alto Adige", cap: "39031" },

  // =========================================================================
  // VENETO
  // =========================================================================
  // Venezia (VE)
  { codice: "027042", nome: "Venezia",           sigla_prov: "VE", nome_prov: "Venezia",           nome_reg: "Veneto", cap: "30100" },
  { codice: "027004", nome: "Chioggia",          sigla_prov: "VE", nome_prov: "Venezia",           nome_reg: "Veneto", cap: "30015" },
  { codice: "027006", nome: "Dolo",              sigla_prov: "VE", nome_prov: "Venezia",           nome_reg: "Veneto", cap: "30031" },
  { codice: "027028", nome: "Mestre",            sigla_prov: "VE", nome_prov: "Venezia",           nome_reg: "Veneto", cap: "30170" },
  { codice: "027032", nome: "Mira",              sigla_prov: "VE", nome_prov: "Venezia",           nome_reg: "Veneto", cap: "30034" },
  // Verona (VR)
  { codice: "023091", nome: "Verona",            sigla_prov: "VR", nome_prov: "Verona",            nome_reg: "Veneto", cap: "37100" },
  { codice: "023003", nome: "Bardolino",         sigla_prov: "VR", nome_prov: "Verona",            nome_reg: "Veneto", cap: "37011" },
  { codice: "023022", nome: "Bussolengo",        sigla_prov: "VR", nome_prov: "Verona",            nome_reg: "Veneto", cap: "37012" },
  { codice: "023064", nome: "Peschiera del Garda", sigla_prov: "VR", nome_prov: "Verona",          nome_reg: "Veneto", cap: "37019" },
  { codice: "023070", nome: "San Bonifacio",     sigla_prov: "VR", nome_prov: "Verona",            nome_reg: "Veneto", cap: "37047" },
  // Padova (PD)
  { codice: "028060", nome: "Padova",            sigla_prov: "PD", nome_prov: "Padova",            nome_reg: "Veneto", cap: "35100" },
  { codice: "028001", nome: "Abano Terme",       sigla_prov: "PD", nome_prov: "Padova",            nome_reg: "Veneto", cap: "35031" },
  { codice: "028025", nome: "Cittadella",        sigla_prov: "PD", nome_prov: "Padova",            nome_reg: "Veneto", cap: "35013" },
  { codice: "028036", nome: "Este",              sigla_prov: "PD", nome_prov: "Padova",            nome_reg: "Veneto", cap: "35042" },
  // Vicenza (VI)
  { codice: "024116", nome: "Vicenza",           sigla_prov: "VI", nome_prov: "Vicenza",           nome_reg: "Veneto", cap: "36100" },
  { codice: "024011", nome: "Bassano del Grappa",sigla_prov: "VI", nome_prov: "Vicenza",           nome_reg: "Veneto", cap: "36061" },
  { codice: "024041", nome: "Marostica",         sigla_prov: "VI", nome_prov: "Vicenza",           nome_reg: "Veneto", cap: "36063" },
  { codice: "024049", nome: "Schio",             sigla_prov: "VI", nome_prov: "Vicenza",           nome_reg: "Veneto", cap: "36015" },
  { codice: "024112", nome: "Thiene",            sigla_prov: "VI", nome_prov: "Vicenza",           nome_reg: "Veneto", cap: "36016" },
  // Treviso (TV)
  { codice: "026080", nome: "Treviso",           sigla_prov: "TV", nome_prov: "Treviso",           nome_reg: "Veneto", cap: "31100" },
  { codice: "026006", nome: "Castelfranco Veneto", sigla_prov: "TV", nome_prov: "Treviso",         nome_reg: "Veneto", cap: "31033" },
  { codice: "026039", nome: "Conegliano",        sigla_prov: "TV", nome_prov: "Treviso",           nome_reg: "Veneto", cap: "31015" },
  { codice: "026041", nome: "Montebelluna",      sigla_prov: "TV", nome_prov: "Treviso",           nome_reg: "Veneto", cap: "31044" },
  { codice: "026076", nome: "Vittorio Veneto",   sigla_prov: "TV", nome_prov: "Treviso",           nome_reg: "Veneto", cap: "31029" },
  // Belluno (BL)
  { codice: "025008", nome: "Belluno",           sigla_prov: "BL", nome_prov: "Belluno",           nome_reg: "Veneto", cap: "32100" },
  { codice: "025019", nome: "Cortina d'Ampezzo", sigla_prov: "BL", nome_prov: "Belluno",           nome_reg: "Veneto", cap: "32043" },
  { codice: "025029", nome: "Feltre",            sigla_prov: "BL", nome_prov: "Belluno",           nome_reg: "Veneto", cap: "32032" },
  // Rovigo (RO)
  { codice: "029036", nome: "Rovigo",            sigla_prov: "RO", nome_prov: "Rovigo",            nome_reg: "Veneto", cap: "45100" },
  { codice: "029006", nome: "Adria",             sigla_prov: "RO", nome_prov: "Rovigo",            nome_reg: "Veneto", cap: "45011" },
  { codice: "029048", nome: "Porto Viro",        sigla_prov: "RO", nome_prov: "Rovigo",            nome_reg: "Veneto", cap: "45014" },

  // =========================================================================
  // FRIULI-VENEZIA GIULIA
  // =========================================================================
  // Trieste (TS)
  { codice: "032006", nome: "Trieste",           sigla_prov: "TS", nome_prov: "Trieste",           nome_reg: "Friuli-Venezia Giulia", cap: "34100" },
  { codice: "032002", nome: "Duino Aurisina",    sigla_prov: "TS", nome_prov: "Trieste",           nome_reg: "Friuli-Venezia Giulia", cap: "34011" },
  { codice: "032003", nome: "Monrupino",         sigla_prov: "TS", nome_prov: "Trieste",           nome_reg: "Friuli-Venezia Giulia", cap: "34016" },
  // Udine (UD)
  { codice: "030129", nome: "Udine",             sigla_prov: "UD", nome_prov: "Udine",             nome_reg: "Friuli-Venezia Giulia", cap: "33100" },
  { codice: "030009", nome: "Cividale del Friuli", sigla_prov: "UD", nome_prov: "Udine",           nome_reg: "Friuli-Venezia Giulia", cap: "33043" },
  { codice: "030074", nome: "Codroipo",          sigla_prov: "UD", nome_prov: "Udine",             nome_reg: "Friuli-Venezia Giulia", cap: "33033" },
  { codice: "030118", nome: "Tolmezzo",          sigla_prov: "UD", nome_prov: "Udine",             nome_reg: "Friuli-Venezia Giulia", cap: "33028" },
  // Gorizia (GO)
  { codice: "031007", nome: "Gorizia",           sigla_prov: "GO", nome_prov: "Gorizia",           nome_reg: "Friuli-Venezia Giulia", cap: "34170" },
  { codice: "031017", nome: "Monfalcone",        sigla_prov: "GO", nome_prov: "Gorizia",           nome_reg: "Friuli-Venezia Giulia", cap: "34074" },
  // Pordenone (PN)
  { codice: "093033", nome: "Pordenone",         sigla_prov: "PN", nome_prov: "Pordenone",         nome_reg: "Friuli-Venezia Giulia", cap: "33170" },
  { codice: "093007", nome: "Sacile",            sigla_prov: "PN", nome_prov: "Pordenone",         nome_reg: "Friuli-Venezia Giulia", cap: "33077" },
  { codice: "093004", nome: "San Vito al Tagliamento", sigla_prov: "PN", nome_prov: "Pordenone",   nome_reg: "Friuli-Venezia Giulia", cap: "33078" },

  // =========================================================================
  // EMILIA-ROMAGNA
  // =========================================================================
  // Bologna (BO)
  { codice: "037006", nome: "Bologna",           sigla_prov: "BO", nome_prov: "Bologna",           nome_reg: "Emilia-Romagna", cap: "40100" },
  { codice: "037001", nome: "Imola",             sigla_prov: "BO", nome_prov: "Bologna",           nome_reg: "Emilia-Romagna", cap: "40026" },
  { codice: "037062", nome: "San Lazzaro di Savena", sigla_prov: "BO", nome_prov: "Bologna",       nome_reg: "Emilia-Romagna", cap: "40068" },
  { codice: "037040", nome: "Casalecchio di Reno", sigla_prov: "BO", nome_prov: "Bologna",         nome_reg: "Emilia-Romagna", cap: "40033" },
  // Modena (MO)
  { codice: "036023", nome: "Modena",            sigla_prov: "MO", nome_prov: "Modena",            nome_reg: "Emilia-Romagna", cap: "41100" },
  { codice: "036004", nome: "Carpi",             sigla_prov: "MO", nome_prov: "Modena",            nome_reg: "Emilia-Romagna", cap: "41012" },
  { codice: "036014", nome: "Sassuolo",          sigla_prov: "MO", nome_prov: "Modena",            nome_reg: "Emilia-Romagna", cap: "41049" },
  { codice: "036007", nome: "Formigine",         sigla_prov: "MO", nome_prov: "Modena",            nome_reg: "Emilia-Romagna", cap: "41043" },
  // Parma (PR)
  { codice: "034027", nome: "Parma",             sigla_prov: "PR", nome_prov: "Parma",             nome_reg: "Emilia-Romagna", cap: "43100" },
  { codice: "034004", nome: "Fidenza",           sigla_prov: "PR", nome_prov: "Parma",             nome_reg: "Emilia-Romagna", cap: "43036" },
  { codice: "034006", nome: "Salsomaggiore Terme", sigla_prov: "PR", nome_prov: "Parma",           nome_reg: "Emilia-Romagna", cap: "43039" },
  // Reggio Emilia (RE)
  { codice: "035033", nome: "Reggio nell'Emilia",sigla_prov: "RE", nome_prov: "Reggio nell'Emilia", nome_reg: "Emilia-Romagna", cap: "42100" },
  { codice: "035007", nome: "Correggio",         sigla_prov: "RE", nome_prov: "Reggio nell'Emilia", nome_reg: "Emilia-Romagna", cap: "42015" },
  { codice: "035031", nome: "Scandiano",         sigla_prov: "RE", nome_prov: "Reggio nell'Emilia", nome_reg: "Emilia-Romagna", cap: "42019" },
  // Ferrara (FE)
  { codice: "038008", nome: "Ferrara",           sigla_prov: "FE", nome_prov: "Ferrara",           nome_reg: "Emilia-Romagna", cap: "44100" },
  { codice: "038004", nome: "Cento",             sigla_prov: "FE", nome_prov: "Ferrara",           nome_reg: "Emilia-Romagna", cap: "44042" },
  { codice: "038015", nome: "Comacchio",         sigla_prov: "FE", nome_prov: "Ferrara",           nome_reg: "Emilia-Romagna", cap: "44022" },
  // Forlì-Cesena (FC)
  { codice: "040015", nome: "Forlì",             sigla_prov: "FC", nome_prov: "Forlì-Cesena",      nome_reg: "Emilia-Romagna", cap: "47100" },
  { codice: "040007", nome: "Cesena",            sigla_prov: "FC", nome_prov: "Forlì-Cesena",      nome_reg: "Emilia-Romagna", cap: "47521" },
  { codice: "040044", nome: "Cesenatico",        sigla_prov: "FC", nome_prov: "Forlì-Cesena",      nome_reg: "Emilia-Romagna", cap: "47042" },
  // Ravenna (RA)
  { codice: "039014", nome: "Ravenna",           sigla_prov: "RA", nome_prov: "Ravenna",           nome_reg: "Emilia-Romagna", cap: "48100" },
  { codice: "039004", nome: "Faenza",            sigla_prov: "RA", nome_prov: "Ravenna",           nome_reg: "Emilia-Romagna", cap: "48018" },
  { codice: "039009", nome: "Lugo",              sigla_prov: "RA", nome_prov: "Ravenna",           nome_reg: "Emilia-Romagna", cap: "48022" },
  // Rimini (RN)
  { codice: "099028", nome: "Rimini",            sigla_prov: "RN", nome_prov: "Rimini",            nome_reg: "Emilia-Romagna", cap: "47900" },
  { codice: "099002", nome: "Cattolica",         sigla_prov: "RN", nome_prov: "Rimini",            nome_reg: "Emilia-Romagna", cap: "47841" },
  { codice: "099015", nome: "Riccione",          sigla_prov: "RN", nome_prov: "Rimini",            nome_reg: "Emilia-Romagna", cap: "47838" },
  { codice: "099034", nome: "Santarcangelo di Romagna", sigla_prov: "RN", nome_prov: "Rimini",     nome_reg: "Emilia-Romagna", cap: "47822" },
  // Piacenza (PC)
  { codice: "033036", nome: "Piacenza",          sigla_prov: "PC", nome_prov: "Piacenza",          nome_reg: "Emilia-Romagna", cap: "29100" },
  { codice: "033005", nome: "Castel San Giovanni", sigla_prov: "PC", nome_prov: "Piacenza",        nome_reg: "Emilia-Romagna", cap: "29015" },
  { codice: "033027", nome: "Fiorenzuola d'Arda", sigla_prov: "PC", nome_prov: "Piacenza",         nome_reg: "Emilia-Romagna", cap: "29017" },

  // =========================================================================
  // TOSCANA
  // =========================================================================
  // Firenze (FI)
  { codice: "048017", nome: "Firenze",           sigla_prov: "FI", nome_prov: "Firenze",           nome_reg: "Toscana", cap: "50100" },
  { codice: "048001", nome: "Bagno a Ripoli",    sigla_prov: "FI", nome_prov: "Firenze",           nome_reg: "Toscana", cap: "50012" },
  { codice: "048008", nome: "Campi Bisenzio",    sigla_prov: "FI", nome_prov: "Firenze",           nome_reg: "Toscana", cap: "50013" },
  { codice: "048038", nome: "Scandicci",         sigla_prov: "FI", nome_prov: "Firenze",           nome_reg: "Toscana", cap: "50018" },
  { codice: "048046", nome: "Sesto Fiorentino",  sigla_prov: "FI", nome_prov: "Firenze",           nome_reg: "Toscana", cap: "50019" },
  // Siena (SI)
  { codice: "052032", nome: "Siena",             sigla_prov: "SI", nome_prov: "Siena",             nome_reg: "Toscana", cap: "53100" },
  { codice: "052007", nome: "Chiusi",            sigla_prov: "SI", nome_prov: "Siena",             nome_reg: "Toscana", cap: "53043" },
  { codice: "052011", nome: "Colle di Val d'Elsa", sigla_prov: "SI", nome_prov: "Siena",           nome_reg: "Toscana", cap: "53034" },
  { codice: "052026", nome: "Montepulciano",     sigla_prov: "SI", nome_prov: "Siena",             nome_reg: "Toscana", cap: "53045" },
  // Arezzo (AR)
  { codice: "051002", nome: "Arezzo",            sigla_prov: "AR", nome_prov: "Arezzo",            nome_reg: "Toscana", cap: "52100" },
  { codice: "051011", nome: "Cortona",           sigla_prov: "AR", nome_prov: "Arezzo",            nome_reg: "Toscana", cap: "52044" },
  { codice: "051030", nome: "Sansepolcro",       sigla_prov: "AR", nome_prov: "Arezzo",            nome_reg: "Toscana", cap: "52037" },
  // Pistoia (PT)
  { codice: "047014", nome: "Pistoia",           sigla_prov: "PT", nome_prov: "Pistoia",           nome_reg: "Toscana", cap: "51100" },
  { codice: "047024", nome: "Montecatini-Terme", sigla_prov: "PT", nome_prov: "Pistoia",           nome_reg: "Toscana", cap: "51016" },
  // Prato (PO)
  { codice: "100003", nome: "Prato",             sigla_prov: "PO", nome_prov: "Prato",             nome_reg: "Toscana", cap: "59100" },
  // Lucca (LU)
  { codice: "046017", nome: "Lucca",             sigla_prov: "LU", nome_prov: "Lucca",             nome_reg: "Toscana", cap: "55100" },
  { codice: "046003", nome: "Camaiore",          sigla_prov: "LU", nome_prov: "Lucca",             nome_reg: "Toscana", cap: "55041" },
  { codice: "046028", nome: "Viareggio",         sigla_prov: "LU", nome_prov: "Lucca",             nome_reg: "Toscana", cap: "55049" },
  // Pisa (PI)
  { codice: "050026", nome: "Pisa",              sigla_prov: "PI", nome_prov: "Pisa",              nome_reg: "Toscana", cap: "56100" },
  { codice: "050009", nome: "Cascina",           sigla_prov: "PI", nome_prov: "Pisa",              nome_reg: "Toscana", cap: "56021" },
  { codice: "050023", nome: "Pontedera",         sigla_prov: "PI", nome_prov: "Pisa",              nome_reg: "Toscana", cap: "56025" },
  // Livorno (LI)
  { codice: "049009", nome: "Livorno",           sigla_prov: "LI", nome_prov: "Livorno",           nome_reg: "Toscana", cap: "57100" },
  { codice: "049005", nome: "Cecina",            sigla_prov: "LI", nome_prov: "Livorno",           nome_reg: "Toscana", cap: "57023" },
  { codice: "049019", nome: "Piombino",          sigla_prov: "LI", nome_prov: "Livorno",           nome_reg: "Toscana", cap: "57025" },
  // Grosseto (GR)
  { codice: "053012", nome: "Grosseto",          sigla_prov: "GR", nome_prov: "Grosseto",          nome_reg: "Toscana", cap: "58100" },
  { codice: "053019", nome: "Follonica",         sigla_prov: "GR", nome_prov: "Grosseto",          nome_reg: "Toscana", cap: "58022" },
  { codice: "053027", nome: "Orbetello",         sigla_prov: "GR", nome_prov: "Grosseto",          nome_reg: "Toscana", cap: "58015" },
  // Massa-Carrara (MS)
  { codice: "045011", nome: "Massa",             sigla_prov: "MS", nome_prov: "Massa-Carrara",     nome_reg: "Toscana", cap: "54100" },
  { codice: "045003", nome: "Carrara",           sigla_prov: "MS", nome_prov: "Massa-Carrara",     nome_reg: "Toscana", cap: "54033" },

  // =========================================================================
  // UMBRIA
  // =========================================================================
  // Perugia (PG)
  { codice: "054039", nome: "Perugia",           sigla_prov: "PG", nome_prov: "Perugia",           nome_reg: "Umbria", cap: "06100" },
  { codice: "054002", nome: "Assisi",            sigla_prov: "PG", nome_prov: "Perugia",           nome_reg: "Umbria", cap: "06081" },
  { codice: "054026", nome: "Foligno",           sigla_prov: "PG", nome_prov: "Perugia",           nome_reg: "Umbria", cap: "06034" },
  { codice: "054052", nome: "Spoleto",           sigla_prov: "PG", nome_prov: "Perugia",           nome_reg: "Umbria", cap: "06049" },
  { codice: "054061", nome: "Città di Castello", sigla_prov: "PG", nome_prov: "Perugia",           nome_reg: "Umbria", cap: "06012" },
  // Terni (TR)
  { codice: "055032", nome: "Terni",             sigla_prov: "TR", nome_prov: "Terni",             nome_reg: "Umbria", cap: "05100" },
  { codice: "055004", nome: "Amelia",            sigla_prov: "TR", nome_prov: "Terni",             nome_reg: "Umbria", cap: "05022" },
  { codice: "055018", nome: "Narni",             sigla_prov: "TR", nome_prov: "Terni",             nome_reg: "Umbria", cap: "05035" },
  { codice: "055021", nome: "Orvieto",           sigla_prov: "TR", nome_prov: "Terni",             nome_reg: "Umbria", cap: "05018" },

  // =========================================================================
  // MARCHE
  // =========================================================================
  // Ancona (AN)
  { codice: "042002", nome: "Ancona",            sigla_prov: "AN", nome_prov: "Ancona",            nome_reg: "Marche", cap: "60100" },
  { codice: "042008", nome: "Falconara Marittima", sigla_prov: "AN", nome_prov: "Ancona",          nome_reg: "Marche", cap: "60015" },
  { codice: "042024", nome: "Jesi",              sigla_prov: "AN", nome_prov: "Ancona",            nome_reg: "Marche", cap: "60035" },
  { codice: "042042", nome: "Senigallia",        sigla_prov: "AN", nome_prov: "Ancona",            nome_reg: "Marche", cap: "60019" },
  // Pesaro e Urbino (PU)
  { codice: "041038", nome: "Pesaro",            sigla_prov: "PU", nome_prov: "Pesaro e Urbino",   nome_reg: "Marche", cap: "61100" },
  { codice: "041063", nome: "Urbino",            sigla_prov: "PU", nome_prov: "Pesaro e Urbino",   nome_reg: "Marche", cap: "61029" },
  { codice: "041014", nome: "Fano",              sigla_prov: "PU", nome_prov: "Pesaro e Urbino",   nome_reg: "Marche", cap: "61032" },
  // Macerata (MC)
  { codice: "043022", nome: "Macerata",          sigla_prov: "MC", nome_prov: "Macerata",          nome_reg: "Marche", cap: "62100" },
  { codice: "043016", nome: "Civitanova Marche", sigla_prov: "MC", nome_prov: "Macerata",          nome_reg: "Marche", cap: "62012" },
  { codice: "043028", nome: "Porto Recanati",    sigla_prov: "MC", nome_prov: "Macerata",          nome_reg: "Marche", cap: "62017" },
  // Ascoli Piceno (AP)
  { codice: "044003", nome: "Ascoli Piceno",     sigla_prov: "AP", nome_prov: "Ascoli Piceno",     nome_reg: "Marche", cap: "63100" },
  { codice: "044049", nome: "San Benedetto del Tronto", sigla_prov: "AP", nome_prov: "Ascoli Piceno", nome_reg: "Marche", cap: "63074" },
  // Fermo (FM)
  { codice: "109013", nome: "Fermo",             sigla_prov: "FM", nome_prov: "Fermo",             nome_reg: "Marche", cap: "63900" },
  { codice: "109001", nome: "Amandola",          sigla_prov: "FM", nome_prov: "Fermo",             nome_reg: "Marche", cap: "63857" },
  { codice: "109027", nome: "Porto San Giorgio", sigla_prov: "FM", nome_prov: "Fermo",             nome_reg: "Marche", cap: "63822" },

  // =========================================================================
  // LAZIO
  // =========================================================================
  // Roma (RM)
  { codice: "058091", nome: "Roma",              sigla_prov: "RM", nome_prov: "Roma",              nome_reg: "Lazio", cap: "00100" },
  { codice: "058014", nome: "Civitavecchia",     sigla_prov: "RM", nome_prov: "Roma",              nome_reg: "Lazio", cap: "00053" },
  { codice: "058007", nome: "Velletri",          sigla_prov: "RM", nome_prov: "Roma",              nome_reg: "Lazio", cap: "00049" },
  { codice: "058006", nome: "Guidonia Montecelio", sigla_prov: "RM", nome_prov: "Roma",            nome_reg: "Lazio", cap: "00012" },
  { codice: "058108", nome: "Tivoli",            sigla_prov: "RM", nome_prov: "Roma",              nome_reg: "Lazio", cap: "00019" },
  { codice: "058097", nome: "Anzio",             sigla_prov: "RM", nome_prov: "Roma",              nome_reg: "Lazio", cap: "00042" },
  // Viterbo (VT)
  { codice: "056059", nome: "Viterbo",           sigla_prov: "VT", nome_prov: "Viterbo",           nome_reg: "Lazio", cap: "01100" },
  { codice: "056029", nome: "Montefiascone",     sigla_prov: "VT", nome_prov: "Viterbo",           nome_reg: "Lazio", cap: "01027" },
  { codice: "056032", nome: "Tarquinia",         sigla_prov: "VT", nome_prov: "Viterbo",           nome_reg: "Lazio", cap: "01016" },
  // Rieti (RI)
  { codice: "057052", nome: "Rieti",             sigla_prov: "RI", nome_prov: "Rieti",             nome_reg: "Lazio", cap: "02100" },
  { codice: "057021", nome: "Fara in Sabina",    sigla_prov: "RI", nome_prov: "Rieti",             nome_reg: "Lazio", cap: "02032" },
  // Latina (LT)
  { codice: "059012", nome: "Latina",            sigla_prov: "LT", nome_prov: "Latina",            nome_reg: "Lazio", cap: "04100" },
  { codice: "059009", nome: "Aprilia",           sigla_prov: "LT", nome_prov: "Latina",            nome_reg: "Lazio", cap: "04011" },
  { codice: "059021", nome: "Formia",            sigla_prov: "LT", nome_prov: "Latina",            nome_reg: "Lazio", cap: "04023" },
  { codice: "059028", nome: "Terracina",         sigla_prov: "LT", nome_prov: "Latina",            nome_reg: "Lazio", cap: "04019" },
  // Frosinone (FR)
  { codice: "060038", nome: "Frosinone",         sigla_prov: "FR", nome_prov: "Frosinone",         nome_reg: "Lazio", cap: "03100" },
  { codice: "060020", nome: "Cassino",           sigla_prov: "FR", nome_prov: "Frosinone",         nome_reg: "Lazio", cap: "03043" },
  { codice: "060057", nome: "Sora",              sigla_prov: "FR", nome_prov: "Frosinone",         nome_reg: "Lazio", cap: "03039" },

  // =========================================================================
  // ABRUZZO
  // =========================================================================
  // L'Aquila (AQ)
  { codice: "066049", nome: "L'Aquila",          sigla_prov: "AQ", nome_prov: "L'Aquila",          nome_reg: "Abruzzo", cap: "67100" },
  { codice: "066001", nome: "Avezzano",          sigla_prov: "AQ", nome_prov: "L'Aquila",          nome_reg: "Abruzzo", cap: "67051" },
  { codice: "066087", nome: "Sulmona",           sigla_prov: "AQ", nome_prov: "L'Aquila",          nome_reg: "Abruzzo", cap: "67039" },
  // Teramo (TE)
  { codice: "067041", nome: "Teramo",            sigla_prov: "TE", nome_prov: "Teramo",            nome_reg: "Abruzzo", cap: "64100" },
  { codice: "067006", nome: "Giulianova",        sigla_prov: "TE", nome_prov: "Teramo",            nome_reg: "Abruzzo", cap: "64021" },
  { codice: "067038", nome: "Roseto degli Abruzzi", sigla_prov: "TE", nome_prov: "Teramo",         nome_reg: "Abruzzo", cap: "64026" },
  // Pescara (PE)
  { codice: "068028", nome: "Pescara",           sigla_prov: "PE", nome_prov: "Pescara",           nome_reg: "Abruzzo", cap: "65100" },
  { codice: "068003", nome: "Montesilvano",      sigla_prov: "PE", nome_prov: "Pescara",           nome_reg: "Abruzzo", cap: "65015" },
  // Chieti (CH)
  { codice: "069021", nome: "Chieti",            sigla_prov: "CH", nome_prov: "Chieti",            nome_reg: "Abruzzo", cap: "66100" },
  { codice: "069006", nome: "Francavilla al Mare", sigla_prov: "CH", nome_prov: "Chieti",          nome_reg: "Abruzzo", cap: "66023" },
  { codice: "069073", nome: "Ortona",            sigla_prov: "CH", nome_prov: "Chieti",            nome_reg: "Abruzzo", cap: "66026" },
  { codice: "069044", nome: "Lanciano",          sigla_prov: "CH", nome_prov: "Chieti",            nome_reg: "Abruzzo", cap: "66034" },
  { codice: "069098", nome: "Vasto",             sigla_prov: "CH", nome_prov: "Chieti",            nome_reg: "Abruzzo", cap: "66054" },

  // =========================================================================
  // MOLISE
  // =========================================================================
  // Campobasso (CB)
  { codice: "070006", nome: "Campobasso",        sigla_prov: "CB", nome_prov: "Campobasso",        nome_reg: "Molise", cap: "86100" },
  { codice: "070019", nome: "Isernia",           sigla_prov: "IS", nome_prov: "Isernia",           nome_reg: "Molise", cap: "86170" },
  { codice: "070009", nome: "Termoli",           sigla_prov: "CB", nome_prov: "Campobasso",        nome_reg: "Molise", cap: "86039" },
  // Isernia (IS)
  { codice: "094023", nome: "Venafro",           sigla_prov: "IS", nome_prov: "Isernia",           nome_reg: "Molise", cap: "86079" },

  // =========================================================================
  // CAMPANIA
  // =========================================================================
  // Napoli (NA)
  { codice: "063049", nome: "Napoli",            sigla_prov: "NA", nome_prov: "Napoli",            nome_reg: "Campania", cap: "80100" },
  { codice: "063001", nome: "Acerra",            sigla_prov: "NA", nome_prov: "Napoli",            nome_reg: "Campania", cap: "80011" },
  { codice: "063021", nome: "Ercolano",          sigla_prov: "NA", nome_prov: "Napoli",            nome_reg: "Campania", cap: "80056" },
  { codice: "063041", nome: "Giugliano in Campania", sigla_prov: "NA", nome_prov: "Napoli",        nome_reg: "Campania", cap: "80014" },
  { codice: "063044", nome: "Portici",           sigla_prov: "NA", nome_prov: "Napoli",            nome_reg: "Campania", cap: "80055" },
  { codice: "063061", nome: "Pozzuoli",          sigla_prov: "NA", nome_prov: "Napoli",            nome_reg: "Campania", cap: "80078" },
  { codice: "063066", nome: "Torre del Greco",   sigla_prov: "NA", nome_prov: "Napoli",            nome_reg: "Campania", cap: "80059" },
  // Salerno (SA)
  { codice: "065108", nome: "Salerno",           sigla_prov: "SA", nome_prov: "Salerno",           nome_reg: "Campania", cap: "84100" },
  { codice: "065009", nome: "Battipaglia",       sigla_prov: "SA", nome_prov: "Salerno",           nome_reg: "Campania", cap: "84091" },
  { codice: "065091", nome: "Nocera Inferiore",  sigla_prov: "SA", nome_prov: "Salerno",           nome_reg: "Campania", cap: "84014" },
  // Caserta (CE)
  { codice: "061023", nome: "Caserta",           sigla_prov: "CE", nome_prov: "Caserta",           nome_reg: "Campania", cap: "81100" },
  { codice: "061014", nome: "Aversa",            sigla_prov: "CE", nome_prov: "Caserta",           nome_reg: "Campania", cap: "81031" },
  { codice: "061041", nome: "Mondragone",        sigla_prov: "CE", nome_prov: "Caserta",           nome_reg: "Campania", cap: "81034" },
  // Avellino (AV)
  { codice: "064007", nome: "Avellino",          sigla_prov: "AV", nome_prov: "Avellino",          nome_reg: "Campania", cap: "83100" },
  { codice: "064002", nome: "Ariano Irpino",     sigla_prov: "AV", nome_prov: "Avellino",          nome_reg: "Campania", cap: "83031" },
  // Benevento (BN)
  { codice: "062009", nome: "Benevento",         sigla_prov: "BN", nome_prov: "Benevento",         nome_reg: "Campania", cap: "82100" },

  // =========================================================================
  // PUGLIA
  // =========================================================================
  // Bari (BA)
  { codice: "072006", nome: "Bari",              sigla_prov: "BA", nome_prov: "Bari",              nome_reg: "Puglia", cap: "70100" },
  { codice: "072003", nome: "Altamura",          sigla_prov: "BA", nome_prov: "Bari",              nome_reg: "Puglia", cap: "70022" },
  { codice: "072009", nome: "Bitonto",           sigla_prov: "BA", nome_prov: "Bari",              nome_reg: "Puglia", cap: "70032" },
  { codice: "072018", nome: "Modugno",           sigla_prov: "BA", nome_prov: "Bari",              nome_reg: "Puglia", cap: "70026" },
  { codice: "072019", nome: "Mola di Bari",      sigla_prov: "BA", nome_prov: "Bari",              nome_reg: "Puglia", cap: "70042" },
  // Taranto (TA)
  { codice: "073027", nome: "Taranto",           sigla_prov: "TA", nome_prov: "Taranto",           nome_reg: "Puglia", cap: "74100" },
  { codice: "073003", nome: "Grottaglie",        sigla_prov: "TA", nome_prov: "Taranto",           nome_reg: "Puglia", cap: "74023" },
  { codice: "073013", nome: "Manduria",          sigla_prov: "TA", nome_prov: "Taranto",           nome_reg: "Puglia", cap: "74024" },
  // Lecce (LE)
  { codice: "075036", nome: "Lecce",             sigla_prov: "LE", nome_prov: "Lecce",             nome_reg: "Puglia", cap: "73100" },
  { codice: "075016", nome: "Gallipoli",         sigla_prov: "LE", nome_prov: "Lecce",             nome_reg: "Puglia", cap: "73014" },
  { codice: "075058", nome: "Nardò",             sigla_prov: "LE", nome_prov: "Lecce",             nome_reg: "Puglia", cap: "73048" },
  { codice: "075067", nome: "Galatina",          sigla_prov: "LE", nome_prov: "Lecce",             nome_reg: "Puglia", cap: "73013" },
  // Foggia (FG)
  { codice: "071024", nome: "Foggia",            sigla_prov: "FG", nome_prov: "Foggia",            nome_reg: "Puglia", cap: "71100" },
  { codice: "071005", nome: "Cerignola",         sigla_prov: "FG", nome_prov: "Foggia",            nome_reg: "Puglia", cap: "71042" },
  { codice: "071022", nome: "Manfredonia",       sigla_prov: "FG", nome_prov: "Foggia",            nome_reg: "Puglia", cap: "71043" },
  { codice: "071048", nome: "Lucera",            sigla_prov: "FG", nome_prov: "Foggia",            nome_reg: "Puglia", cap: "71036" },
  // Brindisi (BR)
  { codice: "074002", nome: "Brindisi",          sigla_prov: "BR", nome_prov: "Brindisi",          nome_reg: "Puglia", cap: "72100" },
  { codice: "074001", nome: "Fasano",            sigla_prov: "BR", nome_prov: "Brindisi",          nome_reg: "Puglia", cap: "72015" },
  { codice: "074008", nome: "Ostuni",            sigla_prov: "BR", nome_prov: "Brindisi",          nome_reg: "Puglia", cap: "72017" },
  // Barletta-Andria-Trani (BT)
  { codice: "110001", nome: "Andria",            sigla_prov: "BT", nome_prov: "Barletta-Andria-Trani", nome_reg: "Puglia", cap: "76123" },
  { codice: "110002", nome: "Barletta",          sigla_prov: "BT", nome_prov: "Barletta-Andria-Trani", nome_reg: "Puglia", cap: "76121" },
  { codice: "110009", nome: "Trani",             sigla_prov: "BT", nome_prov: "Barletta-Andria-Trani", nome_reg: "Puglia", cap: "76125" },

  // =========================================================================
  // BASILICATA
  // =========================================================================
  // Potenza (PZ)
  { codice: "076063", nome: "Potenza",           sigla_prov: "PZ", nome_prov: "Potenza",           nome_reg: "Basilicata", cap: "85100" },
  { codice: "076095", nome: "Melfi",             sigla_prov: "PZ", nome_prov: "Potenza",           nome_reg: "Basilicata", cap: "85025" },
  { codice: "076079", nome: "Lagonegro",         sigla_prov: "PZ", nome_prov: "Potenza",           nome_reg: "Basilicata", cap: "85042" },
  // Matera (MT)
  { codice: "077014", nome: "Matera",            sigla_prov: "MT", nome_prov: "Matera",            nome_reg: "Basilicata", cap: "75100" },
  { codice: "077004", nome: "Bernalda",          sigla_prov: "MT", nome_prov: "Matera",            nome_reg: "Basilicata", cap: "75012" },
  { codice: "077025", nome: "Pisticci",          sigla_prov: "MT", nome_prov: "Matera",            nome_reg: "Basilicata", cap: "75015" },

  // =========================================================================
  // CALABRIA
  // =========================================================================
  // Reggio Calabria (RC)
  { codice: "080063", nome: "Reggio Calabria",   sigla_prov: "RC", nome_prov: "Reggio di Calabria", nome_reg: "Calabria", cap: "89100" },
  { codice: "080006", nome: "Gioia Tauro",       sigla_prov: "RC", nome_prov: "Reggio di Calabria", nome_reg: "Calabria", cap: "89013" },
  { codice: "080072", nome: "Locri",             sigla_prov: "RC", nome_prov: "Reggio di Calabria", nome_reg: "Calabria", cap: "89044" },
  // Catanzaro (CZ)
  { codice: "079023", nome: "Catanzaro",         sigla_prov: "CZ", nome_prov: "Catanzaro",         nome_reg: "Calabria", cap: "88100" },
  { codice: "079100", nome: "Lamezia Terme",     sigla_prov: "CZ", nome_prov: "Catanzaro",         nome_reg: "Calabria", cap: "88046" },
  { codice: "079028", nome: "Soverato",          sigla_prov: "CZ", nome_prov: "Catanzaro",         nome_reg: "Calabria", cap: "88068" },
  // Cosenza (CS)
  { codice: "078042", nome: "Cosenza",           sigla_prov: "CS", nome_prov: "Cosenza",           nome_reg: "Calabria", cap: "87100" },
  { codice: "078084", nome: "Corigliano-Rossano",sigla_prov: "CS", nome_prov: "Cosenza",           nome_reg: "Calabria", cap: "87064" },
  { codice: "078152", nome: "Rende",             sigla_prov: "CS", nome_prov: "Cosenza",           nome_reg: "Calabria", cap: "87036" },
  { codice: "078068", nome: "Paola",             sigla_prov: "CS", nome_prov: "Cosenza",           nome_reg: "Calabria", cap: "87027" },
  // Vibo Valentia (VV)
  { codice: "102044", nome: "Vibo Valentia",     sigla_prov: "VV", nome_prov: "Vibo Valentia",     nome_reg: "Calabria", cap: "89900" },
  { codice: "102028", nome: "Pizzo",             sigla_prov: "VV", nome_prov: "Vibo Valentia",     nome_reg: "Calabria", cap: "89812" },
  // Crotone (KR)
  { codice: "101011", nome: "Crotone",           sigla_prov: "KR", nome_prov: "Crotone",           nome_reg: "Calabria", cap: "88900" },
  { codice: "101004", nome: "Cirò Marina",       sigla_prov: "KR", nome_prov: "Crotone",           nome_reg: "Calabria", cap: "88811" },

  // =========================================================================
  // SICILIA
  // =========================================================================
  // Palermo (PA)
  { codice: "082053", nome: "Palermo",           sigla_prov: "PA", nome_prov: "Palermo",           nome_reg: "Sicilia", cap: "90100" },
  { codice: "082002", nome: "Bagheria",          sigla_prov: "PA", nome_prov: "Palermo",           nome_reg: "Sicilia", cap: "90011" },
  { codice: "082022", nome: "Carini",            sigla_prov: "PA", nome_prov: "Palermo",           nome_reg: "Sicilia", cap: "90044" },
  { codice: "082054", nome: "Marsala",           sigla_prov: "TP", nome_prov: "Trapani",           nome_reg: "Sicilia", cap: "91025" },
  { codice: "082061", nome: "Monreale",          sigla_prov: "PA", nome_prov: "Palermo",           nome_reg: "Sicilia", cap: "90046" },
  // Catania (CT)
  { codice: "087015", nome: "Catania",           sigla_prov: "CT", nome_prov: "Catania",           nome_reg: "Sicilia", cap: "95100" },
  { codice: "087002", nome: "Acireale",          sigla_prov: "CT", nome_prov: "Catania",           nome_reg: "Sicilia", cap: "95024" },
  { codice: "087009", nome: "Biancavilla",       sigla_prov: "CT", nome_prov: "Catania",           nome_reg: "Sicilia", cap: "95033" },
  { codice: "087011", nome: "Caltagirone",       sigla_prov: "CT", nome_prov: "Catania",           nome_reg: "Sicilia", cap: "95041" },
  { codice: "087057", nome: "Paternò",           sigla_prov: "CT", nome_prov: "Catania",           nome_reg: "Sicilia", cap: "95047" },
  // Messina (ME)
  { codice: "083048", nome: "Messina",           sigla_prov: "ME", nome_prov: "Messina",           nome_reg: "Sicilia", cap: "98100" },
  { codice: "083002", nome: "Milazzo",           sigla_prov: "ME", nome_prov: "Messina",           nome_reg: "Sicilia", cap: "98057" },
  { codice: "083029", nome: "Barcellona Pozzo di Gotto", sigla_prov: "ME", nome_prov: "Messina",   nome_reg: "Sicilia", cap: "98051" },
  // Agrigento (AG)
  { codice: "084002", nome: "Agrigento",         sigla_prov: "AG", nome_prov: "Agrigento",         nome_reg: "Sicilia", cap: "92100" },
  { codice: "084003", nome: "Canicattì",         sigla_prov: "AG", nome_prov: "Agrigento",         nome_reg: "Sicilia", cap: "92024" },
  { codice: "084025", nome: "Licata",            sigla_prov: "AG", nome_prov: "Agrigento",         nome_reg: "Sicilia", cap: "92027" },
  { codice: "084033", nome: "Porto Empedocle",   sigla_prov: "AG", nome_prov: "Agrigento",         nome_reg: "Sicilia", cap: "92014" },
  // Ragusa (RG)
  { codice: "088009", nome: "Ragusa",            sigla_prov: "RG", nome_prov: "Ragusa",            nome_reg: "Sicilia", cap: "97100" },
  { codice: "088003", nome: "Comiso",            sigla_prov: "RG", nome_prov: "Ragusa",            nome_reg: "Sicilia", cap: "97013" },
  { codice: "088010", nome: "Vittoria",          sigla_prov: "RG", nome_prov: "Ragusa",            nome_reg: "Sicilia", cap: "97019" },
  // Siracusa (SR)
  { codice: "089018", nome: "Siracusa",          sigla_prov: "SR", nome_prov: "Siracusa",          nome_reg: "Sicilia", cap: "96100" },
  { codice: "089005", nome: "Augusta",           sigla_prov: "SR", nome_prov: "Siracusa",          nome_reg: "Sicilia", cap: "96011" },
  { codice: "089011", nome: "Noto",              sigla_prov: "SR", nome_prov: "Siracusa",          nome_reg: "Sicilia", cap: "96017" },
  // Trapani (TP)
  { codice: "081021", nome: "Trapani",           sigla_prov: "TP", nome_prov: "Trapani",           nome_reg: "Sicilia", cap: "91100" },
  { codice: "081003", nome: "Alcamo",            sigla_prov: "TP", nome_prov: "Trapani",           nome_reg: "Sicilia", cap: "91011" },
  { codice: "081010", nome: "Mazara del Vallo",  sigla_prov: "TP", nome_prov: "Trapani",           nome_reg: "Sicilia", cap: "91026" },
  // Caltanissetta (CL)
  { codice: "085006", nome: "Caltanissetta",     sigla_prov: "CL", nome_prov: "Caltanissetta",     nome_reg: "Sicilia", cap: "93100" },
  { codice: "085007", nome: "Gela",              sigla_prov: "CL", nome_prov: "Caltanissetta",     nome_reg: "Sicilia", cap: "93012" },
  { codice: "085005", nome: "Mussomeli",         sigla_prov: "CL", nome_prov: "Caltanissetta",     nome_reg: "Sicilia", cap: "93014" },
  // Enna (EN)
  { codice: "086010", nome: "Enna",              sigla_prov: "EN", nome_prov: "Enna",              nome_reg: "Sicilia", cap: "94100" },
  { codice: "086015", nome: "Nicosia",           sigla_prov: "EN", nome_prov: "Enna",              nome_reg: "Sicilia", cap: "94014" },
  { codice: "086017", nome: "Piazza Armerina",   sigla_prov: "EN", nome_prov: "Enna",              nome_reg: "Sicilia", cap: "94015" },

  // =========================================================================
  // SARDEGNA
  // =========================================================================
  // Cagliari (CA)
  { codice: "092009", nome: "Cagliari",          sigla_prov: "CA", nome_prov: "Cagliari",          nome_reg: "Sardegna", cap: "09100" },
  { codice: "092010", nome: "Capoterra",         sigla_prov: "CA", nome_prov: "Cagliari",          nome_reg: "Sardegna", cap: "09012" },
  { codice: "092072", nome: "Quartucciu",        sigla_prov: "CA", nome_prov: "Cagliari",          nome_reg: "Sardegna", cap: "09044" },
  { codice: "092090", nome: "Selargius",         sigla_prov: "CA", nome_prov: "Cagliari",          nome_reg: "Sardegna", cap: "09047" },
  // Sassari (SS)
  { codice: "090064", nome: "Sassari",           sigla_prov: "SS", nome_prov: "Sassari",           nome_reg: "Sardegna", cap: "07100" },
  { codice: "090012", nome: "Alghero",           sigla_prov: "SS", nome_prov: "Sassari",           nome_reg: "Sardegna", cap: "07041" },
  { codice: "090019", nome: "Porto Torres",      sigla_prov: "SS", nome_prov: "Sassari",           nome_reg: "Sardegna", cap: "07046" },
  { codice: "090038", nome: "Olbia",             sigla_prov: "OT", nome_prov: "Olbia-Tempio",      nome_reg: "Sardegna", cap: "07026" },
  // Nuoro (NU)
  { codice: "091056", nome: "Nuoro",             sigla_prov: "NU", nome_prov: "Nuoro",             nome_reg: "Sardegna", cap: "08100" },
  { codice: "091014", nome: "Dorgali",           sigla_prov: "NU", nome_prov: "Nuoro",             nome_reg: "Sardegna", cap: "08022" },
  { codice: "091088", nome: "Siniscola",         sigla_prov: "NU", nome_prov: "Nuoro",             nome_reg: "Sardegna", cap: "08029" },
  // Oristano (OR)
  { codice: "095044", nome: "Oristano",          sigla_prov: "OR", nome_prov: "Oristano",          nome_reg: "Sardegna", cap: "09170" },
  { codice: "095072", nome: "Cabras",            sigla_prov: "OR", nome_prov: "Oristano",          nome_reg: "Sardegna", cap: "09072" },
  // Sud Sardegna (SU)
  { codice: "111102", nome: "Carbonia",          sigla_prov: "SU", nome_prov: "Sud Sardegna",      nome_reg: "Sardegna", cap: "09013" },
  { codice: "111048", nome: "Iglesias",          sigla_prov: "SU", nome_prov: "Sud Sardegna",      nome_reg: "Sardegna", cap: "09016" },
  // Olbia-Tempio (OT)
  { codice: "104017", nome: "Tempio Pausania",   sigla_prov: "OT", nome_prov: "Olbia-Tempio",      nome_reg: "Sardegna", cap: "07029" },
  // Medio Campidano / Ogliastra
  { codice: "106011", nome: "Sanluri",           sigla_prov: "VS", nome_prov: "Medio Campidano",   nome_reg: "Sardegna", cap: "09025" },
  { codice: "105008", nome: "Lanusei",           sigla_prov: "OG", nome_prov: "Ogliastra",         nome_reg: "Sardegna", cap: "08045" },
];

// ---------------------------------------------------------------------------
// SEED FUNCTION
// ---------------------------------------------------------------------------

/**
 * Seed the comuni_istat table if it is empty.
 *
 * @param {import('better-sqlite3').Database} db
 * @returns {number} Number of comuni inserted (0 if already seeded)
 */
export function seedComuniIstat(db) {
  const row = db.prepare('SELECT COUNT(*) AS cnt FROM comuni_istat').get();
  if (row && row.cnt > 0) {
    console.log(`[istat-seed] comuni_istat already populated (${row.cnt} rows). Skipping seed.`);
    return 0;
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO comuni_istat
      (codice, nome, sigla_prov, nome_prov, nome_reg, cap)
    VALUES
      (@codice, @nome, @sigla_prov, @nome_prov, @nome_reg, @cap)
  `);

  const insertMany = db.transaction((comuni) => {
    for (const c of comuni) {
      insert.run(c);
    }
  });

  insertMany(COMUNI_ISTAT);

  const inserted = COMUNI_ISTAT.length;
  console.log(`[istat-seed] Inserted ${inserted} comuni into comuni_istat.`);
  return inserted;
}

// ---------------------------------------------------------------------------
// CSV IMPORT FUNCTION
// ---------------------------------------------------------------------------

/**
 * Import comuni from a CSV file in ISTAT format and bulk-insert/update the
 * comuni_istat table.
 *
 * Expected CSV columns (case-insensitive, flexible separator , or ;):
 *   CODICE_COMUNE | DENOMINAZIONE_COMUNE | sigla_prov |
 *   DENOMINAZIONE_PROVINCIA | DENOMINAZIONE_REGIONE | CAP
 *
 * Alternative column names also accepted:
 *   CODICE | NOME | SIGLA_PROV | NOME_PROV | NOME_REG | CAP
 *
 * @param {import('better-sqlite3').Database} db
 * @param {string} csvPath  Absolute path to the CSV file
 * @returns {number} Number of records imported
 */
export async function importComuniFromCsv(db, csvPath) {
  const fs = await import('fs');
  const path = await import('path');

  if (!fs.existsSync(csvPath)) {
    throw new Error(`[istat-seed] CSV file not found: ${csvPath}`);
  }

  const raw = fs.readFileSync(csvPath, 'utf-8');

  // Detect separator
  const firstLine = raw.split(/\r?\n/)[0];
  const sep = firstLine.includes(';') ? ';' : ',';

  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('[istat-seed] CSV file has no data rows.');
  }

  // Parse header
  const headers = lines[0].split(sep).map((h) => h.trim().replace(/^["']|["']$/g, '').toUpperCase());

  /**
   * Find a column index by trying multiple candidate names.
   * @param {string[]} candidates
   * @returns {number}
   */
  const colIndex = (candidates) => {
    for (const c of candidates) {
      const idx = headers.indexOf(c);
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const iCodice   = colIndex(['CODICE_COMUNE', 'CODICE', 'COD_COMUNE', 'codice']);
  const iNome     = colIndex(['DENOMINAZIONE_COMUNE', 'NOME', 'DENOMINAZIONE', 'COMUNE']);
  const iSigla    = colIndex(['sigla_prov', 'SIGLA_PROV', 'SIGLA', 'PROV']);
  const iNomeProv = colIndex(['DENOMINAZIONE_PROVINCIA', 'nome_prov', 'NOME_PROV', 'PROVINCIA']);
  const iNomeReg  = colIndex(['DENOMINAZIONE_REGIONE', 'nome_reg', 'NOME_REG', 'REGIONE']);
  const iCap      = colIndex(['CAP']);

  if (iCodice === -1 || iNome === -1) {
    throw new Error(
      `[istat-seed] Could not find required columns (CODICE_COMUNE, DENOMINAZIONE_COMUNE) in CSV header: ${headers.join(', ')}`
    );
  }

  /**
   * Parse a single CSV line respecting quoted fields.
   * @param {string} line
   * @param {string} separator
   * @returns {string[]}
   */
  function parseCsvLine(line, separator) {
    const result = [];
    let current = '';
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
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  const upsert = db.prepare(`
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

  const get = (fields, idx) => (idx !== -1 && fields[idx] !== undefined ? fields[idx] : '');

  const importMany = db.transaction((dataLines) => {
    let count = 0;
    for (const line of dataLines) {
      if (!line.trim()) continue;
      const fields = parseCsvLine(line, sep);
      const record = {
        codice:    get(fields, iCodice).padStart(6, '0'),
        nome:      get(fields, iNome),
        sigla_prov: get(fields, iSigla),
        nome_prov:  get(fields, iNomeProv),
        nome_reg:   get(fields, iNomeReg),
        cap:        get(fields, iCap),
      };
      if (!record.codice || !record.nome) continue;
      upsert.run(record);
      count++;
    }
    return count;
  });

  const dataLines = lines.slice(1);
  const count = importMany(dataLines);

  console.log(`[istat-seed] Imported ${count} comuni from ${path.basename(csvPath)}.`);
  return count;
}

