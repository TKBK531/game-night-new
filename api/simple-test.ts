import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    console.log('API endpoint hit:', req.url, req.method);

    res.status(200).json({
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        headers: req.headers,
        environment: {
            nodeEnv: process.env.NODE_ENV,
            mongoUri: process.env.MONGODB_URI ? 'configured' : 'missing',
            sessionSecret: process.env.SESSION_SECRET ? 'configured' : 'missing'
        }
    });
}
