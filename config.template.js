// Database Configuration Template
// Copy this file to config.js and replace with your actual Turso credentials

const DB_CONFIG = {
    // Replace with your actual Turso database URL
    // Example: "libsql://your-database-name.turso.io"
    url: "libsql://your-database-name.turso.io",
    
    // Replace with your actual Turso auth token
    // Get this by running: turso db tokens create your-database-name
    authToken: "your-auth-token-here"
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DB_CONFIG;
}
