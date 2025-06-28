#!/bin/bash

echo "🚀 Preparing for Vercel deployment..."

# Check TypeScript
echo "📝 Checking TypeScript..."
npm run check

# Build the project
echo "🔨 Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📋 Deployment Checklist:"
    echo "1. ✅ TypeScript check passed"
    echo "2. ✅ Build completed"
    echo "3. 🔄 Push your changes to GitHub"
    echo "4. 🌐 Deploy to Vercel"
    echo ""
    echo "🔐 Don't forget to set these environment variables in Vercel:"
    echo "   - DATABASE_URL (your Neon connection string)"
    echo "   - SESSION_SECRET (secure random string)"
    echo "   - NODE_ENV=production"
    echo ""
    echo "🎉 Ready for deployment!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi
