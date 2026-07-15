import { supabaseRestGet } from './lib/supabaseAdminFetch.js';
async function test() {
  const phone = '9999999999';
  const path = `/rest/v1/vendors?contact_number=in.(${encodeURIComponent(phone)},91${encodeURIComponent(phone)})&select=id,name&limit=1`;
  console.log('Querying:', path);
  try {
    const data = await supabaseRestGet(path);
    console.log('Result:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
