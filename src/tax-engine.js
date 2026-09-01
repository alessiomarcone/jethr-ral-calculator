/**
 * Motore di calcolo lordo -> netto per un lavoratore dipendente.
 * Anno d'imposta 2026. Tutti i parametri normativi stanno in PARAMS, REGIONI,
 * CONTRATTI e AGEVOLAZIONI: un solo posto da aggiornare quando cambia la legge.
 *
 * Le fonti di ogni numero sono documentate in README.md.
 */

export const PARAMS = {
  anno: 2026,

  // --- Contributi previdenziali a carico del lavoratore (IVS, FPLD) ---
  contributi: {
    // Aliquota di default: impiegato, terziario. La sposta il contratto scelto.
    aliquotaBase: 0.0919,
    // Art. 3-ter L. 438/1992: +1% sulla quota eccedente la prima fascia
    // di retribuzione pensionabile (INPS circ. 6/2026).
    aliquotaAggiuntiva: 0.01,
    primaFasciaPensionabile: 56224,
    // Massimale annuo per iscritti dal 1/1/1996 (INPS circ. 6/2026).
    massimaleAnnuo: 122295,
  },

  // --- IRPEF (art. 11 TUIR, aliquote rese strutturali dalla L. 199/2025) ---
  irpefScaglioni: [
    { fino: 28000, aliquota: 0.23 },
    { fino: 50000, aliquota: 0.33 },
    { fino: Infinity, aliquota: 0.43 },
  ],

  /**
   * Addizionale comunale: il comune non e' fra gli input richiesti, quindi
   * il prototipo usa un'unica ipotesi dichiarata (aliquota massima ordinaria
   * dell'art. 1 c. 3 D.Lgs. 360/1998). Il comune reale puo' essere piu' basso,
   * esente, o avere una soglia di esenzione propria.
   */
  addizionaleComunale: {
    aliquota: 0.008,
    nota: "aliquota massima ordinaria 0,80%: ipotesi unica, il comune non e' un input",
  },

  // --- Detrazione per redditi da lavoro dipendente (art. 13 c.1 TUIR) ---
  detrazioneLavoro: {
    importoBase: 1955, // reddito <= 15.000
    fascia1: 15000,
    fascia2: 28000,
    fascia3: 50000,
    // Bonus 65 EUR art. 13 c.1-bis TUIR
    bonus65: { da: 25000, a: 35000, importo: 65 },
  },

  // --- Trattamento integrativo, ex "bonus Renzi" (D.L. 3/2020) ---
  trattamentoIntegrativo: {
    importo: 1200,
    sogliaPiena: 15000,
    sogliaMassima: 28000,
    // Capienza verificata sulla detrazione art.13 diminuita di 75 EUR
    scontoCapienza: 75,
  },

  // --- Taglio del cuneo fiscale (L. 207/2024, resa strutturale nel 2026) ---
  cuneo: {
    // A) somma non imponibile per reddito complessivo <= 20.000
    sommaIntegrativa: {
      sogliaRedditoComplessivo: 20000,
      scaglioni: [
        { fino: 8500, percentuale: 0.071 },
        { fino: 15000, percentuale: 0.053 },
        { fino: Infinity, percentuale: 0.048 },
      ],
    },
    // B) ulteriore detrazione per reddito complessivo 20.000 - 40.000
    ulterioreDetrazione: {
      da: 20000,
      pienaFinoA: 32000,
      azzeramentoA: 40000,
      importo: 1000,
    },
  },

  // --- TFR (informativo, non entra nel netto in busta) ---
  tfr: {
    divisore: 13.5,
    contributoFondoGaranzia: 0.005, // 0,50% trattenuto sull'accantonamento
  },
};

/**
 * Addizionale regionale all'IRPEF, anno d'imposta 2026.
 *
 * Fonte unica: MEF - Dipartimento delle Finanze, "Addizionale regionale
 * all'IRPEF - ricerca aliquote applicabili", interrogazione per regione,
 * anno 2026 (dati letti il 1 settembre 2026; la data di pubblicazione
 * della delibera e' riportata in `pubblicazione` regione per regione).
 * https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/addregirpef/
 *
 * Campi:
 *   scaglioni        scala progressiva applicata all'imponibile
 *   flatSottoSoglia  alcune regioni non usano la scala sotto una soglia:
 *                    applicano un'aliquota unica sull'INTERO imponibile
 *   esenzioneFinoA   nessuna addizionale dovuta fino a questo imponibile
 *   detrazioni       detrazioni d'imposta a fascia (non generano credito)
 *   detrazioneCrescente  detrazione proporzionale (solo Bolzano)
 *
 * Non sono modellate le agevolazioni che dipendono dai carichi di famiglia o
 * dalla disabilita' (Campania, Marche, Piemonte, Puglia, Sardegna, Trento,
 * Bolzano, Veneto): il prototipo non chiede la situazione familiare.
 */
export const REGIONI = {
  abruzzo: {
    nome: "Abruzzo",
    codice: "01",
    pubblicazione: "28-01-2026",
    norma: "art. 6 D.Lgs. 68/2011; art. 1 c. 1 L.R. 4 aprile 2025, n. 9",
    scaglioni: [
      { fino: 28000, aliquota: 0.0167 },
      { fino: 50000, aliquota: 0.0287 },
      { fino: Infinity, aliquota: 0.0333 },
    ],
  },
  basilicata: {
    nome: "Basilicata",
    codice: "02",
    pubblicazione: "29-01-2026",
    norma: "art. 6 D.Lgs. 68/2011; art. 50 D.Lgs. 446/1997",
    scaglioni: [{ fino: Infinity, aliquota: 0.0123 }],
  },
  bolzano: {
    nome: "Provincia autonoma di Bolzano",
    codice: "03",
    pubblicazione: "29-01-2026",
    norma: "art. 21/sexiesdecies L.P. 11 agosto 1998, n. 9",
    scaglioni: [
      { fino: 50000, aliquota: 0.0123 },
      { fino: Infinity, aliquota: 0.0173 },
    ],
    detrazioni: [{ da: 0, a: 90000, importo: 430.5 }],
    // Oltre 50.000: 125 x (imponibile - 50.000) / 25.000, massimo 125 EUR.
    detrazioneCrescente: { da: 50000, ampiezza: 25000, massimo: 125 },
  },
  calabria: {
    nome: "Calabria",
    codice: "04",
    pubblicazione: "29-01-2026",
    norma: "art. 1 L.R. 30/2002; art. 29 c. 14 D.L. 216/2011",
    scaglioni: [{ fino: Infinity, aliquota: 0.0173 }],
  },
  campania: {
    nome: "Campania",
    codice: "05",
    pubblicazione: "29-01-2026",
    norma: "art. 1 L.R. 31/2021; art. 1 L.R. 7/2022",
    scaglioni: [
      { fino: 15000, aliquota: 0.0173 },
      { fino: 28000, aliquota: 0.0296 },
      { fino: 50000, aliquota: 0.032 },
      { fino: Infinity, aliquota: 0.0333 },
    ],
  },
  "emilia-romagna": {
    nome: "Emilia-Romagna",
    codice: "06",
    pubblicazione: "19-01-2026",
    norma: "art. 2 L.R. 19/2006, come modificato dalla L.R. 1/2025 e dalla L.R. 9/2025",
    scaglioni: [
      { fino: 15000, aliquota: 0.0133 },
      { fino: 28000, aliquota: 0.0193 },
      { fino: 50000, aliquota: 0.0278 },
      { fino: Infinity, aliquota: 0.0333 },
    ],
  },
  "friuli-venezia-giulia": {
    nome: "Friuli-Venezia Giulia",
    codice: "07",
    pubblicazione: "19-01-2026",
    norma: "art. 1 c. 5 L.R. 14/2012",
    // Fino a 15.000 l'aliquota e' 0,70% sull'intero importo; sopra, 1,23%
    // sull'intero importo (non e' una scala progressiva).
    flatSottoSoglia: { soglia: 15000, aliquota: 0.007 },
    scaglioni: [{ fino: Infinity, aliquota: 0.0123 }],
  },
  lazio: {
    nome: "Lazio",
    codice: "08",
    pubblicazione: "22-01-2026",
    norma: "art. 2 L.R. 31 dicembre 2025, n. 20",
    // Fino a 28.000 si applica l'1,73% sull'intero imponibile.
    flatSottoSoglia: { soglia: 28000, aliquota: 0.0173 },
    scaglioni: [
      { fino: 15000, aliquota: 0.0173 },
      { fino: Infinity, aliquota: 0.0333 },
    ],
    detrazioni: [{ da: 28000.01, a: 30000, importo: 60 }],
  },
  liguria: {
    nome: "Liguria",
    codice: "09",
    pubblicazione: "28-01-2026",
    norma: "art. 2-bis L.R. 17/2024, come modificata dalla L.R. 3/2025",
    scaglioni: [
      { fino: 28000, aliquota: 0.0123 },
      { fino: 50000, aliquota: 0.0318 },
      { fino: Infinity, aliquota: 0.0323 },
    ],
  },
  lombardia: {
    nome: "Lombardia",
    codice: "10",
    pubblicazione: "28-01-2026",
    norma: "art. 72 c. 1 L.R. 14 luglio 2003, n. 10",
    scaglioni: [
      { fino: 15000, aliquota: 0.0123 },
      { fino: 28000, aliquota: 0.0158 },
      { fino: 50000, aliquota: 0.0172 },
      { fino: Infinity, aliquota: 0.0173 },
    ],
  },
  marche: {
    nome: "Marche",
    codice: "11",
    pubblicazione: "22-01-2026",
    norma: "art. 1 L.R. 23 marzo 2022, n. 5",
    scaglioni: [
      { fino: 15000, aliquota: 0.0123 },
      { fino: 28000, aliquota: 0.0153 },
      { fino: 50000, aliquota: 0.017 },
      { fino: Infinity, aliquota: 0.0173 },
    ],
  },
  molise: {
    nome: "Molise",
    codice: "12",
    pubblicazione: "19-06-2026",
    norma: "art. 2 L.R. 9/2013; art. 1 L.R. 15 dicembre 2023, n. 5",
    scaglioni: [
      { fino: 15000, aliquota: 0.0203 },
      { fino: 28000, aliquota: 0.0223 },
      { fino: Infinity, aliquota: 0.0363 },
    ],
  },
  piemonte: {
    nome: "Piemonte",
    codice: "13",
    pubblicazione: "29-01-2026",
    norma: "L.R. 28 marzo 2022, n. 4; L.R. 6 agosto 2025, n. 16",
    scaglioni: [
      { fino: 15000, aliquota: 0.0162 },
      { fino: 28000, aliquota: 0.0268 },
      { fino: 50000, aliquota: 0.0331 },
      { fino: Infinity, aliquota: 0.0333 },
    ],
  },
  puglia: {
    nome: "Puglia",
    codice: "14",
    pubblicazione: "29-05-2026",
    norma: "Decreto Commissario ad acta n. 3 del 28 maggio 2026; art. 3 L.R. 40/2015",
    scaglioni: [
      { fino: 15000, aliquota: 0.0133 },
      { fino: 28000, aliquota: 0.0213 },
      { fino: 50000, aliquota: 0.0323 },
      { fino: Infinity, aliquota: 0.0333 },
    ],
  },
  sardegna: {
    nome: "Sardegna",
    codice: "15",
    pubblicazione: "29-01-2026",
    norma: "art. 2 L.R. 48/2018; art. 1 L.R. 11 luglio 2022, n. 13",
    scaglioni: [{ fino: Infinity, aliquota: 0.0123 }],
  },
  sicilia: {
    nome: "Sicilia",
    codice: "16",
    pubblicazione: "29-01-2026",
    norma: "art. 1 L.R. 12/2007; art. 8 L.R. 11 agosto 2017, n. 15",
    scaglioni: [{ fino: Infinity, aliquota: 0.0123 }],
  },
  toscana: {
    nome: "Toscana",
    codice: "17",
    pubblicazione: "30-01-2026",
    norma: "art. 1 L.R. 28 dicembre 2023, n. 48",
    scaglioni: [
      { fino: 15000, aliquota: 0.0142 },
      { fino: 28000, aliquota: 0.0143 },
      { fino: 50000, aliquota: 0.0332 },
      { fino: Infinity, aliquota: 0.0333 },
    ],
  },
  trento: {
    nome: "Provincia autonoma di Trento",
    codice: "18",
    pubblicazione: "22-01-2026",
    norma: "art. 1 L.P. 23 dicembre 2019, n. 13, come modificato dalla L.P. 11/2025",
    // Deduzione di 30.000 EUR per imponibili fino a 30.000: sotto quella
    // soglia l'addizionale e' azzerata, sopra la deduzione non spetta.
    esenzioneFinoA: 30000,
    scaglioni: [
      { fino: 50000, aliquota: 0.0123 },
      { fino: Infinity, aliquota: 0.0173 },
    ],
  },
  umbria: {
    nome: "Umbria",
    codice: "19",
    pubblicazione: "19-01-2026",
    norma: "art. 1 L.R. 11 aprile 2025, n. 2",
    // Fino a 28.000 le maggiorazioni non si applicano: resta l'1,23%.
    flatSottoSoglia: { soglia: 28000, aliquota: 0.0123 },
    scaglioni: [
      { fino: 15000, aliquota: 0.0173 },
      { fino: 28000, aliquota: 0.0302 },
      { fino: 50000, aliquota: 0.0312 },
      { fino: Infinity, aliquota: 0.0333 },
    ],
    detrazioni: [{ da: 28000.01, a: 50000, importo: 150 }],
  },
  "valle-d-aosta": {
    nome: "Valle d'Aosta",
    codice: "20",
    pubblicazione: "19-01-2026",
    norma: "art. 1 L.R. 23 dicembre 2025, n. 29",
    esenzioneFinoA: 15000,
    scaglioni: [{ fino: Infinity, aliquota: 0.0123 }],
  },
  veneto: {
    nome: "Veneto",
    codice: "21",
    pubblicazione: "22-01-2026",
    norma: "art. 1 c. 5 L.R. 19/2005, come modificato dalla L.R. 30/2022",
    scaglioni: [{ fino: Infinity, aliquota: 0.0123 }],
  },
};

/**
 * Tipologie contrattuali coperte dal prototipo.
 * Cambiano l'aliquota contributiva a carico del lavoratore e le mensilita'
 * tipiche; non cambiano la parte fiscale.
 */
export const CONTRATTI = {
  "indeterminato-impiegato": {
    nome: "Tempo indeterminato · impiegato (terziario)",
    aliquota: 0.0919,
    mensilita: 13,
    voce: "Contributi IVS 9,19%",
    nota: "Aliquota IVS standard a carico del lavoratore, FPLD.",
  },
  "indeterminato-industria": {
    nome: "Tempo indeterminato · industria con CIGS",
    aliquota: 0.0949,
    mensilita: 13,
    voce: "Contributi IVS 9,19% + CIGS 0,30%",
    nota: "Nelle aziende industriali sopra i 50 dipendenti la CIGS (0,90%) e' per un terzo a carico del lavoratore.",
  },
  determinato: {
    nome: "Tempo determinato",
    aliquota: 0.0919,
    mensilita: 13,
    voce: "Contributi IVS 9,19%",
    nota: "Il contributo addizionale NASpI dell'1,40% e' a carico esclusivo del datore, non tocca il netto.",
  },
  apprendistato: {
    nome: "Apprendistato professionalizzante",
    aliquota: 0.0584,
    mensilita: 13,
    voce: "Contributi apprendista 5,84%",
    nota: "Aliquota agevolata a carico dell'apprendista (art. 1 c. 773 L. 296/2006).",
  },
  dirigente: {
    nome: "Dirigente",
    aliquota: 0.0919,
    mensilita: 13,
    voce: "Contributi IVS 9,19%",
    nota: "Restano fuori i fondi contrattuali (Previndai, Fasi, Mario Negri), che dipendono dal CCNL.",
  },
};

/**
 * Agevolazioni fiscali sul reddito di lavoro dipendente.
 * Riducono la base imponibile IRPEF e delle addizionali; NON riducono i
 * contributi previdenziali, che restano dovuti sulla retribuzione piena.
 */
export const AGEVOLAZIONI = {
  nessuna: {
    nome: "Nessuna agevolazione",
    quotaImponibile: 1,
    tetto: Infinity,
    norma: "",
    nota: "",
  },
  impatriati: {
    nome: "Lavoratori impatriati · 50% esente",
    quotaImponibile: 0.5,
    tetto: 600000,
    norma: "art. 5 D.Lgs. 209/2023",
    nota: "Concorre al reddito il 50% della retribuzione, entro un limite di 600.000 € l'anno.",
  },
  "impatriati-figli": {
    nome: "Impatriati con figlio minore · 60% esente",
    quotaImponibile: 0.4,
    tetto: 600000,
    norma: "art. 5 c. 4 D.Lgs. 209/2023",
    nota: "Con un figlio minore la quota esente sale al 60%, sempre entro 600.000 €.",
  },
  "docenti-ricercatori": {
    nome: "Docenti e ricercatori rientrati · 90% esente",
    quotaImponibile: 0.1,
    tetto: Infinity,
    norma: "art. 44 D.L. 78/2010",
    nota: "Concorre al reddito il 10% degli emolumenti, senza tetto di importo.",
  },
};

/** Applica una scala a scaglioni progressivi a un imponibile. */
export function imposta_a_scaglioni(imponibile, scaglioni) {
  let residuo = Math.max(0, imponibile);
  let precedente = 0;
  let totale = 0;
  const dettaglio = [];

  for (const s of scaglioni) {
    if (residuo <= 0) break;
    const ampiezza = s.fino - precedente;
    const quota = Math.min(residuo, ampiezza);
    const imposta = quota * s.aliquota;
    if (quota > 0) {
      dettaglio.push({
        da: precedente,
        a: s.fino,
        aliquota: s.aliquota,
        imponibile: quota,
        imposta,
      });
    }
    totale += imposta;
    residuo -= quota;
    precedente = s.fino;
  }
  return { totale, dettaglio };
}

/**
 * Addizionale regionale: scala progressiva, oppure aliquota unica sull'intero
 * imponibile sotto la soglia agevolata, oppure esenzione piena. Le detrazioni
 * si sottraggono dall'imposta e non generano mai credito.
 */
export function addizionale_regionale(imponibile, regione) {
  const base = Math.max(0, imponibile);

  if (regione.esenzioneFinoA && base <= regione.esenzioneFinoA) {
    return {
      lorda: 0,
      detrazione: 0,
      totale: 0,
      dettaglio: [],
      esente: true,
    };
  }

  const flat = regione.flatSottoSoglia;
  const usaFlat = flat && base <= flat.soglia;

  const { totale: lorda, dettaglio } = usaFlat
    ? {
        totale: base * flat.aliquota,
        dettaglio: [
          {
            da: 0,
            a: flat.soglia,
            aliquota: flat.aliquota,
            imponibile: base,
            imposta: base * flat.aliquota,
            unica: true,
          },
        ],
      }
    : imposta_a_scaglioni(base, regione.scaglioni);

  let detrazione = 0;
  for (const d of regione.detrazioni ?? []) {
    if (base >= d.da && base <= d.a) detrazione += d.importo;
  }
  const dc = regione.detrazioneCrescente;
  if (dc && base > dc.da) {
    detrazione += Math.min(dc.massimo, (dc.massimo * (base - dc.da)) / dc.ampiezza);
  }
  detrazione = Math.min(detrazione, lorda);

  return { lorda, detrazione, totale: lorda - detrazione, dettaglio, esente: false };
}

/** Contributi previdenziali a carico del dipendente. */
export function contributi_dipendente(ral, p = PARAMS, contratto = null) {
  const c = p.contributi;
  const aliquota = contratto?.aliquota ?? c.aliquotaBase;
  const imponibile = Math.min(ral, c.massimaleAnnuo);
  const base = imponibile * aliquota;
  const eccedenza = Math.max(0, imponibile - c.primaFasciaPensionabile);
  const aggiuntivo = eccedenza * c.aliquotaAggiuntiva;
  return { imponibile, aliquota, base, aggiuntivo, totale: base + aggiuntivo };
}

/** Detrazione per lavoro dipendente, art. 13 c.1 e c.1-bis TUIR. */
export function detrazione_lavoro_dipendente(reddito, p = PARAMS) {
  const d = p.detrazioneLavoro;
  let base;
  if (reddito <= 0) base = 0;
  else if (reddito <= d.fascia1) base = d.importoBase;
  else if (reddito <= d.fascia2)
    base = 1910 + (1190 * (d.fascia2 - reddito)) / 13000;
  else if (reddito <= d.fascia3)
    base = (1910 * (d.fascia3 - reddito)) / 22000;
  else base = 0;

  const bonus =
    reddito > d.bonus65.da && reddito <= d.bonus65.a ? d.bonus65.importo : 0;

  return { base, bonus, totale: base + bonus };
}

/** Ulteriore detrazione "cuneo" per reddito complessivo 20.000-40.000. */
export function ulteriore_detrazione_cuneo(reddito, p = PARAMS) {
  const u = p.cuneo.ulterioreDetrazione;
  if (reddito <= u.da || reddito > u.azzeramentoA) return 0;
  if (reddito <= u.pienaFinoA) return u.importo;
  return (
    (u.importo * (u.azzeramentoA - reddito)) /
    (u.azzeramentoA - u.pienaFinoA)
  );
}

/** Somma integrativa non imponibile per reddito complessivo <= 20.000. */
export function somma_integrativa(redditoComplessivo, redditoLavoro, p = PARAMS) {
  const s = p.cuneo.sommaIntegrativa;
  if (redditoComplessivo > s.sogliaRedditoComplessivo) return 0;
  const scaglione = s.scaglioni.find((x) => redditoLavoro <= x.fino);
  return redditoLavoro * scaglione.percentuale;
}

/**
 * Trattamento integrativo.
 * - reddito <= 15.000: spetta pieno se l'IRPEF lorda supera la detrazione
 *   da lavoro dipendente diminuita di 75 EUR (condizione di capienza).
 * - 15.000 < reddito <= 28.000: spetta per la sola parte di detrazioni
 *   incapienti, con tetto di 1.200 EUR.
 */
export function trattamento_integrativo(reddito, irpefLorda, detrazioni, p = PARAMS) {
  const t = p.trattamentoIntegrativo;
  if (reddito <= t.sogliaPiena) {
    const soglia = Math.max(0, detrazioni.lavoro - t.scontoCapienza);
    return irpefLorda > soglia ? t.importo : 0;
  }
  if (reddito <= t.sogliaMassima) {
    const incapienza = detrazioni.totale - irpefLorda;
    return Math.min(t.importo, Math.max(0, incapienza));
  }
  return 0;
}

/** Quota di reddito che concorre alla base imponibile, data l'agevolazione. */
export function imponibile_agevolato(reddito, agevolazione) {
  const a = agevolazione;
  if (!a || a.quotaImponibile === 1) return reddito;
  const entroTetto = Math.min(reddito, a.tetto);
  const oltreTetto = Math.max(0, reddito - a.tetto);
  return entroTetto * a.quotaImponibile + oltreTetto;
}

/**
 * Calcolo completo RAL -> netto.
 * @param {number} ral Retribuzione annua lorda in euro.
 * @param {object} opzioni { mensilita, regione, contratto, agevolazione, params }
 */
export function calcola(ral, opzioni = {}) {
  const p = opzioni.params ?? PARAMS;
  const regione = REGIONI[opzioni.regione] ?? REGIONI.lombardia;
  const contratto = CONTRATTI[opzioni.contratto] ?? CONTRATTI["indeterminato-impiegato"];
  const agevolazione = AGEVOLAZIONI[opzioni.agevolazione] ?? AGEVOLAZIONI.nessuna;
  const mensilita = opzioni.mensilita ?? contratto.mensilita;
  const lordo = Math.max(0, Number(ral) || 0);

  // 1. Contributi previdenziali (deducibili dall'imponibile IRPEF).
  //    Si calcolano sulla retribuzione piena: le agevolazioni sono fiscali.
  const contributi = contributi_dipendente(lordo, p, contratto);

  // 2. Reddito di lavoro al netto dei contributi, poi la quota che concorre
  //    davvero al reddito imponibile secondo l'agevolazione scelta.
  const redditoNettoContributi = Math.max(0, lordo - contributi.totale);
  const imponibileFiscale = imponibile_agevolato(redditoNettoContributi, agevolazione);
  const quotaEsente = redditoNettoContributi - imponibileFiscale;

  // 3. IRPEF lorda a scaglioni, sulla base gia' ridotta dall'agevolazione.
  const irpef = imposta_a_scaglioni(imponibileFiscale, p.irpefScaglioni);

  /**
   * 4. Detrazioni e bonus.
   *
   * Scelta dichiarata: detrazioni, trattamento integrativo e taglio del cuneo
   * sono commisurati al reddito AL LORDO della quota esente. Senza questa
   * regola un impatriato con 30.000 di RAL scenderebbe sotto le soglie dei
   * bonus per redditi bassi e cumulerebbe agevolazione e sostegno: un
   * risultato che il legislatore non vuole e che sarebbe il bug piu' costoso
   * di questo motore. Sotto il regime ordinario le due basi coincidono.
   */
  const redditoRiferimento = redditoNettoContributi;
  const detrLavoro = detrazione_lavoro_dipendente(redditoRiferimento, p);
  const detrCuneo = ulteriore_detrazione_cuneo(redditoRiferimento, p);
  const detrazioniTotali = detrLavoro.totale + detrCuneo;

  // 5. IRPEF netta (mai negativa: l'eccedenza non e' rimborsabile).
  const irpefNetta = Math.max(0, irpef.totale - detrazioniTotali);

  // 6. Addizionali locali, calcolate sull'imponibile IRPEF.
  const regionale = addizionale_regionale(imponibileFiscale, regione);
  const comunale = imponibileFiscale * p.addizionaleComunale.aliquota;

  // 7. Bonus in busta paga (aumentano il netto, non sono imposte).
  const ti = trattamento_integrativo(redditoRiferimento, irpef.totale, {
    lavoro: detrLavoro.totale,
    totale: detrazioniTotali,
  }, p);
  const somma = somma_integrativa(redditoRiferimento, lordo, p);

  // 8. Netto.
  const trattenuteTotali =
    contributi.totale + irpefNetta + regionale.totale + comunale;
  const bonusTotali = ti + somma;
  const nettoAnnuo = lordo - trattenuteTotali + bonusTotali;

  // 9. TFR: informativo, non fa parte del netto mensile.
  const tfrLordo = lordo / p.tfr.divisore;
  const tfrAccantonato = tfrLordo * (1 - p.tfr.contributoFondoGaranzia);

  return {
    input: { ral: lordo, mensilita, anno: p.anno },
    scelte: { regione, contratto, agevolazione },
    contributi,
    redditoNettoContributi,
    redditoRiferimento,
    quotaEsente,
    imponibileFiscale,
    irpef: {
      lorda: irpef.totale,
      scaglioni: irpef.dettaglio,
      detrazioneLavoro: detrLavoro,
      detrazioneCuneo: detrCuneo,
      detrazioniTotali,
      netta: irpefNetta,
    },
    addizionali: {
      regionale: regionale.totale,
      regionaleLorda: regionale.lorda,
      regionaleDetrazione: regionale.detrazione,
      regionaleEsente: regionale.esente,
      regionaleScaglioni: regionale.dettaglio,
      comunale,
      totale: regionale.totale + comunale,
    },
    bonus: { trattamentoIntegrativo: ti, sommaIntegrativa: somma, totale: bonusTotali },
    totali: {
      trattenute: trattenuteTotali,
      imposte: irpefNetta + regionale.totale + comunale,
      nettoAnnuo,
      nettoMensile: nettoAnnuo / mensilita,
      aliquotaEffettiva: lordo > 0 ? trattenuteTotali / lordo : 0,
      cuneoNetto: lordo > 0 ? (lordo - nettoAnnuo) / lordo : 0,
    },
    tfr: { lordo: tfrLordo, accantonato: tfrAccantonato },
  };
}
