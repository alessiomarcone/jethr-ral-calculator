# Design system

Un motore di calcolo, due interfacce, due posture opposte: A è uno strumento
senza colore, B è la traduzione visiva del manifesto Jet HR.

| | Variante A — tech minimal | Variante B — manifesto |
|---|---|---|
| File | `src/design-system.css` + `src/page.html` | `src/ds-b.css` + `src/page-b.html` |
| Build | `index.html` | `index-b.html` |
| Colore | base monocromatica, tinte solo dove significano | palette prodotto Jet HR |
| Postura | strumento: hero + donut, il resto sotto la piega | manifesto: nessun modulo, nessun bottone |

## Cosa condividono

Scala 4/8, raggi 6/10/16 e pill a raggio pieno, CTA nera piena, impaginazione
ariosa ad alto contrasto: l'impostazione arriva dal DOM di jethr.com, rilevata e
non stimata a occhio. La famiglia del sito (Wix Made for Display) non è
distribuibile: al suo posto **Manrope** in A e **Plus Jakarta Sans** in B.
Da lì le due varianti divergono — A butta via la palette e tiene solo la
struttura, B tiene tutto.

## Variante A — minimal, vetro, colore semantico

**La base è monocromatica**: una rampa di pietra calda, piatta, senza tinte.
Il colore entra solo dove significa qualcosa, e ogni tinta ha un solo lavoro:

| Ruolo | Tinta | Dove |
|---|---|---|
| Primario | emerald | il bottone *Calcola* e la quota che resta in mano |
| Secondario | sky | i controlli di secondo livello: il selettore delle mensilità |
| Serie | emerald · violet · amber | i tre segmenti del grafico |

Il primario non si usa per due cose diverse: le mensilità non competono con
*Calcola*, perché non sono l'azione della pagina. I passi del grafico sono
validati con lo script della skill dataviz — in chiaro passano tutti e sei i
check, in scuro passano separazione CVD, soglia a vista normale e contrasto.

**Contrasto AAA ovunque**, non solo sul testo grande: le etichette mono da
10,5px stanno a 7,9:1, il testo bianco sul verde del bottone a 7,7:1, quello sul
blu delle mensilità a 7,6:1. In scuro il testo scuro sulle tinte chiare arriva a
oltre 9:1.

### Vetro, non bordi

Niente reticolo di rettangoli da 1px. Ogni superficie è vetro: velo traslucido,
`backdrop-filter` con una punta di saturazione, un filo di luce sul bordo alto
disegnato in maschera (`mask-composite`, non un `border`) e un'ombra bassa e
larga. Dietro tutto, tre aloni al 7-10% presi dalle tinte delle serie: senza
qualcosa da rifrangere, il vetro è solo un rettangolo chiaro. Le hairline
restano solo dove aiutano a leggere una colonna di numeri, e sono `box-shadow`,
non bordi, così non spostano il layout di un pixel.

### Niente tooltip

I tooltip erano diventati il posto dove nascondere la prosa: un dato ogni due
aveva la sua nuvoletta. Ora l'hero è pulito e c'è **un link terziario** —
*Perché ti chiediamo questi dati* — che apre un dialogo: cosa non chiediamo
(nome, codice fiscale, comune), dove gira il calcolo (nel browser), e per ogni
campo che cosa sposta davvero, effetti indiretti compresi. Le note di legge
scendono sotto la piega, nella piega *Le tue scelte*.

### Il donut

Parte-tutto a colpo d'occhio, tre segmenti, valori lontani fra loro: è il caso
in cui il cerchio regge. 4px di gap in superficie fra due archi, mai un bordo
attorno al segmento. L'identità non è affidata al solo colore: ogni segmento ha
la sua riga in legenda con importo e percentuale, e la tabella completa sta
sotto. **Il tooltip del grafico è il centro del donut**: passando su un segmento
il numero grande diventa quel segmento, invece di aprire un popover dove
l'occhio non sta guardando.

### Micromotion

Premendo *Calcola* il grafico si traccia in 900ms con un ease-out, il numero al
centro sale da zero fino al valore, e solo quando l'arco è chiuso le tre voci
compaiono in sequenza a 90ms l'una dall'altra. Il resto è micromovimento di
servizio: le card entrano sfalsate, il bottone cede sotto la pressione, la
legenda scorre di 2px al passaggio, la × del dialogo ruota. Cambiare una tendina
non rigioca l'animazione: aggiorna i numeri e basta, perché lì l'utente sta
confrontando, non scoprendo. Tutto è disattivato sotto `prefers-reduced-motion`,
compreso il conteggio, che salta al valore finale.

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
