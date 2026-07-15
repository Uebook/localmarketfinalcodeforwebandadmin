import { supabaseRestGet } from './lib/supabaseAdminFetch.js';
async function test() {
  try {
    const data = await supabaseRestGet('/rest/v1/vendors?select=id,name,contact_number,email');
    console.log('Total vendors in database:', data.length);
    console.log('List of all contact numbers:');
    data.forEach(v => {
      console.log(`- ID: ${v.id} | Name: ${v.name} | Phone: ${v.contact_number} | Email: ${v.email}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
