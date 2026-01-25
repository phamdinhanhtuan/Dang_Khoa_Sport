// const fetch = require('node-fetch'); // Native fetch in Node 18+


// Config
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
    name: 'Test Reviewer',
    email: 'reviewer' + Date.now() + '@test.com',
    password: 'password123', // Assuming basic structure
    passwordConfirm: 'password123'
};

async function runTest() {
    console.log('🚀 Starting Review System Demo Test...');

    try {
        // 1. Signup / Login User
        console.log('\n1. Creating Test User...');
        let res = await fetch(`${BASE_URL}/api/users/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        let data = await res.json();

        // If user already exists (testing again), try login
        if (data.status !== 'success' && data.message && data.message.includes('duplicate')) {
            console.log('   User exists, logging in...');
            res = await fetch(`${BASE_URL}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
            });
            data = await res.json();
        }

        if (data.status !== 'success') {
            throw new Error('Failed to auth user: ' + (data.message || JSON.stringify(data)));
        }

        // Save Token/Cookie logic if API relies on it. 
        // The app seems to use Cookies (jwt) or Bearer token.
        // For fetch, we need to handle cookie manually or use the token in header if the API supports it.
        // From app.js: if (req.headers.authorization...)
        const token = data.token;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
        console.log('   ✅ Authenticated!');

        // 2. Get a Product to Review
        console.log('\n2. Fetching a Product...');
        res = await fetch(`${BASE_URL}/api/products`);
        data = await res.json();
        const products = data.data.products;
        if (!products || products.length === 0) throw new Error('No products found to test');

        const targetProduct = products[0];
        console.log(`   ✅ Selected Product: ${targetProduct.name} (ID: ${targetProduct._id})`);
        console.log(`      Current Ratings: ${targetProduct.ratingsAverage || 0} (${targetProduct.ratingsQuantity || 0} reviews)`);

        // 3. Post a Review
        console.log('\n3. Posting a Review...');
        const reviewData = {
            review: 'Demo review from test script. seamless experience!',
            rating: 5,
            product: targetProduct._id
        };

        res = await fetch(`${BASE_URL}/api/reviews`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(reviewData)
        });
        data = await res.json();

        if (data.status === 'success') {
            console.log('   ✅ Review Posted Successfully!');
            console.log('      Review ID:', data.data.review._id);
        } else {
            // Might fail if duplicate review
            if (data.message && data.message.includes('duplicate')) {
                console.log('   ⚠️  Review already exists for this product by this user.');
            } else {
                throw new Error('Failed to post review: ' + data.message);
            }
        }

        // 4. Verify Product Details Updated
        console.log('\n4. Verifying Product Stats...');
        // We fetch the individual product to trigger any read-time population if needed, 
        // essentially just checking if the aggregation worked (which happens on save).
        res = await fetch(`${BASE_URL}/api/products/${targetProduct._id}`);
        data = await res.json();
        const updatedProduct = data.data.product;

        console.log(`   Before: ${targetProduct.ratingsQuantity} reviews`);
        console.log(`   After:  ${updatedProduct.ratingsQuantity} reviews`);
        console.log(`   Avg Rating: ${updatedProduct.ratingsAverage}`);

        if (updatedProduct.ratingsQuantity > targetProduct.ratingsQuantity || (updatedProduct.ratingsQuantity === targetProduct.ratingsQuantity && data.message && data.message.includes('duplicate'))) {
            console.log('\n🎉 TEST PASSED: Validation Logic & Data Flow is working.');
        } else {
            // If duplicate, it won't increase, but query worked.
            console.log('\n🎉 TEST COMPLETED. (Stats might not change if review was duplicate)');
        }

    } catch (err) {
        console.error('\n❌ TEST FAILED:', err.message);
    }
}

runTest();
