// fetch is global in Node 18+

async function testRegistration() {
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const testData = {
        businessName: "Test Shop " + randomSuffix,
        ownerName: "Test Owner",
        category: "Grocery",
        mobile: "999" + randomSuffix.toString().padStart(7, '0'),
        password: "password123",
        city: "Amritsar",
        state: "Punjab",
        address: "123 Test Street",
        pincode: "143001"
    };

    console.log("Testing registration with data:", JSON.stringify(testData, null, 2));

    try {
        const response = await fetch('http://localhost:3000/api/vendor/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        const result = await response.json();
        console.log("Status:", response.status);
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error:", error.message);
    }
}

testRegistration();
