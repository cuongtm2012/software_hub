import { config } from "dotenv";
config();

import { eq, ilike } from "drizzle-orm";
import { db } from "../server/db";
import { users, externalRequests } from "../shared/schema";

const DEMO_PREFIX = "[DEMO] ";

async function findUser(email: string, fallbackRoles: string[]) {
  const [byEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (byEmail) return byEmail;

  for (const role of fallbackRoles) {
    const [user] = await db.select().from(users).where(eq(users.role, role)).limit(1);
    if (user) return user;
  }

  return null;
}

async function seedExternalRequests() {
  console.log("=== Seed Yêu cầu dự án (external_requests) ===\n");

  const buyer = await findUser("buyer@test.com", ["buyer", "user", "client"]);

  const existing = await db
    .select({ id: externalRequests.id })
    .from(externalRequests)
    .where(ilike(externalRequests.project_description, `${DEMO_PREFIX}%`));

  if (existing.length > 0) {
    console.log(
      `  ⏭  Đã có ${existing.length} yêu cầu demo — bỏ qua (xóa mô tả "${DEMO_PREFIX}*" để seed lại)`,
    );
    return;
  }

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const publicRows = [
    {
      name: "Trần Minh Khôi",
      email: "khoi.tran@fintech-startup.vn",
      phone: "0908123456",
      title: `${DEMO_PREFIX}App mobile ví điện tử`,
      project_description: `${DEMO_PREFIX}Startup fintech cần app iOS/Android Flutter, tích hợp VNPay và eKYC. MVP trong 3 tháng.`,
      requirements: "Flutter, Node.js API, PostgreSQL, PCI-aware design",
      technology_stack: ["Flutter", "Node.js", "PostgreSQL", "Redis"],
      timeline: "3 tháng",
      budget_range: "200–400 triệu VND",
      status: "pending" as const,
      priority: "urgent",
      client_id: null,
      created_at: daysAgo(1),
      updated_at: daysAgo(1),
    },
    {
      name: "Lê Thị Hương",
      email: "huong.le@retailco.com",
      phone: "0912345678",
      title: `${DEMO_PREFIX}Website bán hàng B2B`,
      project_description: `${DEMO_PREFIX}Công ty phân phối cần catalog online, đặt hàng sỉ, quản lý đại lý. Hiện dùng Excel.`,
      requirements: "Responsive, đa ngôn ngữ VI/EN, export báo cáo",
      technology_stack: ["React", "Next.js", "Supabase"],
      timeline: "6–8 tuần",
      budget_range: "80–120 triệu VND",
      status: "in_progress" as const,
      priority: "high",
      admin_notes: "Đã gọi điện xác nhận scope — chờ báo giá từ dev",
      client_id: null,
      created_at: daysAgo(4),
      updated_at: daysAgo(2),
    },
    {
      name: "Phạm Đức Anh",
      email: "duc.anh@logistics.vn",
      phone: "0987654321",
      title: `${DEMO_PREFIX}Dashboard tracking đơn hàng`,
      project_description: `${DEMO_PREFIX}Đơn vị logistics muốn dashboard realtime theo dõi xe và đơn, tích hợp GPS API đối tác.`,
      technology_stack: ["Vue.js", "Python", "FastAPI"],
      timeline: "2 tháng",
      budget_range: "100–150 triệu VND",
      status: "pending" as const,
      priority: "normal",
      client_id: null,
      created_at: daysAgo(7),
      updated_at: daysAgo(7),
    },
  ];

  const registeredRows = buyer
    ? [
        {
          name: buyer.name,
          email: buyer.email,
          phone: "0900111222",
          title: `${DEMO_PREFIX}Plugin tích hợp phần mềm kế toán`,
          project_description: `${DEMO_PREFIX}User đã đăng ký cần plugin đồng bộ đơn hàng từ Software Hub sang MISA.`,
          requirements: "REST API, webhook, tài liệu kỹ thuật",
          technology_stack: ["TypeScript", "REST API"],
          timeline: "4 tuần",
          budget_range: "30–50 triệu VND",
          status: "in_progress" as const,
          priority: "normal",
          client_id: buyer.id,
          admin_notes: "Khách quen — ưu tiên phản hồi trong 24h",
          created_at: daysAgo(10),
          updated_at: daysAgo(3),
        },
        {
          name: buyer.name,
          email: buyer.email,
          title: `${DEMO_PREFIX}Tùy chỉnh theme marketplace`,
          project_description: `${DEMO_PREFIX}Cần white-label giao diện marketplace cho đối tác, giữ backend hiện tại.`,
          timeline: "3 tuần",
          budget_range: "25 triệu VND",
          status: "completed" as const,
          priority: "low",
          client_id: buyer.id,
          admin_notes: "Đã bàn giao tháng trước",
          created_at: daysAgo(45),
          updated_at: daysAgo(5),
        },
        {
          name: buyer.name,
          email: buyer.email,
          title: `${DEMO_PREFIX}Bot hỗ trợ khách hàng`,
          project_description: `${DEMO_PREFIX}Yêu cầu chatbot FAQ tích hợp Zalo OA — đã hủy do đổi hướng.`,
          status: "cancelled" as const,
          priority: "low",
          client_id: buyer.id,
          admin_notes: "Khách hủy — ngân sách không phù hợp",
          created_at: daysAgo(20),
          updated_at: daysAgo(15),
        },
      ]
    : [];

  const allRows = [...publicRows, ...registeredRows];

  if (registeredRows.length === 0) {
    console.log("  ⚠  Không tìm thấy buyer@test.com — chỉ seed form công khai\n");
  }

  const inserted = await db.insert(externalRequests).values(allRows).returning({ id: externalRequests.id });

  console.log(`  ✅ Đã tạo ${inserted.length} yêu cầu dự án:`);
  console.log(`     · ${publicRows.length} form công khai (client_id = null)`);
  console.log(`     · ${registeredRows.length} user đăng ký`);
  inserted.forEach((row, i) => {
    const src = i < publicRows.length ? "public" : "registered";
    console.log(`     #${row.id} [${src}]`);
  });
  console.log("\n=== Xong — reload /admin/projects ===");
}

seedExternalRequests().catch((err) => {
  console.error(err);
  process.exit(1);
});
