import { storage } from "../storage.js";
import { sendServiceNotificationEmail } from "../email.js";

async function getAdminEmails(): Promise<string[]> {
  const configured = process.env.ADMIN_EMAIL;
  if (configured) return [configured];

  const { users } = await storage.getAllUsers({ role: "admin", limit: 5 });
  return users.map((u: { email: string }) => u.email).filter(Boolean);
}

function fireAndForget(promise: Promise<unknown>) {
  promise.catch((err) => console.error("Service email failed:", err));
}

export function notifyServiceRequestCreated(request: {
  id: number;
  title: string;
  client_id: number;
}) {
  fireAndForget(
    (async () => {
      const client = await storage.getUser(request.client_id);
      if (client?.email) {
        await sendServiceNotificationEmail(
          client.email,
          `Đã nhận yêu cầu dịch vụ: ${request.title}`,
          `<p>Xin chào ${client.name},</p>
           <p>Chúng tôi đã nhận yêu cầu <strong>${request.title}</strong> (#${request.id}).</p>
           <p>Team sẽ phản hồi báo giá trong 24–48 giờ làm việc.</p>`,
        );
      }

      const admins = await getAdminEmails();
      for (const email of admins) {
        await sendServiceNotificationEmail(
          email,
          `[IT Studio] Yêu cầu mới: ${request.title}`,
          `<p>Yêu cầu dịch vụ mới <strong>#${request.id}</strong>: ${request.title}</p>
           <p>Khách hàng: ${client?.name || request.client_id} (${client?.email || "—"})</p>`,
        );
      }
    })(),
  );
}

export function notifyServiceQuotationCreated(quotation: {
  id: number;
  title: string;
  total_price: string;
  service_request_id: number;
}, clientId: number) {
  fireAndForget(
    (async () => {
      const client = await storage.getUser(clientId);
      if (!client?.email) return;

      await sendServiceNotificationEmail(
        client.email,
        `Báo giá mới cho yêu cầu #${quotation.service_request_id}`,
        `<p>Xin chào ${client.name},</p>
         <p>Team đã gửi báo giá <strong>${quotation.title}</strong>.</p>
         <p>Tổng giá: <strong>${Number(quotation.total_price).toLocaleString("vi-VN")}₫</strong></p>
         <p>Vui lòng đăng nhập để xem chi tiết và chấp nhận báo giá.</p>`,
      );
    })(),
  );
}

export function notifyServiceQuotationResponded(
  quotation: { id: number; title: string; service_request_id: number },
  action: "accept" | "reject",
  clientId: number,
) {
  fireAndForget(
    (async () => {
      const client = await storage.getUser(clientId);
      const admins = await getAdminEmails();
      const label = action === "accept" ? "chấp nhận" : "từ chối";

      for (const email of admins) {
        await sendServiceNotificationEmail(
          email,
          `[IT Studio] Khách ${label} báo giá #${quotation.id}`,
          `<p>Khách hàng <strong>${client?.name || clientId}</strong> đã <strong>${label}</strong> báo giá:</p>
           <p><strong>${quotation.title}</strong> (yêu cầu #${quotation.service_request_id})</p>`,
        );
      }
    })(),
  );
}
