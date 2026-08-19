const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAccount() {
  const { data, error } = await supabase.from('social_accounts').select('*').eq('network', 'Instagram').order('created_at', { ascending: false });
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Found Instagram Accounts:", data.length);
    data.forEach(acc => {
      console.log(`- Handle: ${acc.account_handle}, Brand: ${acc.brand_name}, Connected At: ${acc.created_at}`);
    });
  }
}
checkAccount();
