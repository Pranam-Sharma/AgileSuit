const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Manually load .env.local to avoid needing 'dotenv' package
console.log('Loading .env.local...');
const envPath = path.resolve(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
    console.error('ERROR: .env.local file not found!');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    // Split by first = only
    const idx = line.indexOf('=');
    if (idx !== -1) {
        const key = line.substring(0, idx).trim();
        let value = line.substring(idx + 1).trim();
        // Remove quotes if present
        value = value.replace(/^['"]|['"]$/g, '');
        env[key] = value;
    }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('ERROR: Missing keys in .env.local');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? 'Found' : 'MISSING');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? 'Found' : 'MISSING');
    process.exit(1);
}

// 2. Initialize Supabase
console.log('Connecting to Supabase...');
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkTables() {
    try {
        console.log('\n--- ORGANIZATIONS TABLE ---');
        const { data: orgs, error: orgError } = await supabase.from('organizations').select('*');
        if (orgError) throw orgError;
        console.table(orgs);

        console.log('\n--- SUBSCRIPTIONS TABLE ---');
        const { data: subs, error: subError } = await supabase.from('subscriptions').select('*');
        if (subError) throw subError;
        console.table(subs);

        console.log('\n--- USERS (Profiles) ---');
        const { data: profiles, error: profError } = await supabase.from('profiles').select('*');
        if (profError) throw profError;
        console.table(profiles);

        console.log('\nConnection Successful! Your keys are working.');

    } catch (error) {
        console.error('FAILED to fetch data:', error.message);
        console.error('This likely means your API Key is invalid.');
    }
}

checkTables();
