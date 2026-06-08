export const DEMO_ACCOUNTS = {
  seller: { email: "seller@test.com", password: "testpassword", label: "Seller" },
  buyer: { email: "buyer@test.com", password: "testpassword", label: "Buyer" },
  admin: { email: "admin@test.com", password: "testpassword", label: "Admin" },
} as const;

export type DemoRole = keyof typeof DEMO_ACCOUNTS;
