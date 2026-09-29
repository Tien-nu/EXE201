const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  await client.query("TRUNCATE TABLE product CASCADE;");
  
  console.log("Hard reset products successfully.");
  await client.end();
}

run().catch(console.error);
