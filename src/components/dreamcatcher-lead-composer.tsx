"use client";

import { useMemo, useState } from "react";
import { Mail, MessageCircle, Send } from "lucide-react";

const interestOptions = ["Hotel stay", "Villa Toro", "Makaiza", "Full property buyout", "Retreat / wedding / event"];

export function DreamcatcherLeadComposer() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    dates: "",
    guests: "",
    interest: interestOptions[0],
    occasion: "",
    message: "",
  });

  const draft = useMemo(() => {
    return [
      "Hi Dreamcatcher team,",
      "",
      "I would like to request a stay in Santa Teresa.",
      "",
      `Name: ${form.name || "[name]"}`,
      `Email / phone: ${form.email || "[email / phone]"}`,
      `Preferred dates or month: ${form.dates || "[dates]"}`,
      `Guests: ${form.guests || "[guest count]"}`,
      `Interested in: ${form.interest}`,
      `Occasion: ${form.occasion || "[occasion]"}`,
      `Notes: ${form.message || "[notes]"}`,
      "",
      "Please confirm availability, fit and next steps. I understand rates, inventory, restrictions and booking details are subject to Dreamcatcher/Kross confirmation.",
    ].join("\n");
  }, [form]);

  const subject = encodeURIComponent("Dreamcatcher Hotel qualified stay request");
  const mailto = `mailto:reservations@dreamcatcherhotel.com?subject=${subject}&body=${encodeURIComponent(draft)}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(draft)}`;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-[#120f0b]/46 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Name</span>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/26 focus:border-[#f7d7a6]/55" placeholder="Your name" />
        </label>
        <label className="grid gap-2">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Email / WhatsApp</span>
          <input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/26 focus:border-[#f7d7a6]/55" placeholder="How should we reply?" />
        </label>
        <label className="grid gap-2">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Dates / month</span>
          <input value={form.dates} onChange={(event) => setForm({ ...form, dates: event.target.value })} className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/26 focus:border-[#f7d7a6]/55" placeholder="Exact dates or flexible month" />
        </label>
        <label className="grid gap-2">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Guests</span>
          <input value={form.guests} onChange={(event) => setForm({ ...form, guests: event.target.value })} className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/26 focus:border-[#f7d7a6]/55" placeholder="Adults, kids, rooms if known" />
        </label>
        <label className="grid gap-2 sm:col-span-2">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Stay type</span>
          <select value={form.interest} onChange={(event) => setForm({ ...form, interest: event.target.value })} className="rounded-2xl border border-white/10 bg-[#1b1711] px-4 py-3 text-sm text-white outline-none transition focus:border-[#f7d7a6]/55">
            {interestOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className="grid gap-2 sm:col-span-2">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Occasion</span>
          <input value={form.occasion} onChange={(event) => setForm({ ...form, occasion: event.target.value })} className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/26 focus:border-[#f7d7a6]/55" placeholder="Vacation, honeymoon, retreat, wedding, birthday..." />
        </label>
        <label className="grid gap-2 sm:col-span-2">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/46">Notes</span>
          <textarea value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="min-h-28 rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/26 focus:border-[#f7d7a6]/55" placeholder="Tell us what would make this stay perfect." />
        </label>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a href={mailto} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f7d7a6] px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-[#17120c] transition hover:bg-white">
          <Mail className="h-4 w-4" /> Send email draft
        </a>
        <a href={whatsapp} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.06] px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/12">
          <MessageCircle className="h-4 w-4" /> Open WhatsApp draft
        </a>
      </div>
      <p className="mt-4 flex gap-2 text-xs leading-5 text-white/42">
        <Send className="mt-0.5 h-4 w-4 shrink-0 text-[#f7d7a6]" />
        Draft-only by design: this does not write to Airtable, Kross, WhatsApp Business, payments, channels or reservations.
      </p>
    </div>
  );
}
