const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.cfautecietvchjeulwwz:Jokerrefundsk5@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
  });
  await client.connect();

  const regionRes = await client.query("SELECT id FROM region LIMIT 1");
  const regionId = regionRes.rows[0]?.id;

  if (regionId) {
    const spRes = await client.query("SELECT id FROM shipping_profile LIMIT 1");
    const profileId = spRes.rows[0]?.id;

    if (profileId) {
      console.log('Region ID:', regionId);
      console.log('Profile ID:', profileId);

      // Check existing shipping options for this region
      const existingOptions = await client.query("SELECT id FROM shipping_option WHERE region_id = $1", [regionId]);
      console.log(`Existing shipping options for region: ${existingOptions.rowCount}`);
    }
  }

  await client.end();
}

run().catch(console.error);
