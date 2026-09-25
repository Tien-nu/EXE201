const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.cfautecietvchjeulwwz:Jokerrefundsk5@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
  });
  await client.connect();

  const regionRes = await client.query("SELECT id FROM region LIMIT 1");
  const regionId = regionRes.rows[0]?.id;

  if (regionId) {
    await client.query("UPDATE region_country SET region_id = null WHERE region_id = $1", [regionId]);
    await client.query("UPDATE region_country SET region_id = $1 WHERE iso_2 = 'vn'", [regionId]);
  }
  
  console.log("Database updated successfully to link Vietnam country to region.");
  await client.end();
}

run().catch(console.error);
