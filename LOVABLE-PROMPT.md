# Prompt per Lovable

> Nota: questo prompt descrive la prima versione del prototipo, quella a caso
> fisso (Lombardia, Milano, impiegato a tempo indeterminato). La versione
> corrente aggiunge tre input reali — regione, contratto, agevolazione — che il
> prompt non copre. Vale ancora come traccia di impaginazione e di tono.

Due versioni. La **breve** lascia a Lovable le scelte di impaginazione: usala se
vuoi vedere cosa propone. La **lunga**, più sotto, fissa anche layout e token.

---

## Versione breve

```
Crea una web app che calcola quanto resta in busta a un dipendente italiano
partendo dalla RAL: inserisci la retribuzione annua lorda e ottieni il netto
annuo, il netto mensile e il dettaglio di tutto ciò che viene trattenuto.

Caso coperto: impiegato a tempo indeterminato, full time, anno intero, residente
a Milano, senza familiari a carico né agevolazioni. Anno d'imposta 2026.

Tieni la logica fiscale in un modulo separato dalla UI, con tutti i parametri
normativi raccolti in un unico oggetto di configurazione: quando cambia la legge
di bilancio si deve poter aggiornare un solo punto.

Regole di calcolo, in quest'ordine:
1. Contributi INPS a carico del dipendente: 9,19% della RAL, più un 1% aggiuntivo
   sulla quota che supera 56.224 €, con massimale contributivo a 122.295 €.
2. I contributi sono deducibili: l'imponibile fiscale è RAL meno contributi.
   L'IRPEF non si calcola mai sulla RAL.
3. IRPEF a scaglioni progressivi: 23% fino a 28.000, 33% da 28.000 a 50.000,
   43% oltre.
4. Detrazione per lavoro dipendente: 1.955 € fino a 15.000 € di reddito;
   1.910 + 1.190 × (28.000 − R)/13.000 tra 15.000 e 28.000;
   1.910 × (50.000 − R)/22.000 tra 28.000 e 50.000; zero oltre.
   Più 65 € se il reddito sta tra 25.000 e 35.000.
5. Taglio del cuneo: per redditi fino a 20.000 una somma non imponibile pari al
   7,1% / 5,3% / 4,8% del reddito da lavoro (soglie a 8.500 e 15.000); tra 20.000
   e 40.000 una detrazione di 1.000 €, piena fino a 32.000 e poi decrescente fino
   ad azzerarsi a 40.000.
6. Trattamento integrativo fino a 1.200 € per i redditi bassi, subordinato alla
   capienza dell'imposta.
7. Le detrazioni si sottraggono dall'imposta, non dal reddito, e non sono
   rimborsabili: se superano l'IRPEF lorda l'imposta va a zero e basta.
8. Addizionale regionale Lombardia a scaglioni sull'imponibile: 1,23% fino a
   15.000, 1,58% fino a 28.000, 1,72% fino a 50.000, 1,73% oltre.
9. Addizionale comunale Milano 0,80% sull'imponibile, con esenzione fino a
   23.000 €. È una soglia, non una franchigia: un euro sopra si paga tutto. Non
   trasformarla in franchigia per rendere la curva liscia, è corretta così.
10. Netto annuo = RAL − contributi − IRPEF netta − addizionali + integrazioni.
    Netto mensile = netto annuo diviso per le mensilità scelte (12, 13 o 14).
Mostra a parte il TFR maturato (RAL / 13,5 meno lo 0,50% al Fondo di garanzia):
è accantonato, non arriva in busta.

Interfaccia: una pagina sola, il risultato sempre visibile e aggiornato in tempo
reale mentre si digita, senza bottone "Calcola". Sopra il numero grande del netto
mensile, poi la ripartizione tra quello che resta e quello che se ne va, poi il
dettaglio voce per voce dove ogni riga può mostrare la formula con cui è stata
calcolata. Rendi visibili anche le ipotesi fissate (contratto, comune, assenza di
agevolazioni) come informazioni bloccate, non nasconderle.
Aspetto pulito e professionale, importi con cifre tabulari, formattazione in
italiano, funzionante da mobile a desktop e con dark mode.

Verifica: con RAL 30.000 e 13 mensilità il netto deve venire 23.426 € l'anno e
1.802 € al mese, con 2.757 € di contributi, 3.222 € di IRPEF netta e 596 € di
addizionali. Con RAL 80.000, 3.641 € al mese. Se non tornano, il problema è nella
catena di calcolo.
```

---

## Versione lunga

Copia il blocco **Prompt principale**. I due blocchi successivi sono follow-up da
mandare dopo, uno alla volta.

---

## Prompt principale

```
Costruisci una single-page app in React + TypeScript + Tailwind che calcola la
retribuzione netta annuale e mensile di un dipendente italiano partendo dalla RAL.
Niente backend, niente routing, niente librerie di UI: tutto client-side.

## Architettura
Crea due file separati:
1. `src/lib/taxEngine.ts` — logica pura, nessun import da React. Esporta un
   oggetto `PARAMS` con TUTTI i parametri normativi e una funzione
   `calcola(ral: number, opzioni: { mensilita: 12 | 13 | 14 }): Risultato`.
2. `src/App.tsx` — sola presentazione, consuma `calcola`.
Nessun numero fiscale può comparire in App.tsx: stanno solo in PARAMS.

## PARAMS — anno d'imposta 2026
Contributi a carico del dipendente (impiegato, industria/terziario):
- aliquota base 9,19%
- aliquota aggiuntiva 1% sulla quota eccedente 56.224 € (prima fascia pensionabile)
- massimale contributivo annuo 122.295 €

IRPEF a scaglioni progressivi:
- fino a 28.000 → 23%
- da 28.000 a 50.000 → 33%
- oltre 50.000 → 43%

Detrazione da lavoro dipendente (sul reddito complessivo R):
- R ≤ 15.000 → 1.955
- 15.000 < R ≤ 28.000 → 1.910 + 1.190 × (28.000 − R) / 13.000
- 28.000 < R ≤ 50.000 → 1.910 × (50.000 − R) / 22.000
- R > 50.000 → 0
- più 65 € se 25.000 < R ≤ 35.000

Taglio del cuneo:
- somma integrativa NON imponibile, se R ≤ 20.000: percentuale sul reddito di
  lavoro dipendente L → 7,1% se L ≤ 8.500; 5,3% se 8.500 < L ≤ 15.000; 4,8% se L > 15.000
- ulteriore detrazione se 20.000 < R ≤ 40.000: 1.000 € fino a 32.000, poi
  1.000 × (40.000 − R) / 8.000 fino ad azzerarsi a 40.000

Trattamento integrativo (max 1.200 €):
- R ≤ 15.000 → spetta pieno se IRPEF lorda > (detrazione da lavoro − 75)
- 15.000 < R ≤ 28.000 → spetta per la sola incapienza: min(1.200, max(0, detrazioni totali − IRPEF lorda))
- R > 28.000 → zero

Addizionale regionale Lombardia, a scaglioni sull'imponibile IRPEF:
1,23% fino a 15.000 · 1,58% fino a 28.000 · 1,72% fino a 50.000 · 1,73% oltre.

Addizionale comunale Milano: 0,80% sull'imponibile IRPEF, ma esente se
l'imponibile è ≤ 23.000 €. ATTENZIONE: è una SOGLIA, non una franchigia — un euro
sopra i 23.000 e si paga lo 0,80% sull'intero imponibile. Non lisciare questa
discontinuità: è corretta.

TFR (solo informativo, non entra nel netto): RAL / 13,5, meno lo 0,50% di
contributo al Fondo di garanzia.

## Catena di calcolo — l'ordine è vincolante
1. contributi = 9,19% × min(RAL, massimale) + 1% × max(0, min(RAL, massimale) − 56.224)
2. imponibileFiscale = RAL − contributi   (i contributi sono DEDUCIBILI)
3. irpefLorda = scaglioni progressivi applicati a imponibileFiscale
4. detrazioni = detrazione lavoro + eventuale bonus 65 + ulteriore detrazione cuneo
5. irpefNetta = max(0, irpefLorda − detrazioni)   (l'eccedenza NON è rimborsabile)
6. addizionali = regionale a scaglioni + comunale, entrambe su imponibileFiscale
7. bonus = trattamento integrativo + somma integrativa
8. nettoAnnuo = RAL − contributi − irpefNetta − addizionali + bonus
9. nettoMensile = nettoAnnuo / mensilita

Il risultato deve esporre anche il dettaglio per scaglione (base imponibile e
imposta di ogni fascia, sia IRPEF che addizionale regionale), perché la UI mostra
la formula di ogni riga.

## UI
Una sola colonna centrata, max 860px, quattro card bianche a raggio 20px su fondo
verde-oliva chiaro. Nessun bottone "Calcola": il risultato si aggiorna in tempo
reale mentre l'utente digita o trascina.

Card 1 — Calcolo
- titolo "Retribuzione annua lorda" e a destra un selettore segmentato a pill per
  le mensilità (12 / 13 / 14, default 13)
- campo di testo grande con prefisso €, formattazione italiana live (30.000) e
  cursore che non salta quando la formattazione inserisce un separatore
- slider da 10.000 a 150.000, step 500, sincronizzato col campo, traccia riempita
  in verde lime fino al pollice
- sotto, separato da una linea: "Netto al mese, su N mensilità" con il numero
  gigante (48–76px, tabular-nums, tracking stretto), affiancato da netto annuo e
  trattenute in formato più piccolo

Card 2 — "Dove vanno i tuoi soldi"
- badge verde chiaro in alto a destra: "78,1% resta a te"
- una barra unica alta 44px divisa in DUE parti: verde lime (netto) e verde-oliva
  scuro (trattenute), ognuna con il proprio importo scritto dentro, separate da 3px
- sotto, tre righe di magnitudine (contributi INPS, IRPEF, addizionali): percentuale
  sulla sinistra, nome + barra sottile mono-tinta, importo a destra
- niente quattro colori diversi: il colore distingue solo "resta" da "se ne va"

Card 3 — "Il conto, senza sorprese"
- un blocco per voce: Contributi INPS, IRPEF, Addizionali locali, Integrazioni in
  busta (solo se > 0), TFR messo da parte
- ogni blocco: tile pastello 40×40 con icona SVG stroke 1.75, titolo, una riga di
  spiegazione in italiano corrente, importo grande a destra col segno − o +
- ogni blocco ha un `<details>` con label "Mostra il calcolo" che rivela le righe
  con la formula esplicita e i numeri sostituiti, es.
  "Scaglione 23% · 27.243 € imponibili → 6.266 €" oppure
  "1.910 + 1.190 × (28.000 − 27.243) / 13.000"
- se l'imponibile è tra 23.000 e 25.500, mostra un avviso: superare la soglia
  dell'addizionale comunale di Milano costa l'importo pieno, perché è una soglia
  e non una franchigia

Card 4 — "Cosa ho dato per scontato"
- tre righe non modificabili, ognuna con tile pastello, titolo e motivo:
  impiegato a tempo indeterminato full time; Lombardia / Milano; nessuna
  agevolazione né familiari a carico. A destra un lucchetto con la parola "fisso"
- un `<details>` "Le fonti di ogni numero" con l'elenco dei riferimenti normativi:
  L. 199/2025 art. 1 c. 3 · art. 13 TUIR · L. 207/2024 e circ. Agenzia Entrate 4/E
  2025 · D.L. 3/2020 · INPS circ. 6/2026 · L.R. Lombardia 10/2003 art. 72 ·
  delib. C.C. Milano 46/2020

In fondo: "Prototipo dimostrativo: non è un cedolino e non sostituisce il
consulente del lavoro."

## Design
Font Plus Jakarta Sans da Google Fonts (400/500/700/800).
Token colore, definiti come CSS custom properties e usati ovunque:
- fondo #EEF1EA, card #FFFFFF, superficie interna #F5F7F2
- testo #1E2419, secondario #59614F, terziario #838B78, linee #E5E9DF
- verde lime #8FC53F (ciò che resta), oliva scuro #2C3123 (ciò che se ne va)
- tile pastello: lime #E6F3B8, blu #CFDEFB, verdeacqua #C3EBDD, sabbia #ECDFB8
Raggi 20 / 14 / 10 px e pill a 100px. Scala di spazio 4/8.
Dark mode via prefers-color-scheme con token ridefiniti (fondo #1B2017, card
#242A20, testo #F0F3EA, lime #A3D857): non invertire i colori, ridefinisci i token.

## Qualità, non negoziabile
- ogni importo con font-variant-numeric: tabular-nums e formattazione it-IT con
  useGrouping esplicito (altrimenti 2757 resta senza punto)
- target tattili ≥ 44px, focus visibile su ogni controllo, aria-label su input e
  barra, prefers-reduced-motion rispettato
- testo primario ≥ 4,5:1 e secondario ≥ 3:1 in entrambi i temi
- nessuna emoji come icona: solo SVG inline
- il layout non deve mai scrollare in orizzontale, testato a 375px

## Verifica prima di consegnare
Con RAL 30.000 e 13 mensilità devi ottenere esattamente:
contributi 2.757 € · imponibile 27.243 € · IRPEF lorda 6.266 € ·
detrazioni 3.044 € (1.979 + 65 + 1.000) · IRPEF netta 3.222 € ·
addizionali 596 € (378 regionale + 218 comunale) · netto annuo 23.426 € ·
netto mensile 1.802 € · aliquota effettiva 21,9%.
Con RAL 80.000: contributi 7.590 € (di cui 238 € di aliquota aggiuntiva 1%),
netto mensile 3.641 € su 13 mensilità.
Con RAL 22.000: nessuna addizionale comunale (imponibile 19.978 € sotto soglia) e
somma integrativa di 1.056 € (4,8% di 22.000), netto mensile 1.448 €.
Se un numero non torna, il bug è nella catena di calcolo, non nell'arrotondamento.
```

---

## Follow-up 1 — test

```
Aggiungi Vitest e un file di test per taxEngine.ts, senza toccare la UI.
Copri: progressività degli scaglioni; massimale e aliquota aggiuntiva 1%;
continuità della detrazione ai confini 15.000 / 28.000 / 50.000; la catena
completa su RAL 30.000 con i valori attesi; il caso a basso reddito con somma
integrativa; il cliff dell'addizionale comunale (imponibile 22.999 vs 23.001).
Aggiungi un test che scorre la RAL da 5.000 a 150.000 a passi di 10 e verifica che
il netto sia monotono crescente, TRANNE in prossimità delle sei soglie di legge
note (RAL ≈ 8.500, 15.000, 16.520, 22.030, 25.330, 38.550): lì il salto
all'indietro è corretto, ovunque altrove è un bug.
```

---

## Follow-up 2 — variante sobria

```
Aggiungi una seconda vista, raggiungibile da un toggle in alto, con lo stesso
motore ma un'impaginazione da documento: due colonne 5/7 in alto (pannello di
input a sinistra, riepilogo a destra) e 7/5 in basso (cedolino a sinistra, note a
destra), superfici bianche su fondo sage #F4F6F2, font Manrope per il testo e IBM
Plex Mono per micro-label e formule, nessun blocco colorato. Qui il cedolino è una
tabella riga per riga con la formula sotto ogni voce, non blocchi espandibili.
Nel pannello di input aggiungi tre select DISABILITATE — tipo di contratto,
regione e comune, agevolazioni — con bordo tratteggiato e una riga che spiega
perché sono bloccate.
```
