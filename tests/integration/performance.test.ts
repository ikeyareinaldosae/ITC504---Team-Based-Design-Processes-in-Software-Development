// API integration tests: weekly performance records. Owner: Chandani Gupta.
// Run from the backend folder with: npm run test:api (the database must be migrated and seeded).
// Movie 8 (Southern Cross) has no record for 2026-10-19 or later in the seed data, so those weeks are free to use.
// Every record a test creates is deleted again.
import { after, afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { api, BASE, disconnect, sql } from "../../backend/src/chandani/testClient.js";

const FREE_WEEK = "2026-10-19";

afterEach(() => sql(`DELETE FROM performance WHERE "movieId" = 8 AND "weekStart" >= $1::date`, FREE_WEEK));
after(disconnect);

const record = (overrides: Record<string, unknown> = {}) => ({
  movieId: 8,
  weekStart: FREE_WEEK,
  revenue: 1234.56,
  ...overrides,
});

describe("POST /performance", () => {
  it("records weekly revenue (201) with the calculated ISO week", async () => {
    const res = await api().post(`${BASE}/performance`).send(record({ ticketsSold: 74, screenings: 3 }));
    assert.equal(res.status, 201);
    assert.equal(res.body.movieId, 8);
    assert.equal(res.body.weekStart, FREE_WEEK);
    assert.equal(res.body.isoWeek, "2026-W43");
    assert.equal(res.body.revenue, 1234.56);
    assert.equal(res.body.ticketsSold, 74);
    assert.equal(res.body.screenings, 3);
  });

  it("revenue of exactly 0 is accepted (boundary)", async () => {
    const res = await api().post(`${BASE}/performance`).send(record({ revenue: 0 }));
    assert.equal(res.status, 201);
    assert.equal(res.body.revenue, 0);
  });

  it("the same movie and week a second time returns 409", async () => {
    assert.equal((await api().post(`${BASE}/performance`).send(record())).status, 201);
    const res = await api().post(`${BASE}/performance`).send(record({ revenue: 99 }));
    assert.equal(res.status, 409);
    assert.equal(res.body.code, "CONFLICT");
  });

  it("an unknown movie returns 404", async () => {
    const res = await api().post(`${BASE}/performance`).send(record({ movieId: 99 }));
    assert.equal(res.status, 404);
    assert.equal(res.body.code, "NOT_FOUND");
  });

  for (const [name, overrides] of [
    ["week that is not a Monday (Tuesday)", { weekStart: "2026-10-20" }],
    ["impossible date", { weekStart: "2026-02-30" }],
    ["date in another format", { weekStart: "19/10/2026" }],
    ["revenue just below zero", { revenue: -0.01 }],
    ["revenue with three decimal places", { revenue: 10.555 }],
    ["revenue sent as text", { revenue: "100" }],
    ["missing revenue", { revenue: undefined }],
    ["negative tickets sold", { ticketsSold: -1 }],
    ["decimal screenings", { screenings: 2.5 }],
    ["movieId of 0", { movieId: 0 }],
  ] as const) {
    it(`${name} returns 400`, async () => {
      const res = await api().post(`${BASE}/performance`).send(record(overrides));
      assert.equal(res.status, 400);
      assert.equal(res.body.code, "BAD_REQUEST");
    });
  }
});

describe("PUT /performance/{recordId}", () => {
  it("corrects the revenue (200)", async () => {
    const created = await api().post(`${BASE}/performance`).send(record());
    const res = await api().put(`${BASE}/performance/${created.body.recordId}`).send({ revenue: 1300 });
    assert.equal(res.status, 200);
    assert.equal(res.body.revenue, 1300);
    assert.equal(res.body.weekStart, FREE_WEEK);
  });

  it("an unknown record returns 404", async () => {
    const res = await api().put(`${BASE}/performance/999999`).send({ revenue: 10 });
    assert.equal(res.status, 404);
  });

  it("invalid revenue returns 400", async () => {
    const res = await api().put(`${BASE}/performance/1`).send({ revenue: -5 });
    assert.equal(res.status, 400);
  });
});

describe("DELETE /performance/{recordId}", () => {
  it("deletes a record (204), then a second delete returns 404", async () => {
    const created = await api().post(`${BASE}/performance`).send(record());
    const first = await api().delete(`${BASE}/performance/${created.body.recordId}`);
    assert.equal(first.status, 204);
    const second = await api().delete(`${BASE}/performance/${created.body.recordId}`);
    assert.equal(second.status, 404);
  });

  it("recordId that is not a number returns 400", async () => {
    const res = await api().delete(`${BASE}/performance/abc`);
    assert.equal(res.status, 400);
  });
});
