// Production environment validation
export function validateEnvironment() {
    const requiredEnvVars = [
        'DATABASE_URL',
        'SESSION_SECRET'
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }

    // Validate DATABASE_URL format for Neon
    const dbUrl = process.env.DATABASE_URL!;
    if (!dbUrl.includes('neon.tech') && !dbUrl.includes('localhost')) {
        console.warn('⚠️  DATABASE_URL doesn\'t appear to be a Neon database URL');
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
