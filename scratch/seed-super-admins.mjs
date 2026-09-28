// Seeds/upserts the platform's SUPER_ADMIN accounts.
// Usage: node scratch/seed-super-admins.mjs
// Reads DB connection from env vars (same names/fallbacks as src/app.module.ts).
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;

const client = new Client({
  host: process.env.DATABASE_HOST || '43.133.133.58',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'bismillah_transgo_emas',
  database: process.env.DATABASE_NAME || 'katamereka_db',
});

const SUPER_ADMINS = [
  { name: 'Zanfuu', email: 'zanfuu@katamereka.id', password: 'secret' },
  { name: 'Billyaz', email: 'billyaz@katamereka.id', password: 'secret' },
];

async function upsertSuperAdmin({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);

  const check = await client.query('SELECT id FROM users WHERE email = $1', [email]);
  if (check.rows.length > 0) {
    await client.query(
      `UPDATE users SET name = $1, role = 'SUPER_ADMIN', status = 'ACTIVE', password_hash = $2, updated_at = NOW() WHERE email = $3`,
      [name, passwordHash, email]
    );
    console.log(`Updated existing user ${email} -> SUPER_ADMIN (password: ${password})`);
  } else {
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role, status, email_verified_at, created_at, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, 'SUPER_ADMIN', 'ACTIVE', NOW(), NOW(), NOW())`,
      [name, email, passwordHash]
    );
    console.log(`Created new user ${email} as SUPER_ADMIN (password: ${password})`);
  }
}

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL');

  for (const admin of SUPER_ADMINS) {
    await upsertSuperAdmin(admin);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  client.end();
  process.exitCode = 1;
});
