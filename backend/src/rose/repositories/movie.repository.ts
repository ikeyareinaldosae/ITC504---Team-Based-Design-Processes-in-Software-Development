// Movie queries (Q1 to Q3b and Q12 to Q15). Owner: Rose Budha.
// One function per API operation. Every function takes an optional database client, so the
// API can pass a transaction and the tests can roll their changes back.
import { Prisma } from "@prisma/client";
import { prisma } from "../prismaClient.js";
import { day, type Db } from "../dbUtils.js";

export type MovieRow = {
  movieId: number;
  title: string;
  genre: string | null;
  releaseDate: string | null;
  screeningStatus: "active" | "extended" | "ended";
  extendedWeeks: number;
};

type RawMovie = Omit<MovieRow, "releaseDate"> & { releaseDate: Date | null };
const toMovie = (r: RawMovie): MovieRow => ({ ...r, releaseDate: day(r.releaseDate) });

const MOVIE_COLUMNS = Prisma.sql`"movieId", "title", "genre", "releaseDate", "screeningStatus"::text AS "screeningStatus", "extendedWeeks"`;

// Q1 List movies (GET /movies)
export async function listMovies(db: Db = prisma): Promise<MovieRow[]> {
  const rows = await db.$queryRaw<RawMovie[]>`SELECT ${MOVIE_COLUMNS} FROM movies ORDER BY lower("title")`;
  return rows.map(toMovie);
}

// Q2 Get one movie (GET /movies/{movieId}). Returns null when there is no such movie (404).
export async function getMovie(movieId: number, db: Db = prisma): Promise<MovieRow | null> {
  const rows = await db.$queryRaw<RawMovie[]>`SELECT ${MOVIE_COLUMNS} FROM movies WHERE "movieId" = ${movieId}`;
  return rows[0] ? toMovie(rows[0]) : null;
}

// Q3 Add movie (POST /movies). A repeated title (any letter case) throws a unique error (409).
export async function addMovie(
  input: { title: string; genre?: string | null; releaseDate?: string | null },
  db: Db = prisma,
): Promise<MovieRow> {
  const rows = await db.$queryRaw<RawMovie[]>`
    INSERT INTO movies ("title", "genre", "releaseDate")
    VALUES (${input.title}, ${input.genre ?? null}, ${input.releaseDate ?? null}::date)
    RETURNING ${MOVIE_COLUMNS}`;
  return toMovie(rows[0]);
}

// Q3b Find a movie id by name (the input page sends the movie name). Null means 404.
export async function findMovieIdByTitle(title: string, db: Db = prisma): Promise<number | null> {
  const rows = await db.$queryRaw<{ movieId: number }[]>`SELECT "movieId" FROM movies WHERE lower("title") = lower(${title})`;
  return rows[0]?.movieId ?? null;
}

// Q12 Extend screening (POST /movies/{movieId}/screening/extend). Returns null when the movie is missing or ended.
export async function extendScreening(movieId: number, weeks: number, db: Db = prisma): Promise<MovieRow | null> {
  const rows = await db.$queryRaw<RawMovie[]>`
    UPDATE movies SET "screeningStatus" = 'extended', "extendedWeeks" = "extendedWeeks" + ${weeks}
    WHERE "movieId" = ${movieId} AND "screeningStatus" <> 'ended'
    RETURNING ${MOVIE_COLUMNS}`;
  return rows[0] ? toMovie(rows[0]) : null;
}

// Q13 End screening (POST /movies/{movieId}/screening/end). Returns null when there is no such movie.
export async function endScreening(movieId: number, db: Db = prisma): Promise<MovieRow | null> {
  const rows = await db.$queryRaw<RawMovie[]>`
    UPDATE movies SET "screeningStatus" = 'ended' WHERE "movieId" = ${movieId} RETURNING ${MOVIE_COLUMNS}`;
  return rows[0] ? toMovie(rows[0]) : null;
}

// Q14 Update a movie (PUT /movies/{movieId}, proposed). A repeated title throws a unique error (409).
export async function updateMovie(
  movieId: number,
  input: { title: string; genre?: string | null; releaseDate?: string | null },
  db: Db = prisma,
): Promise<MovieRow | null> {
  const rows = await db.$queryRaw<RawMovie[]>`
    UPDATE movies SET "title" = ${input.title}, "genre" = ${input.genre ?? null}, "releaseDate" = ${input.releaseDate ?? null}::date
    WHERE "movieId" = ${movieId}
    RETURNING ${MOVIE_COLUMNS}`;
  return rows[0] ? toMovie(rows[0]) : null;
}

// Q15 Delete a movie and, through ON DELETE CASCADE, its weekly records (DELETE /movies/{movieId}, proposed).
// Returns false when there is no such movie (404).
export async function deleteMovie(movieId: number, db: Db = prisma): Promise<boolean> {
  const n = await db.$executeRaw`DELETE FROM movies WHERE "movieId" = ${movieId}`;
  return n > 0;
}
