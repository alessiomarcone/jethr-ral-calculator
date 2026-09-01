# Bozza email di consegna

> Rispondere alla mail di invito **senza modificare l'oggetto**, con
> `task@jethr.com` e `matteo.vertemati@jethr.com` in CC.

---

Ciao,

ecco la mia task.

**Prototipo live:** https://alessiomarcone.github.io/jethr-ral-calculator/
**Codice, fonti e test:** https://github.com/alessiomarcone/jethr-ral-calculator

## Cosa fa

Inserisci una RAL, scegli regione, tipologia di contratto e agevolazione, premi
*Calcola*: la pagina restituisce netto annuo e mensile, imposte e contributi nel
grafico in alto, e sotto il conto riga per riga con la formula di ogni voce.

Il brief permetteva di fissare il caso semplice — impiegato a tempo
indeterminato, Milano, nessuna agevolazione. L'ho preso come punto di partenza e
ne ho fatto tre input veri, perché sono esattamente le tre variabili che in un
prodotto reale un utente si aspetta di poter cambiare:

- **Regione** — tutte e 21 fra regioni e province autonome, comprese le
  irregolarità: aliquota unica sotto soglia in Lazio, Umbria e Friuli, esenzione
  piena in Valle d'Aosta e Trento, detrazioni regionali che non generano credito.
- **Contratto** — l'aliquota contributiva a carico del lavoratore passa da 5,84%
  (apprendista) a 9,49% (industria che versa la CIGS).
- **Agevolazioni** — impatriati e rientro di docenti e ricercatori: riducono la
  base imponibile ma non i contributi.

Il comune è invece rimasto fuori: servirebbe l'anagrafica di oltre 7.900
aliquote, quindi uso lo 0,80%, il massimo ordinario di legge, dichiarato in
pagina. Le altre semplificazioni (full time per l'anno intero, nessun familiare
a carico, nessun conguaglio, solo lato dipendente) sono elencate sotto il
risultato e nel README, non nascoste.

## Come l'ho costruito

Analisi del brief → ricerca visiva sul brand e sui competitor → wireframe e
prima bozza UI → passaggio a Claude Code con il design system estratto dai token
CSS pubblici del sito Jet HR, per coerenza e velocità → fine tuning su
accessibilità e micro-interazioni → integrazione del prototipo nella hero di una
landing page dedicata.

Quest'ultimo passaggio è quello a cui tenevo di più: non volevo un calcolatore
isolato, ma un pezzo di prodotto che sta dentro uno scenario d'uso reale, dove il
risultato è il primo elemento che vedi e il dettaglio arriva allo scroll.

## Sul controllo delle logiche

Il punto sollevato nel brief mi sembra il più importante, quindi lo affronto
direttamente.

- **Il motore è separato dall'interfaccia** (`src/tax-engine.js`) e coperto da
  **22 test** che girano con `npm test`, senza dipendenze. Fra questi: la
  monotonia del netto su tutto l'arco 5.000–150.000 € e i punti in cui invece il
  netto *deve* scendere, perché la legge contiene vere discontinuità.
- **Tutti i parametri normativi stanno in quattro oggetti**: quando cambia la
  legge di bilancio si tocca un dato, non la logica. Le tendine sono generate
  dagli stessi oggetti, quindi un'opzione a schermo esiste sempre anche nel
  motore.
- **Le aliquote regionali le ho lette una per una dall'interrogazione ufficiale
  del MEF**, non da tabelle di terze parti: le fonti secondarie che avevo trovato
  si contraddicevano fra loro su Sicilia, Valle d'Aosta e Calabria. Ogni regione
  porta con sé la norma di riferimento e la data di pubblicazione.
- **Una scelta di modello che vale la pena discutere**: detrazioni, trattamento
  integrativo e taglio del cuneo restano commisurati al reddito al lordo della
  quota esente. Senza questa regola un impatriato con 30.000 € di RAL scivolava
  sotto le soglie dei bonus per redditi bassi e cumulava agevolazione e
  sostegno — un risultato che il sistema non vuole. È l'unico punto in cui il
  codice fa una scelta interpretativa, ed è commentato nel motore e nel README.

Controprova rapida: RAL 30.000 in Lombardia, 13 mensilità → 1.802 € netti al
mese, 23.426 € l'anno, aliquota effettiva 21,9%.

## Altri lavori, se vi è utile vedere come lavoro

- **Spesa consapevole** — calcolatore di spesa:
  https://github.com/alessiomarcone/spesa-consapevole
- **Generatore di Gantt** — nato da un problema nostro: caricavamo CSV di
  tempistiche e nessuno degli strumenti in giro restituiva l'output che ci
  serviva, così ce lo siamo costruiti su misura, gratuito e interno.
  https://am-gantt-generator.netlify.app/ — ne ho scritto qui:
  https://www.linkedin.com/pulse/quanto-costa-davvero-non-pagare-pi%C3%B9-il-software-alessio-marcone-ktmne/
- **Agent Fieldbook** — knowledge base sull'uso operativo degli agenti:
  https://github.com/alessiomarcone/agent-fieldbook
- **Skills for AI** — raccolta e audit di skill selezionate, più un blog su AI,
  MCP, RAG e comparatori: https://skillsforai.pro/

Resto a disposizione per entrare nel dettaglio delle semplificazioni e delle
scelte di modello.

Grazie,
Alessio Marcone
