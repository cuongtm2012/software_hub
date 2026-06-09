import { config } from "dotenv";
config();

import { eq, ilike } from "drizzle-orm";
import { db } from "../server/db";
import {
  users,
  serviceRequests,
  serviceQuotations,
  serviceProjects,
} from "../shared/schema";

const DEMO_PREFIX = "[DEMO] ";

async function findUser(email: string, fallbackRoles: string[]) {
  const [byEmail] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (byEmail) return byEmail;

  for (const role of fallbackRoles) {
    const [user] = await db.select().from(users).where(eq(users.role, role)).limit(1);
    if (user) return user;
  }

  throw new Error(`No user found for ${email} or roles ${fallbackRoles.join(", ")}`);
}

async function seedServiceRequests() {
  console.log("=== Seed IT Service Requests (demo) ===\n");

  const client = await findUser("buyer@test.com", ["buyer", "user", "client"]);
  const admin = await findUser("admin@test.com", ["admin"]);
  console.log(`  Client: #${client.id} ${client.email}`);
  console.log(`  Admin:  #${admin.id} ${admin.email}\n`);

  const existing = await db
    .select({ id: serviceRequests.id })
    .from(serviceRequests)
    .where(ilike(serviceRequests.title, `${DEMO_PREFIX}%`));

  if (existing.length > 0) {
    console.log(`  ⏭  Đã có ${existing.length} yêu cầu demo — bỏ qua (xóa title "${DEMO_PREFIX}*" để seed lại)`);
    return;
  }

  const now = new Date();

  const [req1] = await db
    .insert(serviceRequests)
    .values({
      client_id: client.id,
      title: `${DEMO_PREFIX}Thiết lập máy chủ AWS cho startup`,
      description:
        "Cần triển khai VPC, EC2, RDS PostgreSQL và CI/CD GitHub Actions cho team 8 người. Yêu cầu backup hàng ngày và monitoring cơ bản.",
      requirements: "Terraform hoặc CDK, SSL, domain swhubco.com subdomain staging",
      budget_range: "15–30 triệu VND",
      timeline: "2–3 tuần",
      status: "submitted",
      priority: "high",
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    })
    .returning();

  const [req2] = await db
    .insert(serviceRequests)
    .values({
      client_id: client.id,
      title: `${DEMO_PREFIX}Migrate hệ thống on-premise lên cloud`,
      description:
        "Hiện có 3 VM chạy PHP + MySQL, cần lên Azure hoặc AWS với downtime tối thiểu trong cuối tuần.",
      requirements: "Zero-downtime migration plan, DNS cutover hỗ trợ",
      budget_range: "50–80 triệu VND",
      timeline: "4–6 tuần",
      status: "under_review",
      priority: "normal",
      admin_notes: "Đang chờ khảo sát hạ tầng hiện tại",
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    })
    .returning();

  const [req3] = await db
    .insert(serviceRequests)
    .values({
      client_id: client.id,
      title: `${DEMO_PREFIX}Triển khai SSO & bảo mật cho doanh nghiệp`,
      description:
        "Tích hợp Google Workspace SSO, 2FA bắt buộc, audit log và chính sách mật khẩu cho ~120 nhân viên.",
      budget_range: "20–35 triệu VND",
      timeline: "3 tuần",
      status: "quoted",
      priority: "urgent",
      created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    })
    .returning();

  await db.insert(serviceQuotations).values({
    service_request_id: req3.id,
    admin_id: admin.id,
    title: "Gói SSO Enterprise — báo giá #1",
    description:
      "Triển khai Keycloak hoặc Supabase Auth, đồng bộ Google Workspace, training 2 buổi cho IT nội bộ.",
    deliverables: [
      "Thiết kế kiến trúc SSO",
      "Cấu hình IdP & MFA",
      "Tài liệu vận hành",
    ],
    total_price: "28000000",
    deposit_amount: "14000000",
    timeline_days: 21,
    terms_conditions: "Thanh toán 50% khi ký, 50% khi nghiệm thu",
    status: "pending",
    expires_at: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
  });

  const [req4] = await db
    .insert(serviceRequests)
    .values({
      client_id: client.id,
      title: `${DEMO_PREFIX}Tối ưu hiệu năng website thương mại`,
      description:
        "Website React + Node chậm khi traffic cao. Cần CDN, cache Redis, và review database queries.",
      budget_range: "10–18 triệu VND",
      timeline: "2 tuần",
      status: "in_progress",
      priority: "normal",
      created_at: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    })
    .returning();

  const [quote4] = await db
    .insert(serviceQuotations)
    .values({
      service_request_id: req4.id,
      admin_id: admin.id,
      title: "Gói Performance Boost",
      description: "Audit + CDN Cloudflare + Redis cache layer + 5 query fixes ưu tiên.",
      deliverables: ["Báo cáo audit", "CDN & cache", "Load test trước/sau"],
      total_price: "15000000",
      deposit_amount: "7500000",
      timeline_days: 14,
      status: "accepted",
      client_response: "Đồng ý triển khai",
      created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    })
    .returning();

  await db.insert(serviceProjects).values({
    quotation_id: quote4.id,
    service_request_id: req4.id,
    client_id: client.id,
    admin_id: admin.id,
    status: "in_progress",
    progress_percentage: 45,
    milestones: [
      { id: 1, title: "Audit hiện trạng", completed: true },
      { id: 2, title: "CDN & Redis", completed: true },
      { id: 3, title: "Query optimization", completed: false },
    ],
    started_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    created_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
    updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  });

  await db.insert(serviceRequests).values({
    client_id: client.id,
    title: `${DEMO_PREFIX}Bảo trì & giám sát hệ thống (retainer)`,
    description: "Gói hỗ trợ 20 giờ/tháng: monitoring, patch bảo mật, backup restore drill.",
    budget_range: "8 triệu VND/tháng",
    timeline: "Ongoing",
    status: "completed",
    priority: "low",
    admin_notes: "Đã hoàn thành tháng đầu, khách gia hạn",
    created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
  });

  console.log(`  ✅ #${req1.id} submitted — AWS setup`);
  console.log(`  ✅ #${req2.id} under_review — cloud migration`);
  console.log(`  ✅ #${req3.id} quoted — SSO (có báo giá pending)`);
  console.log(`  ✅ #${req4.id} in_progress — performance (có project 45%)`);
  console.log(`  ✅ completed — retainer`);
  console.log("\n=== Xong — reload /admin/service-requests ===");
}

seedServiceRequests().catch((err) => {
  console.error(err);
  process.exit(1);
});
