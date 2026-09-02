# Dal lordo al netto — calcolatore RAL → netto (anno d'imposta 2026)

Prototipo per il task Jet HR. Inserisci una RAL, scegli **regione di residenza
fiscale**, **tipologia di contratto** e **agevolazione**, premi *Calcola*:
ottieni il netto annuo e mensile e il dettaglio riga per riga di tutto ciò che
viene trattenuto sul lordo, con la formula usata per ogni voce.

La pagina è una landing: il calcolatore **è** la hero — headline, tre righe di
contesto e subito il prototipo, risultato in evidenza. Sotto, nell'ordine: il
conto riga per riga, i quattro passaggi della catena di calcolo con i numeri
correnti, cosa il prototipo copre e cosa no, le fonti di ogni parametro.
Due interfacce sullo stesso motore: `index.html` (landing, minimal, vetro,
colore solo nel grafico) e `index-b.html` (manifesto Jet HR, si aggiorna mentre
scegli). Vedi `DESIGN-SYSTEM.md`.

- **Pagine live:** vedi i link nella mail di consegna
- **Uso in locale:** apri `index.html` o `index-b.html`, non serve nessun server
- **Test:** `npm test` (Node 18+, nessuna dipendenza)

## Com'è fatto

| File | Cosa contiene |
|---|---|
| `src/tax-engine.js` | il motore di calcolo e **tutti** i parametri normativi: `PARAMS`, `REGIONI` (21), `COMUNI` (21 capoluoghi), `CONTRATTI` (5), `AGEVOLAZIONI` (4) |
| `src/page.html` + `src/design-system.css` | variante A, minimal in vetro con colore semantico |
| `src/page-b.html` + `src/ds-b.css` | variante B, manifesto |
| `test/tax-engine.test.mjs` | 27 test sul motore |
| `build.mjs` | inlina design system e motore in ogni variante e genera le pagine standalone |

I parametri di legge stanno tutti in cinque oggetti: quando cambia la legge di
bilancio, o una regione ritocca l'addizionale, si tocca un dato, non la logica.
Le tendine sono generate dagli stessi oggetti, quindi un'opzione visibile a
schermo esiste sempre anche nel motore.

## La catena di calcolo

```
RAL
 − contributi previdenziali a carico del dipendente        (aliquota dal contratto)
 = reddito di lavoro al netto dei contributi
 − quota esente                                            (agevolazione scelta)
 = imponibile IRPEF e addizionali
 − IRPEF lorda a scaglioni
 + detrazione da lavoro dipendente + ulteriore detrazione   (fino a capienza)
 = IRPEF netta
 − addizionale regionale                                    (regione scelta)
 − addizionale comunale                                     (capoluogo della regione)
 + trattamento integrativo e somma integrativa              (non sono retribuzione)
 = netto annuo → / mensilità = netto mensile
```

L'ordine conta. I contributi sono deducibili, quindi l'IRPEF non si calcola sulla
RAL ma sull'imponibile al netto dei contributi. Le detrazioni si sottraggono
dall'**imposta**, non dal reddito, e non sono rimborsabili: se superano l'IRPEF
lorda, l'imposta va a zero e l'eccedenza si perde (è la ragione per cui esiste il
trattamento integrativo).

### Le tre scelte, e cosa spostano davvero

| Input | Cosa cambia | Cosa **non** cambia |
|---|---|---|
| **Regione** | l'addizionale regionale (aliquote, scaglioni, esenzioni, detrazioni) **e** quella comunale, perché da qui si deriva il capoluogo | IRPEF erariale, contributi |
| **Contratto** | aliquota contributiva a carico del lavoratore (5,84% apprendista, 9,19% standard, 9,49% con CIGS) e, di riflesso, l'imponibile fiscale | aliquote IRPEF, detrazioni |
| **Agevolazione** | quota di reddito che concorre all'imponibile: 50%, 40% o 10% | i **contributi**, dovuti sulla retribuzione piena, e le soglie di detrazioni e bonus (vedi sotto) |

Una scelta di modello dichiarata: detrazioni, trattamento integrativo e taglio
del cuneo restano commisurati al reddito **al lordo** della quota esente. Senza
questa regola un impatriato con 30.000 € di RAL scivolerebbe sotto le soglie dei
bonus per redditi bassi e cumulerebbe agevolazione e sostegno. Un test fissa il
comportamento.

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
| Contributi a carico dipendente | 9,19% standard · 9,49% con CIGS a carico lavoratore (0,30%) · 5,84% apprendista | aliquota IVS FPLD; CIGS art. 9 L. 407/1990; apprendisti art. 1 c. 773 L. 296/2006 |
| Aliquota aggiuntiva 1% | sulla quota oltre 56.224 € | art. 3-ter L. 438/1992; soglia 2026 da INPS circ. 6/2026 |
| Massimale contributivo | 122.295 € | INPS circ. 6/2026 |
| **Addizionali regionali** | **tutte e 21 le regioni e province autonome**, con scaglioni, esenzioni e detrazioni | MEF – Dipartimento delle Finanze, [ricerca aliquote applicabili](https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/addregirpef/), anno 2026, dati letti l'1.9.2026 |
| **Addizionali comunali** | **i 21 capoluoghi di regione**, con scaglioni e soglie di esenzione | MEF – Dipartimento delle Finanze, [elenco generale dei comuni](https://www1.finanze.gov.it/finanze2/dipartimentopolitichefiscali/fiscalitalocale/nuova_addcomirpef/download/), anni 2026 e 2025, letti l'1.9.2026 |
| Impatriati | concorre il 50% del reddito (40% con figlio minore), entro 600.000 € | art. 5 D.Lgs. 209/2023 |
| Docenti e ricercatori | concorre il 10% del reddito | art. 44 D.L. 78/2010 |
| TFR | RAL / 13,5 meno 0,50% al Fondo di garanzia | art. 2120 c.c.; il TFR è mostrato a parte perché è accantonato, non pagato in busta |

Le aliquote regionali sono state lette una per una dall'interrogazione ufficiale
del MEF, non da tabelle di terze parti: le fonti secondarie consultate in fase di
raccolta si contraddicevano fra loro su Sicilia, Valle d'Aosta e Calabria. Ogni
regione porta con sé la propria norma di riferimento e la data di pubblicazione,
mostrate in pagina sotto la tendina.

## Semplificazioni (dichiarate, non nascoste)

1. **Full time, anno intero.** Nessun ragguaglio ai giorni: detrazioni e bonus
   sono presi per intero. Nessun minimo di 690/1.380 € sulla detrazione, che
   diventa rilevante solo con rapporti parziali.
2. **Tutta la RAL è imponibile**, sia ai fini contributivi che fiscali. Niente
   fringe benefit, welfare, premi di risultato detassati al 5%, trasferte, auto
   aziendale, straordinari.
3. **Il comune è derivato, non chiesto.** L'addizionale comunale usa il
   capoluogo della regione scelta: Milano per la Lombardia, Roma per il Lazio,
   Firenze per la Toscana. Sono 21 aliquote reali con le loro soglie di
   esenzione, invece delle oltre 7.900 che servirebbero per coprire ogni comune.
   Chi vive in un altro comune della stessa regione ottiene una stima, e la
   pagina lo dichiara.
4. **Nessun familiare a carico.** Restano fuori le detrazioni per carichi di
   famiglia, comprese quelle regionali di Campania, Marche, Piemonte, Puglia,
   Sardegna, Trento, Bolzano e Veneto, e le aliquote agevolate per disabilità.
5. **Reddito complessivo = RAL − contributi.** Nessun altro reddito, nessun onere
   deducibile o detraibile oltre ai contributi.
6. **Aliquota contributiva per tipologia, non per CCNL.** Nella realtà dipende
   anche da settore, dimensione aziendale e qualifica, e i fondi contrattuali dei
   dirigenti (Previndai, Fasi, Mario Negri) qui non sono calcolati.
7. **Addizionali per competenza.** In busta paga si trattengono come saldo
   dell'anno precedente più acconto dell'anno in corso; qui sono calcolate
   sull'anno di competenza, che è la lettura corretta per una proiezione annuale.
8. **Nessun conguaglio di fine anno**, nessuna gestione dei ratei di
   tredicesima/quattordicesima: la mensilità è il netto annuo diviso per il
   numero di mensilità scelto.
9. **Solo lato dipendente.** Il costo azienda (≈ +30% di contributi a carico del
   datore, più TFR e INAIL) non è calcolato.

## Le soglie che fanno saltare il netto

Il sistema italiano contiene vere discontinuità: superare la soglia di un euro fa
perdere l'intero beneficio. Il prototipo le riproduce invece di lisciarle, e le
segnala in pagina quando ci si finisce sopra.

| Soglia | Effetto |
|---|---|
| Milano, 23.000 € di imponibile | sotto è esente dall'addizionale comunale, un euro sopra costa 184 € pieni |
| Valle d'Aosta, 15.000 € di imponibile | sotto è esente, sopra l'addizionale regionale è dovuta sull'intero importo |
| Trento, 30.000 € di imponibile | la deduzione di 30.000 € azzera l'addizionale fino alla soglia e sparisce di colpo appena sopra |
| Lazio e Umbria, 28.000 € · Friuli-Venezia Giulia, 15.000 € | sotto soglia si applica un'aliquota unica sull'intero imponibile, sopra si passa alla scala progressiva |
| 8.500 e 15.000 € di reddito di lavoro | cambia la percentuale della somma integrativa, applicata a tutta la base |
| 20.000 € di reddito complessivo | finisce la somma integrativa e inizia l'ulteriore detrazione |
| 35.000 € | decade la detrazione aggiuntiva di 65 € |

Nelle Marche, dove né la regione né Ancona fissano soglie, il netto è
**monotono** su tutto l'arco 5.000–150.000 €: un test lo verifica passo passo,
così ogni salto all'indietro che comparisse in futuro è un bug.

## Verifica

```bash
npm test
```

I 27 test coprono: la progressività degli scaglioni, il massimale e l'aliquota
aggiuntiva dell'1%, le tre aliquote contributive per contratto, la continuità
delle detrazioni ai confini di fascia, la completezza e la coerenza della tabella
delle 21 regioni, la scala progressiva e l'aliquota unica sotto soglia,
le esenzioni piene di Valle d'Aosta e Trento, la detrazione di Bolzano che non
genera mai credito, la tabella dei 21 capoluoghi, la soglia comunale di Milano
che non è una franchigia, gli scaglioni comunali di Torino, il caso di Trento
dove l'addizionale comunale non esiste, le quote imponibili delle agevolazioni e il tetto dei
600.000 €, il fatto che un'agevolazione non apra la porta ai bonus per redditi
bassi, la catena completa su RAL 30.000 con i valori calcolati a mano, il caso a
basso reddito con somma integrativa, la monotonia del netto nelle Marche e i salti
all'indietro sopra le soglie di Milano e della Valle d'Aosta.

Controprova rapida: RAL 30.000, Lombardia, impiegato a tempo indeterminato,
nessuna agevolazione, 13 mensilità → **1.802 € netti al mese**, 23.426 € l'anno,
aliquota effettiva 21,9%. Stessa RAL in Lazio → 23.332 € l'anno; in Valle d'Aosta
→ 23.468 €.

## Cosa servirebbe per andare oltre il prototipo

- anagrafica comunale completa: oltre 7.900 comuni al posto dei 21 capoluoghi,
  con il CSV del MEF già in formato adatto
- tabelle CCNL per aliquota contributiva, mensilità e minimi, e i fondi dirigenti
- familiari a carico, altri redditi, oneri deducibili e detraibili, e con essi le
  detrazioni regionali oggi non modellate
- ratei, ferie, ROL, conguaglio di fine anno e cambio di scaglione in corso d'anno
- le altre agevolazioni (premi di risultato, welfare, fringe benefit, frontalieri)
- costo azienda e vista bidirezionale netto → lordo
