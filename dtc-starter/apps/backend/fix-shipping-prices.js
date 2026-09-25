const { Client } = require('pg');

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres.cfautecietvchjeulwwz:Jokerrefundsk5@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    
    // 1. Get all shipping options
    const soRes = await client.query(`SELECT id FROM shipping_option`);
    const options = soRes.rows;

    for (const opt of options) {
      // 2. Find the price set for this shipping option
      const psRes = await client.query(`SELECT price_set_id FROM shipping_option_price_set WHERE shipping_option_id = $1`, [opt.id]);
      
      if (psRes.rows.length === 0) {
        // If no price set, create one
        const newPsId = 'pset_' + Math.random().toString(36).substring(2, 15);
        await client.query(`INSERT INTO price_set (id, created_at, updated_at) VALUES ($1, NOW(), NOW())`, [newPsId]);
        await client.query(`INSERT INTO shipping_option_price_set (shipping_option_id, price_set_id, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())`, [opt.id, newPsId]);
        
        // Insert price
        const newPriceId = 'price_' + Math.random().toString(36).substring(2, 15);
        await client.query(`INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, created_at, updated_at) VALUES ($1, $2, 'vnd', 30000, '{"value":30000,"precision":0}'::jsonb, NOW(), NOW())`, [newPriceId, newPsId]);
      } else {
        const psId = psRes.rows[0].price_set_id;
        
        // Check if a VND price exists
        const priceRes = await client.query(`SELECT id FROM price WHERE price_set_id = $1 AND currency_code = 'vnd'`, [psId]);
        
        if (priceRes.rows.length === 0) {
          const newPriceId = 'price_' + Math.random().toString(36).substring(2, 15);
          await client.query(`INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, created_at, updated_at) VALUES ($1, $2, 'vnd', 30000, '{"value":30000,"precision":0}'::jsonb, NOW(), NOW())`, [newPriceId, psId]);
        } else {
          // Update existing price
          await client.query(`UPDATE price SET amount = 30000, raw_amount = '{"value":30000,"precision":0}'::jsonb WHERE price_set_id = $1 AND currency_code = 'vnd'`, [psId]);
        }
      }
    }
    
    console.log("Successfully set VND prices for all shipping options!");
    
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.end();
  }
}

run();
