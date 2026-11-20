import { defineTheme } from "@hyper-elements/react";

// The notary look, defined once. Every Email, Page and Document takes this theme.
export const FONT = { serif: "'Source Serif 4', Georgia, 'Times New Roman', serif" };

export const theme = defineTheme({
  colors: {
    background: "#FFFFFF",
    foreground: "#2B3445",
    primary: "#14213D", // navy
    primaryForeground: "#F4F1EA",
    seal: "#B3261E", // wax-seal red
    mist: "#E8EDF4",
    muted: "#5B6676",
    border: "#C9D1DE",
  },
  fonts: { body: FONT.serif },
  fontSizes: { body: 17 },
  lineHeights: { body: 1.6 },
  elements: {
    Heading: {
      fontWeight: 700,
      color: "{colors.primary}",
      by: { level: { 1: { fontSize: 46, lineHeight: 1.1 }, 2: { fontSize: 28, lineHeight: 1.2 }, 3: { fontSize: 20, lineHeight: 1.3 } } },
    },
    Button: { backgroundColor: "{colors.seal}", color: "#FFFFFF", borderRadius: 4, fontFamily: FONT.serif, fontWeight: 700, fontSize: 18, padding: "16px 30px" },
  },
  styles: {
    kicker: { fontSize: 14, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: "{colors.muted}" },
    small: { fontSize: 14, lineHeight: 1.5, color: "{colors.muted}" },
  },
});

export type FontFaceDef = { family: string; src: string; format: "woff"; weight: number; style?: "normal" | "italic" };
export const fontFiles = [
  { family: "Source Serif 4", file: "source-serif-4-latin-400-normal.woff", weight: 400, style: "normal" as const },
  { family: "Source Serif 4", file: "source-serif-4-latin-700-normal.woff", weight: 700, style: "normal" as const },
];
/** Font faces for a design. `origin` is where the fonts folder is served ("." for files opened from disk). */
export const fontFaces = (origin: string): FontFaceDef[] =>
  fontFiles.map((f) => ({ family: f.family, src: `${origin}/fonts/${f.file}`, format: "woff" as const, weight: f.weight, style: f.style }));
