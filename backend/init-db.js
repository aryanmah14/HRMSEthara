const db = require('./db');
const fs = require('fs');
const path = require('path');

async function initDb() {
    try {
        console.log('Reading schema.sql...');
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

        console.log('Executing schema...');
        await db.query(schema);

        console.log('✅ Database Initialized Successfully!');

        // Verify tables again
        const tables = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables now present:', tables.rows.map(t => t.table_name).join(', '));

        process.exit(0);
    } catch (err) {
        console.error('❌ Initialization Failed!');
        console.error(err);
        process.exit(1);
    }
}

initDb();
