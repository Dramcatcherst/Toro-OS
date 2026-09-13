"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type SessionState = "loading" | "anonymous" | "forbidden" | "authorized";

type RevenueOptions = {
  agencies: Array<{ key: string; name: string }>;
  rooms: Array<{ number: number; name: string }>;
  seasons: string[];
  source: string;
  villaPricingAvailable: boolean;
  note: string;
};

type RevenueRow = {
  agency_key: string;
  agency_name: string;
  room_number: number;
  room_name: string;
  season_code: string;
  starts_on: string;
  ends_on: string;
  currency: string;
  base_rack_rate: number | string | null;
  rack_rate: number | string | null;
  base_commission_rate: number | string | null;
  commission_rate: number | string | null;
  agency_earn_amount: number | string | null;
  hotel_net_rate: number | string | null;
  commercial_conditions: string | null;
  override_reason: string | null;
  override_active: boolean;
};

type LookupResponse = {
  rows: RevenueRow[];
  meta: {
    source: string;
    occupancy: number | null;
    occupancyPricingRule: string;
    villaPricingAvailable: boolean;
    note: string;
  };
};

function numberValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function money(value: number | string | null, currency = "USD") {
  const parsed = numberValue(value);
  if (parsed === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 2,
  }).format(parsed);
}

function percentage(value: number | string | null) {
  const parsed = numberValue(value);
  if (parsed === null) return "—";
  return `${(parsed * 100).toFixed(1)}%`;
}

export default function RevenueAdminClient() {
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [identity, setIdentity] = useState("");
  const [options, setOptions] = useState<RevenueOptions | null>(null);
  const [agency, setAgency] = useState("");
  const [room, setRoom] = useState("");
  const [stayDate, setStayDate] = useState("");
  const [season, setSeason] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [results, setResults] = useState<LookupResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadOptions = useCallback(async () => {
    const response = await fetch("/api/revenue/agency-rates?options=1", { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudieron cargar las opciones de Revenue.");
    setOptions((await response.json()) as RevenueOptions);
  }, []);

  const checkSession = useCallback(async () => {
    setSessionState("loading");
    const response = await fetch("/api/auth/revenue/me", { cache: "no-store" });
    if (response.status === 401) {
      setSessionState("anonymous");
      return;
    }
    if (!response.ok) {
      setError("No se pudo validar la sesión de Revenue.");
      setSessionState("anonymous");
      return;
    }

    const payload = await response.json();
    setIdentity(payload.user?.email || "Usuario autenticado");
    if (!payload.hasRevenueAccess) {
      setSessionState("forbidden");
      return;
    }

    setSessionState("authorized");
    try {
      await loadOptions();
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar opciones.");
    }
  }, [loadOptions]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/revenue/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo iniciar sesión.");
      setPassword("");
      await checkSession();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/revenue/logout", { method: "POST" });
    setOptions(null);
    setResults(null);
    setIdentity("");
    setSessionState("anonymous");
  };

  const lookup = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResults(null);
    try {
      const params = new URLSearchParams();
      if (agency) params.set("agency", agency);
      if (room) params.set("room", room);
      if (stayDate) params.set("date", stayDate);
      if (season) params.set("season", season);
      if (occupancy) params.set("occupancy", occupancy);

      const response = await fetch(`/api/revenue/agency-rates?${params.toString()}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo consultar Revenue.");
      setResults(payload as LookupResponse);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "No se pudo consultar Revenue.");
    } finally {
      setBusy(false);
    }
  };

  const hasOverrides = useMemo(
    () => Boolean(results?.rows.some((row) => row.override_active)),
    [results],
  );

  if (sessionState === "loading") {
    return <main className="mx-auto w-full max-w-7xl p-6 text-slate-300">Validando acceso de Revenue…</main>;
  }

  if (sessionState === "anonymous") {
    return (
      <main className="mx-auto flex min-h-[80vh] w-full max-w-xl items-center px-6 py-12">
        <section className="w-full rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Dreamcatcher Admin</p>
          <h1 className="mt-3 text-3xl font-black text-white">Revenue / Agencias</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Acceso privado con Supabase Auth. Las tarifas netas y comisiones no se cargan hasta validar un rol ADMIN, GERENCIA o REVENUE.
          </p>
          <form className="mt-8 space-y-4" onSubmit={login}>
            <label className="block text-sm text-slate-300">
              Email
              <input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="block text-sm text-slate-300">
              Contraseña
              <input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            {error ? <p className="rounded-xl border border-rose-900 bg-rose-950/50 p-3 text-sm text-rose-200">{error}</p> : null}
            <button className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-50" disabled={busy} type="submit">
              {busy ? "Validando…" : "Entrar a Revenue"}
            </button>
          </form>
          <Link className="mt-6 inline-block text-sm text-slate-400 hover:text-white" href="/">← Volver a Toro OS</Link>
        </section>
      </main>
    );
  }

  if (sessionState === "forbidden") {
    return (
      <main className="mx-auto w-full max-w-3xl p-8">
        <section className="rounded-3xl border border-amber-900 bg-amber-950/30 p-8">
          <p className="text-sm font-bold text-amber-300">ACCESO RESTRINGIDO</p>
          <h1 className="mt-2 text-3xl font-black text-white">Tu cuenta no tiene permiso para ver tarifas privadas.</h1>
          <p className="mt-4 text-slate-300">Sesión: {identity}. Se requiere ADMIN, GERENCIA o REVENUE.</p>
          <button className="mt-6 rounded-xl border border-slate-700 px-4 py-2 text-sm text-white" onClick={logout} type="button">Cerrar sesión</button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950/80 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Dreamcatcher Admin · Private</p>
          <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">Revenue / Agencias</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Fuente canónica: Supabase. Kross sigue siendo autoridad transaccional. Este módulo reemplaza el buscador de tarifas de Airtable, sin exponer net rates públicamente.
          </p>
        </div>
        <div className="text-sm text-slate-400">
          <p>{identity}</p>
          <div className="mt-2 flex gap-3">
            <Link className="text-cyan-300 hover:text-cyan-200" href="/">Toro OS</Link>
            <button className="text-slate-300 hover:text-white" onClick={logout} type="button">Cerrar sesión</button>
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/20 p-5">
          <p className="text-xs uppercase tracking-widest text-emerald-300">Backend</p>
          <p className="mt-2 text-xl font-bold text-white">Supabase Revenue</p>
          <p className="mt-1 text-sm text-slate-400">RLS: ADMIN / GERENCIA / REVENUE</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <p className="text-xs uppercase tracking-widest text-slate-400">Cobertura verificada</p>
          <p className="mt-2 text-xl font-bold text-white">20 habitaciones</p>
          <p className="mt-1 text-sm text-slate-400">Temporadas, rack, comisión y neto.</p>
        </div>
        <div className="rounded-2xl border border-amber-900/60 bg-amber-950/20 p-5">
          <p className="text-xs uppercase tracking-widest text-amber-300">Límite actual</p>
          <p className="mt-2 text-xl font-bold text-white">Villas no modeladas</p>
          <p className="mt-1 text-sm text-slate-400">No se inventan precios sin fuente verificada.</p>
        </div>
      </section>

      <form className="mt-6 grid gap-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-6 md:grid-cols-2 xl:grid-cols-5" onSubmit={lookup}>
        <label className="text-sm text-slate-300">Agencia
          <select className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white" value={agency} onChange={(event) => setAgency(event.target.value)}>
            <option value="">Todas</option>
            {options?.agencies.map((item) => <option key={item.key} value={item.key}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-300">Fecha de estadía
          <input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white" type="date" value={stayDate} onChange={(event) => setStayDate(event.target.value)} />
        </label>
        <label className="text-sm text-slate-300">Temporada
          <select className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white" value={season} onChange={(event) => setSeason(event.target.value)}>
            <option value="">Todas</option>
            {options?.seasons.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-300">Habitación
          <select className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white" value={room} onChange={(event) => setRoom(event.target.value)}>
            <option value="">Todas</option>
            {options?.rooms.map((item) => <option key={item.number} value={String(item.number)}>#{item.number} · {item.name}</option>)}
          </select>
        </label>
        <label className="text-sm text-slate-300">Ocupación
          <input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white" min="1" max="70" inputMode="numeric" type="number" value={occupancy} onChange={(event) => setOccupancy(event.target.value)} placeholder="Contexto" />
        </label>
        <div className="md:col-span-2 xl:col-span-5 flex flex-wrap items-center gap-3">
          <button className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-50" disabled={busy} type="submit">{busy ? "Consultando…" : "Consultar tarifa"}</button>
          <button className="rounded-xl border border-slate-700 px-5 py-3 text-sm text-slate-200" type="button" onClick={() => { setAgency(""); setRoom(""); setStayDate(""); setSeason(""); setOccupancy(""); setResults(null); setError(""); }}>Limpiar</button>
          <p className="text-xs text-slate-500">La ocupación se registra como contexto; no modifica tarifas porque la fuente actual no tiene pricing por pax.</p>
        </div>
      </form>

      {error ? <p className="mt-4 rounded-2xl border border-rose-900 bg-rose-950/40 p-4 text-sm text-rose-200">{error}</p> : null}

      {results ? (
        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/70">
          <div className="flex flex-col gap-2 border-b border-slate-800 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Resultados privados</h2>
              <p className="text-sm text-slate-400">{results.rows.length} filas · {results.meta.source}</p>
            </div>
            <div className="text-xs text-slate-500">{hasOverrides ? "Hay overrides activos en el resultado." : "Sin overrides activos en el resultado."}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Agencia</th><th className="px-4 py-3">Hab.</th><th className="px-4 py-3">Temporada</th><th className="px-4 py-3">Vigencia</th><th className="px-4 py-3">Rack</th><th className="px-4 py-3">Comisión</th><th className="px-4 py-3">Agencia gana</th><th className="px-4 py-3">Neto hotel</th><th className="px-4 py-3">Condiciones / Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {results.rows.map((row) => (
                  <tr key={`${row.agency_key}-${row.room_number}-${row.season_code}-${row.starts_on}`} className="text-slate-200">
                    <td className="px-4 py-4 font-semibold text-white">{row.agency_name}</td>
                    <td className="px-4 py-4">#{row.room_number}<div className="mt-1 text-xs text-slate-500">{row.room_name}</div></td>
                    <td className="px-4 py-4">{row.season_code}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{row.starts_on} → {row.ends_on}</td>
                    <td className="px-4 py-4">{money(row.rack_rate, row.currency)}{numberValue(row.base_rack_rate) !== numberValue(row.rack_rate) ? <div className="text-xs text-amber-300">Base {money(row.base_rack_rate, row.currency)}</div> : null}</td>
                    <td className="px-4 py-4">{percentage(row.commission_rate)}</td>
                    <td className="px-4 py-4">{money(row.agency_earn_amount, row.currency)}</td>
                    <td className="px-4 py-4 font-bold text-emerald-300">{money(row.hotel_net_rate, row.currency)}</td>
                    <td className="max-w-xs px-4 py-4 text-xs leading-5 text-slate-400">{row.override_active ? <p className="mb-1 font-semibold text-amber-300">Override: {row.override_reason || "Activo"}</p> : null}{row.commercial_conditions || "Sin condición privada adicional registrada."}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!results.rows.length ? <p className="p-6 text-sm text-slate-400">No hay una tarifa verificada que coincida con esos filtros.</p> : null}
        </section>
      ) : null}
    </main>
  );
}
