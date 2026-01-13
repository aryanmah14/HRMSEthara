const db = require('./db');

async function testConnection() {
    try {
        console.log('Testing connection to:', process.env.DATABASE_URL || 'Local Config');
        const res = await db.query('SELECT NOW()');
        console.log('✅ Connection Successful!');
        console.log('Current Timestamp from DB:', res.rows[0].now);

        // Check tables
        const tables = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables found:', tables.rows.map(t => t.table_name).join(', '));

        process.exit(0);
    } catch (err) {
        console.error('❌ Connection Failed!');
        console.error(err);
        process.exit(1);
    }
}

testConnection();
