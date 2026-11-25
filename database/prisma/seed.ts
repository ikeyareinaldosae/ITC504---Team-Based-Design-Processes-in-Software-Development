// Dummy data. Weeks: 2026-09-07, 2026-09-14, 2026-09-21, 2026-09-28, 2026-10-05, 2026-10-12
// Run it with: npm run db:seed (from the backend folder). Running it again resets movies and weekly records to the same starting data.
import { prisma } from "../../backend/src/rose/prismaClient.js";

const movies: { movieId: number; title: string; genre: string; releaseDate: string; screeningStatus: "active" | "extended" | "ended"; extendedWeeks: number }[] = [
  { movieId: 1, title: "Midnight Harbour", genre: "Thriller", releaseDate: "2026-08-20", screeningStatus: "active", extendedWeeks: 0 },
  { movieId: 2, title: "Coral Kingdom", genre: "Animation", releaseDate: "2026-08-27", screeningStatus: "active", extendedWeeks: 0 },
  { movieId: 3, title: "The Last Ferry", genre: "Drama", releaseDate: "2026-09-03", screeningStatus: "active", extendedWeeks: 0 },
  { movieId: 4, title: "Outback Run", genre: "Action", releaseDate: "2026-09-03", screeningStatus: "extended", extendedWeeks: 2 },
  { movieId: 5, title: "Paper Lanterns", genre: "Romance", releaseDate: "2026-09-10", screeningStatus: "active", extendedWeeks: 0 },
  { movieId: 6, title: "Neon Static", genre: "Sci-Fi", releaseDate: "2026-09-17", screeningStatus: "active", extendedWeeks: 0 },
  { movieId: 7, title: "Grandma's Gold", genre: "Comedy", releaseDate: "2026-08-13", screeningStatus: "ended", extendedWeeks: 0 },
  { movieId: 8, title: "Southern Cross", genre: "Documentary", releaseDate: "2026-10-01", screeningStatus: "active", extendedWeeks: 0 },
];

const weeks = ["2026-09-07", "2026-09-14", "2026-09-21", "2026-09-28", "2026-10-05", "2026-10-12"];

// Weekly revenue per movie, in week order. null means the movie had no record that week.
const revenue: Record<number, (number | null)[]> = {
  1: [41250, 38900, 36100, 33800, 31200, 28750],
  2: [52300.5, 55120, 58900, 61250, 63400, 66800],
  3: [18400, 14200, 9800, 6100, 4300, 3200],
  4: [27800, 27150, 26900, 27400, 26800, 27050],
  5: [null, 22100, 21500, 20900, 19800, 18750],
  6: [null, null, 12400, 13100, 12950, 5100],
  7: [8200, 5600, 3900, 2400, null, null],
  8: [null, null, null, null, 9400, 9900],
};

async function main() {
  await prisma.performance.deleteMany();
  await prisma.movie.deleteMany();

  await prisma.movie.createMany({
    data: movies.map((m) => ({ ...m, releaseDate: new Date(m.releaseDate) })),
  });

  const records = Object.entries(revenue).flatMap(([id, values]) =>
    values.flatMap((value, i) =>
      value === null
        ? []
        : [{
            movieId: Number(id),
            weekStart: new Date(weeks[i]),
            revenue: value,
            // Dummy tickets and screenings derived from revenue (about 16.50 AUD per ticket)
            ticketsSold: Math.floor(value / 16.5),
            screenings: Math.max(1, Math.floor(value / 1800)),
          }],
    ),
  );
  await prisma.performance.createMany({ data: records });

  // The movies were inserted with fixed ids, so move the id counter past them.
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('movies', 'movieId'), (SELECT max("movieId") FROM movies))`;

  console.log(`Seeded ${movies.length} movies and ${records.length} weekly records.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
