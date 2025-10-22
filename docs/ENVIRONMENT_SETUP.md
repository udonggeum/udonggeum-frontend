# Environment Configuration Guide

This document explains how to configure environment variables for development and production environments.

## Overview

The project uses Vite's built-in environment variable system with separate configurations for development and production.

## Files

- `.env.development` - Development environment configuration (auto-loaded with `npm run dev`)
- `.env.production` - Production environment configuration (auto-loaded with `npm run build`)
- `.env.example` - Template file showing all available environment variables

## Development vs Production

### Development Mode (`npm run dev`)

**File**: `.env.development`

```bash
# Empty string = use Vite proxy
VITE_API_BASE_URL=
```

**How it works:**
1. Vite dev server runs on `http://localhost:5173`
2. API requests go to `/api/v1/*` (same origin)
3. Vite proxy forwards requests to `http://192.168.71.112:8080`
4. **No CORS errors** because browser sees same-origin requests

**Proxy Configuration** (in `vite.config.ts:12-23`):
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://192.168.71.112:8080',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

### Production Mode (`npm run build`)

**File**: `.env.production`

```bash
# Direct backend URL
VITE_API_BASE_URL=https://api.udonggeum.com
```

**How it works:**
1. Frontend is built as static files
2. API requests go directly to `https://api.udonggeum.com/api/v1/*`
3. **Backend must have CORS enabled** for your frontend domain
4. No proxy involved in production

## Usage

### Running Development Server

```bash
npm run dev
# Automatically loads .env.development
# API calls use Vite proxy
```

### Building for Production

```bash
npm run build
# Automatically loads .env.production
# Outputs static files to /dist
```

### Preview Production Build

```bash
npm run preview
# Test production build locally
# Still uses .env.production settings
```

## Environment Variables

### Available Variables

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `VITE_API_BASE_URL` | Backend API base URL | Empty string (use proxy) | `https://api.yourdomain.com` |

### Accessing in Code

Environment variables are accessed via `import.meta.env`:

```typescript
// src/constants/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
```

**Important**: Only variables prefixed with `VITE_` are exposed to client-side code.

## Common Scenarios

### Scenario 1: Local Backend Development

If backend is running locally on `localhost:8080`:

```bash
# Update vite.config.ts proxy target
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    // ...
  }
}

# .env.development stays empty
VITE_API_BASE_URL=
```

### Scenario 2: Remote Development Backend

If using a remote development server at `http://192.168.71.112:8080`:

```bash
# Current setup - already configured
# vite.config.ts:17
target: 'http://192.168.71.112:8080',

# .env.development
VITE_API_BASE_URL=
```

### Scenario 3: Testing with Real Backend URL (No Proxy)

If you want to test without proxy in development:

```bash
# .env.development
VITE_API_BASE_URL=http://192.168.71.112:8080

# Note: This may cause CORS errors if backend doesn't allow localhost:5173
```

### Scenario 4: Production Deployment

Before deploying to production:

```bash
# Update .env.production with your actual backend URL
VITE_API_BASE_URL=https://api.udonggeum.com

# Build
npm run build

# Deploy /dist folder to your hosting service
```

## Troubleshooting

### CORS Errors in Development

**Symptom**: API calls fail with CORS errors

**Solution**: Ensure `.env.development` has empty `VITE_API_BASE_URL` to use proxy

```bash
# .env.development
VITE_API_BASE_URL=
```

### CORS Errors in Production

**Symptom**: Production build has CORS errors

**Solution**: Configure backend to allow your frontend domain

```java
// Spring Boot example
@CrossOrigin(origins = ["https://yourdomain.com"])

// Or configure globally
```

### Environment Changes Not Applied

**Symptom**: Changed `.env.*` file but nothing happens

**Solution**: Restart dev server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Wrong Environment File Loaded

**Symptom**: Production URL used in development

**Solution**: Check that you're using the correct command

```bash
npm run dev      # Uses .env.development
npm run build    # Uses .env.production
```

## Best Practices

1. **Never commit sensitive data** - Use `.env.local` for secrets (auto-ignored by git)
2. **Keep `.env.example` updated** - Document all required variables
3. **Use proxy in development** - Avoids CORS issues
4. **Set production URL before deploy** - Update `.env.production`
5. **Verify environment** - Check `import.meta.env.MODE` to confirm environment

## Security Notes

- Environment variables are embedded in the build at build time
- All `VITE_*` variables are public (visible in browser)
- Never store API keys or secrets in `VITE_*` variables
- For secrets, use backend environment variables instead

## References

- [Vite Environment Variables Documentation](https://vite.dev/guide/env-and-mode.html)
- [Vite Server Proxy Configuration](https://vite.dev/config/server-options.html#server-proxy)
