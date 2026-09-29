const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  await client.query("UPDATE price SET amount = amount * 10000 WHERE currency_code = 'vnd' AND amount < 1000");
  
  console.log("Prices adjusted to realistic VND values.");
  await client.end();
}

run().catch(console.error);
