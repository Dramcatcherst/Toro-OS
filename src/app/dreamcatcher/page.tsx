import { ArrowRight, CalendarCheck, CheckCircle2, HeartHandshake, MapPin, MessageCircle, ShieldCheck, Sparkles, Star, Users, Waves } from "lucide-react";
import { businessObjects, connectors, queuedActions } from "@/lib/toro-data";
import { getConnectorHealth } from "@/lib/server/connector-health";

const property = businessObjects.find((item) => item.id === "dc");
const villas = businessObjects.filter((item) => item.type === "Villa");

const conversionMoments = [
  "Boutique hotel energy with private-villa flexibility for couples, families and groups.",
  "Santa Teresa positioning built around barefoot luxury, surf days, privacy and hosted experiences.",
  "Inquiry-first funnel: qualify dates, group size and intent before promising price or availability.",
];

const stayTypes = [
  { title: "Romantic stays", detail: "Design-forward rooms, pool rituals and a soft landing after beach days.", metric: "2 guests" },
  { title: "Villa gatherings", detail: "Villa Toro and Makaiza packaged as high-intent group stays with validation gates.", metric: "8+ rooms" },
  { title: "Full buyouts", detail: "Flexible property-wide concepts for retreats, weddings and celebrations, confirmed by the team.", metric: "up to ~70" },
];

const proof = [
  "Source-backed content from TORO OS business objects and connector health.",
  "Kross remains the authority for live rates, availability and restrictions.",
  "Owner approval required before any external publishing, pricing or guest-facing send.",
];

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function CTA({ className }: { className?: string }) {
  return (
    <div className={cx("flex flex-col gap-3 sm:flex-row", className)}>
      <a href="mailto:reservations@dreamcatcherhotel.com?subject=Dreamcatcher%20Hotel%20stay%20request" className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#f6d29d] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-[#17120c] shadow-[0_20px_70px_rgba(246,210,157,0.25)] transition hover:-translate-y-0.5 hover:bg-white">
        Request your stay <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </a>
      <a href="#experiences" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/8 px-6 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition hover:border-white/40 hover:bg-white/14">
        Explore the concept
      </a>
    </div>
  );
}

export default async function DreamcatcherLanding() {
  const health = await getConnectorHealth();
  const kross = connectors.find((connector) => connector.id === "kross");
  const contentQueue = queuedActions.filter((action) => action.targetTool.includes("Kross") || action.module.includes("Content"));

  return (
    <main className="min-h-screen overflow-hidden bg-[#120f0b] text-[#fff8ed]">
      <section className="relative isolate min-h-screen px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(246,210,157,0.26),transparent_28%),radial-gradient(circle_at_78%_20%,rgba(46,125,112,0.32),transparent_30%),linear-gradient(135deg,rgba(18,15,11,0.72),rgba(18,15,11,0.98)),url('/globe.svg')] bg-[length:auto,auto,auto,520px] bg-center opacity-100" />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full border border-white/12 bg-white/8 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f6d29d]/40 bg-[#f6d29d]/15"><Waves className="h-5 w-5 text-[#f6d29d]" /></div>
            <div><p className="text-xs uppercase tracking-[0.28em] text-[#f6d29d]">Dreamcatcher Hotel</p><p className="text-[11px] text-white/55">Santa Teresa conversion concept</p></div>
          </div>
          <a href="mailto:reservations@dreamcatcherhotel.com" className="hidden rounded-full bg-white px-5 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#17120c] sm:inline-flex">Book direct</a>
        </div>
        <div className="mx-auto grid max-w-7xl gap-10 pb-14 pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:pt-28">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#f6d29d]/30 bg-[#f6d29d]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f6d29d]"><Sparkles className="h-4 w-4" /> Boutique hotel · villas · buyouts</div>
            <h1 className="max-w-5xl text-6xl font-black leading-[0.9] tracking-[-0.07em] text-white sm:text-7xl lg:text-8xl">Sleep inside the wild rhythm of Santa Teresa.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">{property?.details ?? "Dreamcatcher Hotel is positioned as the first high-confidence TORO OS workspace for hospitality conversion."} The page packages every stay as a clear path from desire to qualified inquiry, without overpromising live inventory.</p>
            <CTA className="mt-8" />
          </div>
          <div className="rounded-[2rem] border border-white/14 bg-white/10 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="rounded-[1.5rem] bg-[#f6d29d] p-5 text-[#17120c]">
              <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.22em] opacity-70">Live conversion brief</p><h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">Designed to win trust before the first click.</h2></div><Star className="h-10 w-10" /></div>
              <div className="mt-8 grid gap-3">{conversionMoments.map((item, index) => <div key={item} className="flex gap-3 rounded-2xl bg-[#17120c]/8 p-4 text-sm font-semibold leading-6"><span className="font-mono">0{index + 1}</span>{item}</div>)}</div>
            </div>
            <div className="grid gap-3 pt-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4"><MapPin className="mb-4 h-5 w-5 text-[#f6d29d]" /><p className="text-sm font-bold">Santa Teresa</p><p className="mt-1 text-xs text-white/50">Destination-led demand</p></div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4"><ShieldCheck className="mb-4 h-5 w-5 text-[#f6d29d]" /><p className="text-sm font-bold">Approval-safe</p><p className="mt-1 text-xs text-white/50">No risky writes</p></div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4"><CalendarCheck className="mb-4 h-5 w-5 text-[#f6d29d]" /><p className="text-sm font-bold">Kross-gated</p><p className="mt-1 text-xs text-white/50">Rates validated live</p></div>
            </div>
          </div>
        </div>
      </section>
      <section id="experiences" className="px-5 py-20 sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl"><div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><p className="text-sm font-black uppercase tracking-[0.26em] text-[#f6d29d]">Stay architecture</p><h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-0.05em] text-white md:text-6xl">One hotel, three high-converting paths.</h2></div><p className="max-w-xl text-sm leading-7 text-white/58">The database separates Dreamcatcher Hotel, Villa Toro, Makaiza and full-property buyouts, so the website can route guests into the right inquiry without creating false certainty.</p></div><div className="grid gap-4 lg:grid-cols-3">{stayTypes.map((stay) => <article key={stay.title} className="group rounded-[2rem] border border-white/12 bg-white/[0.06] p-6 transition hover:-translate-y-1 hover:bg-white/[0.09]"><p className="font-mono text-5xl text-[#f6d29d]">{stay.metric}</p><h3 className="mt-8 text-2xl font-black tracking-[-0.04em] text-white">{stay.title}</h3><p className="mt-3 text-sm leading-7 text-white/58">{stay.detail}</p><div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#f6d29d]">Qualify this stay <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div></article>)}</div></div></section>
      <section className="px-5 py-20 sm:px-8 lg:px-12"><div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr]"><div className="rounded-[2rem] bg-white p-8 text-[#17120c]"><HeartHandshake className="h-10 w-10" /><h2 className="mt-8 text-4xl font-black tracking-[-0.05em]">Conversion promise: faster yes, safer no.</h2><p className="mt-5 text-sm leading-7 opacity-70">Guests see a premium, emotionally specific offer. Operators keep every critical action routed through source authority, approval and connector status.</p><CTA className="mt-8 [&_a:first-child]:bg-[#17120c] [&_a:first-child]:text-white [&_a:last-child]:border-[#17120c]/20 [&_a:last-child]:text-[#17120c]" /></div><div className="grid gap-4 md:grid-cols-2">{villas.map((villa) => <div key={villa.id} className="rounded-[2rem] border border-white/12 bg-white/[0.06] p-6"><p className="text-xs font-black uppercase tracking-[0.22em] text-[#f6d29d]">{villa.type}</p><h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">{villa.name}</h3><p className="mt-3 text-sm leading-7 text-white/58">{villa.details}</p><div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/55">Next action: {villa.nextAction}</div></div>)}</div></div></section>
      <section className="px-5 py-20 sm:px-8 lg:px-12"><div className="mx-auto max-w-7xl rounded-[2.5rem] border border-[#f6d29d]/20 bg-[#f6d29d]/10 p-6 md:p-10"><div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="text-sm font-black uppercase tracking-[0.26em] text-[#f6d29d]">Data + connector analysis</p><h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-white md:text-5xl">Built from the operating brain, not generic hotel copy.</h2></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-3xl bg-black/25 p-5"><p className="font-mono text-4xl text-[#f6d29d]">{health.summary.configured}</p><p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/50">configured surfaces</p></div><div className="rounded-3xl bg-black/25 p-5"><p className="font-mono text-4xl text-[#f6d29d]">{contentQueue.length}</p><p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/50">content queues</p></div><div className="rounded-3xl bg-black/25 p-5"><p className="font-mono text-4xl text-[#f6d29d]">{kross?.risk}</p><p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/50">Kross risk gate</p></div></div></div><div className="mt-8 grid gap-3 md:grid-cols-3">{proof.map((item) => <div key={item} className="flex gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/68"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#f6d29d]" />{item}</div>)}</div></div></section>
      <section className="px-5 pb-24 pt-10 sm:px-8 lg:px-12"><div className="mx-auto max-w-4xl text-center"><Users className="mx-auto h-10 w-10 text-[#f6d29d]" /><h2 className="mt-6 text-5xl font-black leading-none tracking-[-0.06em] text-white md:text-7xl">Ready to turn the next visitor into a qualified guest?</h2><p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/62">This temporary live concept is designed for review: emotional above the fold, source-backed stay paths, and a direct inquiry CTA that keeps live pricing and availability safely validated by the Dreamcatcher team.</p><div className="mt-8 flex justify-center"><CTA /></div><div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs text-white/50"><MessageCircle className="h-4 w-4" /> Draft only: no WhatsApp, Kross, social or payment action was executed.</div></div></section>
    </main>
  );
}
