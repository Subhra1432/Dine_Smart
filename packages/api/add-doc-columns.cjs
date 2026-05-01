// Direct SQL migration to add document URL columns
const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    connectionString: 'postgresql://postgres.twlkxfxkvamqdoozuqap:Situ8658809082@aws-1-ap-south-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected to database');

  const queries = [
    `ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "panCardUrl" TEXT`,
    `ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "gstBillUrl" TEXT`,
    `ALTER TABLE "restaurants" ADD COLUMN IF NOT EXISTS "registrationCertUrl" TEXT`,
  ];

  for (const q of queries) {
    try {
      await client.query(q);
      console.log('✅', q.substring(0, 60));
    } catch (err) {
      console.log('⚠️ Skipped:', err.message);
    }
  }

  await client.end();
  console.log('Migration complete');
}

migrate().catch(console.error);
