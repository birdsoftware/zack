import { getStore } from "@netlify/blobs";

const STORE_NAME = "zack-traffic";
const TOTALS_KEY = "totals";
const TRAFFIC_EVENTS = new Set(["visit", "play"]);
const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function response(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function normalizeCounter(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

function normalizeTotals(value = {}) {
  return {
    visits: normalizeCounter(value.visits),
    plays: normalizeCounter(value.plays),
    createdAt: typeof value.createdAt === "string" ? value.createdAt : null,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
  };
}

function openTrafficStore() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

async function readTotals(store) {
  const entry = await store.getWithMetadata(TOTALS_KEY, {
    consistency: "strong",
    type: "json",
  });

  if (!entry || !entry.data) {
    return { totals: normalizeTotals(), etag: null };
  }

  return {
    totals: normalizeTotals(entry.data),
    etag: entry.etag || null,
  };
}

function nextTotals(totals, eventName) {
  const now = new Date().toISOString();
  const next = {
    ...totals,
    createdAt: totals.createdAt || now,
    updatedAt: now,
  };

  if (eventName === "visit") {
    next.visits += 1;
  }

  if (eventName === "play") {
    next.plays += 1;
  }

  return next;
}

async function incrementTotals(eventName) {
  const store = openTrafficStore();

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { totals, etag } = await readTotals(store);
    const next = nextTotals(totals, eventName);
    const result = await store.setJSON(
      TOTALS_KEY,
      next,
      etag ? { onlyIfMatch: etag } : { onlyIfNew: true }
    );

    if (result.modified) {
      return next;
    }
  }

  const { totals } = await readTotals(store);
  const next = nextTotals(totals, eventName);
  await store.setJSON(TOTALS_KEY, next);
  return next;
}

export default async function traffic(request) {
  try {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }

    if (request.method === "GET") {
      const { totals } = await readTotals(openTrafficStore());
      return response(200, { ok: true, ...totals });
    }

    if (request.method !== "POST") {
      return response(405, { ok: false, error: "Method not allowed" });
    }

    let payload;
    try {
      payload = await request.json();
    } catch (error) {
      return response(400, { ok: false, error: "Invalid JSON" });
    }

    if (!TRAFFIC_EVENTS.has(payload.event)) {
      return response(400, { ok: false, error: "Unknown traffic event" });
    }

    const totals = await incrementTotals(payload.event);
    return response(200, { ok: true, ...totals });
  } catch (error) {
    console.error("Traffic counter failed", error);
    return response(500, { ok: false, error: "Traffic counter unavailable" });
  }
}
