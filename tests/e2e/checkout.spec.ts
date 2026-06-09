import { test, expect } from "@playwright/test";

test.describe("Checkout & payOS", () => {
  test("add-funds redirects unauthenticated users to auth", async ({ page }) => {
    await page.goto("/add-funds");
    await page.waitForURL(/\/auth/, { timeout: 15_000 });
    expect(page.url()).toContain("/auth");
  });

  test("POST /api/payment/initiate requires authentication", async ({ request }) => {
    const res = await request.post("/api/payment/initiate", {
      data: { amount: 10_000, payment_method: "bank-qr" },
    });
    expect(res.status()).toBe(401);
  });

  test("POST /api/payment/checkout requires authentication", async ({ request }) => {
    const res = await request.post("/api/payment/checkout", {
      data: {
        items: [{ product_id: 1, quantity: 1 }],
        payment_method: "bank-qr",
      },
    });
    expect(res.status()).toBe(401);
  });

  test("payOS webhook rejects invalid signature", async ({ request }) => {
    const res = await request.post("/api/payment/webhook", {
      data: {
        code: "00",
        desc: "success",
        success: true,
        data: {
          orderCode: 123456,
          amount: 10000,
          description: "TEST",
          accountNumber: "12345678",
          reference: "REF",
          transactionDateTime: "2024-01-01 10:00:00",
          currency: "VND",
          paymentLinkId: "test-link-id",
          code: "00",
          desc: "Thành công",
          counterAccountBankId: "",
          counterAccountBankName: "",
          counterAccountName: "",
          counterAccountNumber: "",
          virtualAccountName: "",
          virtualAccountNumber: "",
        },
        signature: "invalid-signature",
      },
    });
    expect(res.status()).toBe(400);
  });

  test("payOS webhook alias /api/payment/ipn rejects invalid signature", async ({ request }) => {
    const res = await request.post("/api/payment/ipn", {
      data: {
        code: "00",
        success: true,
        data: {
          orderCode: 999,
          amount: 5000,
          description: "TEST",
          accountNumber: "12345678",
          reference: "REF",
          transactionDateTime: "2024-01-01 10:00:00",
          currency: "VND",
          paymentLinkId: "test-link-id",
          code: "00",
          desc: "Thành công",
          counterAccountBankId: "",
          counterAccountBankName: "",
          counterAccountName: "",
          counterAccountNumber: "",
          virtualAccountName: "",
          virtualAccountNumber: "",
        },
        signature: "bad",
      },
    });
    expect(res.status()).toBe(400);
  });

  test("checkout page shows payOS copy when cart has items", async ({ page, context }) => {
    await context.addInitScript(() => {
      localStorage.setItem(
        "shopping-cart",
        JSON.stringify([
          {
            productId: "1",
            packageId: "standard",
            quantity: 1,
            product: { id: "1", name: "Test Product", price: 100000 },
            selectedPackage: { id: "standard", name: "Standard", price: 100000 },
          },
        ]),
      );
    });

    await page.goto("/marketplace/checkout");
    await expect(page.getByText(/Thanh toán an toàn qua payOS/i).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
