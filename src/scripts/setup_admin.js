
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    const email = 'hello@sellout.ng';
    const password = 'AdminPassword123!'; // User can change this later

    console.log(`Creating/Updating admin user: ${email}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: { role: 'admin' }
    });

    if (error) {
        if (error.message.includes('already registered')) {
            console.log('Admin already exists. Updating password...');
            const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
            if (listError) throw listError;
            
            const user = listData.users.find(u => u.email === email);
            if (user) {
                const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
                    password: password
                });
                if (updateError) throw updateError;
                console.log('Password updated successfully.');
            }
        } else {
            console.error('Error creating admin:', error.message);
        }
    } else {
        console.log('Admin user created successfully.');
        console.log('Credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    }
}

createAdmin().catch(console.error);
