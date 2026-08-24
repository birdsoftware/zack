import { getStore } from "@netlify/blobs";

const STORE_NAME = "zack-leaderboard";
const MAX_ENTRIES = 25;
const ALIAS_FALLBACKS = [
  "Blue Comet",
  "Laser Bean",
  "Moon Wizard",
  "Rocket Noodle",
  "Nova Muffin",
  "Turbo Spark",
];
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

function monthKeyFrom(value, fallbackDate = new Date()) {
  const text = String(value || "");
  if (/^\d{4}-\d{2}$/.test(text)) {
    return text;
  }

  const fallback = Number.isNaN(fallbackDate.getTime()) ? new Date() : fallbackDate;
  return fallback.toISOString().slice(0, 7);
}

function dateKeyFrom(value) {
  const text = String(value || "");
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : new Date().toISOString().slice(0, 10);
}

function cleanText(value, fallback, maxLength) {
  const text = String(value || "")
    .replace(/[^A-Za-z0-9 .'-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  return text || fallback;
}

function cleanAlias(value, dateKey) {
  const alias = cleanText(value, "", 28).replace(/[^A-Za-z ]/g, "").replace(/\s+/g, " ").trim();
  if (alias.length >= 3) {
    return alias;
  }

  const index = Math.abs([...dateKey].reduce((total, char) => total + char.charCodeAt(0), 0)) % ALIAS_FALLBACKS.length;
  return ALIAS_FALLBACKS[index];
}

function normalizeEntry(entry = {}) {
  const dateKey = dateKeyFrom(entry.dateKey);
  return {
    alias: cleanAlias(entry.alias, dateKey),
    score: Math.max(0, Math.min(9999999, Math.floor(Number(entry.score) || 0))),
    seconds: Math.max(0, Math.min(9999, Number(entry.seconds) || 0)),
    dateKey,
    monthKey: monthKeyFrom(dateKey.slice(0, 7), new Date(`${dateKey}T00:00:00Z`)),
    world: cleanText(entry.world, "Planet", 32),
    pilot: cleanText(entry.pilot, "Pilot", 32),
    createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
  };
}

function sortEntries(entries = []) {
  return entries
    .map(normalizeEntry)
    .sort((a, b) => b.score - a.score || a.seconds - b.seconds || a.createdAt.localeCompare(b.createdAt))
    .slice(0, MAX_ENTRIES);
}

function mergeDailyEntry(entries, entry) {
  const key = `${entry.alias.toLowerCase()}|${entry.dateKey}`;
  const existing = new Map();
  for (const boardEntry of entries.map(normalizeEntry)) {
    existing.set(`${boardEntry.alias.toLowerCase()}|${boardEntry.dateKey}`, boardEntry);
  }

  const previous = existing.get(key);
  if (!previous || entry.score > previous.score || (entry.score === previous.score && entry.seconds < previous.seconds)) {
    existing.set(key, entry);
  }

  return sortEntries([...existing.values()]);
}

function openLeaderboardStore() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

async function readBoard(store, monthKey) {
  const entry = await store.getWithMetadata(monthKey, {
    consistency: "strong",
    type: "json",
  });

  if (!entry || !entry.data) {
    return {
      board: { monthKey, entries: [] },
      etag: null,
    };
  }

  return {
    board: {
      monthKey,
      entries: sortEntries(entry.data.entries),
      updatedAt: typeof entry.data.updatedAt === "string" ? entry.data.updatedAt : null,
    },
    etag: entry.etag || null,
  };
}

async function writeEntry(payload) {
  const store = openLeaderboardStore();
  const entry = normalizeEntry(payload);
  const monthKey = entry.monthKey;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { board, etag } = await readBoard(store, monthKey);
    const next = {
      monthKey,
      entries: mergeDailyEntry(board.entries, entry),
      updatedAt: new Date().toISOString(),
    };
    const result = await store.setJSON(
      monthKey,
      next,
      etag ? { onlyIfMatch: etag } : { onlyIfNew: true }
    );

    if (result.modified) {
      return next;
    }
  }

  const { board } = await readBoard(store, monthKey);
  const next = {
    monthKey,
    entries: mergeDailyEntry(board.entries, entry),
    updatedAt: new Date().toISOString(),
  };
  await store.setJSON(monthKey, next);
  return next;
}

export default async function leaderboard(request) {
  try {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }

    if (request.method === "GET") {
      const url = new URL(request.url);
      const monthKey = monthKeyFrom(url.searchParams.get("month"));
      const { board } = await readBoard(openLeaderboardStore(), monthKey);
      return response(200, { ok: true, ...board });
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

    const entry = normalizeEntry(payload);
    if (entry.score <= 0) {
      return response(400, { ok: false, error: "Score must be positive" });
    }

    const board = await writeEntry(entry);
    return response(200, { ok: true, ...board });
  } catch (error) {
    console.error("Leaderboard failed", error);
    return response(500, { ok: false, error: "Leaderboard unavailable" });
  }
}
