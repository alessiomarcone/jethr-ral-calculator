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

**Una famiglia sola** (Inter variabile) e **una scala tipografica dichiarata nel
DS**: nove gradini, dal micro-testo al numero hero. La pagina non sceglie mai un
`font-size` a mano, prende un token, e titoli e paragrafi hanno una classe
ciascuno. Il mono è sparito: sulle etichette di un modulo suonava tecnico senza
essere più leggibile, e i numeri tabulari li dà anche Inter.

**La base cromatica è pietra calda.** Il colore vive nel grafico, e da lì
scende in velatura sulle card che parlano di quel pezzo: emerald dove si parla
del netto, violet sulle imposte, amber sui contributi. Sono gradienti al 13%
in un angolo solo, non superfici colorate: servono a togliere la piattezza al
vetro, il testo resta su fondo neutro.

**Il fondo scuro è profondo, non piatto.** `#0C0A09`: un nero con una virata
calda appena percettibile, non il grigio-carbone. Ho provato ad alzarlo a
`#14110D` e la pagina perdeva il contrasto fra fondo e vetro, che è quello che
fa leggere le card come oggetti sospesi. Le ombre restano nere piene, perché
sotto una card sospesa l'ombra è assenza di luce, non un colore.

**Grana sul gradiente.** Gli aloni di sfondo, su uno schermo ampio, mostrano le
bande. Sopra c'è un rumore frattale generato da un SVG inline (`feTurbulence`,
tile da 140px, nessun file da caricare) al 50% in chiaro e al 34% in scuro. Il
vetro sfoca la grana che ha dietro, quindi le card tinte se la rimettono nel
proprio livello, più fine e in `overlay`.

| Ruolo | Trattamento | Dove |
|---|---|---|
| Azione | inchiostro pieno, invertito col tema | *Calcola*: nero su bianco in chiaro, bianco su nero in scuro |
| Selezione | un gradino di pietra | il selettore delle mensilità: non compete con l'azione |
| Serie | emerald · violet · amber | i tre segmenti del grafico |

Le mensilità non sono l'azione della pagina, quindi non ne prendono il peso: un
riempimento di pietra le distingue senza gridare. I passi del grafico sono
validati con lo script della skill dataviz — in chiaro passano tutti e sei i
check, in scuro passano separazione CVD, soglia a vista normale e contrasto.

Il tema si sceglie da un interruttore nell'header sticky, in alto a destra: la
scelta esplicita vince sul sistema e sopravvive al reload (`localStorage`, in
try/catch — in una finestra privata anche solo leggerlo lancia).

**Contrasto AAA ovunque**, non solo sul testo grande: le etichette dei campi
stanno a 9,9:1 sulla card e 8,2:1 sul vetro più scuro, il testo del bottone a
16,8:1 in chiaro e 18,9:1 in scuro, la mensilità selezionata a 12,6:1. Il mono
piccolo gira a 500 e 600 di peso, non a 400: sotto i 12px la IBM Plex Mono in
regular si sfilaccia, e nessun contrasto lo compensa.

### Il campo bloccato che si aggiorna

La provincia non si sceglie: segue la regione, mostra il capoluogo con la sua
aliquota fra parentesi e resta `disabled`. Un campo assente nasconde una scelta,
un campo bloccato la dichiara, e mostrare il valore che cambia da solo racconta
il legame fra i due dati meglio di qualsiasi nota.

### Bento, non griglia uniforme

Nel riepilogo la dimensione della tessera dice quanto pesa il numero: il netto
annuo occupa quattro celle, il netto mensile due, imposte e contributi una
ciascuna. Sotto, il cedolino completo sta in un accordion chiuso: la sezione
entra in una schermata, e chi vuole la riga per riga la apre.

### Le voci non compaiono, cambiano

Prima le tre voci entravano in scena dopo il grafico. Anche senza spostare il
layout era la cosa sbagliata: comparire dice "ecco una novità", mentre qui il
contenuto è sempre lo stesso e cambia solo la cifra. Ora le righe stanno
sempre a schermo e i numeri **transitano** dal valore vecchio a quello nuovo in
700ms, mentre gli archi del donut si muovono con loro. Una velatura della tinta
di serie sale e svanisce sulle righe: dice che il conto è stato rifatto senza
chiedere attenzione. Sotto `prefers-reduced-motion`, o su una scheda in secondo
piano, i valori arrivano al risultato finale senza transizione.

### Il bottone che ha un lavoro

Se ogni cosa si ricalcola da sola, *Calcola* diventa un ornamento. Qui la
divisione è netta: **le scelte discrete** (regione, contratto, agevolazione,
mensilità) si applicano subito, perché non c'è niente da aspettare;
**digitare la RAL non ricalcola**, perché mentre scrivi "3", "30", "300" il
conto salterebbe su tre risultati che non hai chiesto. Il bottone è il momento
in cui dici di aver finito, e finché la cifra a schermo non è quella calcolata
lo dichiara: l'etichetta diventa *Ricalcola*.

### La velatura segue lo sguardo

La card del grafico cambia tinta con il segmento sotto il puntatore: emerald sul
netto, violet sulle imposte, amber sui contributi. Funziona perché `--tint` è
registrata con `@property` come `<color>`, e una custom property dichiarata si
può animare: 550ms di transizione invece di uno scatto. Resta una velatura al
13% in un angolo, non un cambio di superficie, altrimenti a ogni passaggio del
mouse la pagina lampeggerebbe e la lettura ne soffrirebbe.

### Vetro, non bordi

Niente reticolo di rettangoli da 1px attorno a tutto. I bordi restano dove
servono a capire dove si scrive: i campi hanno un anello interno da 1,5px ben
visibile, che si scurisce al passaggio e diventa inchiostro al focus. Le
superfici invece sono vetro: velo traslucido,
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
attorno al segmento. **La legenda sta sotto il grafico a ogni larghezza**, non a
fianco solo sul desktop: un'unica colonna di lettura, e nessun salto di layout
fra mobile e desktop. L'identità non è affidata al solo colore: ogni segmento ha
la sua riga con importo e percentuale, e la tabella completa sta sotto. **Il tooltip del grafico è il centro del donut**: passando su un segmento
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
