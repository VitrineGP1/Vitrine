const fetch = require('node-fetch');

async function testResetPassword() {
    try {
        const response = await fetch('http://localhost:3001/api/reset_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com'
            })
        });

        const result = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', result);
        
        if (response.status === 503) {
            console.log('✅ Success: Proper error handling for missing email config');
        } else if (response.status === 200) {
            console.log('✅ Success: Email service is configured and working');
        } else {
            console.log('❌ Unexpected response');
        }
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

console.log('Testing reset password endpoint...');
testResetPassword();