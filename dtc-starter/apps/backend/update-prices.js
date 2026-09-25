const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.cfautecietvchjeulwwz:Jokerrefundsk5@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    console.log("Updating prices to be under 200k...");
    
    // Set amount between 99000 and 199000 randomly
    const result = await client.query(`
      UPDATE price 
      SET amount = FLOOR(RANDOM() * 101 + 99) * 1000
    `);
    
    console.log(`Successfully updated ${result.rowCount} prices.`);
    
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

run();
