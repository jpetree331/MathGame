#!/bin/bash
# build.sh - Netlify build script to inject environment variables

echo "Starting build process..."
echo "TURSO_URL: $TURSO_URL"
echo "TURSO_TOKEN: ${TURSO_TOKEN:0:20}..." # Show first 20 chars for security
echo "REACT_APP_API_URL: $REACT_APP_API_URL"

# Create config.js with environment variables
cat > config.js << EOF
// config.js - Generated at build time with environment variables
window.DB_CONFIG = {
    url: "$TURSO_URL",
    authToken: "$TURSO_TOKEN"
};

// Set API URL from environment variable
window.API_BASE_URL = "$REACT_APP_API_URL" || 'http://localhost:3000/api';

console.log('Environment API URL:', "$REACT_APP_API_URL");
console.log('Final API URL:', window.API_BASE_URL);
EOF

echo "config.js created successfully"
echo "Build complete - config.js generated with environment variables"
