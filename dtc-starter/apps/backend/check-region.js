const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.cfautecietvchjeulwwz:Jokerrefundsk5@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
  });
  await client.connect();

  const regionRes = await client.query("SELECT * FROM region");
  console.log('Regions:', regionRes.rows);

  const rcRes = await client.query("SELECT * FROM region_country");
  console.log('Region Countries:', rcRes.rows);
  
  await client.end();
}

run().catch(console.error);
