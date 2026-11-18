import { writeFileSync, mkdirSync } from "node:fs";
import { renderToHtml, renderToJson } from "@unlayer/react-elements";
import { Will, type Mode } from "./template";
import { sample, validateWill } from "./data";

validateWill(sample); // refuses to build if the data looks like it contains a secret

mkdirSync("out", { recursive: true });
const files: [string, Mode][] = [
  ["email-checkin", "checkin"],
  ["email-heir", "heir"],
  ["web", "web"],
  ["document", "document"],
];
for (const [name, mode] of files) {
  const html = renderToHtml(<Will d={sample} mode={mode} />);
  writeFileSync(`out/${name}.html`, html);
  console.log(`out/${name}.html  ${(html.length / 1024).toFixed(1)} KB`);
}
writeFileSync("out/design.json", JSON.stringify(renderToJson(<Will d={sample} mode="web" />), null, 2));
console.log("out/design.json");
