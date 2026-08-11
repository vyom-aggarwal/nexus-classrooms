/**
 * Creates the application database on the local `prisma dev` Postgres server.
 *
 * Postgres copies new databases from `template1` by default. Anything that ever
 * gets applied to `template1` is silently inherited by every database created
 * afterwards — which produces a confusing "type already exists" failure on the
 * very first migration. Creating from the pristine `template0` avoids that.
 */
import pg from "pg";

const HOST = process.env.PRISMA_DEV_HOST ?? "localhost";
const PORT = process.env.PRISMA_DEV_PORT ?? "51214";
const DB_NAME = process.env.PRISMA_DEV_DB ?? "nexus";

const url = (db) => `postgres://postgres:postgres@${HOST}:${PORT}/${db}?sslmode=disable`;

const admin = new pg.Client({ connectionString: url("postgres") });

try {
  await admin.connect();
} catch (err) {
  console.error(
    `Could not reach Postgres at ${HOST}:${PORT}. Run \`npm run db:start\` first.\n${err.message}`,
  );
  process.exit(1);
}

const { rows } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);

if (rows.length > 0) {
  console.log(`Database "${DB_NAME}" already exists — leaving it alone.`);
} else {
  await admin.query(`CREATE DATABASE "${DB_NAME}" TEMPLATE template0`);
  console.log(`Created database "${DB_NAME}" from template0.`);
}

await admin.end();

console.log(`\nSet this in .env:\n  DATABASE_URL="${url(DB_NAME)}"`);
