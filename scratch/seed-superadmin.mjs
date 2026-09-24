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

async function main() {
  await client.connect();
  console.log('Connected to PostgreSQL');

  const email = 'admin@katamereka.id';
  const password = 'Admin123!';
  const name = 'Super Admin Katamereka';
  const passwordHash = await bcrypt.hash(password, 10);

  const check = await client.query('SELECT * FROM users WHERE email = $1', [email]);
  if (check.rows.length > 0) {
    await client.query(
      `UPDATE users SET role = 'SUPER_ADMIN', status = 'ACTIVE', password_hash = $1 WHERE email = $2`,
      [passwordHash, email]
    );
    console.log('Updated existing user admin@katamereka.id to SUPER_ADMIN with password Admin123!');
  } else {
    await client.query(
      `INSERT INTO users (id, name, email, password_hash, role, status, email_verified_at, created_at, updated_at) 
       VALUES (gen_random_uuid(), $1, $2, $3, 'SUPER_ADMIN', 'ACTIVE', NOW(), NOW(), NOW())`,
      [name, email, passwordHash]
    );
    console.log('Created new user admin@katamereka.id as SUPER_ADMIN with password Admin123!');
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  client.end();
});
