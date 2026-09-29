const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  const storeRes = await client.query("SELECT id FROM store LIMIT 1");
  const storeId = storeRes.rows[0]?.id;

  if (storeId) {
    await client.query("DELETE FROM store_currency WHERE store_id = $1", [storeId]);
    await client.query("INSERT INTO store_currency (id, store_id, currency_code, is_default, created_at, updated_at) VALUES ('stocur_vnd123', $1, 'vnd', true, now(), now())", [storeId]);
  }

  const regionRes = await client.query("SELECT id FROM region LIMIT 1");
  const regionId = regionRes.rows[0]?.id;

  if (regionId) {
    await client.query("UPDATE region SET currency_code = 'vnd', name = 'Vietnam' WHERE id = $1", [regionId]);
    await client.query("DELETE FROM region_country WHERE region_id = $1", [regionId]);
    await client.query("INSERT INTO region_country (region_id, iso_2, iso_3, num_code, name, display_name, created_at, updated_at) VALUES ($1, 'vn', 'vnm', 704, 'Vietnam', 'Vietnam', now(), now())", [regionId]);
  }
  
  console.log("Database updated successfully to VND.");
  await client.end();
}

run().catch(console.error);
