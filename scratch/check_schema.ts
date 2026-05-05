
import { createClient } from './src/auth/supabase/server';

async function checkSchema() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from('stories').select('*').limit(1);
        if (error) {
            console.error('Error fetching story:', error);
            return;
        }
        if (data && data.length > 0) {
            console.log('Columns in stories table:', Object.keys(data[0]));
        } else {
            console.log('Stories table is empty, could not determine columns from select *');
        }
    } catch (e) {
        console.error('Exception:', e);
    }
}

checkSchema();
