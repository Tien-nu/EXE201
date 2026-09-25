const { Client } = require('pg');

async function resetDb() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database, dropping public schema...');
    await client.query('DROP SCHEMA public CASCADE;');
    console.log('Schema dropped. Recreating public schema...');
    await client.query('CREATE SCHEMA public;');
    await client.query('GRANT ALL ON SCHEMA public TO postgres;');
    await client.query('GRANT ALL ON SCHEMA public TO public;');
    console.log('Database reset successfully.');
  } catch (error) {
    console.error('Error resetting database:', error);
  } finally {
    await client.end();
  }
}

resetDb();
