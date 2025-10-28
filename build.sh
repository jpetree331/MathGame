#!/bin/bash
# build.sh - Netlify build script to inject environment variables

# Create config.js with environment variables
cat > config.js << EOF
// config.js - Generated at build time with environment variables
window.DB_CONFIG = {
    url: "$TURSO_URL",
    authToken: "$TURSO_TOKEN"
};
EOF

echo "Build complete - config.js generated with environment variables"
