import React from "react";
import { useLocation } from "wouter";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function PageBreadcrumb({ items, className = "" }: PageBreadcrumbProps) {
  const [, navigate] = useLocation();

  return (
    <div className={`bg-white dark:bg-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <Breadcrumb>
          <BreadcrumbList className="text-sm text-gray-500 dark:text-gray-400">
            {items.map((item, index) => (
              <div key={`breadcrumb-${index}`} className="contents">
                <BreadcrumbItem>
                  {item.isCurrentPage || !item.href ? (
                    <BreadcrumbPage className="text-gray-900 dark:text-gray-100">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      onClick={() => navigate(item.href!)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < items.length - 1 && (
                  <BreadcrumbSeparator>
                    <span>/</span>
                  </BreadcrumbSeparator>
                )}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}

// Helper function to create common breadcrumb patterns
export const createBreadcrumbs = {
  // Home breadcrumb
  home: (): BreadcrumbItem => ({ label: "Home", href: "/" }),
  
  // Marketplace breadcrumbs
  marketplace: (): BreadcrumbItem => ({ label: "Marketplace", href: "/marketplace" }),
  marketplaceProduct: (productTitle: string): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Marketplace", href: "/marketplace" },
    { label: productTitle, isCurrentPage: true },
  ],
  
  // Dashboard breadcrumbs
  dashboard: (): BreadcrumbItem => ({ label: "Dashboard", href: "/dashboard" }),
  
  // Profile breadcrumbs
  profile: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Profile", isCurrentPage: true },
  ],
  
  // Projects breadcrumbs
  projects: (): BreadcrumbItem => ({ label: "Projects", href: "/projects" }),
  projectDetail: (projectTitle: string): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: projectTitle, isCurrentPage: true },
  ],
  projectNew: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "New Project", isCurrentPage: true },
  ],
  projectRequest: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Request Project", isCurrentPage: true },
  ],
  
  // Portfolio breadcrumbs
  portfolio: (): BreadcrumbItem => ({ label: "Portfolio", href: "/portfolio" }),
  portfolioDetail: (portfolioTitle: string): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: portfolioTitle, isCurrentPage: true },
  ],
  portfolioNew: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "New Portfolio", isCurrentPage: true },
  ],
  
  // Seller breadcrumbs
  seller: (): BreadcrumbItem => ({ label: "Seller Dashboard", href: "/seller" }),
  sellerProduct: (productTitle: string): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Seller Dashboard", href: "/seller" },
    { label: productTitle, isCurrentPage: true },
  ],
  sellerProductNew: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Seller Dashboard", href: "/dashboard" },
    { label: "New Product", isCurrentPage: true },
  ],
  sellerProductEdit: (productTitle?: string): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Seller Dashboard", href: "/dashboard" },
    { label: productTitle || "Edit Product", isCurrentPage: true },
  ],
  
  // Admin breadcrumbs
  admin: (): BreadcrumbItem => ({ label: "Admin", href: "/admin" }),
  adminUsers: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Admin", href: "/admin" },
    { label: "Users", isCurrentPage: true },
  ],
  adminSoftware: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Admin", href: "/admin" },
    { label: "Software", isCurrentPage: true },
  ],
  adminSellerApprovals: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Admin", href: "/admin" },
    { label: "Seller Approvals", isCurrentPage: true },
  ],
  
  // Order breadcrumbs
  orders: (): BreadcrumbItem => ({ label: "Orders", href: "/orders" }),
  orderDetail: (orderId: string): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Orders", href: "/orders" },
    { label: `Order #${orderId}`, isCurrentPage: true },
  ],
  
  // Chat breadcrumbs
  chat: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Chat", isCurrentPage: true },
  ],
  
  // Software catalog breadcrumbs
  softwareCatalog: (): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Software Catalog", isCurrentPage: true },
  ],
  
  // Category breadcrumbs
  category: (categoryName: string): BreadcrumbItem[] => [
    { label: "Home", href: "/" },
    { label: "Marketplace", href: "/marketplace" },
    { label: categoryName, isCurrentPage: true },
  ],
};