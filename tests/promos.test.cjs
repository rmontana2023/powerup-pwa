const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const vm = require("node:vm");
const { test } = require("node:test");

function load(path, dependencies = {}) {
  const result = {};
  const source = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  new Function("exports", "require", source)(result, (name) => {
    if (!(name in dependencies)) throw new Error("Unexpected dependency: " + name);
    return dependencies[name];
  });
  return result;
}
const rules = load("lib/promo-rules.ts");
test("daily reset uses Philippine midnight and promo expiry may end the window sooner", () => {
  assert.equal(rules.promoDayWindow(new Date("2026-11-14T15:59:59Z")).dayKey, "2026-11-14");
  assert.equal(rules.promoDayWindow(new Date("2026-11-14T16:00:00Z")).dayKey, "2026-11-15");
  assert.equal(rules.promoDayWindow(new Date("2026-12-31T17:00:00Z")).validUntil, "2027-01-01T16:00:00.000Z");
  assert.equal(rules.promoDayWindow(new Date("2026-11-14T01:00:00Z"), new Date("2026-11-14T02:00:00Z")).validUntil, "2026-11-14T02:00:00.000Z");
});
function matches(query, row) {
  return Object.entries(query).every(([key, value]) => {
    if (key === "$and") return value.every((part) => matches(part, row));
    if (key === "$or") return value.some((part) => matches(part, row));
    if (value === null) return row[key] == null;
    if (value instanceof Date) return +row[key] === +value;
    if (typeof value === "object") return (!value.$lte || row[key] <= value.$lte) && (!value.$gt || row[key] > value.$gt);
    return row[key] === value;
  });
}
test("eligibility is start-inclusive, end-exclusive and requires enabled", () => {
  const now = new Date("2026-11-15T00:00:00Z");
  const query = rules.activePromoFilter(now);
  assert.ok(matches(query, { enabled: true, startsAt: null, endsAt: null }));
  assert.ok(matches(query, { enabled: true, startsAt: now, endsAt: null }));
  assert.equal(matches(query, { enabled: true, startsAt: null, endsAt: now }), false);
  assert.equal(matches(query, { enabled: true, startsAt: new Date(+now + 1), endsAt: null }), false);
  assert.equal(matches(query, { enabled: false, startsAt: null, endsAt: null }), false);
});
test("links allow only HTTP(S) without credentials", () => {
  for (const link of ["javascript:alert(1)", "data:text/html,test", "https://user:pass@example.com", "//example.com", "bad"]) assert.equal(rules.safePromoLink(link), "");
  assert.equal(rules.safePromoLink("https://example.com/promo"), "https://example.com/promo");
});
function fixture(authorized = true, failDB = false) {
  const now = Date.now();
  const base = { title: "Promo", link: "https://example.com", enabled: true, priority: 1, startsAt: null, endsAt: null, createdAt: new Date(0), updatedAt: new Date(0), image: Buffer.from([1, 2]), imageType: "image/png" };
  const rows = [
    { ...base, _id: "000000000000000000000001", enabled: false, priority: 999 },
    { ...base, _id: "000000000000000000000002", startsAt: new Date(now + 60_000), priority: 999 },
    { ...base, _id: "000000000000000000000003", endsAt: new Date(now - 60_000), priority: 999 },
    { ...base, _id: "000000000000000000000005", priority: 50 },
    { ...base, _id: "000000000000000000000004", priority: 50 },
    { ...base, _id: "000000000000000000000006", priority: 50, createdAt: new Date(1) },
  ];
  let accesses = 0;
  const api = load("lib/customer-promos.ts", {
    "next/server": { NextResponse: { json: (body, options) => new Response(JSON.stringify(body), { ...options, headers: { "Content-Type": "application/json", ...options?.headers } }) } },
    "@/lib/server-auth": { getVerifiedCustomer: async () => authorized ? { id: "customer", role: "customer", isVerified: true } : null },
    "@/lib/promo-rules": rules,
    "@/lib/promo-db": { getPromoModel: async () => {
      accesses++;
      if (failDB) throw new Error("Database unavailable");
      const queryRows = (query, many = false) => {
        let candidates = rows.filter((row) => matches(query, row));
        const chain = {
          sort(sort) { assert.deepEqual(sort, rules.PROMO_SORT); candidates.sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt || a._id.localeCompare(b._id)); return chain; },
          select() { return chain; },
          lean: async () => many ? candidates : candidates[0] ?? null,
          then: (resolve) => Promise.resolve(candidates[0] ?? null).then(resolve),
        };
        return chain;
      }; return { findOne: (query) => queryRows(query), find: (query) => queryRows(query, true) };
    } },
  });
  return { api, rows, accesses: () => accesses };
}
test("API selects highest active priority and deterministic ties without exposing image bytes", async () => {
  const { api } = fixture();
  const response = await api.customerPromoRequest(api.activeCustomerPromo);
  const body = await response.json();
  assert.equal(body.promo.id, "000000000000000000000004");
  assert.equal(body.promo.image, undefined);
  assert.match(body.promo.imageUrl, /^\/api\/promos\/.*\/image\?v=/);
  assert.match(response.headers.get("cache-control"), /no-store/);
});
test("API handles empty promos, unauthenticated sessions and database outages", async () => {
  const empty = fixture(); empty.rows.length = 0;
  assert.equal((await (await empty.api.activeCustomerPromo()).json()).promo, null);
  const denied = fixture(false);
  assert.equal((await denied.api.customerPromoRequest(denied.api.activeCustomerPromo)).status, 401);
  assert.equal(denied.accesses(), 0);
  const failed = fixture(true, true);
  assert.equal((await failed.api.customerPromoRequest(failed.api.activeCustomerPromo)).status, 503);
});
test("promo list returns all eligible offers with mechanics in priority order", async () => {
  const { api, rows } = fixture();
  rows[4].mechanics = "Buy fuel\nPresent your rewards account.";
  const response = await api.customerPromoRequest(api.listCustomerPromos);
  const { promos } = await response.json();
  assert.deepEqual(promos.map((promo) => promo.id.slice(-1)), ["4", "5", "6"]);
  assert.equal(promos[0].mechanics, rows[4].mechanics);
  assert.equal(promos[1].mechanics, "");
  assert.equal(promos[0].image, undefined);
  assert.match(response.headers.get("cache-control"), /no-store/);
  const denied = fixture(false);
  assert.equal((await denied.api.customerPromoRequest(denied.api.listCustomerPromos)).status, 401);
  assert.equal(denied.accesses(), 0);
  rows.length = 0;
  assert.deepEqual((await (await api.listCustomerPromos()).json()).promos, []);
});

test("image requests reject expired/disabled promos, stale versions and invalid IDs", async () => {
  const { api } = fixture();
  const request = new Request("http://localhost/api/promos/id/image?v=1970-01-01T00%3A00%3A00.000Z");
  assert.equal((await api.customerPromoImage(request, "000000000000000000000001")).status, 404);
  assert.equal((await api.customerPromoImage(request, "000000000000000000000003")).status, 404);
  assert.equal((await api.customerPromoImage(request, "bad")).status, 404);
  assert.equal((await api.customerPromoImage(new Request("http://localhost?v=2026-01-01"), "000000000000000000000004")).status, 404);
  const image = await api.customerPromoImage(request, "000000000000000000000004");
  assert.equal(image.headers.get("content-type"), "image/png");
  assert.match(image.headers.get("cache-control"), /no-store/);
  assert.equal((await image.arrayBuffer()).byteLength, 2);
});
test("service worker never falls back to cached promo data or images", async () => {
  const listeners = {};
  let fetched = false;
  // Exercise production caching rules even while the temporary test bypass is enabled.
  vm.runInNewContext(fs.readFileSync("public/sw.js", "utf8").replace("const OFFLINE_TEST_BYPASS = true;", "const OFFLINE_TEST_BYPASS = false;"), {
    self: { location: { origin: "https://app.example" }, addEventListener: (name, callback) => { listeners[name] = callback; } },
    URL, Response, console,
    fetch: async (_, options) => { fetched = true; assert.equal(options.cache, "no-store"); throw new Error("Offline"); },
    caches: { open: () => { throw new Error("Promos must not use cached responses"); } },
  });
  for (const path of ["/api/rewards/catalog", "/api/promos/list", "/api/promos/active", "/api/promos/000000000000000000000004/image?v=1"]) {
    let response;
    listeners.fetch({ request: { method: "GET", url: "https://app.example" + path }, respondWith: (promise) => { response = promise; } });
    assert.equal((await response).status, 503);
  }
  assert.ok(fetched);
});
