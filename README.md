# Dal lordo al netto — calcolatore RAL → netto (anno d'imposta 2026)

Prototipo per il task Jet HR. Inserisci una RAL, ottieni il netto annuo e mensile
e il dettaglio riga per riga di tutto ciò che viene trattenuto sul lordo, con la
formula usata per ogni voce.

- **Pagina live:** vedi il link nella mail di consegna
- **Uso in locale:** apri `index.html` in un browser, non serve nessun server
- **Test:** `npm test` (Node 18+, nessuna dipendenza)

## Com'è fatto

| File | Cosa contiene |
|---|---|
| `src/tax-engine.js` | il motore di calcolo e **tutti** i parametri normativi in un solo oggetto `PARAMS` |
| `src/page.html` | interfaccia e formattazione |
| `src/design-system.css` | il design system: token, primitive, temi (vedi `DESIGN-SYSTEM.md`) |
| `test/tax-engine.test.mjs` | 13 test sul motore |
| `build.mjs` | inlina design system e motore nella pagina, genera `index.html` e `dist/artifact.html` |

I parametri di legge stanno tutti in `PARAMS`: quando cambia la legge di bilancio
si tocca un oggetto solo, non la logica. La pagina è generata dal motore, quindi
quello che gira nel browser è esattamente il codice testato.

## La catena di calcolo

```
RAL
 − contributi previdenziali a carico del dipendente        (deducibili)
 = reddito imponibile IRPEF (= reddito complessivo)
 − IRPEF lorda a scaglioni
 + detrazione da lavoro dipendente + ulteriore detrazione   (fino a capienza)
 = IRPEF netta
 − addizionale regionale Lombardia
 − addizionale comunale Milano
 + trattamento integrativo e somma integrativa              (non sono retribuzione)
 = netto annuo → / mensilità = netto mensile
```

L'ordine conta: i contributi sono deducibili, quindi l'IRPEF non si calcola sulla
RAL ma sull'imponibile al netto dei contributi. Le detrazioni si sottraggono
dall'**imposta**, non dal reddito, e non sono rimborsabili: se superano l'IRPEF
lorda, l'imposta va a zero e l'eccedenza si perde (è la ragione per cui esiste il
trattamento integrativo).

## Parametri e fonti

Tutti verificati a settembre 2026 per l'anno d'imposta 2026.

| Voce | Valore usato | Fonte |
|---|---|---|
| Scaglioni IRPEF | 23% fino a 28.000 · 33% fino a 50.000 · 43% oltre | L. 199/2025 (Bilancio 2026) art. 1 c. 3 — la seconda aliquota scende dal 35% al 33% |
| Detrazione lavoro dipendente | 1.955 fino a 15.000; `1.910 + 1.190 × (28.000 − R)/13.000`; `1.910 × (50.000 − R)/22.000`; 0 oltre 50.000 | art. 13 c. 1 TUIR |
| Detrazione aggiuntiva | +65 € tra 25.000 e 35.000 | art. 13 c. 1-bis TUIR |
| Somma integrativa (non imponibile) | 7,1% / 5,3% / 4,8% del reddito di lavoro, per reddito complessivo ≤ 20.000 | L. 207/2024 art. 1 c. 4-5, circ. Agenzia Entrate 4/E del 16.5.2025 |
| Ulteriore detrazione | 1.000 € tra 20.000 e 32.000, poi `1.000 × (40.000 − R)/8.000` fino a 40.000 | idem |
| Trattamento integrativo | 1.200 € fino a 15.000 con capienza verificata sulla detrazione ridotta di 75 €; tra 15.000 e 28.000 solo per l'incapienza | D.L. 3/2020, come modificato dalla L. 207/2024 |
| Contributi a carico dipendente | 9,19% | aliquota IVS FPLD standard per impiegati industria/terziario |
| Aliquota aggiuntiva 1% | sulla quota oltre 56.224 € | art. 3-ter L. 438/1992; soglia 2026 da INPS circ. 6/2026 |
| Massimale contributivo | 122.295 € | INPS circ. 6/2026 |
| Addizionale regionale Lombardia | 1,23% / 1,58% / 1,72% / 1,73% sugli stessi scaglioni IRPEF | L.R. Lombardia 10/2003 art. 72 c. 1, dati pubblicati dal MEF (28.1.2026) |
| Addizionale comunale Milano | 0,80%, esenzione fino a 23.000 € di imponibile | delib. C.C. Milano 46/2020 |
| TFR | RAL / 13,5 meno 0,50% al Fondo di garanzia | art. 2120 c.c.; il TFR è mostrato a parte perché è accantonato, non pagato in busta |

## Semplificazioni (dichiarate, non nascoste)

1. **Impiegato a tempo indeterminato, full time, anno intero.** Nessun ragguaglio
   ai giorni: detrazioni e bonus sono presi per intero. Nessun minimo di 690/1.380 €
   sulla detrazione, che diventa rilevante solo con rapporti parziali.
2. **Tutta la RAL è imponibile**, sia ai fini contributivi che fiscali. Niente
   fringe benefit, welfare, premi di risultato detassati al 5%, trasferte, auto
   aziendale, straordinari.
3. **Aliquota contributiva fissa al 9,19%.** Nella realtà dipende da CCNL,
   settore, dimensione aziendale e qualifica: può variare di qualche decimo, e i
   dirigenti hanno tutt'altro schema.
4. **Reddito complessivo = RAL − contributi.** Nessun altro reddito, nessun
   familiare a carico, nessun onere deducibile o detraibile, nessuna agevolazione
   (impatriati, rientro cervelli, detassazione premi).
5. **Addizionali per competenza.** In busta paga si trattengono come saldo
   dell'anno precedente più acconto dell'anno in corso; qui sono calcolate
   sull'anno di competenza, che è la lettura corretta per una proiezione annuale.
6. **Nessun conguaglio di fine anno**, nessuna gestione dei ratei di
   tredicesima/quattordicesima: la mensilità è il netto annuo diviso per il numero
   di mensilità scelto.
7. **Solo lato dipendente.** Il costo azienda (≈ +30% di contributi a carico del
   datore, più TFR e INAIL) non è calcolato.

## Le soglie che fanno saltare il netto

Il sistema italiano contiene vere discontinuità: superare la soglia di un euro fa
perdere l'intero beneficio. Il prototipo le riproduce invece di lisciarle, e un
test le fissa esplicitamente (`il netto e' monotono, salvo le soglie di legge
documentate`), così ogni altro salto all'indietro è un bug.

| Soglia | Effetto |
|---|---|
| 23.000 € di imponibile | l'addizionale comunale di Milano è una **soglia, non una franchigia**: un euro sopra costa 184 € pieni. La pagina lo segnala quando ci sei vicino |
| 8.500 e 15.000 € di reddito di lavoro | cambia la percentuale della somma integrativa, applicata a tutta la base |
| 20.000 € di reddito complessivo | finisce la somma integrativa e inizia l'ulteriore detrazione |
| 35.000 € | decade la detrazione aggiuntiva di 65 € |

## Verifica

```bash
npm test
```

I test coprono la progressività degli scaglioni, il massimale e l'aliquota
aggiuntiva dell'1%, la continuità delle detrazioni ai confini di fascia, la catena
completa su RAL 30.000 con i valori attesi calcolati a mano, il caso a basso
reddito con somma integrativa, la monotonia del netto su tutto l'arco
5.000–150.000 € e il cliff dell'addizionale comunale.

Controprova rapida: RAL 30.000, 13 mensilità → 1.802 € netti al mese, 23.426 €
l'anno, aliquota effettiva 21,9%. RAL 80.000 → 3.641 € al mese.

## Cosa servirebbe per andare oltre il prototipo

- tabelle CCNL per aliquota contributiva, mensilità e minimi
- anagrafica comune/regione con le rispettive aliquote e soglie, non due valori fissi
- familiari a carico, altri redditi, oneri deducibili e detraibili
- ratei, ferie, ROL, conguaglio di fine anno e gestione del cambio di scaglione in corso d'anno
- regimi agevolati (impatriati, premi di risultato, welfare, fringe benefit)
- costo azienda e vista bidirezionale netto → lordo
