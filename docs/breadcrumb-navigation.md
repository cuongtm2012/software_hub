# Breadcrumb Navigation System

## Overview

The breadcrumb navigation system provides consistent navigation hierarchy across all pages in the marketplace application. It uses a reusable component that can be easily integrated into any page.

## Components

### PageBreadcrumb Component

Located at: `client/src/components/page-breadcrumb.tsx`

The main component that renders breadcrumb navigation with consistent styling:

```tsx
<PageBreadcrumb
  items={createBreadcrumbs.marketplaceProduct("Product Name")}
/>
```

### Props

- `items`: Array of BreadcrumbItem objects
- `className`: Optional additional CSS classes

### BreadcrumbItem Interface

```tsx
interface BreadcrumbItem {
  label: string;        // Display text
  href?: string;        // Navigation path (optional for current page)
  isCurrentPage?: boolean;  // Marks the final breadcrumb
}
```

## Helper Functions

The `createBreadcrumbs` object provides pre-configured breadcrumb patterns:

### Marketplace
- `createBreadcrumbs.marketplace()` - Returns to marketplace
- `createBreadcrumbs.marketplaceProduct(title)` - Home > Marketplace > Product
- `createBreadcrumbs.category(categoryName)` - Home > Marketplace > Category

### User & Profile
- `createBreadcrumbs.profile()` - Home > Profile
- `createBreadcrumbs.dashboard()` - Home > Dashboard

### Projects
- `createBreadcrumbs.projects()` - Returns to projects
- `createBreadcrumbs.projectDetail(title)` - Home > Projects > Project
- `createBreadcrumbs.projectNew()` - Home > Projects > New Project

### Portfolio
- `createBreadcrumbs.portfolio()` - Returns to portfolio
- `createBreadcrumbs.portfolioDetail(title)` - Home > Portfolio > Item
- `createBreadcrumbs.portfolioNew()` - Home > Portfolio > New Portfolio

### Seller
- `createBreadcrumbs.seller()` - Returns to seller dashboard
- `createBreadcrumbs.sellerProduct(title)` - Home > Seller Dashboard > Product
- `createBreadcrumbs.sellerProductNew()` - Home > Seller Dashboard > New Product

### Admin
- `createBreadcrumbs.admin()` - Returns to admin
- `createBreadcrumbs.adminUsers()` - Home > Admin > Users
- `createBreadcrumbs.adminSoftware()` - Home > Admin > Software
- `createBreadcrumbs.adminSellerApprovals()` - Home > Admin > Seller Approvals

### Orders & Chat
- `createBreadcrumbs.orders()` - Returns to orders
- `createBreadcrumbs.orderDetail(orderId)` - Home > Orders > Order #ID
- `createBreadcrumbs.chat()` - Home > Chat

## Implementation

### Basic Usage

1. Import the components:
```tsx
import { PageBreadcrumb, createBreadcrumbs } from "@/components/page-breadcrumb";
```

2. Add breadcrumb after Header component:
```tsx
<Header />
<PageBreadcrumb
  items={createBreadcrumbs.marketplaceProduct(product.title)}
/>
<main>
  {/* Page content */}
</main>
```

### Custom Breadcrumbs

For custom navigation paths, create an array of BreadcrumbItem objects:

```tsx
const customBreadcrumbs: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Custom Section", href: "/custom" },
  { label: "Current Page", isCurrentPage: true }
];

<PageBreadcrumb items={customBreadcrumbs} />
```

## Styling

The breadcrumb component uses consistent dark mode support and hover effects:

- Light background: `bg-white`
- Dark background: `dark:bg-gray-800`
- Hover effects: Blue color transitions
- Responsive design with proper spacing

## Pages Currently Using Breadcrumbs

1. **Product Detail** (`product-detail-ecommerce.tsx`) - Marketplace navigation
2. **Project Detail** (`project-detail-page.tsx`) - Project navigation  
3. **Portfolio Detail** (`portfolio-detail-page.tsx`) - Portfolio navigation
4. **Marketplace Category** (`marketplace-category-page.tsx`) - Category navigation
5. **User Profile** (`user-profile-page.tsx`) - Profile navigation
6. **Seller Product New** (`seller-product-new-page.tsx`) - Seller navigation
7. **Order Details** (`order-details-page.tsx`) - Order navigation

## Benefits

1. **Consistent Navigation**: Same style and behavior across all pages
2. **Better UX**: Users always know where they are and how to navigate back
3. **Accessibility**: Proper ARIA labels and semantic HTML
4. **Maintainable**: Centralized breadcrumb logic and styling
5. **Responsive**: Works on all device sizes
6. **Dark Mode**: Full dark mode support

## Future Enhancements

1. Add breadcrumb analytics tracking
2. Implement breadcrumb schema markup for SEO
3. Add keyboard navigation support
4. Create breadcrumb management for dynamic routes