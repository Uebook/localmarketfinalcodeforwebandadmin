import { supabaseRestGet } from './lib/supabaseAdminFetch.js';
async function test() {
  const data = await supabaseRestGet('/rest/v1/vendors?select=id,name,contact_number,email');
  console.log(data);
}
test();
