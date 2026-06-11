import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Search,
    Mail,
    Building2,
    Calendar,
    User,
    FileText,
    List,
    Phone,
    DollarSign,
    Clock,
    Code,
    Save,
    X,
    Edit,
    Globe,
    UserCheck,
    Info,
    Wrench,
} from "lucide-react";
import { Link } from "wouter";

type ProjectStatus = "pending" | "in_progress" | "completed" | "cancelled" | "contacted" | "converted" | "rejected";

type SourceFilter = "all" | "public" | "registered";

interface Project {
    id: number;
    name: string;
    email: string;
    phone?: string;
    project_description: string;
    requirements?: string;
    technology_stack?: string[];
    budget_range?: string;
    budget?: string | number | null;
    timeline?: string;
    status: ProjectStatus;
    priority?: string;
    client_id?: number | null;
    created_at: string;
    company?: string;
    admin_notes?: string;
}

interface ProjectStats extends Record<string, number> {
    _source?: { public: number; registered: number; total: number };
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
    pending: "Mới",
    in_progress: "Đang xem xét",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    contacted: "Đã liên hệ",
    converted: "Đã phê duyệt",
    rejected: "Từ chối",
};

const STATUS_COLORS: Record<ProjectStatus, string> = {
    pending: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    contacted: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    converted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    rejected: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
};

function readSourceFromUrl(): SourceFilter {
    const s = new URLSearchParams(window.location.search).get("source");
    if (s === "public" || s === "registered") return s;
    return "all";
}

export default function ProjectsPage() {
    const { user } = useAuth();
    const [, navigate] = useLocation();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [sourceFilter, setSourceFilter] = useState<SourceFilter>(readSourceFromUrl);
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editedStatus, setEditedStatus] = useState<ProjectStatus>("pending");
    const [editedNotes, setEditedNotes] = useState("");

    useEffect(() => {
        setSourceFilter(readSourceFromUrl());
    }, [typeof window !== "undefined" ? window.location.search : ""]);

    const { data: projectsData, isLoading } = useQuery<{ projects: Project[]; total: number }>({
        queryKey: ["/api/admin/projects", selectedStatus, searchQuery, sourceFilter, priorityFilter],
        queryFn: async () => {
            const params = new URLSearchParams({ limit: "50" });
            if (selectedStatus !== "all") params.set("status", selectedStatus);
            if (searchQuery.trim()) params.set("search", searchQuery.trim());
            if (sourceFilter !== "all") params.set("source", sourceFilter);
            if (priorityFilter !== "all") params.set("priority", priorityFilter);
            const res = await apiRequest("GET", `/api/admin/projects?${params}`);
            return res.json();
        },
        enabled: user?.role === "admin",
    });

    const { data: stats } = useQuery<ProjectStats>({
        queryKey: ["/api/admin/projects/stats"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/admin/projects/stats");
            return res.json();
        },
        enabled: user?.role === "admin",
    });

    const updateProjectMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<Project> }) => {
            const response = await apiRequest("PATCH", `/api/admin/projects/${id}`, data);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/projects"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/projects/stats"] });
            setIsDetailOpen(false);
        },
    });

    const projects = projectsData?.projects || [];

    const handleViewDetails = (project: Project) => {
        setSelectedProject(project);
        setEditedStatus(project.status);
        setEditedNotes(project.admin_notes || "");
        setIsDetailOpen(true);
    };

    const handleSaveChanges = () => {
        if (!selectedProject) return;
        updateProjectMutation.mutate({
            id: selectedProject.id,
            data: {
                status: editedStatus,
                admin_notes: editedNotes,
            },
        });
    };

    const getStatusCount = (status: string) => {
        if (status === "all") {
            return stats?._source?.total ?? projectsData?.total ?? projects.length;
        }
        return stats?.[status] || 0;
    };

    const handleSourceChange = (source: SourceFilter) => {
        setSourceFilter(source);
        const qs = source === "all" ? "" : `?source=${source}`;
        navigate(`/admin/projects${qs}`);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <AdminLayout>
            <div className="w-full min-w-0 max-w-full px-[4%] py-6 space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Yêu cầu dự án
                    </h1>
                    <p className="text-muted-foreground">
                        Tất cả inquiry từ form công khai và user đã đăng ký (bảng <code className="text-xs">external_requests</code>)
                    </p>
                </div>

                <div className="flex gap-3 p-4 rounded-lg border bg-blue-50/50 border-blue-100 text-sm text-blue-900">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>
                        <strong>Yêu cầu dự án</strong> = khách/dev tìm làm dự án (form{" "}
                        <code className="text-xs bg-blue-100 px-1 rounded">/request-project</code>, developer quotes).
                        Khác với{" "}
                        <Link href="/admin/service-requests" className="font-medium underline inline-flex items-center gap-1">
                            <Wrench className="h-3.5 w-3.5" />
                            Dịch vụ IT
                        </Link>{" "}
                        (báo giá admin, thanh toán payOS).
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Tổng</CardDescription>
                            <CardTitle className="text-2xl">{stats?._source?.total ?? "—"}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-1">
                                <Globe className="h-3 w-3" /> Form công khai
                            </CardDescription>
                            <CardTitle className="text-2xl">{stats?._source?.public ?? "—"}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-1">
                                <UserCheck className="h-3 w-3" /> User đăng ký
                            </CardDescription>
                            <CardTitle className="text-2xl">{stats?._source?.registered ?? "—"}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Chờ xử lý</CardDescription>
                            <CardTitle className="text-2xl text-amber-600">{stats?.pending ?? "—"}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={sourceFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSourceChange("all")}
                    >
                        Tất cả nguồn
                    </Button>
                    <Button
                        variant={sourceFilter === "public" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSourceChange("public")}
                    >
                        <Globe className="h-4 w-4 mr-1" />
                        Form công khai
                    </Button>
                    <Button
                        variant={sourceFilter === "registered" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSourceChange("registered")}
                    >
                        <UserCheck className="h-4 w-4 mr-1" />
                        User đăng ký
                    </Button>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-40 h-9">
                            <SelectValue placeholder="Ưu tiên" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Mọi ưu tiên</SelectItem>
                            <SelectItem value="low">Thấp</SelectItem>
                            <SelectItem value="normal">Bình thường</SelectItem>
                            <SelectItem value="high">Cao</SelectItem>
                            <SelectItem value="urgent">Khẩn cấp</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Tìm kiếm theo tên project, email, hoặc khách hàng..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12"
                    />
                </div>

                {/* Status Filter Tabs */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Lọc theo trạng thái
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedStatus === "all" ? "default" : "outline"}
                            onClick={() => setSelectedStatus("all")}
                            className="gap-2"
                        >
                            Tất cả
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
                                {getStatusCount("all")}
                            </span>
                        </Button>
                        <Button
                            variant={selectedStatus === "pending" ? "default" : "outline"}
                            onClick={() => setSelectedStatus("pending")}
                            className="gap-2"
                        >
                            Mới
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
                                {getStatusCount("pending")}
                            </span>
                        </Button>
                        <Button
                            variant={selectedStatus === "in_progress" ? "default" : "outline"}
                            onClick={() => setSelectedStatus("in_progress")}
                            className="gap-2"
                        >
                            Đang xem xét
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
                                {getStatusCount("in_progress")}
                            </span>
                        </Button>
                        <Button
                            variant={selectedStatus === "converted" ? "default" : "outline"}
                            onClick={() => setSelectedStatus("converted")}
                            className="gap-2"
                        >
                            Đã phê duyệt
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
                                {getStatusCount("converted")}
                            </span>
                        </Button>
                        <Button
                            variant={selectedStatus === "rejected" ? "default" : "outline"}
                            onClick={() => setSelectedStatus("rejected")}
                            className="gap-2"
                        >
                            Từ chối
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
                                {getStatusCount("rejected")}
                            </span>
                        </Button>
                        <Button
                            variant={selectedStatus === "completed" ? "default" : "outline"}
                            onClick={() => setSelectedStatus("completed")}
                            className="gap-2"
                        >
                            Hoàn thành
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700">
                                {getStatusCount("completed")}
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Projects Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Không tìm thấy project
                            </h3>
                            <p className="text-muted-foreground">
                                Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24">Mã dự án</TableHead>
                                        <TableHead>Tên project</TableHead>
                                        <TableHead>Người yêu cầu</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Công ty</TableHead>
                                        <TableHead>Nguồn</TableHead>
                                        <TableHead>Ưu tiên</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Ngày tạo</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projects.map((project) => (
                                        <TableRow key={project.id}>
                                            <TableCell className="font-mono text-sm">
                                                PRJ-{String(project.id).padStart(3, "0")}
                                            </TableCell>
                                            <TableCell className="font-medium max-w-xs truncate">
                                                {project.project_description.substring(0, 50)}
                                                {project.project_description.length > 50 && "..."}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {project.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    {project.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-gray-400" />
                                                    {project.company || "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    {project.client_id ? "Đăng ký" : "Công khai"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm capitalize">
                                                {project.priority || "normal"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={STATUS_COLORS[project.status]}>
                                                    {STATUS_LABELS[project.status]}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(project.created_at)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(project)}
                                                        className="gap-1"
                                                    >
                                                        <List className="w-4 h-4" />
                                                        Chi tiết
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                        {selectedProject && (
                            <>
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                    <div>
                                        <DialogTitle className="text-2xl text-gray-900 dark:text-white">
                                            {selectedProject.project_description.substring(0, 60)}
                                            {selectedProject.project_description.length > 60 && "..."}
                                        </DialogTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Mã dự án: PRJ-{String(selectedProject.id).padStart(3, "0")}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsDetailOpen(false)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-500" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="space-y-6">
                                        {/* Client Information */}
                                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                Thông tin khách hàng
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-3">
                                                    <User className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Tên khách hàng</div>
                                                        <div className="text-gray-900 dark:text-white">{selectedProject.name}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Email</div>
                                                        <div className="text-gray-900 dark:text-white">{selectedProject.email}</div>
                                                    </div>
                                                </div>
                                                {selectedProject.phone && (
                                                    <div className="flex items-center gap-3">
                                                        <Phone className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <div className="text-sm text-gray-500">Số điện thoại</div>
                                                            <div className="text-gray-900 dark:text-white">{selectedProject.phone}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {selectedProject.company && (
                                                    <div className="flex items-center gap-3">
                                                        <Building2 className="w-5 h-5 text-gray-400" />
                                                        <div>
                                                            <div className="text-sm text-gray-500">Công ty</div>
                                                            <div className="text-gray-900 dark:text-white">{selectedProject.company}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <div className="text-sm text-gray-500">Ngày tạo</div>
                                                        <div className="text-gray-900 dark:text-white">{formatDate(selectedProject.created_at)}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Project Description */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                <FileText className="w-5 h-5" />
                                                Mô tả dự án
                                            </h3>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                {selectedProject.project_description}
                                            </p>
                                        </div>

                                        {/* Technical Requirements */}
                                        {selectedProject.requirements && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                                    Yêu cầu kỹ thuật
                                                </h3>
                                                <ul className="space-y-2">
                                                    {selectedProject.requirements.split("\n").filter(r => r.trim()).map((req, index) => (
                                                        <li key={index} className="flex items-start gap-2">
                                                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2" />
                                                            <span className="text-gray-700 dark:text-gray-300">{req}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Technologies */}
                                        {selectedProject.technology_stack && selectedProject.technology_stack.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                    <Code className="w-5 h-5" />
                                                    Công nghệ sử dụng
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedProject.technology_stack.map((tech, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full text-sm"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Budget & Timeline */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedProject.budget_range && (
                                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                                                        <DollarSign className="w-5 h-5" />
                                                        <span>Ngân sách dự kiến</span>
                                                    </div>
                                                    <div className="text-gray-900 dark:text-white font-medium">{selectedProject.budget_range}</div>
                                                </div>
                                            )}
                                            {selectedProject.timeline && (
                                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                                                        <Clock className="w-5 h-5" />
                                                        <span>Thời gian hoàn thành</span>
                                                    </div>
                                                    <div className="text-gray-900 dark:text-white font-medium">{selectedProject.timeline}</div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Update */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                Cập nhật trạng thái
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Trạng thái hiện tại
                                                    </label>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                                            <button
                                                                key={key}
                                                                onClick={() => setEditedStatus(key as ProjectStatus)}
                                                                className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${editedStatus === key
                                                                    ? STATUS_COLORS[key as ProjectStatus] + " ring-2 ring-offset-1 ring-current"
                                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                                                                    }`}
                                                            >
                                                                {label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Ghi chú / Phản hồi
                                                    </label>
                                                    <Textarea
                                                        value={editedNotes}
                                                        onChange={(e) => setEditedNotes(e.target.value)}
                                                        placeholder="Thêm ghi chú hoặc phản hồi cho khách hàng..."
                                                        className="resize-none"
                                                        rows={4}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDetailOpen(false)}
                                    >
                                        Đóng
                                    </Button>
                                    <Button
                                        onClick={handleSaveChanges}
                                        disabled={updateProjectMutation.isPending}
                                        className="gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {updateProjectMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                                    </Button>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
