import { supabaseRestGet } from './lib/supabaseAdminFetch.js';
async function test() {
  const data = await supabaseRestGet('/rest/v1/vendor_quotations?select=*');
  console.log(data);
}
test();
