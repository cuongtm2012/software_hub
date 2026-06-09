import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Monitor, Pencil, X, Check, RefreshCw } from "lucide-react";

interface SoftwareItem {
  id: number;
  name: string;
  slug?: string | null;
  type?: string | null;
  platform?: string[] | null;
  status: string;
  seo_description?: string | null;
  seo_content?: string | null;
}

export default function SoftwareSeoManagementPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    seo_description: "",
    seo_content: "",
    slug: "",
  });

  const { data, isLoading, isError, error, refetch } = useQuery<{
    softwares: SoftwareItem[];
    total: number;
  }>({
    queryKey: ["/api/admin/softwares", "seo", search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "500", page: "1" });
      if (search.trim()) params.set("search", search.trim());
      const res = await apiRequest("GET", `/api/admin/softwares?${params}`);
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, string> }) => {
      const res = await apiRequest("PUT", `/api/admin/software/${id}/seo`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/softwares", "seo"] });
      toast({ title: "Đã cập nhật SEO phần mềm" });
      setEditingId(null);
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const softwares = data?.softwares ?? [];

  const startEdit = (item: SoftwareItem) => {
    setEditingId(item.id);
    setForm({
      seo_description: item.seo_description || "",
      seo_content: item.seo_content || "",
      slug: item.slug || "",
    });
  };

  const handleSave = (id: number) => {
    updateMutation.mutate({
      id,
      payload: {
        seo_description: form.seo_description,
        seo_content: form.seo_content,
        slug: form.slug.trim(),
      },
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Monitor className="h-6 w-6 text-[#004080]" />
              Quản lý SEO Phần mềm
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isLoading
                ? "Đang tải..."
                : `${data?.total ?? softwares.length} phần mềm · meta, slug và nội dung SEO`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Input
          placeholder="Tìm theo tên phần mềm..."
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
            <p className="text-destructive font-medium">Không tải được danh sách</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "Vui lòng thử lại"}
            </p>
          </div>
        ) : softwares.length === 0 ? (
          <div className="text-center py-12 rounded-lg border">
            <Monitor className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="font-medium">Không tìm thấy phần mềm</p>
          </div>
        ) : (
          <div className="space-y-3">
            {softwares.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      /software/{item.slug || item.id}
                      {item.type ? ` · ${item.type}` : ""}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{item.status}</Badge>
                      {item.seo_content ? (
                        <Badge className="bg-green-100 text-green-800">Có SEO content</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800">Auto-generate</Badge>
                      )}
                    </div>
                  </div>
                  {editingId !== item.id && (
                    <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Sửa SEO
                    </Button>
                  )}
                </div>

                {editingId === item.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div>
                      <label className="text-sm font-medium">Slug URL</label>
                      <Input
                        className="mt-1"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="vd: docker-desktop"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">SEO Description (meta)</label>
                      <Textarea
                        className="mt-1"
                        rows={2}
                        value={form.seo_description}
                        onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                        placeholder="Mô tả ngắn cho Google (~150 ký tự)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {form.seo_description.length} ký tự
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">SEO Content (markdown)</label>
                      <Textarea
                        className="mt-1 font-mono text-sm"
                        rows={10}
                        value={form.seo_content}
                        onChange={(e) => setForm({ ...form, seo_content: e.target.value })}
                        placeholder="Hướng dẫn cài đặt, long-tail keywords, internal links..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-[#004080] hover:bg-[#003366]"
                        disabled={updateMutation.isPending}
                        onClick={() => handleSave(item.id)}
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
