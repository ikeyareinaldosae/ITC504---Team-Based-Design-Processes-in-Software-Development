// One shared Prisma client for the whole backend. Reads DATABASE_URL from the environment.
// Owner: Rose Budha.
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
