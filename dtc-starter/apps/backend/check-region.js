const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  const regionRes = await client.query("SELECT * FROM region");
  console.log('Regions:', regionRes.rows);

  const rcRes = await client.query("SELECT * FROM region_country");
  console.log('Region Countries:', rcRes.rows);
  
  await client.end();
}

run().catch(console.error);
