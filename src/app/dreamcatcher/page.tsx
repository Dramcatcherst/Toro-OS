import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  CalendarDays,
  Car,
  CheckCircle2,
  Compass,
  Gem,
  Flower2,
  HeartHandshake,
  Hotel,
  KeyRound,
  Laptop,
  MapPin,
  MessageCircle,
  MoonStar,
  PartyPopper,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  Trees,
  Users,
  Waves,
} from "lucide-react";
import { businessObjects, connectors, queuedActions, safetyModel } from "@/lib/toro-data";
import { DreamcatcherLeadComposer } from "@/components/dreamcatcher-lead-composer";
import { getConnectorHealth } from "@/lib/server/connector-health";

const siteUrl = "https://toro-os-v03.vercel.app";
const pageTitle = "Dreamcatcher Hotel Santa Teresa | Boutique hotel, villas and buyouts";
const pageDescription =
  "Dreamcatcher Hotel in Santa Teresa: boutique hotel stays, Villa Toro, Makaiza and full-property buyout inquiries with availability confirmed by the team.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "Dreamcatcher Hotel Santa Teresa",
    "Santa Teresa boutique hotel",
    "Santa Teresa villas",
    "Costa Rica surf hotel",
    "Santa Teresa yoga retreat",
    "Santa Teresa group retreat",
    "Villa Toro",
    "Makaiza",
    "Dreamcatcher buyout",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: siteUrl,
    siteName: "Dreamcatcher Hotel Santa Teresa",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Dreamcatcher Hotel Santa Teresa social preview image",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/twitter-image"],
  },
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

const directBookingSignals = [
  { label: "Primary CTA", value: "Request availability", note: "Collects dates and intent before the team confirms live Kross facts." },
  { label: "Direct-booking handoff", value: "Kross-ready", note: "Approved booking-engine URL can be attached through KROSS_PUBLIC_BOOKING_URL." },
  { label: "Mobile path", value: "Sticky inquiry", note: "Thumb-friendly CTA stays present without creating a reservation automatically." },
];

const krossReadinessSteps = [
  "Map approved public booking engine URL to KROSS_PUBLIC_BOOKING_URL.",
  "Preserve Dreamcatcher/Kross as the authority for live rates, restrictions and inventory.",
  "Track every guest inquiry as draft-first until the team confirms fit and next steps.",
  "Keep API posture read-only/readiness-only unless owner approval unlocks scoped writes.",
];

const bookingIntentSegments = [
  {
    title: "Rooms for boutique stays",
    audience: "Couples · surfers · solo reset",
    icon: BedDouble,
    copy: "A simple hotel-stay path for guests who want Santa Teresa atmosphere, pool time and hosted help without sorting villa logistics first.",
    cta: "Ask for room fit",
  },
  {
    title: "Wellness + yoga rhythm",
    audience: "Wellness travelers · retreats",
    icon: Flower2,
    copy: "Position Dreamcatcher around slow mornings, recovery, movement and retreat-friendly inquiry briefs while keeping schedules and practitioners on request.",
    cta: "Plan a wellness stay",
  },
  {
    title: "Surf-first Santa Teresa",
    audience: "Surfers · couples · friends",
    icon: Waves,
    copy: "Sell the destination pull: dawn surf, barefoot days and easy routing to the team for dates, boards, lessons or guide recommendations.",
    cta: "Build a surf trip",
  },
  {
    title: "Digital nomad long stays",
    audience: "Remote workers · slow travel",
    icon: Laptop,
    copy: "Capture longer-stay intent with a clear brief for month, work needs, guest count and desired privacy before availability is confirmed.",
    cta: "Request long-stay options",
  },
  {
    title: "Groups, villas + buyouts",
    audience: "Families · friends · retreats",
    icon: Users,
    copy: "Route larger groups into Villa Toro, Makaiza or full-property buyout language without publishing unvalidated configuration or pricing.",
    cta: "Qualify my group",
  },
  {
    title: "Weddings + events",
    audience: "Celebrations · intimate events",
    icon: PartyPopper,
    copy: "Invite event inquiries with date, group size and vision while making clear that layouts, vendors, rules and buyout terms are confirmed by the team.",
    cta: "Start an event brief",
  },
];

const santaTeresaGuide = [
  { title: "Arriving", icon: Plane, text: "Ask the team for the best airport, transfer and arrival plan for your dates before locking logistics." },
  { title: "Getting around", icon: Car, text: "Santa Teresa works best when transport is matched to season, road conditions, group size and comfort level." },
  { title: "First 24 hours", icon: Route, text: "Land, slow down, find the beach rhythm and let the stay plan become easy instead of over-scheduled." },
  { title: "Book direct advantage", icon: BadgeCheck, text: "Direct inquiries give the team context to recommend the right room, villa or buyout path before Kross confirms details." },
];

const directBookingProof = [
  "Best-fit guidance before guests commit to the wrong stay type.",
  "Cleaner handoff to Dreamcatcher/Kross for live rates, restrictions and availability.",
  "Human confirmation for villas, events, transport and long-stay requests.",
  "No surprise automation: the website prepares demand, the team confirms the booking path.",
];

const desireStack = [
  { number: "01", title: "Feel the place", text: "A cinematic first screen sells Santa Teresa before it asks for a click." },
  { number: "02", title: "Choose the intent", text: "Couple, villa group, retreat or buyout paths remove decision friction." },
  { number: "03", title: "Qualify safely", text: "The CTA collects the right signals while Kross validates live operational truth." },
  { number: "04", title: "Hand off cleanly", text: "The team receives a concise request instead of a vague travel dream." },
];

const santaTeresaDay = [
  { time: "6:10", title: "First light surf", text: "Wake into Pacific rhythm, not a standard hotel pitch." },
  { time: "11:40", title: "Pool shade + slow lunch", text: "Space to recover, reconnect and let the day stay unhurried." },
  { time: "16:55", title: "Golden-hour decision", text: "The site moves the guest from fantasy into a qualified request." },
  { time: "20:30", title: "Hosted night", text: "Retreats, villas and buyouts stay flexible until the team confirms details." },
];

const objectionKillers = [
  { title: "Will this fit my group?", answer: "The page routes group size early, then keeps Villa Toro, Makaiza and buyout configuration subject to team confirmation." },
  { title: "Can I trust availability?", answer: "The copy does not fake inventory. Kross remains the source for live dates, restrictions and rates." },
  { title: "Is this luxury or operationally real?", answer: "Every promise is paired with source confidence, approval gates and a safe next step." },
];

const visualSystem = [
  { label: "Hero mood", value: "Jungle shadow · sand warmth · Pacific blue", note: "Project-local editorial media is live now; approved Dropbox/Eagle photography can replace it later." },
  { label: "Booking rhythm", value: "Feel → self-select → qualify → confirm", note: "Every scroll section has a conversion job, not only decoration." },
  { label: "Image guide", value: "Editorial, intimate, natural light", note: "The attached-image direction is translated into warm contrast, soft cards, organic masks and cinematic depth." },
];

const sourceAudit = [
  "TORO OS v0.2/v0.3 docs map Dreamcatcher as the first workspace while keeping the product universal.",
  "Airtable table contracts identify Properties, Villas, Rooms, Sellable Units, Assets Registry, Website Pages and Website V11 Conversion OS as the content spine.",
  "The runtime environment exposes no Airtable, Dropbox/Eagle, Kross or Vercel credentials here, so the page uses source-labeled repo data and draft-only CTAs.",
];

const mediaAssets = [
  {
    src: "/dreamcatcher-media/pool-courtyard.svg",
    title: "Pool courtyard mood",
    caption: "Warm, intimate hospitality atmosphere for the hotel-stay path.",
  },
  {
    src: "/dreamcatcher-media/villa-toro.svg",
    title: "Villa Toro premium stay",
    caption: "Villa-scale positioning without publishing unvalidated live inventory.",
  },
  {
    src: "/dreamcatcher-media/makaiza-hideaway.svg",
    title: "Makaiza hideaway",
    caption: "Layered private-villa energy for group inquiries on request.",
  },
  {
    src: "/dreamcatcher-media/buyout-gathering.svg",
    title: "Full-property buyout",
    caption: "A gathering-first visual for retreats, weddings and events.",
  },
];

const storyFrames = [
  { src: "/dreamcatcher-media/surf-morning.svg", title: "Morning surf pull", text: "Santa Teresa desire cue for the top of the journey." },
  { src: "/dreamcatcher-media/pool-courtyard.svg", title: "Slow pool hour", text: "Hotel intimacy and downtime before the conversion ask." },
  { src: "/dreamcatcher-media/buyout-gathering.svg", title: "Golden-hour gathering", text: "Group energy routed into a qualified request, not instant promises." },
];

const trustNotes = [
  "Kross is the authority for live rates, restrictions, payments, reservations and availability.",
  "Dropbox/Eagle remains the media authority; unapproved assets are placeholders, not final channel publishing.",
  "TORO OS can draft, recommend and queue tasks; external writes stay blocked unless explicit approval exists.",
];

const launchChecklist = [
  "Public home and Dreamcatcher alias render the same finished microsite.",
  "Operator dashboard stays separated at /os.",
  "Local media is checked into the repo and served from /dreamcatcher-media.",
  "SEO metadata, social metadata, sitemap and robots are present.",
  "Lead capture is draft-only and does not write to Kross, Airtable, WhatsApp Business or payments.",
];

const faqItems = [
  {
    question: "Can I book instantly on this page?",
    answer: "No. This page creates a qualified inquiry draft. The Dreamcatcher team confirms availability, restrictions, rates and booking steps before anything is final.",
  },
  {
    question: "Are Villa Toro, Makaiza and buyouts guaranteed for my dates?",
    answer: "No. Villa configuration, group fit, buyout scope and live availability are confirmed on request by the team and Kross.",
  },
  {
    question: "Does the form write into Kross, Airtable or WhatsApp Business?",
    answer: "No. It prepares a guest-facing draft only. It does not create reservations, change prices, change availability or send automated messages.",
  },
  {
    question: "Can final photography replace the current artwork?",
    answer: "Yes. The local editorial media is live-ready for the temporary site, and approved Dropbox/Eagle photography can replace it later without changing the route structure.",
  },
];

const hotelStructuredData = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  name: "Dreamcatcher Hotel",
  url: siteUrl,
  image: `${siteUrl}/dreamcatcher-media/hero-santa-teresa.svg`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Santa Teresa",
    addressCountry: "CR",
  },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Boutique hotel stays", value: true },
    { "@type": "LocationFeatureSpecification", name: "Private villa inquiries", value: true },
    { "@type": "LocationFeatureSpecification", name: "Full-property buyout inquiries", value: true },
  ],
  potentialAction: {
    "@type": "ReserveAction",
    target: `${siteUrl}/#inquiry`,
    result: {
      "@type": "Reservation",
      name: "Qualified stay request subject to Dreamcatcher/Kross confirmation",
    },
  },
};


const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Dreamcatcher Hotel Santa Teresa",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/?stay={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const travelGuideStructuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Dreamcatcher Santa Teresa stay planning guide",
  itemListElement: bookingIntentSegments.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.title,
    description: item.copy,
  })),
};
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

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
      data-analytics="dreamcatcher-mailto-primary"
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([hotelStructuredData, websiteStructuredData, travelGuideStructuredData, faqStructuredData]) }} />
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
            <a href="#guide" className="transition hover:text-white">Guide</a>
            <a href="#direct" className="transition hover:text-white">Book direct</a>
            <a href="#inquiry" className="transition hover:text-white">Inquiry</a>
            <a href="#trust" className="transition hover:text-white">Trust</a>
          </div>
          <a href="#inquiry" data-analytics="nav-start-request" className="rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-[#17120c] transition hover:bg-[#f7d7a6]">Start request</a>
        </nav>
      </section>

      <section id="top" className="relative z-10 px-5 pb-20 pt-10 sm:px-8 lg:px-12 lg:pb-28 lg:pt-16">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f7d7a6]/25 bg-[#f7d7a6]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#f7d7a6]">
              <Sparkles className="h-4 w-4" /> Boutique hotel · private villas · buyouts
            </div>
            <h1 className="dreamcatcher-reveal max-w-5xl text-6xl font-black leading-[0.88] tracking-[-0.075em] text-white sm:text-7xl md:text-8xl xl:text-9xl">
              A secret-feeling stay, made easy to say yes to.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70 md:text-xl md:leading-9">
              Dreamcatcher Hotel becomes a high-intent booking story for Santa Teresa: emotional enough to feel unforgettable, structured enough to qualify couples, villa groups, retreats and full-property buyouts without overpromising live inventory.
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
            <div className="dreamcatcher-float relative overflow-hidden rounded-[2.4rem] border border-white/14 bg-white/[0.08] p-3 shadow-[0_40px_140px_rgba(0,0,0,0.44)] backdrop-blur-xl">
              <div className="relative min-h-[520px] overflow-hidden rounded-[1.8rem] p-6 sm:min-h-[620px]">
                <Image
                  src="/dreamcatcher-media/hero-santa-teresa.svg"
                  alt="Cinematic Dreamcatcher Hotel Santa Teresa media artwork with beach, jungle, pool light and Pacific sunset tones"
                  fill
                  priority
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,15,11,0.08),rgba(18,15,11,0.26)_45%,rgba(18,15,11,0.64))]" />
                <div className="relative z-10">
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
        </div>
      </section>

      <section className="relative z-10 px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[2.8rem] border border-white/12 bg-white/[0.055] p-5 shadow-[0_40px_140px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-8">
          <div className="grid gap-4 lg:grid-cols-4">
            {desireStack.map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-white/10 bg-[#120f0b]/42 p-6">
                <p className="font-mono text-sm text-[#f7d7a6]">{item.number}</p>
                <h2 className="mt-10 text-2xl font-black tracking-[-0.055em] text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/54">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="relative z-10 px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.6rem] border border-[#f7d7a6]/18 bg-[#f7d7a6]/10 p-5 shadow-[0_40px_140px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-8">
          <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
            <div>
              <SectionEyebrow>Direct booking engine readiness</SectionEyebrow>
              <h2 className="mt-4 text-5xl font-black leading-none tracking-[-0.065em] text-white md:text-6xl">Designed to move desire into a Kross-confirmed booking path.</h2>
              <p className="mt-5 text-sm leading-7 text-white/58">
                The website converts first-party demand without pretending to be the PMS. Guests choose intent, submit a clean brief and can be handed to the approved Kross booking flow when the public URL is configured.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {directBookingSignals.map((signal) => (
                <div key={signal.label} className="rounded-[1.6rem] border border-white/10 bg-[#120f0b]/46 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f7d7a6]">{signal.label}</p>
                  <p className="mt-6 text-3xl font-black tracking-[-0.055em] text-white">{signal.value}</p>
                  <p className="mt-3 text-xs leading-5 text-white/48">{signal.note}</p>
                </div>
              ))}
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

      <section className="relative z-10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="overflow-hidden rounded-[2.8rem] border border-white/12 bg-white/[0.065] p-4 shadow-[0_40px_140px_rgba(0,0,0,0.34)]">
            <div className="relative min-h-[620px] rounded-[2.2rem] bg-[radial-gradient(circle_at_18%_22%,rgba(255,232,185,0.92),transparent_17%),radial-gradient(circle_at_64%_30%,rgba(91,154,137,0.72),transparent_22%),radial-gradient(circle_at_80%_78%,rgba(16,55,62,0.96),transparent_32%),linear-gradient(135deg,#2b160d_0%,#684124_34%,#d3a25f_53%,#184e4d_76%,#0f1c1a_100%)] p-6">
              <div className="absolute left-8 top-10 h-48 w-32 rotate-6 rounded-full bg-[#120f0b]/20 blur-xl" />
              <div className="absolute bottom-10 right-10 h-64 w-44 -rotate-12 rounded-full bg-[#f7d7a6]/24 blur-2xl" />
              <div className="relative flex h-full min-h-[560px] flex-col justify-between">
                <div className="max-w-sm rounded-[2rem] border border-white/20 bg-[#120f0b]/28 p-5 backdrop-blur">
                  <SectionEyebrow>Visual direction</SectionEyebrow>
                  <p className="mt-4 text-4xl font-black leading-none tracking-[-0.065em] text-white">Photo-led feeling before photo access.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {visualSystem.map((item) => (
                    <div key={item.label} className="rounded-[1.6rem] border border-white/16 bg-[#120f0b]/38 p-4 backdrop-blur">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f7d7a6]">{item.label}</p>
                      <p className="mt-3 text-xl font-black leading-none tracking-[-0.045em] text-white">{item.value}</p>
                      <p className="mt-3 text-xs leading-5 text-white/52">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-[2.8rem] bg-[#f7d7a6] p-8 text-[#17120c] md:p-10">
            <SectionEyebrow>100% finish pass</SectionEyebrow>
            <h2 className="mt-4 text-5xl font-black leading-none tracking-[-0.065em] md:text-6xl">From TORO OS v2 data map into a sellable website.</h2>
            <p className="mt-6 text-sm font-semibold leading-7 opacity-75">
              This pass treats the site as a finished temporary production surface: public home at <strong>/</strong>, review alias at <strong>/dreamcatcher</strong>, and operational TORO OS dashboard at <strong>/os</strong>.
            </p>
            <div className="mt-8 grid gap-3">
              {sourceAudit.map((item) => (
                <div key={item} className="rounded-3xl bg-[#17120c]/8 p-4 text-sm font-bold leading-6">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
            <div>
              <SectionEyebrow>Media layer</SectionEyebrow>
              <h2 className="mt-4 text-5xl font-black leading-none tracking-[-0.065em] text-white md:text-7xl">Now the page shows the stay.</h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-white/62 lg:justify-self-end">
              Added project-local Dreamcatcher media so the temporary production site no longer depends on empty placeholders. These are owned editorial artworks for the live page; final photography can replace them once Dropbox/Eagle assets are approved.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {mediaAssets.map((asset) => (
              <article key={asset.src} className="group overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.065]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={asset.src}
                    alt={`${asset.title} — ${asset.caption}`}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,15,11,0),rgba(18,15,11,0.72))]" />
                </div>
                <div className="p-5">
                  <h3 className="text-2xl font-black tracking-[-0.045em] text-white">{asset.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/54">{asset.caption}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="villas" className="relative z-10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="dreamcatcher-shimmer rounded-[2.4rem] bg-[linear-gradient(135deg,#f7d7a6,#fff8ed,#d99b5d,#f7d7a6)] p-8 text-[#17120c] md:p-10">
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

      <section className="relative z-10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <div className="lg:sticky lg:top-8">
              <SectionEyebrow>Editorial rhythm</SectionEyebrow>
              <h2 className="mt-4 text-5xl font-black leading-none tracking-[-0.065em] text-white md:text-7xl">A day guests can imagine.</h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/58">
                Award-worthy hospitality pages convert because they create sensory certainty. This sequence turns Santa Teresa into a felt itinerary without claiming fixed packages.
              </p>
            </div>
            <div className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                {storyFrames.map((frame) => (
                  <article key={frame.title} className="overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.065]">
                    <div className="relative aspect-[5/4]">
                      <Image src={frame.src} alt={`${frame.title}: ${frame.text}`} fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    </div>
                    <div className="p-5">
                      <h3 className="text-2xl font-black tracking-[-0.045em] text-white">{frame.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-white/52">{frame.text}</p>
                    </div>
                  </article>
                ))}
              </div>
              {santaTeresaDay.map((moment) => (
                <article key={moment.time} className="grid gap-5 rounded-[2rem] border border-white/12 bg-white/[0.065] p-5 md:grid-cols-[0.24fr_1fr] md:p-7">
                  <div className="font-mono text-5xl tracking-[-0.08em] text-[#f7d7a6]">{moment.time}</div>
                  <div>
                    <h3 className="text-3xl font-black tracking-[-0.055em] text-white">{moment.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/56">{moment.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2.6rem] border border-[#f7d7a6]/18 bg-[#f7d7a6]/10 p-6 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <SectionEyebrow>Friction removal</SectionEyebrow>
                <h2 className="mt-4 text-5xl font-black leading-none tracking-[-0.065em] text-white md:text-6xl">Answer the doubts before they bounce.</h2>
              </div>
              <p className="max-w-3xl text-base leading-8 text-white/62 lg:justify-self-end">
                The page now treats conversion as objection design: group fit, availability trust and operational credibility are answered before the final CTA.
              </p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {objectionKillers.map((item) => (
                <article key={item.title} className="rounded-[2rem] border border-white/10 bg-[#120f0b]/48 p-6">
                  <h3 className="text-2xl font-black tracking-[-0.045em] text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/58">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="guide" className="relative z-10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <SectionEyebrow>Rooms · wellness · surf · groups</SectionEyebrow>
              <h2 className="mt-4 text-5xl font-black leading-none tracking-[-0.065em] text-white md:text-7xl">Every high-intent guest gets a clearer path.</h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-white/62 lg:justify-self-end">
              The website now speaks to the real demand mix for Santa Teresa: couples, wellness travelers, surfers, digital nomads, villa guests, retreats, weddings and full-property buyouts. Each path pushes toward a qualified inquiry, not a fake instant booking promise.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {bookingIntentSegments.map((segment) => {
              const Icon = segment.icon;
              return (
                <article key={segment.title} className="dreamcatcher-reveal rounded-[2rem] border border-white/12 bg-white/[0.065] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#f7d7a6]/30 hover:bg-white/[0.09]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f7d7a6]">{segment.audience}</p>
                      <h3 className="mt-4 text-3xl font-black leading-none tracking-[-0.055em] text-white">{segment.title}</h3>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/24"><Icon className="h-5 w-5 text-[#f7d7a6]" /></span>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-white/56">{segment.copy}</p>
                  <a href="#inquiry" data-analytics={`intent-${segment.title.toLowerCase().replaceAll(" ", "-")}`} className="mt-7 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#f7d7a6]">
                    {segment.cta} <ArrowRight className="h-4 w-4" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="direct" className="relative z-10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="dreamcatcher-shimmer rounded-[2.6rem] bg-[linear-gradient(135deg,#f7d7a6,#fff8ed,#d99b5d,#f7d7a6)] p-8 text-[#17120c] md:p-10">
            <CalendarDays className="h-11 w-11" />
            <h2 className="mt-10 text-5xl font-black leading-none tracking-[-0.065em] md:text-7xl">Why book direct with Dreamcatcher?</h2>
            <p className="mt-6 max-w-xl text-sm font-semibold leading-7 opacity-75">
              Direct does not mean reckless automation. It means the guest gives Dreamcatcher the context needed to recommend the right stay path, then the team validates rates, restrictions and availability in Kross.
            </p>
            <div className="mt-8 grid gap-3">
              {directBookingProof.map((proof) => (
                <div key={proof} className="flex gap-3 rounded-3xl bg-[#17120c]/8 p-4 text-sm font-bold leading-6">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  {proof}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[2.6rem] border border-white/12 bg-white/[0.065] p-6 md:p-8">
            <SectionEyebrow>Santa Teresa guide</SectionEyebrow>
            <h3 className="mt-4 text-4xl font-black leading-none tracking-[-0.06em] text-white md:text-6xl">Answer the trip-planning questions before the guest leaves to search.</h3>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {santaTeresaGuide.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-[1.8rem] border border-white/10 bg-black/20 p-5">
                    <Icon className="h-6 w-6 text-[#f7d7a6]" />
                    <h4 className="mt-6 text-2xl font-black tracking-[-0.045em] text-white">{item.title}</h4>
                    <p className="mt-3 text-sm leading-7 text-white/54">{item.text}</p>
                  </article>
                );
              })}
            </div>
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
            <div className="mt-6">
              <DreamcatcherLeadComposer />
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
          
          <div className="mt-4 rounded-[2rem] border border-[#f7d7a6]/18 bg-[#f7d7a6]/10 p-6">
            <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-[#f7d7a6]" /><h3 className="text-2xl font-black tracking-[-0.04em] text-white">Kross integration readiness</h3></div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {krossReadinessSteps.map((step, index) => (
                <div key={step} className="rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/58">
                  <span className="font-mono text-[#f7d7a6]">0{index + 1}</span> {step}
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-[2.6rem] border border-white/12 bg-white/[0.065] p-6 backdrop-blur-xl md:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
            <div>
              <SectionEyebrow>Launch readiness</SectionEyebrow>
              <h2 className="mt-4 text-5xl font-black leading-none tracking-[-0.065em] text-white md:text-7xl">Ready as a real public website.</h2>
            </div>
            <p className="max-w-3xl text-base leading-8 text-white/62 lg:justify-self-end">
              This release pass closes the basic production gaps: public routes, local media, SEO/social metadata, source authority, conversion CTA, safety posture and operational separation from TORO OS.
            </p>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {launchChecklist.map((item, index) => (
              <div key={item} className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
                <p className="font-mono text-sm text-[#f7d7a6]">0{index + 1}</p>
                <p className="mt-5 text-sm font-bold leading-6 text-white/64">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.68fr_1.32fr] lg:items-start">
            <div className="lg:sticky lg:top-8">
              <SectionEyebrow>Decision support</SectionEyebrow>
              <h2 className="mt-4 text-5xl font-black leading-none tracking-[-0.065em] text-white md:text-7xl">The questions guests ask before they convert.</h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/58">
                This FAQ protects conversion and accuracy at the same time: it answers buyer friction while keeping every commercial promise subject to Dreamcatcher/Kross confirmation.
              </p>
            </div>
            <div className="grid gap-4">
              {faqItems.map((item) => (
                <article key={item.question} className="rounded-[2rem] border border-white/12 bg-white/[0.065] p-6">
                  <h3 className="text-2xl font-black tracking-[-0.045em] text-white">{item.question}</h3>
                  <p className="mt-4 text-sm leading-7 text-white/58">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 px-5 pb-24 pt-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl text-center">
          <MapPin className="mx-auto h-10 w-10 text-[#f7d7a6]" />
          <h2 className="mt-7 text-5xl font-black leading-none tracking-[-0.07em] text-white md:text-8xl">Turn desire into a clean booking conversation.</h2>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-white/62">
            A live-ready temporary microsite for review: premium emotional storytelling, segmented stay paths, a qualified inquiry engine and strict source-authority guardrails.
          </p>
          <div className="mt-9 flex justify-center">{primaryMailto("Start your Dreamcatcher request")}</div>
          <p className="mt-6 text-xs leading-6 text-white/38">
            Subject to confirmation. Pricing, dates, inventory, restrictions, payments and reservations are validated by Dreamcatcher/Kross before any booking is confirmed.
          </p>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#120f0b]/84 p-3 backdrop-blur-xl md:hidden">
        <a href="#inquiry" className="flex items-center justify-center rounded-full bg-[#f7d7a6] px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-[#17120c]">
          Request dates · no booking created
        </a>
      </div>
    </main>
  );
}
