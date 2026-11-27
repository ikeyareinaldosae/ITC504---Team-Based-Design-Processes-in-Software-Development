// API integration tests: movies, health and general error handling. Owner: Chandani Gupta.
// Run from the backend folder with: npm run test:api (the database must be migrated and seeded).
// Tests that add data remove it again, so the seed data stays the same for every run.
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { api, BASE, disconnect, sql } from "../../backend/src/chandani/testClient.js";

after(disconnect);

describe("health and general errors", () => {
  it("GET /health returns 200 { status: ok }", async () => {
    const res = await api().get(`${BASE}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: "ok" });
  });

  it("an unknown path returns 404 in the standard error format", async () => {
    const res = await api().get(`${BASE}/films`);
    assert.equal(res.status, 404);
    assert.equal(res.body.code, "NOT_FOUND");
    assert.equal(typeof res.body.message, "string");
  });

  it("a body that is not valid JSON returns 400", async () => {
    const res = await api().post(`${BASE}/movies`).set("Content-Type", "application/json").send('{"title":');
    assert.equal(res.status, 400);
    assert.equal(res.body.code, "BAD_REQUEST");
  });
});

describe("GET /movies", () => {
  it("lists the 8 seed movies sorted by title", async () => {
    const res = await api().get(`${BASE}/movies`);
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 8);
    const titles = res.body.map((m: { title: string }) => m.title.toLowerCase());
    assert.deepEqual(titles, [...titles].sort());
    assert.deepEqual(Object.keys(res.body[0]).sort(), [
      "extendedWeeks", "genre", "movieId", "releaseDate", "screeningStatus", "title",
    ]);
  });
});

describe("GET /movies/{movieId}", () => {
  it("returns one movie", async () => {
    const res = await api().get(`${BASE}/movies/2`);
    assert.equal(res.status, 200);
    assert.equal(res.body.title, "Coral Kingdom");
    assert.equal(res.body.releaseDate, "2026-08-27");
  });

  it("an unknown movie returns 404", async () => {
    const res = await api().get(`${BASE}/movies/999`);
    assert.equal(res.status, 404);
    assert.equal(res.body.code, "NOT_FOUND");
  });

  for (const bad of ["0", "-1", "abc", "1.5"]) {
    it(`movieId "${bad}" returns 400`, async () => {
      const res = await api().get(`${BASE}/movies/${bad}`);
      assert.equal(res.status, 400);
      assert.equal(res.body.code, "BAD_REQUEST");
    });
  }
});

describe("POST /movies", () => {
  it("creates a movie with only a title (status active, 0 extended weeks)", async () => {
    const res = await api().post(`${BASE}/movies`).send({ title: "API Test Film" });
    try {
      assert.equal(res.status, 201);
      assert.equal(res.body.title, "API Test Film");
      assert.equal(res.body.genre, null);
      assert.equal(res.body.screeningStatus, "active");
      assert.equal(res.body.extendedWeeks, 0);
    } finally {
      await sql(`DELETE FROM movies WHERE lower("title") = lower($1)`, "API Test Film");
    }
  });

  it("the same title in another letter case returns 409", async () => {
    const res = await api().post(`${BASE}/movies`).send({ title: "coral kingdom" });
    assert.equal(res.status, 409);
    assert.equal(res.body.code, "CONFLICT");
  });

  for (const [name, body] of [
    ["missing title", { genre: "Drama" }],
    ["empty title", { title: "" }],
    ["title with only spaces", { title: "   " }],
    ["impossible release date", { title: "Bad Date Film", releaseDate: "2026-02-30" }],
    ["genre that is not text", { title: "Bad Genre Film", genre: 5 }],
  ] as const) {
    it(`${name} returns 400`, async () => {
      const res = await api().post(`${BASE}/movies`).send(body);
      assert.equal(res.status, 400);
      assert.equal(res.body.code, "BAD_REQUEST");
    });
  }
});
