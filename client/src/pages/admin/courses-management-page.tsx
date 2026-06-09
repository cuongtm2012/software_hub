import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Pencil, X, Check, RefreshCw } from "lucide-react";

interface Course {
  id: number;
  title: string;
  slug?: string | null;
  topic: string;
  level?: string | null;
  instructor?: string | null;
  seo_description?: string | null;
  seo_content?: string | null;
  status: string;
}

export default function CoursesManagementPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    seo_description: "",
    seo_content: "",
    title: "",
    description: "",
  });

  const { data, isLoading, isError, error, refetch } = useQuery<{ courses: Course[]; total: number }>({
    queryKey: ["/api/courses", "admin-seo", search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "500" });
      if (search.trim()) params.set("search", search.trim());
      const res = await apiRequest("GET", `/api/courses?${params}`);
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, string> }) => {
      const res = await apiRequest("PUT", `/api/courses/admin/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", "admin-seo"] });
      toast({ title: "Đã cập nhật khóa học" });
      setEditingId(null);
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const courses = data?.courses ?? [];

  const startEdit = (course: Course) => {
    setEditingId(course.id);
    setForm({
      seo_description: course.seo_description || "",
      seo_content: course.seo_content || "",
      title: course.title,
      description: "",
    });
  };

  const handleSave = (id: number) => {
    updateMutation.mutate({
      id,
      payload: {
        seo_description: form.seo_description,
        seo_content: form.seo_content,
      },
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-[#004080]" />
              Quản lý SEO Khóa học
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isLoading
                ? "Đang tải..."
                : `${data?.total ?? courses.length} khóa học · chỉnh meta description và nội dung SEO`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Input
          placeholder="Tìm theo tên, topic, instructor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 max-w-md"
        />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 rounded-lg border bg-destructive/5">
            <p className="text-destructive font-medium">Không tải được danh sách khóa học</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "Vui lòng thử lại"}
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 rounded-lg border">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="font-medium">Không tìm thấy khóa học</p>
            <p className="text-sm text-muted-foreground mt-1">
              {search ? "Thử đổi từ khóa tìm kiếm" : "Chưa có khóa học trong database"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      /courses/{course.slug || course.id} · {course.topic}
                      {course.level ? ` · ${course.level}` : ""}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{course.status}</Badge>
                      {course.seo_content ? (
                        <Badge className="bg-green-100 text-green-800">Có SEO content</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800">Auto-generate</Badge>
                      )}
                    </div>
                  </div>
                  {editingId !== course.id && (
                    <Button size="sm" variant="outline" onClick={() => startEdit(course)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Sửa SEO
                    </Button>
                  )}
                </div>

                {editingId === course.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div>
                      <label className="text-sm font-medium">SEO Description (meta)</label>
                      <Textarea
                        className="mt-1"
                        rows={2}
                        value={form.seo_description}
                        onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                        placeholder="Mô tả ngắn hiển thị trên Google (~150 ký tự)"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">SEO Content (markdown)</label>
                      <Textarea
                        className="mt-1 font-mono text-sm"
                        rows={10}
                        value={form.seo_content}
                        onChange={(e) => setForm({ ...form, seo_content: e.target.value })}
                        placeholder="Nội dung 500–800 chữ, internal links markdown..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-[#004080] hover:bg-[#003366]"
                        disabled={updateMutation.isPending}
                        onClick={() => handleSave(course.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Lưu
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4 mr-1" />
                        Huỷ
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
