/**
 * Motore di calcolo lordo -> netto per un lavoratore dipendente.
 * Anno d'imposta 2026. Tutti i parametri normativi stanno in PARAMS
 * (un solo posto da aggiornare quando cambia la legge di bilancio).
 *
 * Le fonti di ogni numero sono documentate in README.md.
 */

export const PARAMS = {
  anno: 2026,

  // --- Contributi previdenziali a carico del lavoratore (IVS, FPLD) ---
  contributi: {
    // Impiegato, azienda industria/terziario. Quota a carico dipendente.
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

  // --- Addizionale regionale Lombardia (L.R. 10/2003 art. 72 c.1) ---
  addizionaleRegionale: [
    { fino: 15000, aliquota: 0.0123 },
    { fino: 28000, aliquota: 0.0158 },
    { fino: 50000, aliquota: 0.0172 },
    { fino: Infinity, aliquota: 0.0173 },
  ],

  // --- Addizionale comunale Milano (delib. C.C. 46/2020) ---
  addizionaleComunale: {
    aliquota: 0.008,
    // Soglia di esenzione, NON franchigia: sopra la soglia si tassa tutto.
    sogliaEsenzione: 23000,
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

/** Contributi previdenziali a carico del dipendente. */
export function contributi_dipendente(ral, p = PARAMS) {
  const c = p.contributi;
  const imponibile = Math.min(ral, c.massimaleAnnuo);
  const base = imponibile * c.aliquotaBase;
  const eccedenza = Math.max(0, imponibile - c.primaFasciaPensionabile);
  const aggiuntivo = eccedenza * c.aliquotaAggiuntiva;
  return { imponibile, base, aggiuntivo, totale: base + aggiuntivo };
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

/**
 * Calcolo completo RAL -> netto.
 * @param {number} ral Retribuzione annua lorda in euro.
 * @param {object} opzioni { mensilita: 12|13|14, params }
 */
export function calcola(ral, opzioni = {}) {
  const p = opzioni.params ?? PARAMS;
  const mensilita = opzioni.mensilita ?? 13;
  const lordo = Math.max(0, Number(ral) || 0);

  // 1. Contributi previdenziali (deducibili dall'imponibile IRPEF).
  const contributi = contributi_dipendente(lordo, p);

  // 2. Imponibile fiscale = reddito complessivo (semplificazione: nessun
  //    altro reddito e nessun onere deducibile oltre ai contributi).
  const imponibileFiscale = Math.max(0, lordo - contributi.totale);

  // 3. IRPEF lorda a scaglioni.
  const irpef = imposta_a_scaglioni(imponibileFiscale, p.irpefScaglioni);

  // 4. Detrazioni.
  const detrLavoro = detrazione_lavoro_dipendente(imponibileFiscale, p);
  const detrCuneo = ulteriore_detrazione_cuneo(imponibileFiscale, p);
  const detrazioniTotali = detrLavoro.totale + detrCuneo;

  // 5. IRPEF netta (mai negativa: l'eccedenza non e' rimborsabile).
  const irpefNetta = Math.max(0, irpef.totale - detrazioniTotali);

  // 6. Addizionali locali, calcolate sull'imponibile IRPEF.
  const regionale = imposta_a_scaglioni(imponibileFiscale, p.addizionaleRegionale);
  const comunaleDovuta = imponibileFiscale > p.addizionaleComunale.sogliaEsenzione;
  const comunale = comunaleDovuta
    ? imponibileFiscale * p.addizionaleComunale.aliquota
    : 0;

  // 7. Bonus in busta paga (aumentano il netto, non sono imposte).
  const ti = trattamento_integrativo(imponibileFiscale, irpef.totale, {
    lavoro: detrLavoro.totale,
    totale: detrazioniTotali,
  }, p);
  const somma = somma_integrativa(imponibileFiscale, lordo, p);

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
    contributi,
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
      regionaleScaglioni: regionale.dettaglio,
      comunale,
      comunaleDovuta,
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
