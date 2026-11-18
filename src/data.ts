// One data object drives every output. All values are SAMPLE data for a fictional person.
// This file must NEVER contain a recovery phrase, private key or password.
// Describe WHERE material is kept, never WHAT it is. validateWill() enforces this.
export type Heir = { name: string; relationship: string; sharePct: number; email: string };
export type Asset = { label: string; kind: string; chain: string; address: string; recovery: string };
export type Step = { title: string; body: string };

export type WillData = {
  owner: { name: string; email: string };
  executor: { name: string; role: string; email: string };
  heirs: Heir[];
  assets: Asset[];
  steps: Step[];
  note: string;
  preparedOn: string; // YYYY-MM-DD
  lastCheckIn: string; // YYYY-MM-DD
  checkinDays: number;
  graceDays: number;
  checkinUrl: string;
  letterUrl: string;
};

export const sample: WillData = {
  owner: { name: "Jordan Rivera", email: "jordan@example.com" },
  executor: { name: "Maria Chen", role: "Executor and technical helper", email: "maria@example.com" },
  heirs: [
    { name: "Alex Rivera", relationship: "Sister", sharePct: 50, email: "alex@example.com" },
    { name: "Sam Rivera", relationship: "Brother", sharePct: 30, email: "sam@example.com" },
    { name: "Riverside Food Bank", relationship: "Charity", sharePct: 20, email: "give@example.org" },
  ],
  assets: [
    {
      label: "Main savings wallet",
      kind: "Hardware wallet",
      chain: "Ethereum and Base",
      address: "0x71C7...9A3f",
      recovery: "Sealed envelope, safe deposit box 114, Lakeside Credit Union",
    },
    {
      label: "Everyday wallet",
      kind: "Mobile wallet",
      chain: "Solana",
      address: "7Hk2...Qm9e",
      recovery: "Metal backup plate, fireproof box, hall closet at home",
    },
    {
      label: "Exchange account",
      kind: "Exchange",
      chain: "Custodial",
      address: "Login email: jordan@example.com",
      recovery: "Backup codes in the password manager emergency kit held by Maria",
    },
  ],
  steps: [
    { title: "Do nothing in a hurry", body: "Nothing here expires this week. Read this whole letter before you move anything." },
    { title: "Call the executor", body: "Maria Chen knows how all of this works. Do the next steps with her, not alone." },
    { title: "Find the recovery material", body: "It is kept where the asset register says. Never photograph it, type it into a website or send it in a message." },
    { title: "Make a new wallet first", body: "Create a fresh wallet that only you control. Send one small test transaction before moving the rest." },
    { title: "Move the assets, then split them", body: "Follow the shares in this letter. Write down every transaction hash for the estate lawyer." },
    { title: "Show this letter to an estate lawyer", body: "This letter guides you. It does not replace a legal will, and your local rules decide who is entitled to what." },
  ],
  note: "If you are reading this, I am sorry I could not explain it in person. I kept everything simple on purpose. Take your time, lean on Maria, and look after each other. The money matters far less than you do.",
  preparedOn: "2026-11-17",
  lastCheckIn: "2026-11-10",
  checkinDays: 30,
  graceDays: 14,
  checkinUrl: "https://github.com/onchaindc/last-will-of-a-wallet",
  letterUrl: "https://github.com/onchaindc/last-will-of-a-wallet",
};

// ---------- safety: refuse anything that looks like a secret ----------
const SEED_LIKE = /(?:\b[a-z]{3,8}\b\s+){11}\b[a-z]{3,8}\b/; // 12+ plain lowercase words in a row
const HEX_KEY = /\b(?:0x)?[0-9a-fA-F]{64}\b/; // 32 byte hex private key
const WIF_KEY = /\b[5KL][1-9A-HJ-NP-Za-km-z]{50,51}\b/; // Bitcoin WIF private key

function* strings(value: unknown, path = "data"): Generator<[string, string]> {
  if (typeof value === "string") yield [path, value];
  else if (Array.isArray(value)) for (let i = 0; i < value.length; i++) yield* strings(value[i], `${path}[${i}]`);
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) yield* strings(v, `${path}.${k}`);
}

/** Heuristic guard. It catches the common shapes of secrets, it cannot prove a file is clean. */
export function validateWill(d: WillData): void {
  for (const [path, s] of strings(d)) {
    if (SEED_LIKE.test(s) || HEX_KEY.test(s) || WIF_KEY.test(s))
      throw new Error(`Refusing to build: ${path} looks like a recovery phrase or private key. Describe where it is kept, never what it is.`);
  }
  if (d.heirs.length === 0) throw new Error("Add at least one heir.");
  const total = d.heirs.reduce((a, h) => a + h.sharePct, 0);
  if (total !== 100) throw new Error(`Heir shares add up to ${total}%, they must add up to 100%.`);
}

export function fmtDate(iso: string, addDays = 0): string {
  const dt = new Date(`${iso}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + addDays);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
