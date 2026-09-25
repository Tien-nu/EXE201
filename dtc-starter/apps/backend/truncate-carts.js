const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.cfautecietvchjeulwwz:Jokerrefundsk5@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
  });
  await client.connect();

  await client.query("TRUNCATE TABLE cart CASCADE;");
  
  console.log("Deleted all carts.");
  await client.end();
}

run().catch(console.error);
