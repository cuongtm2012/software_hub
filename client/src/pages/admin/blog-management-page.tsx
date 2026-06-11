import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Newspaper,
  Plus,
  Search,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  FileText,
  CheckCircle2,
  Clock,
  Archive,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";

type BlogStatus = "draft" | "published" | "archived";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  content: string;
  seo_description?: string | null;
  cover_image?: string | null;
  author_name?: string | null;
  tags?: string[] | null;
  status: BlogStatus;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface BlogForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seo_description: string;
  cover_image: string;
  tags: string;
  status: BlogStatus;
}

const EMPTY_FORM: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  seo_description: "",
  cover_image: "",
  tags: "",
  status: "draft",
};

const STATUS_CONFIG: Record<
  BlogStatus,
  { label: string; badge: string; icon: typeof CheckCircle2 }
> = {
  published: {
    label: "Đã xuất bản",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  draft: {
    label: "Bản nháp",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
  },
  archived: {
    label: "Lưu trữ",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    icon: Archive,
  },
};

function postToForm(post: BlogPost): BlogForm {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    content: post.content,
    seo_description: post.seo_description || "",
    cover_image: post.cover_image || "",
    tags: (post.tags || []).join(", "),
    status: post.status,
  };
}

function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <div className="flex gap-3">
              <Skeleton className="h-12 w-16 rounded-md shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function BlogManagementPage() {
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<BlogForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<{
    posts: BlogPost[];
    total: number;
  }>({
    queryKey: ["/api/blog/admin/all"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/blog/admin/all?limit=200");
      return res.json();
    },
  });

  const posts = data?.posts ?? [];

  const stats = useMemo(() => ({
    total: posts.length,
    published: posts.filter((p) => p.status === "published").length,
    draft: posts.filter((p) => p.status === "draft").length,
    archived: posts.filter((p) => p.status === "archived").length,
  }), [posts]);

  const filteredPosts = useMemo(() => {
    let result = posts;
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [posts, statusFilter, debouncedSearch]);

  const invalidateBlog = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/blog/admin/all"] });
    queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editingPost) {
        const res = await apiRequest("PUT", `/api/blog/${editingPost.id}`, payload);
        return res.json();
      }
      const res = await apiRequest("POST", "/api/blog", payload);
      return res.json();
    },
    onSuccess: () => {
      invalidateBlog();
      toast({ title: editingPost ? "Đã cập nhật bài viết" : "Đã tạo bài viết" });
      closeEditor();
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: BlogStatus }) => {
      const res = await apiRequest("PUT", `/api/blog/${id}`, {
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
      });
      return res.json();
    },
    onSuccess: () => {
      invalidateBlog();
      toast({ title: "Đã cập nhật trạng thái" });
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/blog/${id}`);
    },
    onSuccess: () => {
      invalidateBlog();
      toast({ title: "Đã xóa bài viết" });
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast({ title: "Lỗi", description: e.message, variant: "destructive" }),
  });

  const openCreate = () => {
    setEditingPost(null);
    setForm(EMPTY_FORM);
    setEditorOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm(postToForm(post));
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingPost(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim(),
      seo_description: form.seo_description.trim() || null,
      cover_image: form.cover_image.trim() || null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      status: form.status,
      published_at: form.status === "published" ? new Date().toISOString() : null,
    };
    saveMutation.mutate(payload);
  };

  const statCards = [
    { key: "all", label: "Tổng bài viết", value: stats.total, color: "border-slate-200 bg-slate-50" },
    { key: "published", label: "Đã xuất bản", value: stats.published, color: "border-emerald-200 bg-emerald-50" },
    { key: "draft", label: "Bản nháp", value: stats.draft, color: "border-amber-200 bg-amber-50" },
    { key: "archived", label: "Lưu trữ", value: stats.archived, color: "border-slate-200 bg-slate-100" },
  ] as const;

  return (
    <AdminLayout>
      <TooltipProvider>
        <div className="w-full min-w-0 max-w-full px-[4%] py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Newspaper className="h-6 w-6 text-[#004080]" />
                Quản lý Blog
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Viết, chỉnh sửa và xuất bản nội dung SEO cho Software Hub
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={openCreate}
                className="bg-[#004080] hover:bg-[#003366]"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Bài mới
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Làm mới"
              >
                <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => setStatusFilter(card.key)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all hover:shadow-sm card-hover",
                  card.color,
                  statusFilter === card.key ? "ring-2 ring-[#004080]/30" : "",
                )}
              >
                <p className="text-2xl font-bold tabular-nums">{card.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tiêu đề, slug, tag..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="published">Đã xuất bản</SelectItem>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="archived">Lưu trữ</SelectItem>
                  </SelectContent>
                </Select>
                {(searchInput || statusFilter !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 gap-1"
                    onClick={() => {
                      setSearchInput("");
                      setStatusFilter("all");
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Xóa lọc
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? "Đang tải..."
                  : `${filteredPosts.length} bài viết${debouncedSearch || statusFilter !== "all" ? " (đã lọc)" : ""}`}
              </p>
              {isFetching && !isLoading && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableHead className="min-w-[280px]">Bài viết</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead className="w-[80px] text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableSkeleton />
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center">
                        <p className="text-destructive font-medium">Không tải được danh sách</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {error instanceof Error ? error.message : "Vui lòng thử lại"}
                        </p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                          Thử lại
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-16 text-center">
                        <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="font-medium">Chưa có bài viết nào</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {posts.length > 0
                            ? "Thử đổi bộ lọc hoặc từ khóa tìm kiếm"
                            : "Bắt đầu bằng cách tạo bài viết đầu tiên"}
                        </p>
                        {posts.length === 0 ? (
                          <Button size="sm" className="mt-3 bg-[#004080] hover:bg-[#003366]" onClick={openCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Tạo bài mới
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => {
                              setSearchInput("");
                              setStatusFilter("all");
                            }}
                          >
                            Xóa bộ lọc
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id} className="group">
                        <TableCell>
                          <div className="flex items-start gap-3 min-w-0">
                            {post.cover_image ? (
                              <img
                                src={post.cover_image}
                                alt=""
                                className="h-12 w-16 rounded-md object-cover border bg-muted shrink-0"
                              />
                            ) : (
                              <div className="h-12 w-16 rounded-md bg-[#004080]/8 flex items-center justify-center shrink-0">
                                <Newspaper className="h-5 w-5 text-[#004080]/60" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-medium truncate">{post.title}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                /blog/{post.slug}
                              </p>
                              {post.excerpt && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {post.excerpt}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[160px]">
                            {(post.tags || []).slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {(post.tags || []).length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{(post.tags || []).length - 2}
                              </Badge>
                            )}
                            {!(post.tags || []).length && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                                disabled={statusMutation.isPending}
                              >
                                <Badge
                                  variant="outline"
                                  className={cn("cursor-pointer", STATUS_CONFIG[post.status].badge)}
                                >
                                  {STATUS_CONFIG[post.status].label}
                                </Badge>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              {(Object.keys(STATUS_CONFIG) as BlogStatus[]).map((status) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() =>
                                    post.status !== status &&
                                    statusMutation.mutate({ id: post.id, status })
                                  }
                                >
                                  {STATUS_CONFIG[status].label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(post.updated_at || post.created_at), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {post.status === "published" && (
                                <>
                                  <DropdownMenuItem asChild>
                                    <a
                                      href={`/blog/${post.slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Xem trang công khai
                                    </a>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem onClick={() => openEdit(post)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(post)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Full-size editor modal */}
          <Dialog open={editorOpen} onOpenChange={(open) => !open && closeEditor()}>
            <DialogContent className="flex flex-col gap-0 p-0 overflow-hidden w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] sm:w-[calc(100vw-2rem)] sm:max-w-[min(1400px,calc(100vw-2rem))] sm:h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-2rem)] sm:rounded-xl">
              {/* Sticky toolbar */}
              <div className="flex items-center justify-between gap-4 border-b px-5 py-4 shrink-0 pr-14 bg-background">
                <DialogHeader className="space-y-0.5 text-left">
                  <DialogTitle className="text-xl">
                    {editingPost ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
                  </DialogTitle>
                  <DialogDescription>
                    Markdown đơn giản · Slug tự sinh từ tiêu đề
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center gap-2 shrink-0">
                  <Button type="button" variant="outline" onClick={closeEditor}>
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    form="blog-editor-form"
                    disabled={saveMutation.isPending}
                    className="bg-[#004080] hover:bg-[#003366]"
                  >
                    {saveMutation.isPending
                      ? "Đang lưu..."
                      : editingPost
                        ? "Cập nhật"
                        : "Xuất bản / Lưu"}
                  </Button>
                </div>
              </div>

              <form
                id="blog-editor-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto px-5 py-5"
              >
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6 h-full max-w-[1400px] mx-auto">
                  {/* Main writing area */}
                  <div className="flex flex-col gap-4 min-w-0 min-h-0">
                    <div>
                      <Label htmlFor="title">Tiêu đề *</Label>
                      <Input
                        id="title"
                        required
                        value={form.title}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            title: e.target.value,
                            slug: editingPost ? form.slug : slugify(e.target.value),
                          })
                        }
                        className="mt-1 text-lg h-11"
                        placeholder="Lộ trình học Frontend 6 tháng..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="slug">Slug URL</Label>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-sm text-muted-foreground shrink-0">/blog/</span>
                          <Input
                            id="slug"
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                            placeholder="lo-trinh-hoc-frontend"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="excerpt">Tóm tắt</Label>
                        <Input
                          id="excerpt"
                          value={form.excerpt}
                          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                          className="mt-1"
                          placeholder="Mô tả ngắn trên danh sách blog..."
                        />
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 min-h-[360px]">
                      <Label htmlFor="content">Nội dung *</Label>
                      <Textarea
                        id="content"
                        required
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        className="mt-1 font-mono text-sm flex-1 min-h-[calc(100dvh-320px)] resize-none"
                        placeholder={"## Tiêu đề\n\nNội dung bài viết..."}
                      />
                    </div>
                  </div>

                  {/* Meta sidebar */}
                  <div className="space-y-4 xl:border-l xl:pl-6">
                    <div>
                      <Label>Trạng thái</Label>
                      <Select
                        value={form.status}
                        onValueChange={(v) => setForm({ ...form, status: v as BlogStatus })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Bản nháp</SelectItem>
                          <SelectItem value="published">Xuất bản</SelectItem>
                          <SelectItem value="archived">Lưu trữ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                        className="mt-1"
                        placeholder="frontend, lộ trình, miễn phí"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Phân cách bằng dấu phẩy</p>
                    </div>

                    <Separator />

                    <div>
                      <Label htmlFor="seo_description">SEO description</Label>
                      <Textarea
                        id="seo_description"
                        rows={4}
                        value={form.seo_description}
                        onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                        className="mt-1"
                        placeholder="Meta description cho Google (150–160 ký tự)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {form.seo_description.length} ký tự
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="cover_image">Ảnh bìa (URL)</Label>
                      <Input
                        id="cover_image"
                        value={form.cover_image}
                        onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                        className="mt-1"
                        placeholder="https://..."
                      />
                      {form.cover_image && (
                        <img
                          src={form.cover_image}
                          alt="Preview"
                          className="mt-2 w-full h-36 object-cover rounded-md border"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete confirmation */}
          <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa bài viết?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc muốn xóa <strong>{deleteTarget?.title}</strong>? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive hover:bg-destructive/90"
                  onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                >
                  Xóa
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TooltipProvider>
    </AdminLayout>
  );
}
