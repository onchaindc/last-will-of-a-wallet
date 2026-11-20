import type { ReactNode } from "react";
import {
  Button, Column, Divider, Document, Email, Heading, Page, Section, Span, Table, TableCell, TableRow, Text, token,
} from "@hyper-elements/react";
import { WillData, fmtDate } from "./data";
import { fontFaces, theme } from "./theme";

type Tone = "primary" | "paper" | "mist" | "seal";
const C = {
  navy: token("colors.primary"),
  seal: token("colors.seal"),
  mist: token("colors.mist"),
  paper: token("colors.background"),
  light: token("colors.primaryForeground"),
  ink: token("colors.foreground"),
  muted: token("colors.muted"),
  border: token("colors.border"),
};
const toneBg: Record<Tone, ReturnType<typeof token>> = { primary: C.navy, paper: C.paper, mist: C.mist, seal: C.seal };
const toneFg: Record<Tone, ReturnType<typeof token>> = { primary: C.light, paper: C.ink, mist: C.ink, seal: token("colors.background") };
const hairline = { width: 1, style: "solid" as const, color: C.border };

// A band of the story: a Section in an email or page.
const Band = ({ tone, children }: { tone: Tone; children: ReactNode }) => (
  <Section style={{ backgroundColor: toneBg[tone], padding: [44, 28], gap: 12 }}>{children}</Section>
);
const H = ({ tone, level = 2, size, children }: { tone: Tone; level?: 1 | 2 | 3; size?: number; children: ReactNode }) => (
  <Heading level={level} style={{ color: toneFg[tone], ...(size ? { fontSize: size } : {}) }}>{children}</Heading>
);
const P = ({ tone, size, children }: { tone: Tone; size?: number; children: ReactNode }) => (
  <Text style={{ color: toneFg[tone], ...(size ? { fontSize: size } : {}) }}>{children}</Text>
);
const B = ({ children }: { children: ReactNode }) => <Span style={{ fontWeight: 700 }}>{children}</Span>;

// A table with navy headers and striped rows.
function Grid({ headers, rows, widths, tight }: { headers: string[]; rows: string[][]; widths?: (number | undefined)[]; tight?: boolean }) {
  return (
    <Table style={{ width: "100%", borderCollapse: "collapse", cellPadding: tight ? [9, 7] : [10, 12] }}>
      <TableRow header>
        {headers.map((h, i) => (
          <TableCell key={h} style={{ backgroundColor: C.navy, color: C.light, fontWeight: 700, fontSize: 14, ...(widths?.[i] ? { width: widths[i] } : {}) }}>{h}</TableCell>
        ))}
      </TableRow>
      {rows.map((r, n) => (
        <TableRow key={n} style={n % 2 === 1 ? { backgroundColor: C.mist } : undefined}>
          {r.map((c, i) => (
            <TableCell key={i} style={{ fontSize: tight ? 13 : 14, verticalAlign: "top" }}>{c}</TableCell>
          ))}
        </TableRow>
      ))}
    </Table>
  );
}

// ---------- shared content ----------
const Rule = ({ color = C.seal }: { color?: ReturnType<typeof token> }) => <Divider style={{ borderTop: { width: 3, style: "solid", color }, padding: [6, 0] }} />;

function CoverContent({ d }: { d: WillData }) {
  return (
    <>
      <Text style={{ apply: ["kicker"], color: C.light }}>Letter of instruction for digital assets</Text>
      <Heading level={1} style={{ color: C.light }}>The Last Will of a Wallet</Heading>
      <Rule />
      <P tone="primary">Prepared by <B>{d.owner.name}</B> on {fmtDate(d.preparedOn)}. For {d.heirs.map((h) => h.name).join(", ")}.</P>
    </>
  );
}

function NoteContent({ d, tone }: { d: WillData; tone: Tone }) {
  return (
    <>
      <H tone={tone}>A note first</H>
      <P tone={tone} size={20}>{d.note}</P>
      <P tone={tone} size={15}>{d.owner.name}</P>
    </>
  );
}

function StepsContent({ d, tone, count }: { d: WillData; tone: Tone; count?: number }) {
  return (
    <>
      <H tone={tone}>What to do, in this order</H>
      {d.steps.slice(0, count ?? d.steps.length).map((s, i) => (
        <Column key={s.title} style={{ gap: 2 }}>
          <Heading level={3}>{`${i + 1}. ${s.title}`}</Heading>
          <P tone={tone} size={16}>{s.body}</P>
        </Column>
      ))}
    </>
  );
}

const ScamContent = () => (
  <>
    <H tone="seal" size={24}>Nobody legitimate will ever ask for the recovery phrase</H>
    <P tone="seal" size={16}>Not a support agent, not an exchange, not a lawyer, not a friend of the family. If someone asks, stop and call the executor.</P>
  </>
);

function RegisterContent({ d, withRecovery }: { d: WillData; withRecovery: boolean }) {
  return (
    <>
      <H tone="paper">What there is</H>
      <P tone="paper" size={15}>
        {withRecovery ? "This list says where things are kept. It never contains the recovery material itself." : "Storage locations appear only in the printed letter, never on this page."}
      </P>
      <Grid
        tight={!withRecovery}
        headers={withRecovery ? ["Asset", "Chain", "Address", "Where the recovery material is kept"] : ["Asset", "Chain", "Address"]}
        rows={d.assets.map((a) => (withRecovery ? [a.label, a.chain, a.address, a.recovery] : [a.label, a.chain, a.address]))}
      />
    </>
  );
}

function SharesContent({ d, slim }: { d: WillData; slim?: boolean }) {
  return (
    <>
      <H tone="paper">Who it goes to</H>
      {slim ? (
        <Grid tight headers={["Name", "Role", "Share"]} rows={d.heirs.map((h) => [h.name, h.relationship, `${h.sharePct}%`])} />
      ) : (
        <Grid headers={["Name", "Relationship", "Share", "Contact"]} rows={d.heirs.map((h) => [h.name, h.relationship, `${h.sharePct}%`, h.email])} />
      )}
      <P tone="paper" size={15}>Executor: <B>{d.executor.name}</B>, {d.executor.role} ({d.executor.email}).</P>
    </>
  );
}

function SignaturesContent({ d }: { d: WillData }) {
  return (
    <>
      <H tone="paper">Signatures</H>
      <P tone="paper" size={15}>Sign in front of two witnesses. Rules for witnesses and notaries differ by place, so check yours.</P>
      <P tone="paper">Signed: ______________________________   Date: ______________</P>
      <P tone="paper" size={15}>{d.owner.name}</P>
      <P tone="paper">Witness 1: ______________________________   Date: ______________</P>
      <P tone="paper">Witness 2: ______________________________   Date: ______________</P>
      <Rule color={C.navy} />
      <Text style={{ apply: ["small"], fontSize: 12 }}>
        This is a letter of instruction, not a legal will or financial advice. It does not transfer ownership by itself. Ask an estate lawyer how your local law treats digital assets. Never write a recovery phrase, private key or password in this document.
      </Text>
    </>
  );
}

// ============================================================ 1. Letter of instruction (PDF)
export function LetterDocument({ d, origin }: { d: WillData; origin: string }) {
  return (
    <Document theme={theme} size="Letter" margin={{ top: 64, right: 64, bottom: 64, left: 64 }} title={`Letter of instruction: ${d.owner.name}`} lang="en" fonts={fontFaces(origin)} style={{ fontSize: 16 }}>
      <Document.Page style={{ backgroundColor: C.navy }}>
        <Column style={{ padding: [220, 0, 0, 0], gap: 16 }}>
          <CoverContent d={d} />
        </Column>
      </Document.Page>
      <Document.Page>
        <Column style={{ gap: 14 }}>
          <NoteContent d={d} tone="paper" />
          <Rule color={C.border} />
          <StepsContent d={d} tone="paper" />
        </Column>
      </Document.Page>
      <Document.Page>
        <Column style={{ gap: 14 }}>
          <Column style={{ backgroundColor: C.seal, padding: [20, 24], gap: 8 }}>
            <ScamContent />
          </Column>
          <RegisterContent d={d} withRecovery />
          <SharesContent d={d} />
        </Column>
      </Document.Page>
      <Document.Page>
        <Column style={{ gap: 14 }}>
          <SignaturesContent d={d} />
        </Column>
      </Document.Page>
    </Document>
  );
}

// ============================================================ 2. Heir walkthrough (page)
export function WalkthroughPage({ d, origin }: { d: WillData; origin: string }) {
  return (
    <Page theme={theme} width={680} title={`A letter from ${d.owner.name}`} description="A calm, step by step guide for the people who inherit this wallet." lang="en" fonts={fontFaces(origin)} style={{ gap: 0 }}>
      <Band tone="primary"><CoverContent d={d} /></Band>
      <Band tone="paper">
        <H tone="paper" size={32}>Take a breath.</H>
        <P tone="paper" size={19}>There is no deadline on this page. Read it slowly, and do the steps with the executor beside you.</P>
      </Band>
      <Band tone="paper"><NoteContent d={d} tone="paper" /></Band>
      <Band tone="mist"><StepsContent d={d} tone="mist" /></Band>
      <Band tone="seal"><ScamContent /></Band>
      <Band tone="paper"><RegisterContent d={d} withRecovery={false} /></Band>
      <Band tone="paper"><SharesContent d={d} slim /></Band>
    </Page>
  );
}

// ============================================================ 3. Check-in email
export function CheckinEmail({ d }: { d: WillData }) {
  const due = fmtDate(d.lastCheckIn, d.checkinDays);
  const send = fmtDate(d.lastCheckIn, d.checkinDays + d.graceDays);
  return (
    <Email theme={theme} width={600} title="Check-in" previewText={`Tap once to reset your ${d.checkinDays} day timer.`} lang="en" style={{ gap: 0 }}>
      <Band tone="primary">
        <H tone="primary" size={34}>{d.owner.name.split(" ")[0]}, are you still there?</H>
        <P tone="primary">This is your {d.checkinDays} day check-in. One tap resets the timer.</P>
      </Band>
      <Band tone="paper">
        <Button href={d.checkinUrl}>I'm okay, reset my timer</Button>
        <P tone="paper" size={15}>
          Your check-in is due <B>{due}</B>. If nothing happens, we wait {d.graceDays} more days, then on <B>{send}</B> we send your letter to {d.heirs.length} people: {d.heirs.map((h) => h.name).join(", ")}.
        </P>
        <Text style={{ apply: ["small"] }}>Not you, or want to change who gets the letter? Update your list before the due date.</Text>
      </Band>
    </Email>
  );
}

// ============================================================ 4. Heir notice email
export function HeirEmail({ d, recipient }: { d: WillData; recipient?: string }) {
  const name = recipient ?? d.heirs[0].name.split(" ")[0];
  return (
    <Email theme={theme} width={600} title={`A letter from ${d.owner.name}`} previewText={`A letter from ${d.owner.name}. Nothing needs to be done today.`} lang="en" style={{ gap: 0 }}>
      <Band tone="primary">
        <H tone="primary" size={34}>A letter from {d.owner.name}</H>
        <P tone="primary">Dear {name}, {d.owner.name.split(" ")[0]} asked us to send you this if they stopped checking in. We are so sorry. You do not need to do anything today.</P>
      </Band>
      <Band tone="mist"><StepsContent d={d} tone="mist" count={3} /></Band>
      <Band tone="paper">
        <Button href={d.letterUrl} style={{ backgroundColor: C.navy }}>Read the full letter</Button>
      </Band>
      <Band tone="seal"><ScamContent /></Band>
    </Email>
  );
}

