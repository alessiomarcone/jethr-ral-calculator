import test from "node:test";
import assert from "node:assert/strict";
import {
  calcola,
  imposta_a_scaglioni,
  detrazione_lavoro_dipendente,
  ulteriore_detrazione_cuneo,
  contributi_dipendente,
  PARAMS,
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

test("RAL 30.000: catena di calcolo completa", () => {
  const r = calcola(30000, { mensilita: 13 });
  assert.equal(round(r.contributi.totale), 2757);
  assert.equal(round(r.imponibileFiscale), 27243);
  assert.equal(round(r.irpef.lorda), round(27243 * 0.23));
  // detrazione: 1910 + 1190*(28000-27243)/13000 + 65
  assert.equal(round(r.irpef.detrazioneLavoro.totale), 2044.29);
  assert.equal(r.irpef.detrazioneCuneo, 1000);
  assert.equal(round(r.addizionali.regionale), round(15000 * 0.0123 + 12243 * 0.0158));
  assert.equal(round(r.addizionali.comunale), round(27243 * 0.008));
  assert.equal(r.bonus.totale, 0);
  assert.equal(round(r.totali.nettoAnnuo), 23425.52);
});

test("RAL 18.000: scattano somma integrativa e nessuna addizionale comunale", () => {
  const r = calcola(18000);
  assert.equal(r.addizionali.comunale, 0); // imponibile sotto i 23.000
  assert.equal(round(r.bonus.sommaIntegrativa), round(18000 * 0.048));
  assert.ok(r.totali.nettoAnnuo > 0);
});

test("il netto e' monotono, salvo le soglie di legge documentate", () => {
  // Il sistema italiano contiene vere discontinuita' (soglie, non franchigie):
  // superarle di 1 euro fa perdere l'intero beneficio. Il test le fissa
  // esplicitamente: qualsiasi ALTRO salto all'indietro e' un bug.
  const soglieNote = [8500, 15000, 16520, 22030, 25330, 38550];
  const tolleranza = 200; // ampiezza massima ammessa per RAL, in euro
  let prec = -1;
  for (let ral = 5000; ral <= 150000; ral += 10) {
    const netto = calcola(ral).totali.nettoAnnuo;
    if (netto <= prec) {
      const vicina = soglieNote.some((s) => Math.abs(ral - s) <= tolleranza);
      assert.ok(vicina, `salto inatteso del netto a RAL ${ral}`);
    }
    prec = netto;
  }
});

test("soglia Milano: 1 euro sopra i 23.000 di imponibile costa 184 EUR", () => {
  const sotto = calcola(25320); // imponibile appena sotto 23.000
  const sopra = calcola(25340); // imponibile appena sopra
  assert.equal(sotto.addizionali.comunale, 0);
  assert.ok(sopra.addizionali.comunale > 180);
  assert.ok(sopra.totali.nettoAnnuo < sotto.totali.nettoAnnuo);
});

test("aliquota effettiva cresce con il reddito", () => {
  const a = calcola(25000).totali.aliquotaEffettiva;
  const b = calcola(55000).totali.aliquotaEffettiva;
  const c = calcola(120000).totali.aliquotaEffettiva;
  assert.ok(a < b && b < c);
});

test("RAL 0 non produce NaN", () => {
  const r = calcola(0);
  assert.equal(r.totali.nettoAnnuo, 0);
  assert.equal(r.totali.nettoMensile, 0);
});
