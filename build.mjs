/**
 * Un'unica sorgente, piu' output:
 *   index.html          pagina standalone apribile in locale
 *   index-b.html        variante manifesto
 *   versioni/index.html archivio delle iterazioni
 *   dist/artifact*.html frammenti per la pubblicazione come Artifact
 *
 * Il motore di calcolo viene inlinato nelle pagine di calcolo, cosi' restano
 * self-contained e non possono divergere da src/tax-engine.js.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";

const engine = await readFile(new URL("./src/tax-engine.js", import.meta.url), "utf8");

// Le keyword `export` non servono una volta inlinato lo script.
const inlined = engine.replace(/^export /gm, "");

await mkdir(new URL("./dist/", import.meta.url), { recursive: true });

// Due varianti di interfaccia sullo stesso motore.
const varianti = [
  { page: "page.html", ds: "design-system.css", out: "index.html", artifact: "artifact.html" },
  { page: "page-b.html", ds: "ds-b.css", out: "index-b.html", artifact: "artifact-b.html" },
];

for (const v of varianti) await costruisci(v);

// L'archivio non calcola niente: gli serve solo il design system.
await costruisci({ page: "versioni.html", ds: "design-system.css", out: "versioni/index.html" });

async function costruisci({ page: pageFile, ds: dsFile, out, artifact }) {
const page = await readFile(new URL(`./src/${pageFile}`, import.meta.url), "utf8");
const ds = await readFile(new URL(`./src/${dsFile}`, import.meta.url), "utf8");

const composed = page
  .replace("/* DS */", ds.trim())
  .replace("/* ENGINE */", inlined.trim());

if (artifact) await writeFile(new URL(`./dist/${artifact}`, import.meta.url), composed);

const cut = composed.indexOf("</style>") + "</style>".length;
const head = composed.slice(0, cut);
const body = composed.slice(cut);

const descrizione = artifact
  ? "Calcolatore RAL lordo-netto, anno d'imposta 2026: netto annuo e mensile, imposte e contributi voce per voce, con le aliquote regionali di tutte e 21 le regioni."
  : "Le otto versioni della pagina, prese dalla cronologia del repo e lasciate intatte.";

const standalone = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${descrizione}">
${head}
</head>
<body>
${body}
</body>
</html>
`;

await mkdir(new URL(`./${out}`, import.meta.url).href.replace(/[^/]+$/, ""), { recursive: true });
await writeFile(new URL(`./${out}`, import.meta.url), standalone);
console.log(`build ok: ${out}${artifact ? ` + dist/${artifact}` : ""}`);
}
