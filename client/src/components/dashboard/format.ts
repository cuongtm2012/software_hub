export function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateVi(date: string | Date) {
  return new Date(date).toLocaleDateString("vi-VN");
}

export function getProductTitle(product: { title?: string; name?: string }) {
  return product.title || product.name || "Sản phẩm không tên";
}

export function getProjectTitle(project: { title?: string; name?: string; id: number }) {
  return project.title || project.name || `Yêu cầu dự án #${project.id}`;
}

export function getProjectDescription(project: {
  description?: string;
  project_description?: string;
}) {
  const text = project.description || project.project_description || "";
  if (!text) return "Không có mô tả";
  return text.length > 120 ? `${text.substring(0, 120)}…` : text;
}
