import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Users,
  Package,
  FileText,
  BarChart3,
  Search,
  Eye,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Clock,
  Loader2,
  Trash2,
  Edit,
  MessageCircle,
  TestTube,
  Bell,
} from "lucide-react";
import SoftwareManagement from "@/pages/admin/software-management";
import {
  deduplicateUsersByEmail,
  getUserDuplicationStats,
} from "@/lib/userUtils";

// Types
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status?: string;
  created_at: string;
}

interface ExternalRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  project_description: string;
  status: string;
  created_at: string;
  title?: string;
  budget?: string;
  deadline?: string;
  assigned_developer_id?: number;
  client_id?: number;
}

interface Software {
  id: number;
  name: string;
  category: string;
  description: string;
  download_url: string;
  created_at: string;
}

// User Management Component
function UserManagementComponent() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery<{ users: User[]; total: number }>({
    queryKey: ["/api/admin/users"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({
      id,
      userData,
    }: {
      id: number;
      userData: Partial<User>;
    }) => {
      return apiRequest("PUT", `/api/admin/users/${id}`, userData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditUserDialogOpen(false);
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      refetch();
    },
    onError: (error: Error) => {
      console.error('Delete user error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const allUsers = usersData?.users?.users || [];
  const uniqueUsers = deduplicateUsersByEmail(allUsers);
  const stats = getUserDuplicationStats(allUsers);

  const filteredUsers = uniqueUsers.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">User Management</h3>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            User Management
          </h3>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Details</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={`user-${user.id}-${user.email}`}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.role === "admin"
                          ? "default"
                          : user.role === "developer"
                            ? "secondary"
                            : user.role === "seller"
                              ? "outline"
                              : "secondary"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "destructive"
                      }
                    >
                      {user.status || "active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditUserDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="text-gray-500">
                    No users found matching your criteria
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog
        open={isEditUserDialogOpen}
        onOpenChange={setIsEditUserDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={selectedUser.name}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value) =>
                    setSelectedUser({ ...selectedUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={selectedUser.status || "active"}
                  onValueChange={(value) =>
                    setSelectedUser({ ...selectedUser, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditUserDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedUser &&
                updateUserMutation.mutate({
                  id: selectedUser.id,
                  userData: selectedUser,
                })
              }
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedUser && deleteUserMutation.mutate(selectedUser.id)
              }
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Software List Component
function SoftwareListComponent() {
  const { data: softwareData, isLoading } = useQuery<{
    software: Software[];
    total: number;
  }>({
    queryKey: ["/api/software"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Software Management
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {softwareData?.total || 0} software items
          </p>
        </div>
      </div>

      {softwareData?.software && softwareData.software.length > 0 ? (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {softwareData.software.map((software) => (
                <TableRow key={software.id}>
                  <TableCell className="font-medium">{software.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{software.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {software.description}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(software.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Software</h3>
          <p className="text-gray-500">
            No software items have been added yet.
          </p>
        </div>
      )}
    </div>
  );
}

// Enhanced External Requests Component (merged with Projects)
function ExternalRequestsComponent() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] =
    useState<ExternalRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const {
    data: requestsData,
    isLoading,
    refetch,
  } = useQuery<{ requests: ExternalRequest[]; total: number }>({
    queryKey: ["/api/admin/external-requests"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      console.log("Updating external request status:", { id, status });
      const response = await fetch(
        `/api/admin/external-requests/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        },
      );
      console.log("External request status update response:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("External request status update error:", errorText);
        throw new Error(
          `Failed to update status: ${response.status} ${errorText}`,
        );
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Request status updated successfully",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    },
  });

  const assignDeveloperMutation = useMutation({
    mutationFn: async ({
      id,
      developerId,
    }: {
      id: number;
      developerId: number;
    }) => {
      const response = await fetch(
        `/api/admin/external-requests/${id}/assign`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ assigned_developer_id: developerId }),
        },
      );
      if (!response.ok) throw new Error("Failed to assign developer");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Developer assigned successfully",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign developer",
        variant: "destructive",
      });
    },
  });

  const filteredRequests =
    requestsData?.requests?.filter((request) => {
      const matchesSearch =
        request.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.project_description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">External Requests</h3>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            External Requests & Projects
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {filteredRequests.length} of {requestsData?.total || 0} requests
          </p>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request Details</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {request.title || `Request #${request.id}`}
                      </div>
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {request.project_description}
                      </div>
                      {request.budget && (
                        <div className="text-sm text-green-600 font-medium mt-1">
                          Budget: {request.budget}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{request.name}</div>
                      <div className="text-gray-500">{request.email}</div>
                      {request.phone && (
                        <div className="text-gray-500">{request.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === "completed"
                          ? "default"
                          : request.status === "in_progress"
                            ? "secondary"
                            : request.status === "pending"
                              ? "outline"
                              : "destructive"
                      }
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(request.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm">
                    {request.assigned_developer_id ? (
                      <Badge variant="secondary">
                        Developer #{request.assigned_developer_id}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsDetailDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        value={request.status}
                        onValueChange={(status) =>
                          updateStatusMutation.mutate({
                            id: request.id,
                            status,
                          })
                        }
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-gray-500">
                    No requests found matching your criteria
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Request Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              View and manage external request information
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">
                    Contact Information
                  </Label>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedRequest.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedRequest.email}</span>
                    </div>
                    {selectedRequest.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedRequest.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">
                    Project Details
                  </Label>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>
                        Created:{" "}
                        {new Date(
                          selectedRequest.created_at,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedRequest.budget && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span>Budget: {selectedRequest.budget}</span>
                      </div>
                    )}
                    {selectedRequest.deadline && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>
                          Deadline:{" "}
                          {new Date(
                            selectedRequest.deadline,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">
                  Project Description
                </Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">
                    {selectedRequest.project_description}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-semibold">Status</Label>
                  <Select
                    value={selectedRequest.status}
                    onValueChange={(status) => {
                      updateStatusMutation.mutate({
                        id: selectedRequest.id,
                        status,
                      });
                      setSelectedRequest({ ...selectedRequest, status });
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to view the admin dashboard",
        variant: "destructive",
      });
    }
  }, [user, navigate, toast]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Login Required</h2>
                <p className="text-gray-600 mb-4">
                  Please log in to access the admin dashboard.
                </p>
                <Button onClick={() => navigate("/test-login")}>Login</Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Manage users, software, and external requests
              </p>
            </div>
            <div className="space-x-2">
              <Button
                onClick={() => navigate("/admin/users/chat")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                User Chat Management
              </Button>
              <Button
                onClick={() => navigate("/admin/email-tests")}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Email Testing
              </Button>
              <Button
                onClick={() => navigate("/admin/push-notifications")}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50"
              >
                <Bell className="h-4 w-4 mr-2" />
                Push Notifications
              </Button>
              <Button
                onClick={() => navigate("/admin/end-to-end-tests")}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                End-to-End Tests
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Management
              </TabsTrigger>
              <TabsTrigger
                value="external-requests"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                External Requests
              </TabsTrigger>
              <TabsTrigger value="software" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Software
              </TabsTrigger>
              <TabsTrigger value="sellers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Seller Approvals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Software Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600">
                        Use the Software tab for full management capabilities
                      </p>
                      <Button variant="outline" size="sm" className="mt-2">
                        View All Software
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium">Total Users</span>
                        <Badge>View Details</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium">
                          Pending Requests
                        </span>
                        <Badge variant="secondary">View Details</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium">
                          Active Software
                        </span>
                        <Badge variant="outline">View Details</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <UserManagementComponent />
            </TabsContent>

            <TabsContent value="external-requests">
              <ExternalRequestsComponent />
            </TabsContent>

            <TabsContent value="software">
              <SoftwareManagement />
            </TabsContent>

            <TabsContent value="sellers">
              <SellersManagementComponent />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SellersManagementComponent() {
  const { toast } = useToast();
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch sellers data
  const { data: sellersData, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/sellers"],
  });

  // Update seller status mutation
  const updateSellerMutation = useMutation({
    mutationFn: async ({ userId, status, notes }: { userId: number; status: string; notes?: string }) => {
      const response = await fetch(`/api/admin/sellers/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) throw new Error("Failed to update seller status");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Seller status updated successfully" });
      refetch();
      setIsViewDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update seller status", variant: "destructive" });
    },
  });

  const handleViewDocuments = (seller: any) => {
    setSelectedSeller(seller);
    setIsViewDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedSeller) {
      updateSellerMutation.mutate({
        userId: selectedSeller.user_id,
        status: "verified",
        notes: "Approved by admin"
      });
    }
  };

  const handleReject = () => {
    if (selectedSeller) {
      updateSellerMutation.mutate({
        userId: selectedSeller.user_id,
        status: "rejected",
        notes: "Rejected by admin"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  const sellers = sellersData?.sellers || [];
  const pendingSellers = sellers.filter((s: any) => s.verification_status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Seller Approvals</h3>
          <p className="text-sm text-gray-500 mt-1">
            {pendingSellers.length} pending registrations
          </p>
        </div>
      </div>

      {pendingSellers.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h4>
            <p className="text-gray-500">All seller registrations have been reviewed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Info</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingSellers.map((seller: any) => (
                <TableRow key={seller.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{seller.business_name}</div>
                      <div className="text-sm text-gray-500">{seller.business_type}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{seller.user?.name}</div>
                      <div className="text-sm text-gray-500">{seller.user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {seller.documents_uploaded ? (
                        <Badge variant="secondary">Documents Uploaded</Badge>
                      ) : (
                        <Badge variant="outline">No Documents</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{seller.verification_status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocuments(seller)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seller Registration Review</DialogTitle>
            <DialogDescription>
              Review seller information and documents for approval
            </DialogDescription>
          </DialogHeader>
          
          {selectedSeller && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Business Name</Label>
                  <p className="mt-1">{selectedSeller.business_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Business Type</Label>
                  <p className="mt-1">{selectedSeller.business_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Contact Person</Label>
                  <p className="mt-1">{selectedSeller.user?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Email</Label>
                  <p className="mt-1">{selectedSeller.user?.email}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold">Business Description</Label>
                <p className="mt-1 text-sm">{selectedSeller.business_description}</p>
              </div>
              
              {selectedSeller.documents_uploaded && (
                <div>
                  <Label className="text-sm font-semibold">Documents</Label>
                  <div className="mt-2 space-y-2">
                    {selectedSeller.national_id_front && (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">National ID (Front)</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/api/r2/download?key=${selectedSeller.national_id_front}`, '_blank')}
                        >
                          View
                        </Button>
                      </div>
                    )}
                    {selectedSeller.national_id_back && (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">National ID (Back)</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/api/r2/download?key=${selectedSeller.national_id_back}`, '_blank')}
                        >
                          View
                        </Button>
                      </div>
                    )}
                    {selectedSeller.bank_account_details && (
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Bank Account Details</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/api/r2/download?key=${selectedSeller.bank_account_details}`, '_blank')}
                        >
                          View
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={updateSellerMutation.isPending}
            >
              {updateSellerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={updateSellerMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {updateSellerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
