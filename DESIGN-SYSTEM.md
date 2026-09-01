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

I tre campi di contesto — contratto, regione, agevolazioni — sono presenti ma
bloccati: bordo tratteggiato, `disabled` semantico, cursore `not-allowed` e una
riga che spiega perché. Un campo assente nasconde una scelta, un campo bloccato
la dichiara.

## Variante B — manifesto

> «Odiamo profondamente la burocrazia. Perché ci rallenta, perché crea
> inefficienza, perché inibisce la voglia di fare impresa.»

Sette traduzioni dirette dal manifesto alla pagina:

| Burocrazia | Traduzione visiva |
|---|---|
| Compilare un modulo | **Un solo campo.** Slider più input: si trascina, non si compila |
| Premere invio e aspettare | **Nessun bottone.** Il conto si aggiorna mentre digiti o trascini |
| Il modulo che non spiega perché | **Campi bloccati che parlano:** tile pastello, titolo in italiano, motivo esplicito |
| Il gergo prima del significato | **Prima il senso, poi la norma.** "Dove vanno i tuoi soldi", i riferimenti di legge in un dettaglio ripiegato |
| Il prospetto illeggibile | **Liste, non tabelle.** Ogni voce è un blocco con icona, importo grande e "Mostra il calcolo" a richiesta |
| Perdersi tra le pagine | **Una colonna sola,** quattro card, nessuna navigazione da imparare; una barra riassuntiva compare solo quando il risultato esce dallo schermo |
| Il totale nascosto in fondo | **Il risultato in cima,** grande, sempre visibile |

Palette dal prodotto: fondo `#EEF1EA` (oliva chiaro), card bianche a raggio 20,
verde lime `#8FC53F` per ciò che resta, oliva scuro `#2C3123` per ciò che se ne
va, tile pastello lime/blu/verdeacqua/sabbia per orientarsi a colpo d'occhio.

La ripartizione è a due parti — quello che resta e quello che se ne va — invece
di quattro serie colorate: la scomposizione delle trattenute vive in tre barre
di magnitudine nello stesso oliva. Meno colore, meno da decifrare, e nessuna
identità affidata alla sola tinta.

## Regole valide in entrambe

1. Un colore non si scrive mai in chiaro fuori dal blocco token.
2. Ogni importo è tabulare; le colonne di numeri non ballano mai.
3. Tema in tre stati: `:root` chiaro, `@media (prefers-color-scheme: dark)` con
   guardia `:not([data-theme="light"])`, `:root[data-theme="dark"]` per il toggle.
4. Target tattili ≥ 44px, focus visibile, `prefers-reduced-motion` rispettato.
5. Testo primario ≥ 4,5:1 e secondario ≥ 3:1, verificati in entrambi i temi.
6. Nessun logo, wordmark o firma Jet HR: i riferimenti sono direzione visiva,
   non identità. Il footer dichiara che è un prototipo indipendente.
