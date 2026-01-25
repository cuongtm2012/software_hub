import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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
    History,
    X,
} from "lucide-react";

type ProjectStatus = "pending" | "in_progress" | "completed" | "cancelled" | "contacted" | "converted" | "rejected";

interface Project {
    id: number;
    name: string;
    email: string;
    phone?: string;
    project_description: string;
    requirements?: string;
    technology_stack?: string[];
    budget_range?: string;
    timeline?: string;
    status: ProjectStatus;
    created_at: string;
    company?: string;
    admin_notes?: string;
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

export default function ProjectsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editedStatus, setEditedStatus] = useState<ProjectStatus>("pending");
    const [editedNotes, setEditedNotes] = useState("");

    // Fetch projects
    const { data: projectsData, isLoading } = useQuery<{ projects: Project[] }>({
        queryKey: ["/api/admin/projects", { status: selectedStatus, search: searchQuery }],
        enabled: user?.role === "admin",
    });

    // Fetch stats
    const { data: stats } = useQuery<Record<string, number>>({
        queryKey: ["/api/admin/projects/stats"],
        enabled: user?.role === "admin",
    });

    // Update project mutation
    const updateProjectMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<Project> }) => {
            const response = await fetch(`/api/admin/projects/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to update project");
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
            return projects.length;
        }
        return stats?.[status] || 0;
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
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Quản lý Project
                    </h1>
                    <p className="text-muted-foreground">
                        Quản lý và theo dõi các yêu cầu dự án từ khách hàng
                    </p>
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
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(project)}
                                                    className="gap-2"
                                                >
                                                    <List className="w-4 h-4" />
                                                    Chi tiết
                                                </Button>
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
