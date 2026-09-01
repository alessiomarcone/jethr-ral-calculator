import test from "node:test";
import assert from "node:assert/strict";
import {
  calcola,
  imposta_a_scaglioni,
  addizionale_regionale,
  detrazione_lavoro_dipendente,
  ulteriore_detrazione_cuneo,
  contributi_dipendente,
  imponibile_agevolato,
  PARAMS,
  REGIONI,
  CONTRATTI,
  AGEVOLAZIONI,
} from "../src/tax-engine.js";

const round = (n) => Math.round(n * 100) / 100;

test("scaglioni IRPEF: progressivita' sul secondo scaglione", () => {
  const r = imposta_a_scaglioni(40000, PARAMS.irpefScaglioni);
  // 28.000 * 23% + 12.000 * 33%
  assert.equal(round(r.totale), round(28000 * 0.23 + 12000 * 0.33));
});

test("scaglioni IRPEF: terzo scaglione", () => {
  const r = imposta_a_scaglioni(60000, PARAMS.irpefScaglioni);
  assert.equal(
    round(r.totale),
    round(28000 * 0.23 + 22000 * 0.33 + 10000 * 0.43),
  );
});

test("contributi: aliquota aggiuntiva 1% solo oltre la prima fascia", () => {
  const sotto = contributi_dipendente(50000);
  assert.equal(sotto.aggiuntivo, 0);
  const sopra = contributi_dipendente(70000);
  assert.equal(round(sopra.aggiuntivo), round((70000 - 56224) * 0.01));
});

test("contributi: massimale annuo", () => {
  const c = contributi_dipendente(200000);
  assert.equal(c.imponibile, PARAMS.contributi.massimaleAnnuo);
});

test("contributi: il contratto sposta l'aliquota a carico del lavoratore", () => {
  const impiegato = contributi_dipendente(30000, PARAMS, CONTRATTI["indeterminato-impiegato"]);
  const industria = contributi_dipendente(30000, PARAMS, CONTRATTI["indeterminato-industria"]);
  const apprendista = contributi_dipendente(30000, PARAMS, CONTRATTI.apprendistato);
  assert.equal(round(impiegato.base), round(30000 * 0.0919));
  assert.equal(round(industria.base), round(30000 * 0.0949));
  assert.equal(round(apprendista.base), round(30000 * 0.0584));
  // Meno contributi -> piu' imponibile fiscale, quindi non piu' netto in automatico.
  assert.ok(apprendista.totale < impiegato.totale);
});

test("detrazione lavoro dipendente: continuita' ai confini di fascia", () => {
  assert.equal(round(detrazione_lavoro_dipendente(15000).base), 1955);
  assert.equal(round(detrazione_lavoro_dipendente(28000).base), 1910);
  assert.equal(round(detrazione_lavoro_dipendente(50000).base), 0);
  assert.equal(detrazione_lavoro_dipendente(60000).base, 0);
});

test("detrazione lavoro dipendente: bonus 65 EUR solo tra 25k e 35k", () => {
  assert.equal(detrazione_lavoro_dipendente(24000).bonus, 0);
  assert.equal(detrazione_lavoro_dipendente(30000).bonus, 65);
  assert.equal(detrazione_lavoro_dipendente(36000).bonus, 0);
});

test("ulteriore detrazione cuneo: piena, decrescente, azzerata", () => {
  assert.equal(ulteriore_detrazione_cuneo(25000), 1000);
  assert.equal(ulteriore_detrazione_cuneo(32000), 1000);
  assert.equal(ulteriore_detrazione_cuneo(36000), 500);
  assert.equal(ulteriore_detrazione_cuneo(40000), 0);
  assert.equal(ulteriore_detrazione_cuneo(41000), 0);
});

test("tutte le regioni sono complete e con scaglioni crescenti", () => {
  const chiavi = Object.keys(REGIONI);
  assert.equal(chiavi.length, 21, "21 fra regioni e province autonome");
  for (const [k, r] of Object.entries(REGIONI)) {
    assert.ok(r.nome && r.norma && r.pubblicazione, `${k}: metadati mancanti`);
    assert.ok(r.scaglioni.length > 0, `${k}: nessuno scaglione`);
    assert.equal(r.scaglioni.at(-1).fino, Infinity, `${k}: ultimo scaglione aperto`);
    let precedente = 0;
    for (const s of r.scaglioni) {
      assert.ok(s.fino > precedente, `${k}: scaglioni non crescenti`);
      // Il minimo di legge e' 1,23%, ridotto solo dove una legge regionale lo prevede.
      assert.ok(s.aliquota > 0 && s.aliquota <= 0.0363, `${k}: aliquota fuori range`);
      precedente = s.fino;
    }
  }
});

test("addizionale regionale: scala progressiva (Lombardia)", () => {
  const a = addizionale_regionale(27243, REGIONI.lombardia);
  assert.equal(
    round(a.totale),
    round(15000 * 0.0123 + (27243 - 15000) * 0.0158),
  );
});

test("addizionale regionale: aliquota unica sull'intero imponibile (Lazio sotto 28.000)", () => {
  const sotto = addizionale_regionale(27000, REGIONI.lazio);
  assert.equal(round(sotto.totale), round(27000 * 0.0173));
  // Sopra la soglia si torna alla scala progressiva, meno la detrazione di 60 EUR.
  const sopra = addizionale_regionale(29000, REGIONI.lazio);
  assert.equal(
    round(sopra.totale),
    round(15000 * 0.0173 + 14000 * 0.0333 - 60),
  );
});

test("addizionale regionale: esenzioni piene (Valle d'Aosta e Trento)", () => {
  assert.equal(addizionale_regionale(15000, REGIONI["valle-d-aosta"]).totale, 0);
  assert.ok(addizionale_regionale(15001, REGIONI["valle-d-aosta"]).totale > 0);
  assert.equal(addizionale_regionale(30000, REGIONI.trento).totale, 0);
  assert.ok(addizionale_regionale(30001, REGIONI.trento).totale > 0);
});

test("addizionale regionale: la detrazione non genera mai credito (Bolzano)", () => {
  // 20.000 x 1,23% = 246 EUR, meno una detrazione di 430,50: si ferma a zero.
  const a = addizionale_regionale(20000, REGIONI.bolzano);
  assert.equal(a.totale, 0);
  assert.equal(round(a.lorda), round(20000 * 0.0123));
  assert.equal(a.detrazione, a.lorda);
});

test("agevolazioni: quota imponibile e tetto dei 600.000", () => {
  assert.equal(imponibile_agevolato(100000, AGEVOLAZIONI.nessuna), 100000);
  assert.equal(imponibile_agevolato(100000, AGEVOLAZIONI.impatriati), 50000);
  assert.equal(imponibile_agevolato(100000, AGEVOLAZIONI["impatriati-figli"]), 40000);
  assert.equal(imponibile_agevolato(100000, AGEVOLAZIONI["docenti-ricercatori"]), 10000);
  // Oltre il tetto la parte eccedente e' tassata per intero.
  assert.equal(
    imponibile_agevolato(700000, AGEVOLAZIONI.impatriati),
    600000 * 0.5 + 100000,
  );
});

test("agevolazioni: non toccano i contributi, solo la base fiscale", () => {
  const piena = calcola(60000, { regione: "lombardia", agevolazione: "nessuna" });
  const impatriato = calcola(60000, { regione: "lombardia", agevolazione: "impatriati" });
  assert.equal(round(impatriato.contributi.totale), round(piena.contributi.totale));
  assert.equal(
    round(impatriato.imponibileFiscale),
    round(piena.redditoNettoContributi * 0.5),
  );
  assert.ok(impatriato.totali.nettoAnnuo > piena.totali.nettoAnnuo);
});

test("agevolazioni: non aprono la porta ai bonus per redditi bassi", () => {
  const r = calcola(30000, { regione: "lombardia", agevolazione: "impatriati" });
  // L'imponibile scende sotto i 15.000, ma le soglie guardano il reddito pieno.
  assert.ok(r.imponibileFiscale < 15000);
  assert.equal(r.redditoRiferimento, r.redditoNettoContributi);
  assert.equal(r.bonus.trattamentoIntegrativo, 0);
  assert.equal(r.bonus.sommaIntegrativa, 0);
});

test("catena completa: RAL 30.000, Lombardia, impiegato, nessuna agevolazione", () => {
  const r = calcola(30000, {
    mensilita: 13,
    regione: "lombardia",
    contratto: "indeterminato-impiegato",
    agevolazione: "nessuna",
  });

  const contributi = 30000 * 0.0919; // 2.757
  const imponibile = 30000 - contributi; // 27.243
  const irpefLorda = imponibile * 0.23;
  const detrazione =
    1910 + (1190 * (28000 - imponibile)) / 13000 + 65; // art. 13 c. 1 e 1-bis
  const cuneo = 1000; // ulteriore detrazione piena fra 20.000 e 32.000
  const irpefNetta = irpefLorda - detrazione - cuneo;
  const regionale = 15000 * 0.0123 + (imponibile - 15000) * 0.0158;
  const comunale = imponibile * 0.008;
  const netto = 30000 - contributi - irpefNetta - regionale - comunale;

  assert.equal(round(r.contributi.totale), round(contributi));
  assert.equal(round(r.imponibileFiscale), round(imponibile));
  assert.equal(round(r.irpef.netta), round(irpefNetta));
  assert.equal(round(r.addizionali.totale), round(regionale + comunale));
  assert.equal(round(r.totali.nettoAnnuo), round(netto));
  assert.equal(round(r.totali.nettoMensile), round(netto / 13));
});

test("basso reddito: la somma integrativa entra nel netto", () => {
  const r = calcola(12000, { regione: "lombardia" });
  assert.ok(r.bonus.sommaIntegrativa > 0);
  assert.equal(round(r.bonus.sommaIntegrativa), round(12000 * 0.053));
  assert.ok(r.totali.nettoAnnuo > 12000 - r.contributi.totale);
});

test("il netto e' monotono in Lombardia su tutto l'arco 5.000-150.000", () => {
  let precedente = -Infinity;
  for (let ral = 5000; ral <= 150000; ral += 250) {
    const netto = calcola(ral, { regione: "lombardia" }).totali.nettoAnnuo;
    assert.ok(
      netto >= precedente - 0.01,
      `netto in calo passando a ${ral}: ${round(netto)} < ${round(precedente)}`,
    );
    precedente = netto;
  }
});

test("le soglie regionali sono discontinuita' vere, non arrotondamenti", () => {
  // La soglia dei 15.000 di imponibile cade attorno a 16.520 EUR di RAL.
  const dentro = calcola(16500, { regione: "valle-d-aosta" }).totali.nettoAnnuo;
  const fuori = calcola(16600, { regione: "valle-d-aosta" }).totali.nettoAnnuo;
  // Superata la soglia di 15.000 di imponibile l'addizionale torna dovuta per
  // intero: il netto scende nonostante il lordo salga.
  assert.ok(fuori < dentro, "Valle d'Aosta: atteso un salto all'indietro sopra la soglia");
});

test("ogni contratto produce un risultato coerente", () => {
  for (const [k, c] of Object.entries(CONTRATTI)) {
    const r = calcola(35000, { contratto: k, regione: "lombardia" });
    assert.equal(r.scelte.contratto.nome, c.nome);
    assert.ok(r.totali.nettoAnnuo > 0 && r.totali.nettoAnnuo < 35000);
    assert.ok(r.totali.aliquotaEffettiva > 0.1 && r.totali.aliquotaEffettiva < 0.6);
  }
});

test("ogni regione produce un risultato plausibile su RAL 35.000", () => {
  for (const k of Object.keys(REGIONI)) {
    const r = calcola(35000, { regione: k });
    assert.ok(
      r.totali.nettoAnnuo > 20000 && r.totali.nettoAnnuo < 30000,
      `${k}: netto fuori scala (${round(r.totali.nettoAnnuo)})`,
    );
  }
});
