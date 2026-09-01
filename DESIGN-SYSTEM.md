# Payslip DS

Il design system del prototipo. Vive in un file solo, `src/design-system.css`, che
la build inlina nella pagina: i token sono l'unico posto in cui si tocca il colore,
la forma o la tipografia.

## Da dove viene

Due riferimenti, fusi con ruoli diversi.

**Jet HR (jethr.com)** — estratto dal sito, non a occhio: inchiostro near-black con
virata oliva `#11150A`, fondi sage `#F1F4F1` / `#E0E6DC`, radius 8/16 e pill a
raggio pieno (100px), CTA nere piene, impaginazione ariosa ad altissimo contrasto.
Da qui vengono l'inchiostro, i fondi, la forma dei controlli e il tono sobrio.
La famiglia del sito (Wix Made for Display) non è distribuibile: al suo posto
**Archivo**, grottesco stretto con la stessa impostazione geometrica.

**Bento fintech dashboard** (le reference immagini) — blocchi pieni e saturi
accostati a griglia, numeri giganti in grottesco molto stretto, micro-label
monospace in maiuscoletto spaziato, pill come etichetta di sezione. Da qui vengono
la griglia bento, i blocchi colorati e la gerarchia "numero enorme + label micro".

**Il ponte tra i due:** i blocchi saturi del secondo riferimento portano l'inchiostro
scuro del primo. Nessun testo bianco su colore, nessun blocco che cambia colore tra
i temi.

## Token

### Colore

| Token | Chiaro | Scuro | Ruolo |
|---|---|---|---|
| `--ds-ground` | `#F1F4F1` | `#0D1008` | fondo pagina |
| `--ds-tile` | `#FFFFFF` | `#171B12` | superficie delle tile neutre |
| `--ds-ink` | `#11150A` | `#F2F5EE` | testo primario |
| `--ds-ink-soft` | `#59615F` | `#A8B0A2` | testo secondario |
| `--ds-ink-faint` | `#888A85` | `#7C847A` | formule, didascalie |
| `--ds-lime` | `#C3CF12` | invariato | blocco del risultato |
| `--ds-lilac` | `#A99CD6` | invariato | blocco contributi |
| `--ds-flame` | `#F0512A` | invariato | blocco IRPEF |
| `--ds-sun` | `#F2D111` | invariato | blocco addizionali, alert soglia |
| `--ds-mint` | `#DDE7DA` | invariato | blocco note |

I cinque blocchi restano identici nei due temi e portano sempre `--ds-on-block`
(`#11150A`). Rapporti di contrasto dell'inchiostro sul blocco: lime 10,8 · sun 12,2 ·
mint 14,6 · lilac 7,4 · flame 5,2. Il flame è il più stretto, per questo sui blocchi
il testo micro resta inchiostro pieno invece di essere sfumato in trasparenza.

### Serie del grafico

Separate dai blocchi e non decorative: sono una palette **categoriale validata**
con `scripts/validate_palette.js` della skill dataviz, sei check superati in
entrambi i temi.

| Serie | Chiaro | Scuro |
|---|---|---|
| Netto | `#1BAF7A` | `#199E70` |
| Contributi INPS | `#2A78D6` | `#3987E5` |
| IRPEF | `#EB6834` | `#D95926` |
| Addizionali | `#4A3AA7` | `#9085E9` |

Le tinte del bento che ho provato come serie (oliva, giallo, lavanda pastello)
falliscono la separazione per deuteranopia — l'oliva contro il flame scende a
ΔE 1,6 — quindi restano superfici, mai codifica di dato. Il colore identifica la
voce, ma la legenda ripete sempre nome e importo: l'identità non è mai affidata al
solo colore.

### Tipografia

| Ruolo | Famiglia | Uso |
|---|---|---|
| display | Archivo 700, tracking da −.028em a −.04em | titolo, numeri giganti |
| corpo | Archivo 400/500 | testo, righe del cedolino |
| dato e micro-label | IBM Plex Mono 500, tracking +.11em, maiuscoletto | label, formule, importi |

Regola: **ogni numero è monospace e tabulare**, così le colonne di importi si
allineano; ogni etichetta di sezione è una micro-label monospace maiuscola. Il
grottesco resta al testo e ai numeri-titolo.

### Forma e spazio

`--ds-r-tile: 22px` · `--ds-r-field: 12px` · `--ds-r-pill: 999px` ·
`--ds-gap: 14px` · `--ds-pad: 22px`. Griglia bento a 12 colonne che collassa a
colonna singola sotto i 960px.

## Componenti

| Classe | Cos'è |
|---|---|
| `.tile` | contenitore base: superficie, radius, padding, colonna flex |
| `.block-*` | variante piena colorata della tile |
| `.pill` / `.pill--solid` / `.pill--ghost` | etichetta a raggio pieno |
| `.figure-xl` / `.figure-lg` | numero-titolo e numero di blocco |
| `.label` | micro-label monospace maiuscola |
| `.control` | campo input con unità a sinistra |
| `.switch` | selettore segmentato (mensilità) |
| `.chips` | scorciatoie di valore |
| `.btn` | azione primaria, pill piena inchiostro |
| `.bento` + `.span-*` | griglia a 12 colonne |

## Regole

1. Un colore non si scrive mai in chiaro fuori dal blocco token.
2. I blocchi pieni portano solo inchiostro scuro, mai bianco.
3. Le serie del grafico non si usano come superficie e le superfici non si usano
   come serie.
4. Ogni numero è tabulare; ogni sezione ha una micro-label.
5. Il tema si definisce a livello di token, in tre stati: `:root` chiaro,
   `@media (prefers-color-scheme: dark)` con guardia `:not([data-theme="light"])`,
   e `:root[data-theme="dark"]` per il toggle esplicito.
6. Il focus è sempre visibile (`outline` 3px inchiostro) e le animazioni si
   spengono con `prefers-reduced-motion`.

## Nota

I riferimenti sono usati come direzione visiva, non come identità: la pagina non
porta logo, wordmark o firma Jet HR, ed è dichiarata in calce come prototipo
indipendente.
