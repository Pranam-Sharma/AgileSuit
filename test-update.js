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

async function testUpdate() {
    console.log('Testing UPDATE on retrospective_items...');

    // Use the ID found in previous step
    const itemId = 'bc7389ff-7fed-4a6f-a041-e36c1e2a9d1a';

    // 1. Fetch current
    const { data: current, error: fetchError } = await supabase
        .from('retrospective_items')
        .select('*')
        .eq('id', itemId)
        .single();

    if (fetchError) {
        console.error('Fetch failed:', fetchError);
        return;
    }

    console.log('Current Position:', current.position);

    const newPos = (current.position === 999) ? 100 : 999;
    console.log(`Attempting to update position to ${newPos}...`);

    // 2. Update
    const { data: updated, error: updateError } = await supabase
        .from('retrospective_items')
        .update({ position: newPos })
        .eq('id', itemId)
        .select()
        .single();

    if (updateError) {
        console.error('❌ UPDATE FAILED:', updateError);
    } else {
        console.log('✅ UPDATE SUCCESS. New Position:', updated.position);
    }

    // 3. Upsert Test (since we use upsert in the app)
    console.log('Testing UPSERT...');
    const upsertPayload = {
        id: itemId,
        position: 500, // Arbitrary
        column_id: current.column_id,
        content: current.content
    };

    const { data: upsertData, error: upsertError } = await supabase
        .from('retrospective_items')
        .upsert([upsertPayload])
        .select()
        .single();

    if (upsertError) {
        console.error('❌ UPSERT FAILED:', upsertError);
    } else {
        console.log('✅ UPSERT SUCCESS. New Position:', upsertData.position);
    }
}

testUpdate();
