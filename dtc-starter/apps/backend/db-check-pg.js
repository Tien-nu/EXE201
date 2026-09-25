const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres.cfautecietvchjeulwwz:Jokerrefundsk5@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
  });
  await client.connect();

  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  const tables = res.rows.map(r => r.table_name).filter(t => t.includes('store') || t.includes('currency') || t.includes('region') || t.includes('price'));
  console.log('Tables:', tables);

  // Check currency
  const currRes = await client.query("SELECT * FROM currency");
  console.log('Currencies:', currRes.rows.map(r => r.code));
  
  await client.end();
}

run().catch(console.error);
