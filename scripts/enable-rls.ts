/**
 * Enable Row Level Security on all public tables.
 * Express server uses postgres role (bypasses RLS). This protects Supabase REST/anon access.
 */
import { db, pool } from "../server/db";
import { sql } from "drizzle-orm";

const TABLES = [
  "users",
  "seller_profiles",
  "categories",
  "softwares",
  "courses",
  "blog_posts",
  "leads",
  "reviews",
  "external_requests",
  "quotes",
  "messages",
  "portfolios",
  "portfolio_reviews",
  "products",
  "orders",
  "order_items",
  "payments",
  "user_downloads",
  "product_reviews",
  "cart_items",
  "support_tickets",
  "sales_analytics",
  "service_requests",
  "service_quotations",
  "service_projects",
  "service_payments",
  "chat_rooms",
  "chat_room_members",
  "chat_messages",
  "notifications",
  "user_presence",
  "session",
] as const;

const POLICIES: { name: string; sql: string }[] = [
  {
    name: "public_read_categories",
    sql: `CREATE POLICY "public_read_categories" ON categories FOR SELECT TO anon, authenticated USING (true)`,
  },
  {
    name: "public_read_approved_software",
    sql: `CREATE POLICY "public_read_approved_software" ON softwares FOR SELECT TO anon, authenticated USING (status = 'approved')`,
  },
  {
    name: "public_read_approved_courses",
    sql: `CREATE POLICY "public_read_approved_courses" ON courses FOR SELECT TO anon, authenticated USING (status = 'approved')`,
  },
  {
    name: "public_read_published_blog",
    sql: `CREATE POLICY "public_read_published_blog" ON blog_posts FOR SELECT TO anon, authenticated USING (status = 'published')`,
  },
  {
    name: "public_read_approved_products",
    sql: `CREATE POLICY "public_read_approved_products" ON products FOR SELECT TO anon, authenticated USING (status = 'approved')`,
  },
  {
    name: "public_read_portfolios",
    sql: `CREATE POLICY "public_read_portfolios" ON portfolios FOR SELECT TO anon, authenticated USING (true)`,
  },
  {
    name: "public_read_software_reviews",
    sql: `CREATE POLICY "public_read_software_reviews" ON reviews FOR SELECT TO anon, authenticated USING (target_type = 'software')`,
  },
  {
    name: "public_insert_leads",
    sql: `CREATE POLICY "public_insert_leads" ON leads FOR INSERT TO anon, authenticated WITH CHECK (true)`,
  },
  {
    name: "users_read_own",
    sql: `CREATE POLICY "users_read_own" ON users FOR SELECT TO authenticated USING (supabase_id = auth.uid()::text)`,
  },
  {
    name: "users_update_own",
    sql: `CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (supabase_id = auth.uid()::text)`,
  },
  {
    name: "cart_items_own",
    sql: `CREATE POLICY "cart_items_own" ON cart_items FOR ALL TO authenticated USING (
      user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text LIMIT 1)
    )`,
  },
  {
    name: "notifications_own",
    sql: `CREATE POLICY "notifications_own" ON notifications FOR SELECT TO authenticated USING (
      user_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text LIMIT 1)
    )`,
  },
  {
    name: "orders_buyer_read",
    sql: `CREATE POLICY "orders_buyer_read" ON orders FOR SELECT TO authenticated USING (
      buyer_id = (SELECT id FROM users WHERE supabase_id = auth.uid()::text LIMIT 1)
    )`,
  },
];

async function policyExists(name: string, table: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT 1 FROM pg_policies
    WHERE policyname = ${name} AND tablename = ${table}
    LIMIT 1
  `);
  return (result.rows?.length ?? 0) > 0;
}

async function tableExists(table: string): Promise<boolean> {
  const result = await db.execute(sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ${table}
    LIMIT 1
  `);
  return (result.rows?.length ?? 0) > 0;
}

async function main() {
  console.log("=== Enable RLS on Supabase tables ===\n");

  for (const table of TABLES) {
    if (!(await tableExists(table))) {
      console.log(`  skip ${table} (not found)`);
      continue;
    }
    await db.execute(sql.raw(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`));
    console.log(`  ✓ RLS enabled: ${table}`);
  }

  console.log("\n=== Creating policies ===\n");

  for (const policy of POLICIES) {
    const table = policy.sql.match(/ON (\w+)/)?.[1];
    if (!table || !(await tableExists(table))) continue;

    if (await policyExists(policy.name, table)) {
      console.log(`  skip policy ${policy.name}`);
      continue;
    }

    try {
      await db.execute(sql.raw(policy.sql));
      console.log(`  ✓ ${policy.name}`);
    } catch (err: any) {
      console.error(`  ✗ ${policy.name}: ${err.message}`);
    }
  }

  console.log("\nDone. Service role / postgres connections bypass RLS.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
