import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Gem,
  HeartHandshake,
  Hotel,
  KeyRound,
  MapPin,
  MessageCircle,
  MoonStar,
  ShieldCheck,
  Sparkles,
  Trees,
  Users,
  Waves,
} from "lucide-react";
import { businessObjects, connectors, queuedActions, safetyModel } from "@/lib/toro-data";
import { getConnectorHealth } from "@/lib/server/connector-health";

export const metadata: Metadata = {
  title: "Dreamcatcher Hotel Santa Teresa | Boutique stays, villas and buyouts",
  description:
    "A premium conversion microsite concept for Dreamcatcher Hotel, Villa Toro, Makaiza and full-property buyouts in Santa Teresa.",
};

const dreamcatcher = businessObjects.find((item) => item.id === "dc");
const villaObjects = businessObjects.filter((item) => item.type === "Villa");
const krossConnector = connectors.find((connector) => connector.id === "kross");
const dropboxConnector = connectors.find((connector) => connector.id === "dropbox");

const audiencePaths = [
  {
    eyebrow: "Couples",
    title: "Barefoot romance",
    description: "A soft, design-led landing for two: beach days, pool rituals and an easy path to a qualified stay request.",
    icon: MoonStar,
    cta: "Plan a romantic stay",
  },
  {
    eyebrow: "Families + friends",
    title: "Private villa energy",
    description: "Route larger groups into Villa Toro or Makaiza language without promising live configuration until the team validates it.",
    icon: KeyRound,
    cta: "Explore villa options",
  },
  {
    eyebrow: "Retreats + events",
    title: "Full-property moments",
    description: "Position the hotel as a flexible canvas for retreats, weddings and buyouts, with every detail confirmed on request.",
    icon: Users,
    cta: "Request a buyout brief",
  },
];

const sensoryProof = [
  "Santa Teresa atmosphere: surf rhythm, jungle calm and hosted hospitality.",
  "Boutique hotel intimacy plus private-villa pathways for groups.",
  "Inquiry-first conversion so the team can validate dates, group size and intent before confirming details.",
];

const qualificationFields = ["Dates or month", "Guests", "Stay type", "Occasion", "Email / WhatsApp", "Anything that matters"];

const trustNotes = [
  "Kross is the authority for live rates, restrictions, payments, reservations and availability.",
  "Dropbox/Eagle remains the media authority; unapproved assets are placeholders, not final channel publishing.",
  "TORO OS can draft, recommend and queue tasks; external writes stay blocked unless explicit approval exists.",
];

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function primaryMailto(label = "Request your stay", className?: string) {
  const subject = encodeURIComponent("Dreamcatcher Hotel stay request");
  const body = encodeURIComponent(
    "Hi Dreamcatcher team,\n\nI would like to request a stay.\n\nPreferred dates/month:\nGuests:\nInterested in: Hotel stay / Villa Toro / Makaiza / Full property buyout\nOccasion:\nNotes:\n\nPlease confirm availability and next steps."
  );

  return (
    <a
      href={`mailto:reservations@dreamcatcherhotel.com?subject=${subject}&body=${body}`}
      className={classNames(
        "group inline-flex items-center justify-center gap-2 rounded-full bg-[#f7d7a6] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#17120c] shadow-[0_24px_80px_rgba(247,215,166,0.24)] transition hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#f7d7a6] focus:ring-offset-2 focus:ring-offset-[#120f0b]",
        className
      )}
    >
      {label} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
    </a>
  );
}

function StatCard({ value, label, note }: { value: string | number; label: string; note: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur">
      <p className="font-mono text-4xl tracking-[-0.08em] text-[#f7d7a6]">{value}</p>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-white/70">{label}</p>
      <p className="mt-2 text-sm leading-6 text-white/50">{note}</p>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f7d7a6]">{children}</p>;
}

export default async function DreamcatcherLanding() {
  const connectorHealth = await getConnectorHealth();
  const contentQueue = queuedActions.filter((action) => action.targetTool.includes("Kross") || action.module.includes("Content"));
  const blockedActions = safetyModel.slice(0, 4);

  return (
    <main className="min-h-screen overflow-hidden bg-[#120f0b] text-[#fff8ed]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_12%,rgba(247,215,166,0.22),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(44,116,102,0.26),transparent_30%),linear-gradient(180deg,rgba(18,15,11,0),rgba(18,15,11,0.94)_68%,#120f0b)]" />

      <section className="relative z-10 px-5 py-5 sm:px-8 lg:px-12">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-white/12 bg-[#120f0b]/62 px-4 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <a href="#top" className="flex items-center gap-3" aria-label="Dreamcatcher Hotel home">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f7d7a6]/35 bg-[#f7d7a6]/12">
              <Waves className="h-5 w-5 text-[#f7d7a6]" />
            </span>
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.22em] text-white">Dreamcatcher</span>
              <span className="block text-[11px] text-white/48">Santa Teresa · Hotel + villas</span>
            </span>
          </a>
          <div className="hidden items-center gap-5 text-xs font-bold uppercase tracking-[0.16em] text-white/60 lg:flex">
            <a href="#stays" className="transition hover:text-white">Stays</a>
            <a href="#villas" className="transition hover:text-white">Villas</a>
            <a href="#inquiry" className="transition hover:text-white">Inquiry</a>
            <a href="#trust" className="transition hover:text-white">Trust</a>
            <a href="/os" className="transition hover:text-white">TORO OS</a>
          </div>
          <a href="#inquiry" className="rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#17120c] transition hover:bg-[#f7d7a6]">Start request</a>
        </nav>
      </section>

      <section id="top" className="relative z-10 px-5 pb-20 pt-10 sm:px-8 lg:px-12 lg:pb-28 lg:pt-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f7d7a6]/25 bg-[#f7d7a6]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#f7d7a6]">
              <Sparkles className="h-4 w-4" /> Boutique hotel · private villas · buyouts
            </div>
            <h1 className="max-w-5xl text-6xl font-black leading-[0.88] tracking-[-0.075em] text-white sm:text-7xl md:text-8xl xl:text-9xl">
              Wild luxury, held softly.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70 md:text-xl md:leading-9">
              Dreamcatcher Hotel is positioned as the first TORO OS hospitality workspace in central Santa Teresa, pairing boutique-hotel intimacy with flexible villa and buyout pathways for high-intent guests.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryMailto("Request availability")}
              <a href="#stays" className="inline-flex items-center justify-center rounded-full border border-white/16 bg-white/[0.06] px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:border-white/34 hover:bg-white/12">
                Choose your path
              </a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <StatCard value="95%" label="Source confidence" note={dreamcatcher?.source ?? "02 Properties"} />
              <StatCard value={connectorHealth.summary.configured} label="Configured surfaces" note="Read/prepare connector posture" />
              <StatCard value="0" label="External writes" note="No Kross, social or payment mutation" />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 rounded-full bg-[#2c7466]/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.4rem] border border-white/14 bg-white/[0.08] p-3 shadow-[0_40px_140px_rgba(0,0,0,0.44)] backdrop-blur-xl">
              <div className="min-h-[620px] rounded-[1.8rem] bg-[radial-gradient(circle_at_28%_18%,rgba(247,215,166,0.78),transparent_18%),radial-gradient(circle_at_72%_28%,rgba(255,255,255,0.22),transparent_16%),linear-gradient(145deg,rgba(24,64,57,0.92),rgba(18,15,11,0.84)),url('/globe.svg')] bg-[length:auto,auto,auto,620px] bg-center p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-3xl border border-white/15 bg-[#120f0b]/32 p-4 backdrop-blur">
                    <SectionEyebrow>Conversion concept</SectionEyebrow>
                    <p className="mt-3 max-w-xs text-3xl font-black leading-none tracking-[-0.05em] text-white">Make guests feel the stay before they ask for dates.</p>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#f7d7a6] text-[#17120c]"><Gem className="h-7 w-7" /></div>
                </div>
                <div className="mt-48 grid gap-3">
                  {sensoryProof.map((item, index) => (
                    <div key={item} className="flex gap-3 rounded-3xl border border-white/12 bg-[#120f0b]/46 p-4 text-sm font-semibold leading-6 text-white/82 backdrop-blur">
                      <span className="font-mono text-[#f7d7a6]">0{index + 1}</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stays" className="relative z-10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.74fr_1.26fr] lg:items-end">
            <div>
              <SectionEyebrow>Stay strategy</SectionEyebrow>
              <h2 className="mt-4 text-5xl font-black leading-none tracking-[-0.065em] text-white md:text-7xl">Three routes to one qualified lead.</h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-white/62 lg:justify-self-end">
              The page is not a room list. It is a decision system: guests self-select their intent, then Dreamcatcher validates the operational reality through Kross and the team before confirming availability, configuration or pricing.
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {audiencePaths.map((path) => {
              const Icon = path.icon;
              return (
                <article key={path.title} className="group rounded-[2rem] border border-white/12 bg-white/[0.065] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#f7d7a6]/28 hover:bg-white/[0.095]">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f7d7a6]">{path.eyebrow}</p>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/22"><Icon className="h-5 w-5 text-[#f7d7a6]" /></span>
                  </div>
                  <h3 className="mt-16 text-3xl font-black tracking-[-0.055em] text-white">{path.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/56">{path.description}</p>
                  <a href="#inquiry" className="mt-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#f7d7a6]">
                    {path.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="villas" className="relative z-10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2.4rem] bg-[#f7d7a6] p-8 text-[#17120c] md:p-10">
            <Hotel className="h-10 w-10" />
            <h2 className="mt-10 text-5xl font-black leading-none tracking-[-0.065em] md:text-6xl">Hotel warmth. Villa-scale possibility.</h2>
            <p className="mt-6 max-w-xl text-sm font-semibold leading-7 opacity-72">
              TORO OS separates confirmed property facts from claims that require validation. That makes the sales story sharper and safer: sell the feeling, qualify the logistics.
            </p>
            <div className="mt-8 grid gap-3">
              {trustNotes.map((note) => (
                <div key={note} className="flex gap-3 rounded-3xl bg-[#17120c]/8 p-4 text-sm font-bold leading-6">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  {note}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {villaObjects.map((villa) => (
              <article key={villa.id} className="rounded-[2rem] border border-white/12 bg-white/[0.065] p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f7d7a6]">{villa.status} · {villa.confidence}% confidence</p>
                    <h3 className="mt-3 text-3xl font-black tracking-[-0.055em] text-white">{villa.name}</h3>
                  </div>
                  <Compass className="h-6 w-6 text-[#f7d7a6]" />
                </div>
                <p className="mt-5 text-sm leading-7 text-white/58">{villa.details}</p>
                <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/42">Safe next step</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{villa.nextAction}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="inquiry" className="relative z-10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.6rem] border border-white/12 bg-white/[0.075] shadow-[0_40px_140px_rgba(0,0,0,0.34)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-[linear-gradient(150deg,rgba(247,215,166,0.94),rgba(255,255,255,0.86))] p-8 text-[#17120c] md:p-12">
            <HeartHandshake className="h-11 w-11" />
            <h2 className="mt-10 text-5xl font-black leading-none tracking-[-0.065em] md:text-7xl">Tell us the shape of your stay.</h2>
            <p className="mt-6 max-w-xl text-base font-semibold leading-8 opacity-72">
              This form is intentionally a qualified-request brief. It gathers the signal Dreamcatcher needs before the team validates dates, inventory and the best path to book.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryMailto("Open email brief", "bg-[#17120c] text-white hover:bg-[#2c7466]")}
              <a href="https://wa.me/?text=Hi%20Dreamcatcher%20team%2C%20I%20would%20like%20to%20request%20a%20stay%20in%20Santa%20Teresa.%20Please%20confirm%20availability%20and%20next%20steps." className="inline-flex items-center justify-center gap-2 rounded-full border border-[#17120c]/18 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#17120c] transition hover:bg-[#17120c]/8">
                Draft WhatsApp <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="p-8 md:p-12">
            <SectionEyebrow>Lead qualification</SectionEyebrow>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {qualificationFields.map((field, index) => (
                <div key={field} className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="font-mono text-sm text-[#f7d7a6]">0{index + 1}</p>
                  <p className="mt-5 text-xl font-black tracking-[-0.04em] text-white">{field}</p>
                  <p className="mt-2 text-xs leading-5 text-white/44">Captured in the email/WhatsApp draft; not written to external systems automatically.</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-3xl border border-[#f7d7a6]/18 bg-[#f7d7a6]/10 p-5 text-sm leading-7 text-white/62">
              <strong className="text-[#f7d7a6]">Conversion guardrail:</strong> CTAs prepare a guest request only. They do not create reservations, change availability, send automated WhatsApp messages or mutate Kross.
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="relative z-10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <SectionEyebrow>Source authority</SectionEyebrow>
              <h2 className="mt-4 text-5xl font-black leading-none tracking-[-0.065em] text-white md:text-7xl">Premium, but governed.</h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-white/62 lg:justify-self-end">
              The microsite is built from the TORO OS business brain and live connector posture. Where credentials are absent, it falls back to scaffolded, source-labeled data rather than inventing claims.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <StatCard value={connectorHealth.summary.live} label="Live-read connectors" note="Depends on configured credentials in runtime" />
            <StatCard value={contentQueue.length} label="Content queues" note="Kross/content work remains approval-gated" />
            <StatCard value={krossConnector?.risk ?? "Critical"} label="Kross risk" note={krossConnector?.nextAction ?? "Validate live commercial facts"} />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-white/12 bg-white/[0.065] p-6">
              <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-[#f7d7a6]" /><h3 className="text-2xl font-black tracking-[-0.04em] text-white">Blocked actions remain blocked</h3></div>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {blockedActions.map((action) => (
                  <div key={action} className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/58">{action}</div>
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/12 bg-white/[0.065] p-6">
              <div className="flex items-center gap-3"><Trees className="h-6 w-6 text-[#f7d7a6]" /><h3 className="text-2xl font-black tracking-[-0.04em] text-white">Asset posture</h3></div>
              <p className="mt-5 text-sm leading-7 text-white/58">{dropboxConnector?.currentCapability ?? "Media source paths and approval metadata should be resolved before final commercial photo publishing."}</p>
              <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-white/48">Final hero photography should be selected from Dropbox/Eagle approved sets when credentials are available.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 pb-24 pt-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl text-center">
          <MapPin className="mx-auto h-10 w-10 text-[#f7d7a6]" />
          <h2 className="mt-7 text-5xl font-black leading-none tracking-[-0.07em] text-white md:text-8xl">Make Santa Teresa feel inevitable.</h2>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/62">
            A live-ready temporary microsite for review: premium emotional storytelling, segmented stay paths, a qualified inquiry engine and strict source-authority guardrails.
          </p>
          <div className="mt-9 flex justify-center">{primaryMailto("Start your Dreamcatcher request")}</div>
          <p className="mt-6 text-xs leading-6 text-white/38">
            Subject to confirmation. Pricing, dates, inventory, restrictions, payments and reservations are validated by Dreamcatcher/Kross before any booking is confirmed.
          </p>
        </div>
      </section>
    </main>
  );
}
