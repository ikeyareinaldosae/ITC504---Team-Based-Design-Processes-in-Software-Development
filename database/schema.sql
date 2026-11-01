-- Movie Performance Management System: database schema (SQLite 3.35+)
-- Owner: Rose Budha. Column names use camelCase to match openapi.yaml.
-- Money is AUD with at most two decimal places. A week is its Monday (YYYY-MM-DD).

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS movies (
    movieId         INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT    NOT NULL COLLATE NOCASE UNIQUE
                            CHECK (length(trim(title)) > 0),
    genre           TEXT,
    releaseDate     TEXT    CHECK (releaseDate IS NULL OR date(releaseDate) IS releaseDate),
    screeningStatus TEXT    NOT NULL DEFAULT 'active'
                            CHECK (screeningStatus IN ('active', 'extended', 'ended')),
    extendedWeeks   INTEGER NOT NULL DEFAULT 0 CHECK (extendedWeeks >= 0)
);

CREATE TABLE IF NOT EXISTS performance (
    recordId  INTEGER PRIMARY KEY AUTOINCREMENT,
    movieId   INTEGER NOT NULL REFERENCES movies(movieId) ON DELETE CASCADE,
    weekStart TEXT    NOT NULL
                      CHECK (date(weekStart) IS weekStart AND strftime('%w', weekStart) = '1'),
    revenue   REAL    NOT NULL
                      CHECK (revenue >= 0 AND round(revenue, 2) = revenue),
    ticketsSold INTEGER CHECK (ticketsSold IS NULL OR ticketsSold >= 0),   -- optional
    screenings  INTEGER CHECK (screenings  IS NULL OR screenings  >= 0),   -- optional
    -- ISO week label such as 2026-W40, calculated from the Monday date (needs SQLite 3.31+)
    isoWeek   TEXT GENERATED ALWAYS AS (
                  strftime('%Y', weekStart, '+3 days') || '-W' ||
                  printf('%02d', (CAST(strftime('%j', weekStart, '+3 days') AS INTEGER) - 1) / 7 + 1)
              ) VIRTUAL,
    UNIQUE (movieId, weekStart)          -- one record per movie per week (API returns 409 on repeat)
);
CREATE INDEX IF NOT EXISTS idx_performance_week ON performance(weekStart);
CREATE INDEX IF NOT EXISTS idx_performance_isoweek ON performance(isoWeek);

-- Review rule values. Defaults are placeholders until the team confirms them.
CREATE TABLE IF NOT EXISTS settings (
    name  TEXT PRIMARY KEY,
    value REAL NOT NULL
);
INSERT OR IGNORE INTO settings (name, value) VALUES ('minRevenue', 5000), ('dropPercent', 30);

-- Optional login feature (not enforced in contract v1.0.0). Store a password HASH only.
CREATE TABLE IF NOT EXISTS users (
    userId       INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT NOT NULL UNIQUE COLLATE NOCASE,
    passwordHash TEXT NOT NULL,
    role         TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'manager'))
);

-- Weekly report with previous week, difference and % change (previous week = weekStart - 7 days).
CREATE VIEW IF NOT EXISTS v_weekly_report AS
SELECT p.weekStart,
       p.isoWeek,
       m.movieId,
       m.title,
       p.revenue,
       p.ticketsSold,
       p.screenings,
       m.screeningStatus,
       prev.revenue AS previousRevenue,
       CASE WHEN prev.revenue IS NOT NULL THEN round(p.revenue - prev.revenue, 2) END AS difference,
       CASE WHEN prev.revenue > 0 THEN round((p.revenue - prev.revenue) * 100.0 / prev.revenue, 1) END AS percentChange
FROM performance p
JOIN movies m ON m.movieId = p.movieId
LEFT JOIN performance prev
       ON prev.movieId = p.movieId AND prev.weekStart = date(p.weekStart, '-7 days');

-- Flagged movies using the thresholds in settings. Ended movies are excluded.
CREATE VIEW IF NOT EXISTS v_review_flags AS
SELECT r.weekStart, r.movieId, r.title, r.revenue, r.previousRevenue, r.percentChange,
       CASE WHEN r.revenue < (SELECT value FROM settings WHERE name = 'minRevenue')
            THEN 'BELOW_MIN_REVENUE' ELSE 'SHARP_DROP' END AS reason
FROM v_weekly_report r
JOIN movies m ON m.movieId = r.movieId
WHERE m.screeningStatus <> 'ended'
  AND ( r.revenue < (SELECT value FROM settings WHERE name = 'minRevenue')
     OR r.percentChange <= -(SELECT value FROM settings WHERE name = 'dropPercent') );
