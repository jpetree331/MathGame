#!/bin/bash
# setup-env.sh - Quick setup script for environment variables

echo "🔧 Math Game Environment Setup"
echo "================================"

echo ""
echo "📋 Frontend Environment Variables (for Netlify):"
echo "REACT_APP_API_URL = https://your-railway-url.up.railway.app/api"
echo "TURSO_URL = libsql://your-database-name.turso.io"
echo "TURSO_TOKEN = your-auth-token-here"

echo ""
echo "📋 Backend Environment Variables (for Railway):"
echo "TURSO_URL = libsql://your-database-name.turso.io"
echo "TURSO_TOKEN = your-auth-token-here"
echo "PORT = 3000"

echo ""
echo "🚀 Next Steps:"
echo "1. Deploy backend to Railway"
echo "2. Get Railway URL"
echo "3. Update REACT_APP_API_URL in Netlify with Railway URL"
echo "4. Redeploy frontend"

echo ""
echo "✅ Setup complete! Check ENVIRONMENT_SETUP.md for detailed instructions."
