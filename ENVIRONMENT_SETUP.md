# Environment Setup Guide

## Database Credentials
Your Turso database credentials have been configured in `script.js`:

- **Database URL**: `libsql://timestablesv2-jpetree331.aws-us-east-1.turso.io`
- **Auth Token**: Configured and ready to use

## Security Notes
- The `.gitignore` file has been created to prevent sensitive files from being committed
- Database credentials are currently in `script.js` for easy setup
- For production deployments, consider moving credentials to environment variables

## Files Created
- `.gitignore` - Prevents sensitive files from being committed to Git
- `config.example.js` - Template for future configuration

## Next Steps
1. Your app is ready to use with the configured database
2. Open `index.html` in your browser to start playing
3. The database tables will be created automatically on first use

## Testing the Connection
1. Open the browser console (F12)
2. Look for "Database initialized successfully" message
3. If you see any errors, check the console for details

Your times table practice app is now fully configured and ready to track student progress!
