import type { ReactNode } from "react";
import {
  Email, Page, Document, Row, Column, ColumnLayouts,
  Heading, Paragraph, Button, Table, Divider, PageBreak,
} from "@unlayer/react-elements";
import { WillData, fmtDate } from "./data";

export type Mode = "checkin" | "heir" | "web" | "document";

const C = {
  navy: "#14213D",
  seal: "#B3261E",
  mist: "#E8EDF4",
  paper: "#FFFFFF",
  slate: "#2B3445",
  brass: "#A8793A",
};
const serif = { label: "Georgia", value: "Georgia, 'Times New Roman', serif" };
const mono = { label: "Courier New", value: "'Courier New', Courier, monospace" };

type Tone = "navy" | "paper" | "mist" | "seal";
const tone: Record<Tone, { bg: string; fg: string }> = {
  navy: { bg: C.navy, fg: "#F4F1EA" },
  paper: { bg: C.paper, fg: C.slate },
  mist: { bg: C.mist, fg: C.slate },
  seal: { bg: C.seal, fg: "#FFFFFF" },
};

function Block({ t, mode, children }: { t: Tone; mode: Mode; children: ReactNode }) {
  const v = mode === "document" ? 30 : 40;
  const h = mode === "document" ? 56 : 28;
  return (
    <Row layout={ColumnLayouts.OneColumn} backgroundColor={tone[t].bg} padding={`${v}px 0px`}>
      <Column padding={`0px ${h}px`}>{children}</Column>
    </Row>
  );
}

const H = ({ t, size = 34, children }: { t: Tone; size?: number; children: ReactNode }) => (
  <Heading headingType="h2" fontSize={`${size}px`} lineHeight={1.2} fontWeight={700} fontFamily={serif} color={tone[t].fg}>
    {children}
  </Heading>
);
const P = ({ t, html, size = 17 }: { t: Tone; html: string; size?: number }) => (
  <Paragraph html={html} fontSize={`${size}px`} lineHeight={1.6} fontFamily={serif} color={tone[t].fg} />
);
const Rule = ({ color = C.seal }: { color?: string }) => <Divider borderTopColor={color} borderTopWidth="3px" />;

const tableStyle = {
  headerBackgroundColor: C.navy,
  headerColor: "#FFFFFF",
  headerFontFamily: serif,
  headerFontSize: "14px" as const,
  contentFontFamily: serif,
  contentFontSize: "14px" as const,
  contentColor: C.slate,
  contentPadding: "10px 12px" as const,
  headerPadding: "10px 12px" as const,
  stripedRows: true,
  stripedRowsBackgroundColor: C.mist,
};

// ---------- sections ----------
function Cover({ d, mode }: { d: WillData; mode: Mode }) {
  return (
    <Block t="navy" mode={mode}>
      <P t="navy" size={14} html="Letter of instruction for digital assets" />
      <Heading headingType="h1" fontSize="46px" lineHeight={1.1} fontWeight={700} fontFamily={serif} color={tone.navy.fg}>
        The Last Will of a Wallet
      </Heading>
      <Rule />
      <P t="navy" html={`Prepared by <b>${d.owner.name}</b> on ${fmtDate(d.preparedOn)}. For ${d.heirs.map((h) => h.name).join(", ")}.`} />
    </Block>
  );
}

function Note({ d, mode }: { d: WillData; mode: Mode }) {
  return (
    <Block t="paper" mode={mode}>
      <H t="paper" size={28}>A note first</H>
      <P t="paper" size={19} html={d.note} />
      <P t="paper" size={15} html={`${d.owner.name}`} />
    </Block>
  );
}

function Steps({ d, mode, count }: { d: WillData; mode: Mode; count?: number }) {
  const steps = d.steps.slice(0, count ?? d.steps.length);
  return (
    <Block t="mist" mode={mode}>
      <H t="mist" size={30}>What to do, in this order</H>
      {steps.map((s, i) => (
        <div key={s.title}>
          <Heading headingType="h3" fontSize="20px" fontWeight={700} fontFamily={serif} color={C.navy}>
            {`${i + 1}. ${s.title}`}
          </Heading>
          <P t="mist" size={16} html={s.body} />
        </div>
      ))}
    </Block>
  );
}

function Scam({ mode }: { mode: Mode }) {
  return (
    <Block t="seal" mode={mode}>
      <H t="seal" size={26}>Nobody legitimate will ever ask for the recovery phrase</H>
      <P t="seal" size={16} html="Not a support agent, not an exchange, not a lawyer, not a friend of the family. If someone asks, stop and call the executor." />
    </Block>
  );
}

function Register({ d, mode, withRecovery }: { d: WillData; mode: Mode; withRecovery: boolean }) {
  const headers = withRecovery ? ["Asset", "Chain", "Address", "Where the recovery material is kept"] : ["Asset", "Type", "Chain", "Address"];
  const data = d.assets.map((a) =>
    withRecovery ? [a.label, a.chain, a.address, a.recovery] : [a.label, a.kind, a.chain, a.address],
  );
  return (
    <Block t="paper" mode={mode}>
      <H t="paper" size={28}>What there is</H>
      <P t="paper" size={15} html={withRecovery ? "This list says <b>where</b> things are kept. It never contains the recovery material itself." : "Storage locations are only in the printed letter, never on this page."} />
      <Table headers={headers} data={data} {...tableStyle} />
    </Block>
  );
}

function Shares({ d, mode }: { d: WillData; mode: Mode }) {
  return (
    <Block t="paper" mode={mode}>
      <H t="paper" size={28}>Who it goes to</H>
      <Table
        headers={["Name", "Relationship", "Share", "Contact"]}
        data={d.heirs.map((h) => [h.name, h.relationship, `${h.sharePct}%`, h.email])}
        {...tableStyle}
      />
      <P t="paper" size={15} html={`Executor: <b>${d.executor.name}</b>, ${d.executor.role} (${d.executor.email}).`} />
    </Block>
  );
}

function Signatures({ d, mode }: { d: WillData; mode: Mode }) {
  return (
    <Block t="paper" mode={mode}>
      <H t="paper" size={28}>Signatures</H>
      <P t="paper" size={15} html="Sign in front of two witnesses. Rules for witnesses and notaries differ by place, so check yours." />
      <P t="paper" size={16} html={`Signed: ______________________________ &nbsp; Date: ______________<br/>${d.owner.name}`} />
      <P t="paper" size={16} html="Witness 1: ______________________________ &nbsp; Date: ______________" />
      <P t="paper" size={16} html="Witness 2: ______________________________ &nbsp; Date: ______________" />
      <Rule color={C.navy} />
      <Paragraph fontFamily={serif} fontSize="12px" lineHeight={1.5} color="#555555">
        This is a letter of instruction, not a legal will or financial advice. It does not transfer ownership by itself. Ask an estate lawyer how your local law treats digital assets. Never write a recovery phrase, private key or password in this document.
      </Paragraph>
    </Block>
  );
}

function CheckinBody({ d, mode }: { d: WillData; mode: Mode }) {
  const due = fmtDate(d.lastCheckIn, d.checkinDays);
  const send = fmtDate(d.lastCheckIn, d.checkinDays + d.graceDays);
  return (
    <>
      <Block t="navy" mode={mode}>
        <H t="navy" size={38}>{`${d.owner.name.split(" ")[0]}, are you still there?`}</H>
        <P t="navy" html={`This is your ${d.checkinDays} day check-in. One tap resets the timer.`} />
      </Block>
      <Block t="paper" mode={mode}>
        <Button href={d.checkinUrl} backgroundColor={C.seal} color="#FFFFFF" fontFamily={serif} fontSize="18px" fontWeight={700} padding="16px 30px" borderRadius="4px">
          {"I'm okay, reset my timer"}
        </Button>
        <P t="paper" size={15} html={`Your check-in is due <b>${due}</b>. If nothing happens, we wait ${d.graceDays} more days, then on <b>${send}</b> we send your letter to ${d.heirs.length} people: ${d.heirs.map((h) => h.name).join(", ")}.`} />
        <P t="paper" size={13} html="Not you, or want to change who gets the letter? Update your list before the due date." />
      </Block>
    </>
  );
}

function HeirBody({ d, mode, recipient }: { d: WillData; mode: Mode; recipient: string }) {
  return (
    <>
      <Block t="navy" mode={mode}>
        <H t="navy" size={36}>{`A letter from ${d.owner.name}`}</H>
        <P t="navy" html={`Dear ${recipient}, ${d.owner.name.split(" ")[0]} asked us to send you this if they stopped checking in. We are so sorry. You do not need to do anything today.`} />
      </Block>
      <Steps d={d} mode={mode} count={3} />
      <Block t="paper" mode={mode}>
        <Button href={d.letterUrl} backgroundColor={C.navy} color="#FFFFFF" fontFamily={serif} fontSize="17px" fontWeight={700} padding="15px 28px" borderRadius="4px">
          Read the full letter
        </Button>
      </Block>
      <Scam mode={mode} />
    </>
  );
}

export function Will({ d, mode, recipient }: { d: WillData; mode: Mode; recipient?: string }) {
  const common = { backgroundColor: C.mist, contentWidth: "680px" as const, fontFamily: serif, textColor: C.slate };
  if (mode === "checkin")
    return (
      <Email {...common} previewText={`Tap once to reset your ${d.checkinDays} day timer.`}>
        <CheckinBody d={d} mode={mode} />
      </Email>
    );
  if (mode === "heir")
    return (
      <Email {...common} previewText={`A letter from ${d.owner.name}. Nothing needs to be done today.`}>
        <HeirBody d={d} mode={mode} recipient={recipient ?? d.heirs[0].name.split(" ")[0]} />
      </Email>
    );
  if (mode === "web")
    return (
      <Page {...common}>
        <Cover d={d} mode={mode} />
        <Block t="paper" mode={mode}>
          <H t="paper" size={32}>Take a breath.</H>
          <P t="paper" size={19} html="There is no deadline on this page. Read it slowly, and do the steps with the executor beside you." />
        </Block>
        <Note d={d} mode={mode} />
        <Steps d={d} mode={mode} />
        <Scam mode={mode} />
        <Register d={d} mode={mode} withRecovery={false} />
        <Shares d={d} mode={mode} />
      </Page>
    );
  return (
    <Document {...common} backgroundColor="#FFFFFF" documentSize="Letter" documentOrientation="portrait">
      <Cover d={d} mode={mode} />
      <Note d={d} mode={mode} />
      <Row layout={ColumnLayouts.OneColumn} padding="0px"><Column><PageBreak /></Column></Row>
      <Steps d={d} mode={mode} />
      <Scam mode={mode} />
      <Row layout={ColumnLayouts.OneColumn} padding="0px"><Column><PageBreak /></Column></Row>
      <Register d={d} mode={mode} withRecovery />
      <Shares d={d} mode={mode} />
      <Row layout={ColumnLayouts.OneColumn} padding="0px"><Column><PageBreak /></Column></Row>
      <Signatures d={d} mode={mode} />
    </Document>
  );
}
