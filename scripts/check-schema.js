const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx !== -1) {
        const key = line.substring(0, idx).trim();
        let value = line.substring(idx + 1).trim();
        value = value.replace(/^['"]|['"]$/g, '');
        env[key] = value;
    }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log('Checking retrospective_items table schema...');

    // Attempt to insert a dummy item with specific position to test column existence
    // We'll roll it back or delete it immediately.

    // First, verify we can select the position column
    const { data, error } = await supabase
        .from('retrospective_items')
        .select('id, position')
        .limit(1);

    if (error) {
        console.error('❌ SELECT Error:', error.message);
        if (error.message.includes('does not exist')) {
            console.error('CRITICAL: The position column definitely DOES NOT exist.');
        }
    } else {
        console.log('✅ SELECT "position" column successful.');
        console.log('Sample data:', data);
    }
}

checkSchema();
