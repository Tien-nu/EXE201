const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  await client.query("TRUNCATE TABLE cart CASCADE;");
  
  console.log("Deleted all carts.");
  await client.end();
}

run().catch(console.error);
