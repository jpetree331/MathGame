# Environment Variables Setup

This document explains how to set up environment variables for both the frontend (Netlify) and backend (Railway).

## Frontend Environment Variables (Netlify)

### Required Variables

1. **REACT_APP_API_URL**
   - **Description**: URL of your Railway backend API
   - **Example**: `https://math-game-backend-production.up.railway.app/api`
   - **Default**: `http://localhost:3000/api` (for local development)

2. **TURSO_URL** (Optional - for direct database access)
   - **Description**: Turso database URL
   - **Example**: `libsql://timestablesv2-jpetree331.aws-us-east-1.turso.io`

3. **TURSO_TOKEN** (Optional - for direct database access)
   - **Description**: Turso authentication token
   - **Example**: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...`

### How to Set in Netlify

1. **Go to your Netlify site dashboard**
2. **Site Settings → Environment Variables**
3. **Add the following variables**:

```
REACT_APP_API_URL = https://your-railway-url.up.railway.app/api
TURSO_URL = libsql://timestablesv2-jpetree331.aws-us-east-1.turso.io
TURSO_TOKEN = eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjE2MDUyOTAsImlkIjoiZmRiYzJiNmEtNDAzMi00NWE3LTkyMmItNzZiOTQ2ZTFiNzQ4IiwicmlkIjoiMzcxZGUxZmYtZGEzNC00M2I0LWIwZmMtOTc3NTM0OWRiNzE5In0.Lpb93O0cNPQS685Ws913Uims_e4rUIfYyXCsePiXdpn919tcLNd8PPeRQIJ8xpsWjzXxyTeZm45z32zkmQHoBw
```

4. **Redeploy your site** to apply the changes

## Backend Environment Variables (Railway)

### Required Variables

1. **TURSO_URL**
   - **Description**: Turso database URL
   - **Example**: `libsql://timestablesv2-jpetree331.aws-us-east-1.turso.io`

2. **TURSO_TOKEN**
   - **Description**: Turso authentication token
   - **Example**: `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...`

3. **PORT** (Optional)
   - **Description**: Port for the server to run on
   - **Default**: `3000`

### How to Set in Railway

1. **Go to your Railway project dashboard**
2. **Variables tab**
3. **Add the following variables**:

```
TURSO_URL = libsql://timestablesv2-jpetree331.aws-us-east-1.turso.io
TURSO_TOKEN = eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjE2MDUyOTAsImlkIjoiZmRiYzJiNmEtNDAzMi00NWE3LTkyMmItNzZiOTQ2ZTFiNzQ4IiwicmlkIjoiMzcxZGUxZmYtZGEzNC00M2I0LWIwZmMtOTc3NTM0OWRiNzE5In0.Lpb93O0cNPQS685Ws913Uims_e4rUIfYyXCsePiXdpn919tcLNd8PPeRQIJ8xpsWjzXxyTeZm45z32zkmQHoBw
PORT = 3000
```

## Development Setup

### Local Development

1. **Backend**: Create `backend/.env` file:
```
TURSO_URL=libsql://timestablesv2-jpetree331.aws-us-east-1.turso.io
TURSO_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjE2MDUyOTAsImlkIjoiZmRiYzJiNmEtNDAzMi00NWE3LTkyMmItNzZiOTQ2ZTFiNzQ4IiwicmlkIjoiMzcxZGUxZmYtZGEzNC00M2I0LWIwZmMtOTc3NTM0OWRiNzE5In0.Lpb93O0cNPQS685Ws913Uims_e4rUIfYyXCsePiXdpn919tcLNd8PPeRQIJ8xpsWjzXxyTeZm45z32zkmQHoBw
PORT=3000
```

2. **Frontend**: The `config.js` will automatically use `http://localhost:3000/api`

## Security Notes

- **Never commit** `.env` files to Git
- **Environment variables** are only available at build time for frontend
- **Backend variables** are available at runtime
- **Use different tokens** for development and production if needed