import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { PageMeta } from "@/components/seo/page-meta";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <PageMeta
        title="Không tìm thấy trang"
        description="Trang bạn tìm không tồn tại trên Software Hub."
        noindex
      />
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 — Không tìm thấy trang</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Đường dẫn không hợp lệ hoặc nội dung đã bị xóa.
          </p>
          <Button className="mt-6" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
