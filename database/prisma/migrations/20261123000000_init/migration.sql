-- Movie Performance Management System: initial migration (PostgreSQL 14 or later).
-- Owner: Rose Budha. Prisma creates the tables; the rules below are added by hand because
-- Prisma's schema language cannot express CHECK constraints, generated columns or views.

-- CreateEnum
CREATE TYPE "ScreeningStatus" AS ENUM ('active', 'extended', 'ended');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('employee', 'manager');

-- CreateTable
CREATE TABLE "movies" (
    "movieId" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "genre" TEXT,
    "releaseDate" DATE,
    "screeningStatus" "ScreeningStatus" NOT NULL DEFAULT 'active',
    "extendedWeeks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("movieId")
);

-- CreateTable
CREATE TABLE "performance" (
    "recordId" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "weekStart" DATE NOT NULL,
    "revenue" DECIMAL NOT NULL,
    "ticketsSold" INTEGER,
    "screenings" INTEGER,
    -- ISO week label such as 2026-W40, calculated by the database from the Monday date
    "isoWeek" TEXT GENERATED ALWAYS AS (
        EXTRACT(ISOYEAR FROM "weekStart")::int::text || '-W' ||
        lpad(EXTRACT(WEEK FROM "weekStart")::int::text, 2, '0')
    ) STORED,

    CONSTRAINT "performance_pkey" PRIMARY KEY ("recordId")
);

-- CreateTable
CREATE TABLE "settings" (
    "name" TEXT NOT NULL,
    "value" DECIMAL NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "users" (
    "userId" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'employee',

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE INDEX "performance_weekStart_idx" ON "performance"("weekStart");

-- CreateIndex
CREATE INDEX "performance_isoWeek_idx" ON "performance"("isoWeek");

-- CreateIndex
CREATE UNIQUE INDEX "performance_movieId_weekStart_key" ON "performance"("movieId", "weekStart");

-- AddForeignKey
ALTER TABLE "performance" ADD CONSTRAINT "performance_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("movieId") ON DELETE CASCADE ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------------------
-- Rules enforced by the database (the API still validates first and returns 400)
-- ---------------------------------------------------------------------------------------

-- Movie titles are unique ignoring upper and lower case, and cannot be blank.
CREATE UNIQUE INDEX "movies_title_lower_key" ON "movies" (lower("title"));
ALTER TABLE "movies" ADD CONSTRAINT "movies_title_not_blank" CHECK (length(btrim("title")) > 0);
ALTER TABLE "movies" ADD CONSTRAINT "movies_extendedWeeks_nonneg" CHECK ("extendedWeeks" >= 0);

-- A week is its Monday (ISO day of week 1). Revenue is not negative and has at most 2 decimals.
ALTER TABLE "performance" ADD CONSTRAINT "performance_weekStart_monday" CHECK (EXTRACT(ISODOW FROM "weekStart") = 1);
ALTER TABLE "performance" ADD CONSTRAINT "performance_revenue_valid" CHECK ("revenue" >= 0 AND "revenue" = round("revenue", 2));
ALTER TABLE "performance" ADD CONSTRAINT "performance_ticketsSold_nonneg" CHECK ("ticketsSold" IS NULL OR "ticketsSold" >= 0);
ALTER TABLE "performance" ADD CONSTRAINT "performance_screenings_nonneg" CHECK ("screenings" IS NULL OR "screenings" >= 0);

-- Usernames are unique ignoring case.
CREATE UNIQUE INDEX "users_username_lower_key" ON "users" (lower("username"));

-- Review rule defaults. These are placeholders until the team confirms them.
INSERT INTO "settings" ("name", "value") VALUES ('minRevenue', 5000), ('dropPercent', 30)
ON CONFLICT ("name") DO NOTHING;

-- ---------------------------------------------------------------------------------------
-- Report views
-- ---------------------------------------------------------------------------------------

-- Weekly report with previous week, difference and % change (previous week = weekStart minus 7 days).
CREATE VIEW "v_weekly_report" AS
SELECT p."weekStart",
       p."isoWeek",
       m."movieId",
       m."title",
       p."revenue",
       p."ticketsSold",
       p."screenings",
       m."screeningStatus",
       prev."revenue" AS "previousRevenue",
       CASE WHEN prev."revenue" IS NOT NULL THEN round(p."revenue" - prev."revenue", 2) END AS "difference",
       CASE WHEN prev."revenue" > 0 THEN round((p."revenue" - prev."revenue") * 100.0 / prev."revenue", 1) END AS "percentChange"
FROM "performance" p
JOIN "movies" m ON m."movieId" = p."movieId"
LEFT JOIN "performance" prev
       ON prev."movieId" = p."movieId" AND prev."weekStart" = p."weekStart" - 7;

-- Flagged movies using the thresholds in settings. Ended movies are excluded.
CREATE VIEW "v_review_flags" AS
SELECT r."weekStart", r."movieId", r."title", r."revenue", r."previousRevenue", r."percentChange",
       CASE WHEN r."revenue" < (SELECT "value" FROM "settings" WHERE "name" = 'minRevenue')
            THEN 'BELOW_MIN_REVENUE' ELSE 'SHARP_DROP' END AS "reason"
FROM "v_weekly_report" r
WHERE r."screeningStatus" <> 'ended'
  AND ( r."revenue" < (SELECT "value" FROM "settings" WHERE "name" = 'minRevenue')
     OR r."percentChange" <= -(SELECT "value" FROM "settings" WHERE "name" = 'dropPercent') );
