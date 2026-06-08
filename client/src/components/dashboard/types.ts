export type ProjectStatusFilter = "all" | "pending" | "in_progress" | "completed" | "cancelled";

export interface DashboardProject {
  id: number;
  title?: string;
  name?: string;
  email?: string;
  status: string;
  deadline?: string;
  description?: string;
  project_description?: string;
  budget?: string;
  created_at?: string;
  type?: string;
}

export interface DashboardProduct {
  id: number;
  title?: string;
  name?: string;
  description: string;
  price: string;
  status: string;
  category?: string;
  stock_quantity: number;
  total_sales: number;
  avg_rating: number | null;
  featured?: boolean;
  created_at: string;
}

export interface DashboardOrder {
  id: number;
  buyer_id: number;
  total_amount: string;
  status: string;
  created_at: string;
}

export interface DashboardQuote {
  id: number;
  project_id: number;
  price: string;
  status: string;
}

export const PROJECT_STATUS_FILTERS: { value: ProjectStatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "in_progress", label: "Đang làm" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];
