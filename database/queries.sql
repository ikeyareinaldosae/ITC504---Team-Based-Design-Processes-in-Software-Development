-- Tested queries for the API data-access layer. Parameters use :name style.

-- Q1 List movies (GET /movies)
SELECT movieId, title, genre, releaseDate, screeningStatus, extendedWeeks FROM movies ORDER BY title;

-- Q2 Get one movie (GET /movies/{movieId})
SELECT movieId, title, genre, releaseDate, screeningStatus, extendedWeeks FROM movies WHERE movieId = :movieId;

-- Q3 Add movie (POST /movies)
INSERT INTO movies (title, genre, releaseDate) VALUES (:title, :genre, :releaseDate);

-- Q3b Find a movie by name (the input page sends the movie name, and no match means 404)
SELECT movieId FROM movies WHERE title = :title;

-- Q4 Record weekly revenue (POST /performance). A UNIQUE violation means 409 Conflict.
-- ticketsSold and screenings are optional (pass NULL). weekStart is the Monday date.
INSERT INTO performance (movieId, weekStart, revenue, ticketsSold, screenings)
VALUES (:movieId, :weekStart, :revenue, :ticketsSold, :screenings);

-- Q5 Correct a record (PUT /performance/{recordId})
UPDATE performance SET revenue = :revenue, ticketsSold = :ticketsSold, screenings = :screenings
WHERE recordId = :recordId;

-- Q6 Delete a record (DELETE /performance/{recordId})
DELETE FROM performance WHERE recordId = :recordId;

-- Q7 Weeks that have data (GET /reports/weeks)
SELECT DISTINCT weekStart, isoWeek FROM performance ORDER BY weekStart DESC;

-- Q8 Weekly report (GET /reports/weekly?weekStart=). To filter by an ISO week label such as
-- 2026-W40, use WHERE isoWeek = :isoWeek instead. A week with no data returns zero rows (empty list, not an error).
SELECT movieId, title, revenue, previousRevenue, difference, percentChange,
       ticketsSold, screenings, screeningStatus
FROM v_weekly_report WHERE weekStart = :weekStart ORDER BY revenue DESC;

-- Q9 Weekly summary: total, best movie (GET /reports/weekly)
SELECT (SELECT sum(revenue) FROM performance WHERE weekStart = :weekStart) AS totalRevenue,
       (SELECT title FROM v_weekly_report WHERE weekStart = :weekStart ORDER BY revenue DESC LIMIT 1) AS bestMovie;

-- Q10 Revenue trend (GET /reports/charts/revenue-trend)
SELECT m.movieId, m.title, p.weekStart, p.revenue
FROM performance p JOIN movies m ON m.movieId = p.movieId
WHERE p.weekStart BETWEEN :fromWeek AND :toWeek ORDER BY m.title, p.weekStart;

-- Q11 Review flags for a week with thresholds passed by the API (GET /management/review-flags)
SELECT r.movieId, r.title, r.revenue, r.previousRevenue, r.percentChange,
       CASE WHEN r.revenue < :minRevenue THEN 'BELOW_MIN_REVENUE' ELSE 'SHARP_DROP' END AS reason
FROM v_weekly_report r JOIN movies m ON m.movieId = r.movieId
WHERE r.weekStart = :weekStart AND m.screeningStatus <> 'ended'
  AND (r.revenue < :minRevenue OR r.percentChange <= -:dropPercent);

-- Q12 Extend screening (POST /movies/{movieId}/screening/extend)
UPDATE movies SET screeningStatus = 'extended', extendedWeeks = extendedWeeks + :weeks
WHERE movieId = :movieId AND screeningStatus <> 'ended';

-- Q13 End screening (POST /movies/{movieId}/screening/end)
UPDATE movies SET screeningStatus = 'ended' WHERE movieId = :movieId;
