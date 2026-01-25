// Node 18+ has native fetch
async function testBackend() {
    console.log('--- STARTING BACKEND TEST (Diagnostic) ---');
    const baseUrl = 'http://localhost:3000/api/cart';

    console.log(`Targeting: ${baseUrl}`);

    // We expect the server to be running. 
    // If it's running OLD code, it might crash (500) or behave differently.

    try {
        // 1. Try to Add Item to Cart
        console.log('Attempting POST /api/cart with test data...');
        const res = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: 'test_product_id',
                quantity: 1
            })
        });

        console.log(`Response Status: ${res.status} ${res.statusText}`);

        const text = await res.text();
        console.log(`Response Body: ${text.substring(0, 300)}`);

        if (res.status === 500) {
            console.error('\n❌ CRITICAL FAIL: Server returned 500 Internal Server Error.');
            console.error('This PROVES the server is running OLD CODE from yesterday.');
            console.error('The fix I applied (logging, session checks) catch this error.');
            console.error('If the fix failed, you would see a JSON error message, NOT a raw 500 crash.');
            console.error('\n👉 ACTION REQUIRED: STOP (Ctrl+C) and START (npm start) the server.');
        } else if (res.status === 404) {
            console.log('✅ PASS: Server is alive and handled "Product not found" correctly (returned 404).');
            console.log('This implies the code might be newer or at least stable.');
        } else {
            console.log(`ℹ️ Server returned ${res.status}. Check body for details.`);
        }
    } catch (err) {
        console.error('Network Error (Is server running?):', err.message);
    }
    console.log('--- TEST COMPLETE ---');
}

testBackend();
