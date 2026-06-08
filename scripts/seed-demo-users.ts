import { config } from "dotenv";
config();

import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { getSupabaseAdmin } from "../server/lib/supabase";

const DEMO_USERS = [
  { email: "seller@test.com", password: "testpassword", name: "Test Seller", role: "seller" as const },
  { email: "buyer@test.com", password: "testpassword", name: "Test Buyer", role: "buyer" as const },
  { email: "admin@test.com", password: "testpassword", name: "Test Admin", role: "admin" as const },
];

async function seedDemoUsers() {
  const supabase = getSupabaseAdmin();
  console.log("=== Seed Demo Users (Supabase Auth + local DB) ===\n");

  for (const demo of DEMO_USERS) {
    const [existing] = await db.select().from(users).where(eq(users.email, demo.email)).limit(1);

    let supabaseId: string | undefined = existing?.supabase_id ?? undefined;

    const { data: listData } = await supabase.auth.admin.listUsers();
    const authUser = listData?.users?.find((u) => u.email === demo.email);

    if (authUser) {
      supabaseId = authUser.id;
      await supabase.auth.admin.updateUserById(authUser.id, {
        password: demo.password,
        email_confirm: true,
        user_metadata: { name: demo.name },
      });
      console.log(`  🔄 Updated Supabase Auth: ${demo.email}`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: demo.email,
        password: demo.password,
        email_confirm: true,
        user_metadata: { name: demo.name },
      });
      if (error) {
        console.error(`  ❌ Auth create failed ${demo.email}:`, error.message);
        continue;
      }
      supabaseId = data.user.id;
      console.log(`  ✅ Created Supabase Auth: ${demo.email}`);
    }

    if (existing) {
      await db
        .update(users)
        .set({
          name: demo.name,
          role: demo.role,
          supabase_id: supabaseId,
          email_verified: true,
        })
        .where(eq(users.id, existing.id));
      console.log(`  🔄 Updated local user #${existing.id} (${demo.role})`);
    } else {
      const [created] = await db
        .insert(users)
        .values({
          name: demo.name,
          email: demo.email,
          password: crypto.randomBytes(32).toString("hex"),
          role: demo.role,
          supabase_id: supabaseId,
          email_verified: true,
        })
        .returning();
      console.log(`  ✅ Created local user #${created.id} (${demo.role})`);
    }
  }

  console.log("\n=== Demo credentials ===");
  for (const demo of DEMO_USERS) {
    console.log(`  ${demo.role.padEnd(6)} → ${demo.email} / ${demo.password}`);
  }
  console.log("\nDone.");
  process.exit(0);
}

seedDemoUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
