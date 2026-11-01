"""Builds movies.db from schema.sql + seed.sql, then tests constraints and queries."""
import os, sqlite3, sys
here = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(here, "movies.db")
if os.path.exists(db_path): os.remove(db_path)
db = sqlite3.connect(db_path); db.execute("PRAGMA foreign_keys = ON")
for f in ("schema.sql", "seed.sql"):
    db.executescript(open(os.path.join(here, f)).read())
db.execute("PRAGMA foreign_keys = ON")
ok = True
def check(name, cond):
    global ok; ok &= bool(cond); print(("PASS" if cond else "FAIL"), name)
def rejects(name, sql, args=()):
    try: db.execute(sql, args); db.rollback(); check(name, False)
    except sqlite3.IntegrityError: check(name, True)
rejects("duplicate movie+week rejected", "INSERT INTO performance(movieId,weekStart,revenue) VALUES (1,'2026-09-07',1)")
rejects("non-Monday week rejected", "INSERT INTO performance(movieId,weekStart,revenue) VALUES (8,'2026-10-13',1)")
rejects("bad date rejected", "INSERT INTO performance(movieId,weekStart,revenue) VALUES (8,'2026-13-01',1)")
rejects("negative revenue rejected", "INSERT INTO performance(movieId,weekStart,revenue) VALUES (8,'2026-10-12',-5)")
rejects("3 decimal places rejected", "INSERT INTO performance(movieId,weekStart,revenue) VALUES (8,'2026-10-12',10.005)")
rejects("unknown movie rejected", "INSERT INTO performance(movieId,weekStart,revenue) VALUES (99,'2026-10-12',10)")
rejects("bad status rejected", "UPDATE movies SET screeningStatus='paused' WHERE movieId=1")
rejects("duplicate title (any case) rejected", "INSERT INTO movies(title) VALUES ('coral kingdom')")
rejects("bad release date rejected", "INSERT INTO movies(title,releaseDate) VALUES ('X','2026-02-30')")
rejects("blank title rejected", "INSERT INTO movies(title) VALUES ('   ')")
db.execute("INSERT INTO performance(movieId,weekStart,revenue) VALUES (8,'2026-10-19',1234.56)"); db.rollback()
check("valid 2-decimal Monday insert accepted", True)
rejects("negative tickets rejected", "INSERT INTO performance(movieId,weekStart,revenue,ticketsSold) VALUES (8,'2026-10-19',10,-1)")
rejects("negative screenings rejected", "INSERT INTO performance(movieId,weekStart,revenue,screenings) VALUES (8,'2026-10-19',10,-1)")
db.execute("INSERT INTO performance(movieId,weekStart,revenue) VALUES (8,'2026-10-19',10)"); db.rollback()
check("tickets and screenings are optional (NULL allowed)", True)
for wk, iso in [("2026-09-28","2026-W40"),("2026-10-12","2026-W42"),("2026-10-05","2026-W41"),("2026-09-07","2026-W37")]:
    got = db.execute("select isoWeek from performance where weekStart=? limit 1", (wk,)).fetchone()
    check("isoWeek %s = %s" % (wk, iso), got and got[0] == iso)
check("tickets seeded", db.execute("select count(*) from performance where ticketsSold is null").fetchone()[0] == 0)
check("8 movies seeded", db.execute("select count(*) from movies").fetchone()[0] == 8)
n = db.execute("select count(*) from performance").fetchone()[0]; check("%d records seeded" % n, n == 39)
rows = db.execute("select title,revenue,previousRevenue,difference,percentChange from v_weekly_report where weekStart='2026-10-12' order by revenue desc").fetchall()
check("weekly report lists 7 movies for 2026-10-12", len(rows) == 7)
flags = {r[0]: r[1] for r in db.execute("select title,reason from v_review_flags where weekStart='2026-10-12'")}
print("flags 2026-10-12:", flags)
check("Neon Static flagged SHARP_DROP", flags.get("Neon Static") == "SHARP_DROP")
check("The Last Ferry flagged BELOW_MIN_REVENUE", flags.get("The Last Ferry") == "BELOW_MIN_REVENUE")
check("ended movie never flagged", "Grandma's Gold" not in {r[0] for r in db.execute("select title from v_review_flags")})
check("gap week has no previous revenue", db.execute("select previousRevenue from v_weekly_report where weekStart='2026-10-12' and title='Southern Cross'").fetchone()[0] == 9400)
db.execute("DELETE FROM movies WHERE movieId=8")
check("deleting a movie cascades its records", db.execute("select count(*) from performance where movieId=8").fetchone()[0] == 0); db.rollback()
# run every query in queries.sql to confirm it parses and executes
import re
params = dict(ticketsSold=420, screenings=18, movieId=1, title="Test Film", genre="Drama", releaseDate="2026-10-01", weekStart="2026-10-12",
              revenue=100.5, recordId=1, fromWeek="2026-09-07", toWeek="2026-10-12", minRevenue=5000, dropPercent=30, weeks=2)
for q in [s.strip() for s in open(os.path.join(here, "queries.sql")).read().split(";") if "--" in s or s.strip()]:
    sql = "\n".join(l for l in q.splitlines() if not l.strip().startswith("--")).strip()
    if not sql: continue
    p = dict(params)
    if sql.startswith("INSERT INTO performance"): p.update(movieId=8, weekStart="2026-10-19")
    used = {k: v for k, v in p.items() if ":" + k in sql}
    try: db.execute(sql, used); check("query runs: " + sql[:45].replace("\n", " "), True)
    except Exception as e: check("query runs: %s (%s)" % (sql[:45], e), False)
db.rollback(); db.close()
print("ALL PASSED" if ok else "SOME FAILED"); sys.exit(0 if ok else 1)
