const DREAMCATCHER_ORG_ID = "595801ce-2895-4d91-81ae-e8d1d5cc8593";

const ALLOWED_ROUTES = new Set(["direct", "manuel-antonio", "undecided"]);
const ALLOWED_SOLIDARITY = new Set([0, 50, 100, 200]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function text(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
  if (req.headers.get("x-los50s-source") !== "dreamcatcher-website-vnext") {
    return json({ ok: false, error: "forbidden_source" }, 403);
  }

  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > 60000) return json({ ok: false, error: "payload_too_large" }, 413);

  const body = await req.json().catch(() => null);
  if (!body || body.type !== "registration_v2" || typeof body.payload !== "object" || !body.payload) {
    return json({ ok: false, error: "invalid_payload" }, 400);
  }

  const p = body.payload as Record<string, unknown>;
  const respondent = (p.respondent ?? {}) as Record<string, unknown>;
  const name = text(respondent.name, 120);
  const whatsapp = text(respondent.whatsapp, 24);
  const personRef = text(respondent.personId, 80) || null;
  const teamRoute = text(p.teamRoute, 40) || "undecided";
  const solidarity = Number(p.solidarityContribution ?? 0);
  const groupFund = Number(p.groupFundPerPerson ?? 100);
  const source = text(p.source, 80) || "los50s_portal_v12";
  const leader = (p.leader ?? {}) as Record<string, unknown>;
  const leaderName = text(leader.name, 120);
  const leaderPersonRef = text(leader.personId, 80) || null;
  const leaderWhatsapp = text(leader.whatsapp, 24) || null;
  const people = Array.isArray(p.people) ? p.people : [];
  const memberCount = people.length;
  const groupEstimate = Number(p.groupEstimate ?? 0);

  if (name.length < 2) return json({ ok: false, error: "missing_name", message: "Falta el nombre de quien llena la inscripción." }, 400);
  if (!/^\+[1-9]\d{7,14}$/.test(whatsapp)) {
    return json({ ok: false, error: "invalid_whatsapp", message: "El WhatsApp debe venir en formato internacional, por ejemplo +50688444004." }, 400);
  }
  if (!ALLOWED_ROUTES.has(teamRoute)) return json({ ok: false, error: "invalid_route" }, 400);
  if (source === "los50s_portal_v13" && leaderName.length < 2) {
    return json({ ok: false, error: "missing_leader", message: "Falta escoger el líder del grupo." }, 400);
  }
  if (memberCount < 1 || memberCount > 20) return json({ ok: false, error: "invalid_member_count" }, 400);
  if (!ALLOWED_SOLIDARITY.has(solidarity) && !(solidarity >= 50 && solidarity <= 5000)) {
    return json({ ok: false, error: "invalid_solidarity" }, 400);
  }
  if (groupFund !== 100) return json({ ok: false, error: "invalid_group_fund" }, 400);

  const serialized = JSON.stringify(p);
  if (serialized.length > 50000) return json({ ok: false, error: "payload_too_large" }, 413);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ ok: false, error: "server_not_configured" }, 500);

  const insert = await fetch(`${supabaseUrl}/rest/v1/los50s_registrations?select=id,created_at`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "apikey": serviceKey,
      "authorization": `Bearer ${serviceKey}`,
      "prefer": "return=representation",
    },
    body: JSON.stringify({
      org_id: DREAMCATCHER_ORG_ID,
      event_key: "los50s-caro-2026",
      source,
      respondent_name: name,
      respondent_person_ref: personRef,
      respondent_whatsapp: whatsapp,
      team_route: teamRoute,
      leader_name: leaderName || null,
      leader_person_ref: leaderPersonRef,
      leader_whatsapp: leaderWhatsapp,
      member_count: memberCount,
      group_estimate: Number.isFinite(groupEstimate) ? groupEstimate : null,
      solidarity_contribution: solidarity,
      group_fund_per_person: 100,
      payload: p,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    }),
  });

  const result = await insert.json().catch(() => null);
  if (!insert.ok) {
    console.error("los50s intake insert failed", insert.status, result);
    return json({ ok: false, error: "save_failed", message: "No se pudo guardar la inscripción. Intenta de nuevo." }, 502);
  }

  const row = Array.isArray(result) ? result[0] : result;
  let opsMaterialized = false;
  let opsWarning: string | null = null;

  if (row?.id) {
    const materialize = await fetch(`${supabaseUrl}/rest/v1/rpc/los50s_materialize_registration`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "apikey": serviceKey,
        "authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ p_registration_id: row.id }),
    });

    if (materialize.ok) {
      opsMaterialized = true;
    } else {
      const materializeError = await materialize.json().catch(() => null);
      console.error("los50s materialize failed", materialize.status, materializeError);
      opsWarning = "registration_saved_ops_pending";
    }
  }

  return json({
    ok: true,
    saved: true,
    id: row?.id ?? null,
    createdAt: row?.created_at ?? null,
    opsMaterialized,
    opsWarning,
  });
});
