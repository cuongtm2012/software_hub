import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ExternalRequest } from "@shared/schema";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, FileText, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function ExternalRequestsPage() {
    const [, navigate] = useLocation();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;

    // Fetch external requests with filters
    const { data: requestsData, isLoading } = useQuery({
        queryKey: ["/api/admin/external-requests", statusFilter, priorityFilter, searchQuery, page],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (statusFilter !== "all") params.append("status", statusFilter);
            if (priorityFilter !== "all") params.append("priority", priorityFilter);
            if (searchQuery) params.append("search", searchQuery);
            params.append("page", page.toString());
            params.append("limit", limit.toString());

            const response = await apiRequest("GET", `/api/admin/external-requests?${params.toString()}`);
            return await response.json() as { requests: ExternalRequest[], total: number };
        },
    });

    // Fetch statistics
    const { data: stats } = useQuery({
        queryKey: ["/api/admin/external-requests/stats"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/api/admin/external-requests/stats");
            return await response.json() as { total: number, pending: number, in_progress: number, completed: number };
        },
    });

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { variant: "secondary" as const, icon: Clock, label: "Pending", color: "bg-gray-100 text-gray-800" },
            contacted: { variant: "default" as const, icon: AlertCircle, label: "Contacted", color: "bg-blue-100 text-blue-800" },
            in_progress: { variant: "default" as const, icon: AlertCircle, label: "In Progress", color: "bg-orange-100 text-orange-800" },
            completed: { variant: "default" as const, icon: CheckCircle2, label: "Completed", color: "bg-green-100 text-green-800" },
            cancelled: { variant: "destructive" as const, icon: XCircle, label: "Cancelled", color: "bg-red-100 text-red-800" },
            rejected: { variant: "destructive" as const, icon: XCircle, label: "Rejected", color: "bg-red-100 text-red-800" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge className={`flex items-center gap-1 w-fit ${config.color}`}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const priorityColors = {
            low: "bg-gray-100 text-gray-800",
            normal: "bg-blue-100 text-blue-800",
            high: "bg-orange-100 text-orange-800",
            urgent: "bg-red-100 text-red-800",
        };

        return (
            <Badge className={priorityColors[priority as keyof typeof priorityColors] || priorityColors.normal}>
                {priority || "Normal"}
            </Badge>
        );
    };

    const formatCurrency = (amount: number | string | null) => {
        if (!amount) return "Not specified";
        const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
        return `${numAmount.toLocaleString('vi-VN')} ₫`;
    };

    const formatDate = (date: string | Date | null) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString('vi-VN');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">External Requests Management</h1>
                    <p className="text-gray-600">Review and manage project requests from clients</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total Requests</CardDescription>
                            <CardTitle className="text-3xl">{stats?.total || 0}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Pending
                            </CardDescription>
                            <CardTitle className="text-3xl text-orange-600">{stats?.pending || 0}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                In Progress
                            </CardDescription>
                            <CardTitle className="text-3xl text-blue-600">{stats?.in_progress || 0}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Completed
                            </CardDescription>
                            <CardTitle className="text-3xl text-green-600">{stats?.completed || 0}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Priority Filter */}
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Requests List */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
                    </div>
                ) : requestsData && requestsData.requests.length > 0 ? (
                    <div className="space-y-4">
                        {requestsData.requests.map((request) => (
                            <Card key={request.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Request #{request.id} - {request.name}
                                                </h3>
                                                {getStatusBadge(request.status)}
                                                {getPriorityBadge(request.priority || "normal")}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">Email</p>
                                                    <p className="text-sm font-medium">{request.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Phone</p>
                                                    <p className="text-sm font-medium">{request.phone || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Budget</p>
                                                    <p className="text-sm font-medium">{formatCurrency(request.budget)}</p>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500 mb-1">Project Description</p>
                                                <p className="text-sm text-gray-700 line-clamp-2">
                                                    {request.project_description || "No description provided"}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>Created: {formatDate(request.created_at)}</span>
                                                {request.timeline && <span>Timeline: {request.timeline}</span>}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 ml-4">
                                            <Button
                                                onClick={() => navigate(`/projects/${request.id}`)}
                                                className="bg-[#004080] hover:bg-[#003366]"
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {requestsData.total > limit && (
                            <div className="flex justify-center gap-2 mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-4 text-sm text-gray-600">
                                    Page {page} of {Math.ceil(requestsData.total / limit)}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= Math.ceil(requestsData.total / limit)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                            <p className="text-gray-600">Try adjusting your filters or search query</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
