// fetch is global in Node 18+

async function testLogin(phone, password) {
    const testData = {
        phone: phone,
        password: password
    };

    console.log("Testing login with data:", JSON.stringify(testData, null, 2));

    try {
        const response = await fetch('http://localhost:3000/api/vendor/auth/login', {
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

// Test with the vendor we just created
const phone = process.argv[2] || "9990161200";
const password = process.argv[3] || "password123";

testLogin(phone, password);
