/**
 * Register payOS webhook URL with the merchant channel.
 * Usage: npx tsx scripts/confirm-payos-webhook.ts [webhookUrl]
 */
import "dotenv/config";
import { confirmWebhookUrl, isPayosConfigured } from "../server/lib/payos.js";

const webhookUrl =
  process.argv[2] ||
  process.env.PAYOS_WEBHOOK_URL ||
  `${process.env.APP_URL || process.env.SITE_URL || "https://swhubco.com"}/api/payment/webhook`;

async function main() {
  if (!isPayosConfigured()) {
    console.error("Missing PAYOS_CLIENT_ID, PAYOS_API_KEY, or PAYOS_CHECKSUM_KEY in .env");
    process.exit(1);
  }

  console.log(`Registering webhook: ${webhookUrl}`);
  await confirmWebhookUrl(webhookUrl);
  console.log("Webhook registered successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
