const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const ts = require("typescript");
const crypto = require("node:crypto");
function fixture({ authorized = true, rewards, locked = 0, totalPoints = 300 } = {}) {
  const created = [];
  const source = ts.transpileModule(fs.readFileSync("app/api/vouchers/create/route.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const session = { withTransaction: async fn => fn(), endSession: async () => {} };
  const dependencies = {
    crypto: { default: crypto },
    mongoose: { default: { startSession: async () => session } },
    "next/server": { NextResponse: { json: (body, options) => new Response(JSON.stringify(body), options) } },
    "@/lib/db": { connectDB: async () => {} },
    "@/lib/server-auth": { getVerifiedCustomer: async () => authorized ? { id: "customer" } : null },
    "@/lib/customer-rewards": { availableRewards: async accountType => { assert.equal(accountType, "ordinary"); return rewards ?? [{ _id: "bundle", title: "Spaghetti Bundle", kind: "item", source: "promo", points: 175, amount: 250 }, { _id: "cash", title: "PHP 20 Cash Voucher", kind: "cash", source: "standard", points: 50, amount: 20 }]; } },
    "@/models/Voucher": { default: { aggregate: () => ({ session: async () => [{ total: locked }] }), create: async rows => { created.push(...rows); return rows; } } },
    "@/models/Customer": { Customer: { findById: () => ({ session: async () => ({ _id: "customer", accountType: "ordinary", totalPoints }) }), updateOne: async () => {} } },
    "@/models/Redemption": { Redemption: { create: async () => {} } },
  };
  const api = {};
  new Function("exports", "require", source)(api, name => { assert.ok(name in dependencies, name); return dependencies[name]; });
  return { created, send: body => api.POST(new Request("http://localhost/api/vouchers/create", { method: "POST", body: JSON.stringify(body) })) };
}
test("promo reward creates a normal voucher with an immutable item label and locked points", async () => {
  const f = fixture();
  const response = await f.send({ rewardId: "bundle", points: 175, amount: 250 });
  assert.equal(response.status, 200);
  assert.equal(f.created[0].rewardTitle, "Spaghetti Bundle");
  assert.equal(f.created[0].rewardKind, "item");
  assert.equal(f.created[0].pointsLocked, 175); assert.equal(f.created[0].amount, 250);
  assert.equal((await response.json()).totalPoints, 300, "existing lock-until-collection flow is preserved");
});
test("cash tiers still work and forged or unavailable rewards cannot create vouchers", async () => {
  assert.equal((await fixture().send({ points: 50, amount: 20 })).status, 200);
  for (const body of [{ rewardId: "bundle", points: 1, amount: 250 }, { rewardId: "bundle", points: 175, amount: 20 }, { points: 175, amount: 250 }, { rewardId: "unknown", points: 175, amount: 250 }]) {
    const f = fixture(); assert.equal((await f.send(body)).status, 400); assert.equal(f.created.length, 0);
  }
  const unavailable = fixture({ rewards: [] });
  assert.equal((await unavailable.send({ rewardId: "bundle", points: 175, amount: 250 })).status, 400);
  assert.equal(unavailable.created.length, 0);
});
test("authentication and cash voucher locks still protect the balance", async () => {
  const denied = fixture({ authorized: false });
  assert.equal((await denied.send({ rewardId: "bundle", points: 175, amount: 250 })).status, 401);
  const locked = fixture({ locked: 200 });
  assert.equal((await locked.send({ rewardId: "bundle", points: 175, amount: 250 })).status, 400);
  assert.equal(locked.created.length, 0);
});
