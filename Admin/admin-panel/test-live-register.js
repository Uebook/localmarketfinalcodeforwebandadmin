async function test() {
  const url = 'https://admin.lokall.in/api/vendor/auth/register';
  // Generate a random phone number that definitely does not exist
  const randomPhone = '9' + Math.floor(100000000 + Math.random() * 900000000);
  console.log('Testing registration with random unused phone number:', randomPhone);
  
  const payload = {
    businessName: 'Temporary Test Shop',
    ownerName: 'Test Owner',
    category: 'Grocery',
    mobile: randomPhone,
    email: `test_v_${randomPhone}@example.com`,
    password: 'password123',
    address: '123 Test Street',
    state: 'Punjab',
    city: 'Amritsar',
    area: 'NORTH CIRCLE',
    circle: 'RANJIT AVENUE C BLOCK',
    pincode: '143001',
    latitude: 31.634,
    longitude: 74.8723,
    idProofUrl: 'https://example.com/id.jpg',
    businessPhotoUrl: 'https://example.com/shop.jpg',
    shopDocumentUrl: 'https://example.com/kyc.jpg'
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log('Status Code:', res.status);
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}
test();
