// Chile: which postings a person living in Chile can take, and which region
// of Chile a location names. Offline; no fixtures.
import assert from "node:assert/strict";
import { analyzeLocation } from "../lib/ats/ranking/location.js";
import { openToChile } from "../scripts/jobs.mjs";
import { regionsOf } from "../api/_classify.js";

const cls = (location) => analyzeLocation([location], {}).locationClass;
const cases = {
  "Santiago, Santiago Metropolitan Region, Chile": "chile",
  "Las Condes": "chile",
  "Concepción, Chile": "chile",
  "Viña del Mar, Valparaíso": "chile",
  "Remote - Chile": "remote-chile",
  "Remote - LATAM": "remote-latam",
  "Remote, Latin America": "remote-latam",
  "Remote - Brazil": "latam",
  "Buenos Aires, Argentina": "latam",
  "Mexico City": "latam",
  "Albuquerque, New Mexico": "us-other",
  "Los Angeles, CA": "us-other",
  "Santiago de Compostela, Spain": "spain",
  "Madrid, Spain": "spain",
  "Remote": "remote-global",
};
for (const [location, expected] of Object.entries(cases)) assert.equal(cls(location), expected, location);
// "Santiago" alone is also in Spain and the Dominican Republic.
assert.notEqual(cls("Santiago"), "chile");

const job = (locationsRaw, title = "Backend Engineer", extra = {}) =>
  ({ title, locationsRaw, workplaceType: "unknown", locationClass: "other", ...extra });
const open = (j) => openToChile(j, analyzeLocation);
assert.ok(open(job(["Santiago, Chile"])));
assert.ok(open(job(["Remote - Chile"], "Backend Engineer", { workplaceType: "remote" })));
assert.ok(open(job(["Remote - LATAM"], "Backend Engineer", { workplaceType: "remote" })));
assert.ok(open(job(["Remote"], "Backend Engineer", { workplaceType: "remote" })), "placeless remote is open");
assert.equal(open(job(["Remote"], "Backend Engineer (Remote, US)", { workplaceType: "remote" })), null);
assert.equal(open(job(["Remote"], "Backend Engineer - Europe", { workplaceType: "remote" })), null);
assert.equal(open(job(["Madrid, Spain"])), null);
assert.equal(open(job(["Buenos Aires, Argentina"])), null);
assert.equal(open(job(["Remote - Brazil"], "Backend Engineer", { workplaceType: "remote" })), null);
assert.ok(open(job(["Buenos Aires, Argentina; Santiago, Chile"])), "any office in Chile is enough");

assert.deepEqual(regionsOf("Santiago, Chile"), ["RM"]);
assert.deepEqual(regionsOf("Las Condes, Región Metropolitana"), ["RM"]);
assert.deepEqual(regionsOf("Concepción, Chile"), ["BI"]);
assert.deepEqual(regionsOf("Viña del Mar"), ["VS"]);
assert.deepEqual(regionsOf("Puerto Montt, Los Lagos"), ["LL"]);

console.log("chile-location: ok");
