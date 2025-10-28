#!/bin/bash
# build.sh - Netlify build script to inject environment variables

echo "Starting build process..."
echo "TURSO_URL: $TURSO_URL"
echo "TURSO_TOKEN: ${TURSO_TOKEN:0:20}..." # Show first 20 chars for security

# Create config.js with environment variables
cat > config.js << EOF
// config.js - Generated at build time with environment variables
window.DB_CONFIG = {
    url: "$TURSO_URL",
    authToken: "$TURSO_TOKEN"
};
EOF

echo "config.js created successfully"
echo "Build complete - config.js generated with environment variables"
