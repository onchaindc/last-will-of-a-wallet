import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(resolve("out/document.html")).href);
await page.pdf({ path: "out/letter-of-instruction.pdf", format: "Letter", printBackground: true });
await browser.close();
console.log("out/letter-of-instruction.pdf");
