# Bozza email di consegna

> Rispondere alla mail di invito **senza modificare l'oggetto**, con
> `task@jethr.com` e `matteo.vertemati@jethr.com` in CC.

---

Ciao,

ecco la mia task.

**Prototipo live:** https://alessiomarcone.github.io/jethr-ral-calculator/
**Codice, fonti e test:** https://github.com/alessiomarcone/jethr-ral-calculator

Inserisci una RAL, scegli regione, contratto e agevolazione, premi *Calcola*:
netto annuo e mensile, imposte e contributi nel grafico, e sotto il conto riga
per riga con la formula di ogni voce.

## Le scelte principali

Il brief permetteva di fissare il caso semplice: impiegato a tempo
indeterminato, Milano, nessuna agevolazione. L'ho preso come punto di partenza e
ne ho fatto tre input veri, perché sono le variabili che un utente reale si
aspetta di poter cambiare: **regione** (tutte e 21, comprese le irregolarità:
aliquota unica sotto soglia in Lazio, Umbria e Friuli, esenzione piena in Valle
d'Aosta e Trento), **contratto** (l'aliquota a carico del lavoratore va da 5,84%
a 9,49%) e **agevolazioni** (impatriati e rientro dei ricercatori, che riducono
la base imponibile ma non i contributi).

Sul comune ho fatto una scelta che vale la pena spiegare. Coprire i 7.900 comuni
italiani è fuori portata per un prototipo, ma fissare Milano allo 0,80% era
l'ipotesi più debole del conto. Ho quindi **derivato il comune dalla regione,
prendendo il capoluogo**: Milano per la Lombardia, Roma per il Lazio, Firenze per
la Toscana. Sono 21 aliquote comunali vere, dallo stesso elenco MEF che già
usavo, senza un campo in più da compilare. Il caso del brief resta coperto alla
lettera, e il prototipo funziona anche per chi non vive a Milano.

Le altre semplificazioni (full time per l'anno intero, nessun familiare a carico,
solo lato dipendente) sono dichiarate in pagina e nel README, non nascoste.

## Come l'ho costruito

Analisi del brief → ricerca visiva su brand e competitor → wireframe e bozza UI →
passaggio a Claude Code con il design system estratto dai token CSS pubblici del
sito Jet HR → fine tuning su accessibilità e micro-interazioni → integrazione nella
hero di una landing page dedicata.

L'ultimo passaggio è quello a cui tenevo di più: non un calcolatore isolato, ma un
pezzo di prodotto dentro uno scenario d'uso, dove il risultato è la prima cosa che
vedi e il dettaglio arriva allo scroll.

## Sul controllo delle logiche

Il punto sollevato nel brief mi sembra il più importante, quindi lo affronto
direttamente:

- **Motore separato dall'interfaccia** (`src/tax-engine.js`), coperto da **27
  test** senza dipendenze: fra questi la monotonia del netto su tutto l'arco
  5.000–150.000 € e i punti in cui invece il netto *deve* scendere, perché la
  legge contiene vere discontinuità.
- **Tutti i parametri normativi in cinque oggetti**: quando cambia la legge di
  bilancio si tocca un dato, non la logica. Le tendine nascono dagli stessi
  oggetti, quindi un'opzione a schermo esiste sempre anche nel motore.
- **Aliquote lette dagli elenchi ufficiali del MEF**, regione per regione e
  comune per comune, non da tabelle di terzi: le fonti secondarie si
  contraddicevano su Sicilia, Valle d'Aosta e Calabria. Dove l'elenco 2026 non
  riporta ancora una delibera comunale, il motore applica la regola dichiarata
  dal MEF e usa l'aliquota dell'anno prima, segnalando quale.

Controprova: RAL 30.000 in Lombardia, 13 mensilità → 1.802 € netti al mese,
23.426 € l'anno, aliquota effettiva 21,9%.

## Mi piacerebbe discuterne a voce

Ci sono un paio di scelte che valgono più di una call che di un paragrafo:

- **Il caso impatriati.** È l'unico punto in cui il codice fa una scelta
  interpretativa: detrazioni, trattamento integrativo e taglio del cuneo restano
  commisurati al reddito *al lordo* della quota esente, altrimenti un impatriato
  con 30.000 € di RAL scivolava sotto le soglie dei bonus per redditi bassi e
  cumulava agevolazione e sostegno.
- **Dove fermare un prototipo.** I 21 capoluoghi sono un compromesso: coprono i
  casi più frequenti con dati veri, ma il passo successivo (l'anagrafica
  completa dei comuni) è un problema di dati, non di logica. Stesso discorso per
  tabelle CCNL, familiari a carico, costo azienda e vista inversa netto → lordo.
- **La collocazione nella hero**, e se sia la lettura giusta di questo strumento
  dentro un prodotto come il vostro.

Sono disponibile per una call quando vi è comodo.

## Altri lavori, se vi è utile vedere come lavoro

- **Spesa consapevole** — calcolatore di spesa:
  https://github.com/alessiomarcone/spesa-consapevole
- **Generatore di Gantt** — nato da un problema nostro: caricavamo CSV di
  tempistiche e nessuno strumento restituiva l'output che ci serviva, così ce lo
  siamo costruiti su misura. https://am-gantt-generator.netlify.app/ — ne ho
  scritto qui:
  https://www.linkedin.com/pulse/quanto-costa-davvero-non-pagare-pi%C3%B9-il-software-alessio-marcone-ktmne/
- **Agent Fieldbook** — knowledge base sull'uso operativo degli agenti:
  https://github.com/alessiomarcone/agent-fieldbook
- **Skills for AI** — raccolta e audit di skill selezionate, più un blog su AI,
  MCP, RAG e comparatori: https://skillsforai.pro/

Grazie,
Alessio Marcone
