/**
 * Un'unica sorgente, due output:
 *   index.html        pagina standalone apribile in locale
 *   dist/artifact.html frammento per la pubblicazione come Artifact
 *
 * Il motore di calcolo viene inlinato in entrambi, cosi' la pagina resta
 * self-contained e non puo' divergere da src/tax-engine.js.
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

async function costruisci({ page: pageFile, ds: dsFile, out, artifact }) {
const page = await readFile(new URL(`./src/${pageFile}`, import.meta.url), "utf8");
const ds = await readFile(new URL(`./src/${dsFile}`, import.meta.url), "utf8");

const composed = page
  .replace("/* DS */", ds.trim())
  .replace("/* ENGINE */", inlined.trim());

await writeFile(new URL(`./dist/${artifact}`, import.meta.url), composed);

const cut = composed.indexOf("</style>") + "</style>".length;
const head = composed.slice(0, cut);
const body = composed.slice(cut);

const standalone = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="Calcolatore RAL lordo-netto, anno d'imposta 2026: netto annuo e mensile, imposte e contributi voce per voce, con le aliquote regionali di tutte e 21 le regioni.">
${head}
</head>
<body>
${body}
</body>
</html>
`;

await writeFile(new URL(`./${out}`, import.meta.url), standalone);
console.log(`build ok: ${out} + dist/${artifact}`);
}
