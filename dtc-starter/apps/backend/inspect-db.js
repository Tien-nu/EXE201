const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  const storeRes = await client.query("SELECT * FROM store LIMIT 1");
  console.log('Store:', storeRes.rows[0]);

  const currencyRes = await client.query("SELECT * FROM store_currency");
  console.log('Store Currencies:', currencyRes.rows);

  const regionRes = await client.query("SELECT * FROM region LIMIT 1");
  console.log('Region:', regionRes.rows[0]);
  
  await client.end();
}

run().catch(console.error);
