# SoftwareHub Environment Variables Guide

This document contains all the environment variables used in the SoftwareHub application. 

**IMPORTANT**: Never expose secret keys in your codebase or version control. Use the Replit Secrets manager to set these values securely.

## Database Configuration
```bash
DATABASE_URL=<Your PostgreSQL connection string>
```

## Email Service Configuration (SendGrid)
```bash
SENDGRID_API_KEY=<Your SendGrid API key>
SENDGRID_FROM_EMAIL=cuongeurovnn@gmail.com
```

## Firebase Configuration (For Push Notifications)
```bash
FIREBASE_PROJECT_ID=<Your Firebase project ID>
FIREBASE_PRIVATE_KEY_ID=<Your Firebase private key ID>
FIREBASE_PRIVATE_KEY=<Your Firebase private key>
FIREBASE_CLIENT_EMAIL=<Your Firebase client email>
FIREBASE_CLIENT_ID=<Your Firebase client ID>
FIREBASE_AUTH_URI=<Your Firebase auth URI>
FIREBASE_TOKEN_URI=<Your Firebase token URI>
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=<Your Firebase auth provider cert URL>
FIREBASE_CLIENT_X509_CERT_URL=<Your Firebase client cert URL>
FIREBASE_UNIVERSE_DOMAIN=<Your Firebase universe domain>
```

## Cloudflare R2 Storage Configuration
```bash
R2_ACCOUNT_ID=<Your Cloudflare R2 account ID>
R2_ACCESS_KEY_ID=<Your R2 access key ID>
R2_SECRET_ACCESS_KEY=<Your R2 secret access key>
R2_BUCKET_NAME=<Your R2 bucket name>
R2_PUBLIC_URL=<Your R2 public URL>
```

## Stripe Configuration (For Payments)
```bash
STRIPE_SECRET_KEY=<Your Stripe secret key>
STRIPE_PUBLISHABLE_KEY=<Your Stripe publishable key>
STRIPE_WEBHOOK_SECRET=<Your Stripe webhook secret>
```

## Session Configuration
```bash
SESSION_SECRET=<Your session secret - generate a strong random string>
```

## Application Configuration
```bash
NODE_ENV=development
PORT=5000
REPL_ID=<Automatically set by Replit>
REPLIT_DOMAINS=<Automatically set by Replit>
```

## Object Storage Configuration
```bash
PUBLIC_OBJECT_SEARCH_PATHS=<Your public object search paths>
PRIVATE_OBJECT_DIR=<Your private object directory>
```

## FCM/Push Notification Configuration
```bash
FCM_VAPID_KEY=BNcpCG47ZDyNf-dZ-mWNYt5CTokMIyrQO46BJJ_gIkMidiJQBahNEe0fV8yZ9o6IzBxMqHf5o-FZ869n0QoibGo
```

## How to Set These Variables in Replit

1. Go to your Replit project
2. Click on "Secrets" in the left sidebar (lock icon)
3. Add each environment variable as a key-value pair
4. The variables will be automatically available to your application

## Test Credentials for Development

For testing purposes, these accounts are available:
- **Seller**: seller@test.com / testpassword
- **Buyer**: buyer@test.com / testpassword  
- **Admin**: cuongeurovnn@gmail.com / abcd@1234

## Current Service Status

✅ **Email Service**: Fully functional with SendGrid
✅ **Push Notifications**: Fully functional with Firebase
✅ **Database**: PostgreSQL working correctly
✅ **File Storage**: Cloudflare R2 configured
✅ **Authentication**: Working with session management
✅ **Payment Processing**: Stripe configured (requires keys)

## Security Notes

- Never commit API keys to version control
- Use environment variables for all secrets
- Regularly rotate API keys and tokens
- Monitor usage and access logs
- Use strong, unique passwords for all accounts