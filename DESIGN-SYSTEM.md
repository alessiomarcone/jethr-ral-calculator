# Design system

Un motore di calcolo, due interfacce, due posture opposte: A è uno strumento
senza colore, B è la traduzione visiva del manifesto Jet HR.

| | Variante A — tech minimal | Variante B — manifesto |
|---|---|---|
| File | `src/design-system.css` + `src/page.html` | `src/ds-b.css` + `src/page-b.html` |
| Build | `index.html` | `index-b.html` |
| Colore | nessuno: rampa di grigi caldi | palette prodotto Jet HR |
| Postura | strumento: hero + donut, il resto sotto la piega | manifesto: nessun modulo, nessun bottone |

## Cosa condividono

Scala 4/8, raggi 6/10/16 e pill a raggio pieno, CTA nera piena, impaginazione
ariosa ad alto contrasto: l'impostazione arriva dal DOM di jethr.com, rilevata e
non stimata a occhio. La famiglia del sito (Wix Made for Display) non è
distribuibile: al suo posto **Manrope** in A e **Plus Jakarta Sans** in B.
Da lì le due varianti divergono — A butta via la palette e tiene solo la
struttura, B tiene tutto.

## Variante A — tech minimal, grigi caldi

Nessun colore: una sola rampa di grigi caldi (virata sabbia, mai neutra fredda),
inchiostro e superficie. La gerarchia la fanno peso, spazio e passi di
luminosita'. Mono (IBM Plex Mono) per etichette, unita' e importi; grottesca
(Manrope) per numeri e titoli.

**L'hero e' una schermata sola.** A sinistra i quattro input, a destra il
risultato. Tutto cio' che prima era un paragrafo esplicativo e' diventato un
tooltip: la norma regionale e la data di pubblicazione, l'aliquota contributiva
del contratto, la quota esente dell'agevolazione, le ipotesi del calcolo. Il
testo non e' sparito, ha smesso di occupare spazio finche' non serve.

**Il conto per esteso vive al primo scroll:** sei tile con i totali, il cedolino
riga per riga con la formula di ogni voce, e tre pieghe — semplificazioni, fonti,
cosa il prototipo non fa.

### Il donut

Parte-tutto a colpo d'occhio, tre segmenti (resta in mano / imposte /
contributi), valori lontani fra loro: e' il caso in cui il cerchio regge.

- rampa **sequenziale**, non categoriale: piu' scuro = la quota che conta.
  I passi sono validati con lo script della skill dataviz — separazione CVD
  >= 17 e contrasto >= 3:1 sulla superficie, in chiaro e in scuro;
- **4px di gap in superficie** fra due archi, mai un bordo attorno al segmento;
- l'identita' non e' mai affidata al solo grigio: ogni segmento ha la sua riga in
  legenda con importo e percentuale, e la tabella completa sta sotto;
- **il tooltip del grafico e' il centro del donut.** Passando su un segmento il
  numero grande diventa quel segmento, invece di aprire un popover dove l'occhio
  non sta guardando. Sul touch un tap fuori riporta al netto.

## Variante B — manifesto

> «Odiamo profondamente la burocrazia. Perché ci rallenta, perché crea
> inefficienza, perché inibisce la voglia di fare impresa.»

Sette traduzioni dirette dal manifesto alla pagina:

| Burocrazia | Traduzione visiva |
|---|---|
| Compilare un modulo | **Un solo campo.** Slider più input: si trascina, non si compila |
| Premere invio e aspettare | **Nessun bottone.** Il conto si aggiorna mentre digiti o trascini |
| Il modulo che non spiega perché | **Ogni campo dichiara il suo effetto:** sotto la scelta, in grigio, la norma o l'aliquota che cambia |
| Il gergo prima del significato | **Prima il senso, poi la norma.** "Dove vanno i tuoi soldi", i riferimenti di legge in un dettaglio ripiegato |
| Il prospetto illeggibile | **Liste, non tabelle.** Ogni voce è un blocco con icona, importo grande e "Mostra il calcolo" a richiesta |
| Perdersi tra le pagine | **Una colonna sola,** quattro card, nessuna navigazione da imparare; una barra riassuntiva compare solo quando il risultato esce dallo schermo |
| Il totale nascosto in fondo | **Il risultato in cima,** grande, sempre visibile |

### Impianto della card

L'impianto viene da un calcolatore di risparmio fotovoltaico usato come
riferimento strutturale: **una sola card divisa a metà**, input a sinistra ed
esito a destra, col pannello di destra che arriva a filo del bordo e si divide in
due fasce — tinta chiara sopra col numero grande, blocco pieno sotto con la
griglia di dati e la call to action. Tradotto sul nostro dominio:

| Riferimento | Qui |
|---|---|
| `HOUSE DETAILS` | `DATI DEL RAPPORTO DI LAVORO` |
| Slider della bolletta con pill del valore | Slider della RAL con pill editabile |
| Gruppi di chip (falde, orientamento, riscaldamento) | Gruppi di chip (mensilità, contratto, agevolazioni) più la tendina delle 21 regioni |
| Toggle `1 year / 25 years` | Toggle `Al mese / All'anno` |
| Risparmio stimato, numero gigante | Netto stimato, numero gigante |
| Griglia `system size / payback / CO2` | Griglia `INPS / IRPEF / addizionali / aliquota` |
| Riga CO2 con dato secondario in grigio | Riga «su ogni 100 € di lordo», col TFR come dato secondario |
| Disclaimer + `Get a Quote` | Disclaimer + `Vedi il conto`, che apre il dettaglio |

I chip reggono bene insiemi piccoli e chiusi — cinque contratti, quattro
agevolazioni — ma non ventuno regioni: quella sola scelta diventa una tendina a
pill, con la stessa altezza minima di 44px e la freccia disegnata in CSS. Dove
serviva un elenco lungo, la chip cede il posto senza cambiare linguaggio.

Palette dal prodotto Jet HR: fondo `#EEF1EA`, card bianche a raggio 20, verde
lime `#8FC53F` per il valore positivo e per la CTA, fascia chiara `#E9F4D4`,
blocco pieno oliva `#2C3123` con testo chiaro, tile pastello
lime/blu/verdeacqua/sabbia nel dettaglio. In dark mode il blocco pieno resta più
scuro della card (`#101409`): non si inverte, altrimenti la gerarchia si ribalta.

## Regole valide in entrambe

1. Un colore non si scrive mai in chiaro fuori dal blocco token.
2. Ogni importo è tabulare; le colonne di numeri non ballano mai.
3. Tema in tre stati: `:root` chiaro, `@media (prefers-color-scheme: dark)` con
   guardia `:not([data-theme="light"])`, `:root[data-theme="dark"]` per il toggle.
4. Target tattili ≥ 44px, focus visibile, `prefers-reduced-motion` rispettato.
5. Testo primario ≥ 4,5:1 e secondario ≥ 3:1, verificati in entrambi i temi.
6. Nessun logo, wordmark o firma Jet HR: i riferimenti sono direzione visiva,
   non identità. Il footer dichiara che è un prototipo indipendente.
