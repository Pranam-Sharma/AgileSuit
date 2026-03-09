const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient('https://juaxjuaiyicqqncdglrx.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1YXhqdWFpeWljcXFuY2RnbHJ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTUzNTA0MCwiZXhwIjoyMDgxMTExMDQwfQ.dLVKd6F7prTc7YP85yXBDlX4q4dVdLIamb4jaGhV0wk');

async function run() {
    const { data, error } = await supabaseAdmin.from('departments').select('*, lead:profiles!lead_id(id, display_name)').eq('org_id', 'rakuten');
    console.log('Error:', error);
    console.log('Result:', data);
}
run();
