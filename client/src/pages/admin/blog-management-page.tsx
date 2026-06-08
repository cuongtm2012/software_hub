import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { slugify } from "@/lib/slug";

export default function BlogManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    seo_description: "",
    tags: "",
    status: "draft",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["/api/blog/admin/all"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRequest("POST", "/api/blog", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Đã tạo bài viết" });
      setShowForm(false);
      setForm({ title: "", slug: "", excerpt: "", content: "", seo_description: "", tags: "", status: "draft" });
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/blog/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({ title: "Đã xóa" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      slug: form.slug || slugify(form.title),
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      published_at: form.status === "published" ? new Date().toISOString() : null,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quản lý Blog</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Bài mới
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow mb-8 space-y-4">
            <Input placeholder="Tiêu đề" required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })} />
            <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <Input placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
            <Textarea placeholder="Nội dung (markdown đơn giản)" rows={8} required value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })} />
            <Input placeholder="SEO description" value={form.seo_description}
              onChange={(e) => setForm({ ...form, seo_description: e.target.value })} />
            <Input placeholder="Tags (phân cách bằng dấu phẩy)" value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <select className="border rounded px-3 py-2" value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
            <Button type="submit" disabled={createMutation.isPending}>Lưu</Button>
          </form>
        )}

        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        ) : (
          <div className="space-y-3">
            {data?.posts?.map((post: any) => (
              <div key={post.id} className="bg-white rounded-lg p-4 shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold">{post.title}</p>
                  <p className="text-sm text-gray-500">/{post.slug} · {post.status}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(post.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
