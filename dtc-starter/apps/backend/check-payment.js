const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.cfautecietvchjeulwwz:Jokerrefundsk5@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
  });
  await client.connect();

  const regionRes = await client.query("SELECT id FROM region LIMIT 1");
  const regionId = regionRes.rows[0]?.id;

  if (regionId) {
    const ppRes = await client.query("SELECT payment_provider_id FROM region_payment_provider WHERE region_id = $1", [regionId]);
    console.log('Payment providers for region:', ppRes.rows.map(r => r.payment_provider_id));
  }

  await client.end();
}

run().catch(console.error);
