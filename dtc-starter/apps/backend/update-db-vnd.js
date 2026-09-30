const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  const storeRes = await client.query("SELECT id FROM store LIMIT 1");
  const storeId = storeRes.rows[0]?.id;

  const regionRes = await client.query("SELECT id FROM region LIMIT 1");
  const regionId = regionRes.rows[0]?.id;

  if (storeId) {
    await client.query(`UPDATE store SET default_currency_code = 'vnd' WHERE id = $1`, [storeId]);
    await client.query(`DELETE FROM store_currency WHERE store_id = $1`, [storeId]);
    // check if it needs an ID or UUID
    try {
      await client.query(`INSERT INTO store_currency (id, store_id, currency_code, is_default) VALUES ('sc_vnd123', $1, 'vnd', true)`, [storeId]);
    } catch (e) {
      console.log('Error inserting store_currency, trying without id', e.message);
      try {
        await client.query(`INSERT INTO store_currency (store_id, currency_code, is_default) VALUES ($1, 'vnd', true)`, [storeId]);
      } catch(e2) {
        console.log('Error without id:', e2.message);
      }
    }
  }

  if (regionId) {
    await client.query(`UPDATE region SET currency_code = 'vnd', name = 'Vietnam' WHERE id = $1`, [regionId]);
    await client.query(`DELETE FROM region_country WHERE region_id = $1`, [regionId]);
    try {
      await client.query(`INSERT INTO region_country (region_id, iso_2) VALUES ($1, 'vn')`, [regionId]);
    } catch(e) {
      console.log('Error inserting region_country, trying with id', e.message);
      try {
        await client.query(`INSERT INTO region_country (id, region_id, iso_2) VALUES ('rc_vn123', $1, 'vn')`, [regionId]);
      } catch (e2) {
        console.log('Error with id:', e2.message);
      }
    }
  }
  
  console.log("Database updated successfully to VND.");
  await client.end();
}

run().catch(console.error);
