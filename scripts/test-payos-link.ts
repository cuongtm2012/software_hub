import "dotenv/config";
import { createPaymentLink, isPayosConfigured } from "../server/lib/payos.js";

async function main() {
  if (!isPayosConfigured()) {
    console.error("payOS not configured");
    process.exit(1);
  }
  const orderCode = 900_000_000_000 + (Date.now() % 1_000_000);
  const link = await createPaymentLink({
    orderCode,
    amount: 10_000,
    description: "TEST",
    returnUrl: "https://swhubco.com/add-funds?status=success",
    cancelUrl: "https://swhubco.com/add-funds?status=cancel",
  });
  console.log("checkoutUrl:", link.checkoutUrl);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
