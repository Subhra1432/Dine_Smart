const { Client } = require('pg');
const client = new Client({
  connectionString: "postgresql://postgres.twlkxfxkvamqdoozuqap:Situ8658809082@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require",
});
async function alter() {
  await client.connect();
  try {
    await client.query('ALTER TABLE branches ADD COLUMN "autoPreparation" BOOLEAN DEFAULT true;');
    console.log('Added autoPreparation');
  } catch(e) { console.error(e.message); }
  
  try {
    await client.query('ALTER TABLE restaurants ADD COLUMN "panCard" TEXT;');
    console.log('Added panCard');
  } catch(e) { console.error(e.message); }
  
  try {
    await client.query('ALTER TABLE restaurants ADD COLUMN "gstBill" TEXT;');
    console.log('Added gstBill');
  } catch(e) { console.error(e.message); }
  
  try {
    await client.query('ALTER TABLE restaurants ADD COLUMN "address" TEXT;');
    console.log('Added address');
  } catch(e) { console.error(e.message); }
  
  await client.end();
}
alter();
