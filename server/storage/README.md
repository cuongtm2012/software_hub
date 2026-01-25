# Storage Layer Architecture

This directory contains the data access layer organized by domain.

## Structure

```
storage/
├── index.ts                      # Main export point
├── base.ts                       # Base interfaces and types
├── user/                         # User domain
│   └── userStorage.ts
├── software/                     # Software domain
│   └── softwareStorage.ts
├── category/                     # Category domain
│   └── categoryStorage.ts
├── review/                       # Review domain
│   └── reviewStorage.ts
├── external-request/             # External request domain
│   └── externalRequestStorage.ts
├── product/                      # Product/Marketplace domain
│   └── productStorage.ts
├── order/                        # Order domain
│   └── orderStorage.ts
├── payment/                      # Payment domain
│   └── paymentStorage.ts
├── notification/                 # Notification domain
│   └── notificationStorage.ts
└── seller/                       # Seller domain
    └── sellerStorage.ts
```

## Usage

```typescript
import { storage } from './storage';

// Use storage methods
const user = await storage.getUser(1);
const softwares = await storage.getSoftwareList({});
```

## Migration Notes

This structure was created by refactoring the monolithic `storage.ts` file (2606 lines)
into smaller, domain-specific modules for better maintainability.
