// Test helper for the API integration tests in tests/integration. Owner: Chandani Gupta.
// Supertest sends real HTTP requests to the Express app without starting a server,
// so the tests do not need port 5000 to be free.
import request from "supertest";
import { app } from "../app.js";
import { prisma } from "../rose/prismaClient.js";

export const BASE = "/api/v1";

/** A Supertest client for the API. Usage: api().get(`${BASE}/movies`). */
export const api = () => request(app);

/** Runs a SQL statement directly, used by tests to put data back the way the seed left it. */
export const sql = (text: string, ...values: unknown[]) => prisma.$executeRawUnsafe(text, ...values);

/** Closes the database connection after a test file. */
export const disconnect = () => prisma.$disconnect();
