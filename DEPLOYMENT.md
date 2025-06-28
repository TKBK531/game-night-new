# 🚀 Vercel Deployment Guide

## Pre-deployment Setup

### 1. Database Setup
You'll need a hosted PostgreSQL database. Recommended providers:
- **Neon** (neon.tech) - Free tier available
- **Supabase** (supabase.com) - Free tier available  
- **Vercel Postgres** (vercel.com/storage/postgres)
- **Railway** (railway.app)

### 2. Environment Variables
Set these in your Vercel dashboard:

```env
DATABASE_URL=your_production_postgresql_url
NODE_ENV=production
```

### 3. Database Schema
After setting up your database, run:
```bash
npm run db:push
```

## Deployment Steps

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables (when prompted)
# DATABASE_URL=your_database_url
```

### Option 2: GitHub Integration
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

## File Upload Considerations

**Important**: Vercel serverless functions have limitations:
- Files are stored in `/tmp` (temporary)
- Files are deleted after function execution
- **Recommendation**: Use cloud storage for production

### Cloud Storage Options
- **Cloudinary** - Image/file hosting
- **AWS S3** - File storage
- **Vercel Blob** - Vercel's file storage

## Post-deployment Checklist

- [ ] Database connection working
- [ ] Team registration functional
- [ ] File uploads working (temporarily)
- [ ] API routes responding
- [ ] Frontend loading correctly

## Common Issues

1. **Database Connection**: Ensure DATABASE_URL is set correctly
2. **File Uploads**: Files stored in `/tmp` are temporary in serverless
3. **Environment Variables**: Set in Vercel dashboard, not in code
4. **Build Errors**: Check build logs in Vercel dashboard

## Production Recommendations

1. **Use Cloud Storage**: Replace local file storage with cloud solution
2. **Error Monitoring**: Add Sentry or similar for error tracking
3. **Database Monitoring**: Monitor connection limits
4. **CDN**: Use Vercel's built-in CDN for static assets
