const { Client } = require('pg');
const fs = require('fs');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
client.connect().then(async () => {
  const res = await client.query("SELECT id FROM api_key WHERE type = 'publishable' LIMIT 1;");
  if (res.rows.length > 0) {
    const key = res.rows[0].id;
    console.log("Found key: " + key);
    let env = fs.readFileSync('../storefront/.env.local', 'utf8');
    env = env.replace(/NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*/, 'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=' + key);
    fs.writeFileSync('../storefront/.env.local', env);
    console.log("Updated .env.local");
  } else {
    console.log("No publishable key found!");
  }
  client.end();
}).catch(console.error);
