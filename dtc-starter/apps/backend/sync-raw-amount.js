const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.cfautecietvchjeulwwz:Jokerrefundsk5@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Sync raw_amount with amount for all prices where raw_amount might be missing or mismatched
    await client.query(`
      UPDATE price 
      SET raw_amount = jsonb_build_object('value', amount, 'precision', 0)
    `);
    
    console.log("Successfully synced raw_amount for all prices!");
    
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

run();
