import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  RefreshCw,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  MoreHorizontal,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type SoftwareStatus = "pending" | "approved" | "rejected";

interface Software {
  id: number;
  slug?: string | null;
  name: string;
  description: string;
  type?: "software" | "api";
  category_id: number;
  platform: string[];
  download_link: string;
  image_url?: string;
  created_by: number;
  status: SoftwareStatus;
  created_at: string;
  version?: string;
  vendor?: string;
  license?: string;
  installation_instructions?: string;
  documentation_link?: string;
  admin_notes?: string;
}

interface Category {
  id: number;
  name: string;
  parent_id?: number;
}

interface SoftwareFilters {
  search: string;
  status: string;
  type: string;
  license: string;
  dateFrom: string;
  dateTo: string;
}

interface SoftwareListResponse {
  softwares: Software[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats?: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

const STATUS_CONFIG: Record<
  SoftwareStatus,
  { label: string; badge: string; icon: typeof CheckCircle2 }
> = {
  approved: {
    label: "Đang hoạt động",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  pending: {
    label: "Chờ duyệt",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
  },
  rejected: {
    label: "Ngừng hiển thị",
    badge: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
};

const DEFAULT_FILTERS: SoftwareFilters = {
  search: "",
  status: "all",
  type: "all",
  license: "all",
  dateFrom: "",
  dateTo: "",
};

function SoftwareAvatar({ name, imageUrl }: { name: string; imageUrl?: string | null }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="h-9 w-9 rounded-lg object-cover border bg-muted shrink-0"
      />
    );
  }
  return (
    <div className="h-9 w-9 rounded-lg bg-[#004080]/10 text-[#004080] flex items-center justify-center font-semibold text-sm shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-6" /></TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function SoftwareManagement() {
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<SoftwareFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Software>>({});
  const [createFormData, setCreateFormData] = useState<Partial<Software>>({
    name: "",
    description: "",
    category_id: undefined,
    platform: [],
    download_link: "",
    license: "Free",
    status: "approved",
  });
  const [deleteTarget, setDeleteTarget] = useState<Software | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput }));
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: softwareData, isLoading, isError, error, refetch, isFetching } = useQuery<SoftwareListResponse>({
    queryKey: ["/api/admin/softwares", { page: currentPage, limit: pageSize, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.type !== "all" && { type: filters.type }),
        ...(filters.license !== "all" && { license: filters.license }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
      });
      const response = await apiRequest("GET", `/api/admin/softwares?${params}`);
      return response.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    (categories || []).forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  const createSoftwareMutation = useMutation({
    mutationFn: async (data: Partial<Software>) => {
      const response = await apiRequest("POST", "/api/admin/software", data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Đã tạo phần mềm mới" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/softwares"] });
      setIsCreateModalOpen(false);
      setCreateFormData({
        name: "",
        description: "",
        category_id: undefined,
        platform: [],
        download_link: "",
        license: "Free",
        status: "approved",
      });
    },
    onError: (err: Error) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    },
  });

  const updateSoftwareMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<Software> }) => {
      const response = await apiRequest("PUT", `/api/admin/software/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Đã cập nhật phần mềm" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/softwares"] });
      setIsEditModalOpen(false);
      setSelectedSoftware(null);
    },
    onError: (err: Error) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    },
  });

  const deleteSoftwareMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/software/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Đã xóa phần mềm" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/softwares"] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { id: number; status: SoftwareStatus }) => {
      const response = await apiRequest("PUT", `/api/admin/software/${data.id}/status`, {
        status: data.status,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Đã cập nhật trạng thái" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/softwares"] });
    },
    onError: (err: Error) => {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    },
  });

  const setFilter = (key: keyof SoftwareFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setFilters(DEFAULT_FILTERS);
    setCurrentPage(1);
  };

  const handleViewSoftware = (software: Software) => {
    setSelectedSoftware(software);
    setIsViewModalOpen(true);
  };

  const handleEditSoftware = (software: Software) => {
    setSelectedSoftware(software);
    setEditFormData(software);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedSoftware) return;
    const { id, created_at, created_by, ...cleanedData } = editFormData;
    updateSoftwareMutation.mutate({ id: selectedSoftware.id, updates: cleanedData });
  };

  const handleCreateSoftware = () => {
    if (!createFormData.name || !createFormData.description || !createFormData.category_id || !createFormData.download_link) {
      toast({ title: "Thiếu thông tin", description: "Vui lòng điền tên, mô tả, danh mục và link tải.", variant: "destructive" });
      return;
    }
    createSoftwareMutation.mutate(createFormData);
  };

  const handleQuickStatusChange = (software: Software, newStatus: SoftwareStatus) => {
    if (software.status === newStatus) return;
    updateStatusMutation.mutate({ id: software.id, status: newStatus });
  };

  const activeFilterCount = [
    filters.status !== "all",
    filters.type !== "all",
    filters.license !== "all",
    filters.dateFrom,
    filters.dateTo,
  ].filter(Boolean).length;

  const software = softwareData?.softwares || [];
  const total = softwareData?.total || 0;
  const totalPages = softwareData?.totalPages || Math.ceil(total / pageSize);
  const stats = softwareData?.stats;
  const rangeStart = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, total);

  const statCards = [
    { key: "all", label: "Tổng cộng", value: stats?.total ?? total, color: "border-slate-200 bg-slate-50" },
    { key: "approved", label: "Đang hoạt động", value: stats?.approved ?? 0, color: "border-emerald-200 bg-emerald-50" },
    { key: "pending", label: "Chờ duyệt", value: stats?.pending ?? 0, color: "border-amber-200 bg-amber-50" },
    { key: "rejected", label: "Ngừng hiển thị", value: stats?.rejected ?? 0, color: "border-red-200 bg-red-50" },
  ] as const;

  return (
    <TooltipProvider>
      <div className="w-full min-w-0 max-w-full px-[4%] py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6 text-[#004080]" />
              Quản lý Phần mềm
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Duyệt, chỉnh sửa và quản lý catalog phần mềm trên Software Hub
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="bg-[#004080] hover:bg-[#003366]"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm mới
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
              onClick={() => setFilter("status", card.key === "all" ? "all" : card.key)}
              className={cn(
                "rounded-xl border p-4 text-left transition-all hover:shadow-sm",
                card.color,
                filters.status === card.key || (card.key === "all" && filters.status === "all")
                  ? "ring-2 ring-[#004080]/30"
                  : ""
              )}
            >
              <p className="text-2xl font-bold tabular-nums">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên, mô tả..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                {(activeFilterCount > 0 || searchInput) && (
                  <Button variant="ghost" size="sm" onClick={handleResetFilters} className="gap-1">
                    <RotateCcw className="h-4 w-4" />
                    Xóa lọc
                  </Button>
                )}
              </div>
            </div>

            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                  <SlidersHorizontal className="h-4 w-4" />
                  Bộ lọc nâng cao
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", filtersOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Trạng thái</Label>
                    <Select value={filters.status} onValueChange={(v) => setFilter("status", v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="approved">Đang hoạt động</SelectItem>
                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                        <SelectItem value="rejected">Ngừng hiển thị</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Loại</Label>
                    <Select value={filters.type} onValueChange={(v) => setFilter("type", v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="software">Phần mềm</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Giấy phép</Label>
                    <Select value={filters.license} onValueChange={(v) => setFilter("license", v)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="free">free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="open-source">Open Source</SelectItem>
                        <SelectItem value="proprietary">Proprietary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Từ ngày</Label>
                      <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilter("dateFrom", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Đến ngày</Label>
                      <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilter("dateTo", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Đang tải..." : `Hiển thị ${rangeStart}–${rangeEnd} / ${total} phần mềm`}
            </p>
            {isFetching && !isLoading && (
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="min-w-[220px]">Phần mềm</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Nền tảng</TableHead>
                  <TableHead>Giấy phép</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày thêm</TableHead>
                  <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton />
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <p className="text-destructive font-medium">Không tải được danh sách</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {error instanceof Error ? error.message : "Vui lòng thử lại"}
                      </p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                        Thử lại
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : software.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center">
                      <Package className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="font-medium">Không tìm thấy phần mềm</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Thử đổi bộ lọc hoặc xóa từ khóa tìm kiếm
                      </p>
                      {(activeFilterCount > 0 || searchInput) && (
                        <Button variant="outline" size="sm" className="mt-3" onClick={handleResetFilters}>
                          Xóa bộ lọc
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  software.map((item, index) => (
                    <TableRow key={item.id} className="group">
                      <TableCell className="text-muted-foreground text-sm">
                        {(currentPage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 min-w-0">
                          <SoftwareAvatar name={item.name} imageUrl={item.image_url} />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {categoryMap.get(item.category_id) || `Category #${item.category_id}`}
                              {item.slug ? ` · /software/${item.slug}` : ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.type === "api" ? "API" : "Software"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {(item.platform || []).slice(0, 2).map((p) => (
                            <Badge key={p} variant="secondary" className="text-xs capitalize">
                              {p}
                            </Badge>
                          ))}
                          {(item.platform || []).length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.platform.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{item.license || "Free"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                              disabled={updateStatusMutation.isPending}
                            >
                              <Badge
                                variant="outline"
                                className={cn("cursor-pointer", STATUS_CONFIG[item.status].badge)}
                              >
                                {STATUS_CONFIG[item.status].label}
                              </Badge>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {(Object.keys(STATUS_CONFIG) as SoftwareStatus[]).map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => handleQuickStatusChange(item, status)}
                                className="gap-2"
                              >
                                {STATUS_CONFIG[status].label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(item.created_at), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5 opacity-80 group-hover:opacity-100">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a
                                  href={`/software/${item.slug || item.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Xem trang công khai</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleViewSoftware(item)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Chi tiết</TooltipContent>
                          </Tooltip>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditSoftware(item)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(item)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedSoftware && (
                  <SoftwareAvatar name={selectedSoftware.name} imageUrl={selectedSoftware.image_url} />
                )}
                {selectedSoftware?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedSoftware && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={STATUS_CONFIG[selectedSoftware.status].badge} variant="outline">
                    {STATUS_CONFIG[selectedSoftware.status].label}
                  </Badge>
                  <Badge variant="outline">{selectedSoftware.type === "api" ? "API" : "Software"}</Badge>
                  <Badge variant="outline">{selectedSoftware.license || "Free"}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Phiên bản</p>
                    <p className="font-medium">{selectedSoftware.version || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nhà phát hành</p>
                    <p className="font-medium">{selectedSoftware.vendor || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Danh mục</p>
                    <p className="font-medium">
                      {categoryMap.get(selectedSoftware.category_id) || `#${selectedSoftware.category_id}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ngày thêm</p>
                    <p className="font-medium">
                      {format(new Date(selectedSoftware.created_at), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-1">Mô tả</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">
                    {selectedSoftware.description}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Nền tảng</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSoftware.platform.map((p) => (
                      <Badge key={p} variant="secondary" className="capitalize">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedSoftware.download_link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={selectedSoftware.download_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Link tải
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/software/${selectedSoftware.slug || selectedSoftware.id}`}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Trang công khai
                    </Link>
                  </Button>
                  <Button size="sm" onClick={() => { setIsViewModalOpen(false); handleEditSoftware(selectedSoftware); }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa phần mềm</DialogTitle>
            </DialogHeader>
            {selectedSoftware && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="edit-name">Tên phần mềm</Label>
                    <Input
                      id="edit-name"
                      value={editFormData.name || ""}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-version">Phiên bản</Label>
                    <Input
                      id="edit-version"
                      value={editFormData.version || ""}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, version: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-vendor">Nhà phát hành</Label>
                    <Input
                      id="edit-vendor"
                      value={editFormData.vendor || ""}
                      onChange={(e) => setEditFormData((prev) => ({ ...prev, vendor: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Giấy phép</Label>
                    <Select
                      value={editFormData.license || "Free"}
                      onValueChange={(value) => setEditFormData((prev) => ({ ...prev, license: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="free">free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="open-source">Open Source</SelectItem>
                        <SelectItem value="proprietary">Proprietary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Trạng thái</Label>
                    <Select
                      value={editFormData.status || "pending"}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, status: value as SoftwareStatus }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Đang hoạt động</SelectItem>
                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                        <SelectItem value="rejected">Ngừng hiển thị</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-description">Mô tả</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description || ""}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Danh mục</Label>
                    <Select
                      value={editFormData.category_id?.toString() || ""}
                      onValueChange={(value) =>
                        setEditFormData((prev) => ({ ...prev, category_id: parseInt(value) }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {(categories || []).map((cat: Category) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-platform">Nền tảng</Label>
                    <Input
                      id="edit-platform"
                      value={Array.isArray(editFormData.platform) ? editFormData.platform.join(", ") : ""}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          platform: e.target.value.split(",").map((p) => p.trim()).filter(Boolean),
                        }))
                      }
                      placeholder="windows, mac, linux"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-download-link">Link tải</Label>
                  <Input
                    id="edit-download-link"
                    value={editFormData.download_link || ""}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, download_link: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-admin-notes">Ghi chú admin</Label>
                  <Textarea
                    id="edit-admin-notes"
                    value={editFormData.admin_notes || ""}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, admin_notes: e.target.value }))}
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateSoftwareMutation.isPending}
                className="bg-[#004080] hover:bg-[#003366]"
              >
                {updateSoftwareMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Thêm phần mềm mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-name">Tên *</Label>
                  <Input
                    id="create-name"
                    value={createFormData.name || ""}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Danh mục *</Label>
                  <Select
                    value={createFormData.category_id?.toString() || ""}
                    onValueChange={(value) =>
                      setCreateFormData((prev) => ({ ...prev, category_id: parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories || []).map((cat: Category) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="create-description">Mô tả *</Label>
                <Textarea
                  id="create-description"
                  value={createFormData.description || ""}
                  onChange={(e) => setCreateFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-platform">Nền tảng</Label>
                  <Input
                    id="create-platform"
                    value={Array.isArray(createFormData.platform) ? createFormData.platform.join(", ") : ""}
                    onChange={(e) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        platform: e.target.value.split(",").map((p) => p.trim()).filter(Boolean),
                      }))
                    }
                    placeholder="windows, mac, linux"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="create-download">Link tải *</Label>
                  <Input
                    id="create-download"
                    value={createFormData.download_link || ""}
                    onChange={(e) => setCreateFormData((prev) => ({ ...prev, download_link: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleCreateSoftware}
                disabled={createSoftwareMutation.isPending}
                className="bg-[#004080] hover:bg-[#003366]"
              >
                {createSoftwareMutation.isPending ? "Đang tạo..." : "Tạo phần mềm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa phần mềm?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc muốn xóa <strong>{deleteTarget?.name}</strong>? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={() => deleteTarget && deleteSoftwareMutation.mutate(deleteTarget.id)}
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
