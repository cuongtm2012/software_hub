import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Package, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface MarketplaceProduct {
  id: number;
  seller_id: number;
  title: string;
  category: string;
  price: string;
  status: string;
  created_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Nháp",
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminProductsPage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");

  const { data, isLoading, refetch } = useQuery<{ products: MarketplaceProduct[]; total: number }>({
    queryKey: ["/api/admin/products", statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const res = await apiRequest("GET", `/api/admin/products?${params}`);
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/products/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      toast({ title: "Đã cập nhật sản phẩm" });
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const products = data?.products ?? [];

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-[#004080]" />
              Sản phẩm Marketplace
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Duyệt sản phẩm digital từ seller ({data?.total ?? 0} kết quả)
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Làm mới
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Tìm theo tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
          </div>
        ) : (
          <div className="rounded-lg border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Không có sản phẩm
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>#{p.id}</TableCell>
                      <TableCell>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-muted-foreground">{p.category}</p>
                      </TableCell>
                      <TableCell>#{p.seller_id}</TableCell>
                      <TableCell>{Number(p.price).toLocaleString("vi-VN")} ₫</TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLOR[p.status] || ""}>
                          {STATUS_LABEL[p.status] || p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(p.created_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {p.status === "pending" && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="h-8 bg-green-600 hover:bg-green-700"
                              onClick={() => updateMutation.mutate({ id: p.id, status: "approved" })}
                            >
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              onClick={() => updateMutation.mutate({ id: p.id, status: "rejected" })}
                            >
                              Từ chối
                            </Button>
                          </div>
                        )}
                        {p.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => updateMutation.mutate({ id: p.id, status: "rejected" })}
                          >
                            Gỡ
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
