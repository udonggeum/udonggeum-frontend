# Authentication API Contracts

## Overview

This directory contains OpenAPI specifications for the authentication API endpoints used by the Udonggeum frontend.

## Files

- `auth-api.yml`: OpenAPI 3.0 specification for authentication endpoints

## Usage

### Validation

```bash
# Install swagger-cli
npm install -g @apidevtools/swagger-cli

# Validate the OpenAPI spec
swagger-cli validate auth-api.yml
```

### Code Generation (Optional)

```bash
# Generate TypeScript types from OpenAPI spec
npx openapi-typescript auth-api.yml --output ../src/types/auth-api.d.ts
```

## Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new user account | No |
| POST | `/api/auth/login` | Authenticate user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/refresh` | Refresh access token | No (refresh token in body) |
| GET | `/api/auth/me` | Get current user profile | Yes |

## Security Notes

- All endpoints use HTTPS in production (requirement: FR-024)
- Access tokens expire in 15-30 minutes
- Refresh tokens expire in 7 days
- 401 responses trigger automatic logout and redirect to login
- 10-second timeout enforced for all auth API calls (requirement: FR-023)

## Error Handling

All error responses follow this structure:

```json
{
  "message": "유효한 이메일을 입력하세요",
  "status": 400,
  "details": [
    {
      "field": "email",
      "message": "유효한 이메일을 입력하세요"
    }
  ]
}
```

Korean error messages are required for user-facing errors (requirement: FR-020).
