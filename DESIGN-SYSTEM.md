# Design system

Un motore di calcolo, due interfacce. Entrambe parlano il linguaggio visivo di
Jet HR: cambia quanto radicale è la traduzione del manifesto.

| | Variante A — sobria | Variante B — manifesto |
|---|---|---|
| File | `src/design-system.css` + `src/page.html` | `src/ds-b.css` + `src/page-b.html` |
| Build | `index.html` | `index-b.html` |
| Riferimento | sito jethr.com | prodotto Jet HR (dashboard, card documenti, grafico costo del personale) |
| Postura | documento professionale, cedolino leggibile | strumento, zero attrito |

## Token comuni, estratti dal sito

Rilevati dal DOM di jethr.com, non a occhio: inchiostro near-black con virata
oliva `#11150A`, superfici bianche su fondi sage `#F1F4F1` / `#E0E6DC`, raggi
8/16 e pill a raggio pieno (100px), CTA nera piena, impaginazione ariosa ad alto
contrasto. La famiglia del sito (Wix Made for Display) non è distribuibile: al
suo posto **Manrope** in A e **Plus Jakarta Sans** in B, entrambe grottesche
umanistiche con la stessa impostazione geometrica.

## Variante A — sobria

Scala 4/8, container 1080px, griglia 5/7 sopra e 7/5 sotto, così le due fasce si
bilanciano invece di inseguirsi. Superfici bianche su fondo sage, hairline
`#E3E7DE`, ombra quasi assente. Il colore compare **solo** nella barra di
ripartizione: quattro serie di una palette categoriale validata con lo script
della skill dataviz (sei check superati in entrambi i temi). Tutto il resto è
inchiostro e grigi.

I tre campi di contesto — regione, contratto, agevolazioni — sono tendine vere,
popolate dagli stessi oggetti che il motore usa per calcolare: 21 regioni,
5 contratti, 4 agevolazioni. Sotto ognuna, una riga in grigio dice cosa quella
scelta sposta davvero — la norma regionale e la data di pubblicazione, l'aliquota
contributiva, la quota di reddito esente — così il campo non è solo un filtro ma
spiega il proprio effetto. Il bottone *Calcola* resta, ma le tendine ricalcolano
già al cambio: chi lo preme conferma, non sblocca.

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
