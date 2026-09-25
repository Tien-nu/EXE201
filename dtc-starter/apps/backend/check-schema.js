const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.cfautecietvchjeulwwz:Jokerrefundsk5@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // Check table schemas
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE '%shipping%';
    `);
    
    console.log(res.rows.map(r => r.column_name).join(', '));
    
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

run();
