/**
 * Test script for license integration in AutoPurge extension
 * This script tests the license manager functionality
 */

// Test license activation with known good license key
async function testLicenseActivation() {
    console.log('=== Testing License Activation ===');

    const testLicenseKey = 'AP-2025-1NBO59'; // Known active license from backend

    try {
        // Test direct license manager call
        const licenseManager = new LicenseManager();
        await licenseManager.initialize();

        console.log('License manager initialized successfully');

        // Test activation
        console.log('Testing license activation with key:', testLicenseKey);
        const result = await licenseManager.activateLicense(testLicenseKey);

        console.log('Activation result:', result);

        // Test verification
        console.log('Testing license verification...');
        const verification = await licenseManager.verifyLicense();

        console.log('Verification result:', verification);

        // Test getting license info
        console.log('Testing license info retrieval...');
        const info = await licenseManager.getLicenseInfo();

        console.log('License info:', info);

        return true;
    } catch (error) {
        console.error('License activation test failed:', error);
        return false;
    }
}

// Test checkout creation
async function testCheckoutCreation() {
    console.log('=== Testing Checkout Creation ===');

    try {
        const licenseManager = new LicenseManager();
        await licenseManager.initialize();

        const checkoutUrl = await licenseManager.createCheckout('test@example.com');
        console.log('Checkout URL created:', checkoutUrl);

        return true;
    } catch (error) {
        console.error('Checkout creation test failed:', error);
        return false;
    }
}

// Test license verification with invalid token
async function testInvalidLicense() {
    console.log('=== Testing Invalid License ===');

    try {
        const licenseManager = new LicenseManager();
        await licenseManager.initialize();

        // Test with invalid license key
        try {
            await licenseManager.activateLicense('AP-2025-INVALID');
            console.error('Should have failed with invalid license');
            return false;
        } catch (error) {
            console.log('Correctly rejected invalid license:', error.message);
        }

        return true;
    } catch (error) {
        console.error('Invalid license test failed:', error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('Starting license integration tests...');

    const tests = [
        { name: 'License Activation', test: testLicenseActivation },
        { name: 'Checkout Creation', test: testCheckoutCreation },
        { name: 'Invalid License', test: testInvalidLicense }
    ];

    const results = [];

    for (const { name, test } of tests) {
        console.log(`\n--- Running ${name} Test ---`);
        try {
            const result = await test();
            results.push({ name, passed: result });
            console.log(`✅ ${name}: ${result ? 'PASSED' : 'FAILED'}`);
        } catch (error) {
            console.error(`❌ ${name}: ERROR -`, error);
            results.push({ name, passed: false, error: error.message });
        }
    }

    console.log('\n=== Test Results Summary ===');
    results.forEach(({ name, passed, error }) => {
        console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'PASSED' : 'FAILED'}${error ? ` (${error})` : ''}`);
    });

    const passedCount = results.filter(r => r.passed).length;
    console.log(`\nPassed: ${passedCount}/${results.length} tests`);

    return passedCount === results.length;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.testLicenseIntegration = {
        runAllTests,
        testLicenseActivation,
        testCheckoutCreation,
        testInvalidLicense
    };
}

// Run tests if in Node.js environment
if (typeof window === 'undefined') {
    runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}