import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Pencil, X, Check } from "lucide-react";

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

  const { data, isLoading } = useQuery<{ courses: Course[]; total: number }>({
    queryKey: ["/api/courses/admin/all", search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (search.trim()) params.set("search", search.trim());
      const res = await apiRequest("GET", `/api/courses/admin/all?${params}`);
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, string> }) => {
      const res = await apiRequest("PUT", `/api/courses/admin/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses/admin/all"] });
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
              <BookOpen className="h-6 w-6" />
              Quản lý SEO Khóa học
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Chỉnh sửa meta description và nội dung SEO cho từng khóa học
            </p>
          </div>
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
