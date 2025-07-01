// Production environment validation
export function validateEnvironment() {
    const requiredEnvVars = [
        'MONGODB_URI',
        'SESSION_SECRET'
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }

    // Validate MONGODB_URI format
    const mongoUri = process.env.MONGODB_URI!;
    if (!mongoUri.includes('mongodb')) {
        console.warn('⚠️  MONGODB_URI doesn\'t appear to be a valid MongoDB connection string');
    }

    // Validate SESSION_SECRET strength
    const sessionSecret = process.env.SESSION_SECRET!;
    if (sessionSecret.length < 32) {
        console.warn('⚠️  SESSION_SECRET should be at least 32 characters long');
    }

    console.log('✅ Environment validation passed');
}

// Auto-validate in production
if (process.env.NODE_ENV === 'production') {
    validateEnvironment();
}
