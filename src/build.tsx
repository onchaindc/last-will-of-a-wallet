// npm run build: renders all four outputs from the one validated data object into out/.
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { render } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { CheckinEmail, HeirEmail, LetterDocument, WalkthroughPage } from "./template";
import { fontFiles } from "./theme";
import { sample, validateWill } from "./data";

validateWill(sample); // refuses to build if the data looks like it contains a secret

const out = resolve("out");
await mkdir(resolve(out, "fonts"), { recursive: true });
for (const f of fontFiles) await copyFile(resolve("public/fonts", f.file), resolve(out, "fonts", f.file));
const fonts = await Promise.all(
  fontFiles.map(async (f) => ({ family: f.family, weight: f.weight, style: f.style, src: new Uint8Array(await readFile(resolve("public/fonts", f.file))) })),
);

const show = (name: string, size: number, diagnostics: { severity: string; code: string }[]) => {
  const worth = diagnostics.filter((x) => x.severity !== "info").map((x) => x.code);
  console.log(`out/${name}  ${(size / 1024).toFixed(1)} KB${worth.length ? `  (${worth.join(", ")})` : ""}`);
};

const checkin = await render(<CheckinEmail d={sample} />);
await writeFile(resolve(out, "email-checkin.html"), checkin.html);
show("email-checkin.html", checkin.html.length, checkin.diagnostics);

const heir = await render(<HeirEmail d={sample} />);
await writeFile(resolve(out, "email-heir.html"), heir.html);
show("email-heir.html", heir.html.length, heir.diagnostics);

// "." makes font URLs relative, so the page works when opened straight from disk.
const page = await render(<WalkthroughPage d={sample} origin="." />);
await writeFile(resolve(out, "web.html"), page.html);
await writeFile(resolve(out, "index.html"), page.html);
show("web.html", page.html.length, page.diagnostics);

const letter = await renderPdf(<LetterDocument d={sample} origin="." />, { fonts });
await writeFile(resolve(out, "letter-of-instruction.pdf"), letter.pdf);
show("letter-of-instruction.pdf", letter.pdf.length, letter.diagnostics);
