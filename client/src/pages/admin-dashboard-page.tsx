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
  AlertTriangle,
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
  CheckCircle2,
  XCircle,
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

interface AdminStatistics {
  users: {
    total: number;
  };
  software: {
    total: number;
    active: number;
    newInLast7Days: number;
  };
  products: {
    total: number;
    active: number;
  };
  projects: {
    total: number;
    pending: number;
  };
  pendingRequests: number;
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
  } = useQuery<{ users: { users: User[] }; total: number }>({
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

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId }: { userId: number }) => {
      const response = await apiRequest('POST', `/api/admin/users/${userId}/reset-password`, { 
        newPassword: 'abcd1234' 
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password reset",
        description: "User password has been reset to 'abcd1234'.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to reset password",
        description: error.message || "An error occurred while resetting the password.",
      });
    }
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
              
              <div className="grid gap-2">
                <Label>Password Reset</Label>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Reset to default password</span>
                    <span className="text-xs text-muted-foreground">New password: abcd1234</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => selectedUser && resetPasswordMutation.mutate({ userId: selectedUser.id })}
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending && (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    )}
                    Reset
                  </Button>
                </div>
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
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: requestsData,
    isLoading,
    refetch,
  } = useQuery<{ requests: ExternalRequest[]; total: number }>({
    queryKey: ["/api/admin/external-requests"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number; status: string; reason: string }) => {
      console.log("Updating external request status:", { id, status, reason });
      const response = await fetch(
        `/api/admin/external-requests/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status, reason }),
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
      setIsDetailDialogOpen(false);
      setStatusReason("");
      setNewStatus("");
      setIsSubmitting(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
      setIsSubmitting(false);
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsDetailDialogOpen(true);
                      }}
                      className="text-xs"
                    >
                      Change Status
                    </Button>
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

      {/* Enhanced Request Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={(open) => {
        setIsDetailDialogOpen(open);
        if (!open) {
          setNewStatus("");
          setStatusReason("");
        } else if (selectedRequest) {
          setNewStatus(selectedRequest.status);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              View and manage external request information
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Project Description with Enhanced Formatting */}
              <div className="bg-white border rounded-lg p-6">
                <div className="space-y-4">
                  {selectedRequest.title && (
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 mb-2">Project Name:</h4>
                      <p className="text-gray-700">{selectedRequest.title}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Company/Contact:</h4>
                    <p className="text-gray-700">{selectedRequest.name}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Description:</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedRequest.project_description}
                      </p>
                    </div>
                  </div>

                  {selectedRequest.requirements && (
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 mb-2">Requirements:</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {selectedRequest.requirements}
                        </p>
                      </div>
                    </div>
                  )}

                  {(selectedRequest.budget || selectedRequest.budget_range) && (
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 mb-2">Budget:</h4>
                      <p className="text-green-600 font-medium">
                        {selectedRequest.budget || selectedRequest.budget_range}
                      </p>
                    </div>
                  )}

                  {(selectedRequest.timeline || selectedRequest.deadline) && (
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 mb-2">Timeline:</h4>
                      <p className="text-gray-700">
                        {selectedRequest.timeline || 
                         (selectedRequest.deadline && `Deadline: ${new Date(selectedRequest.deadline).toLocaleDateString()}`)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{selectedRequest.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{selectedRequest.email}</span>
                    </div>
                    {selectedRequest.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{selectedRequest.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-lg text-gray-900 mb-3">Project Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">
                        Created: {new Date(selectedRequest.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          selectedRequest.status === "completed"
                            ? "default"
                            : selectedRequest.status === "in_progress"
                              ? "secondary"
                              : selectedRequest.status === "pending"
                                ? "outline"
                                : "destructive"
                        }
                      >
                        Current Status: {selectedRequest.status}
                      </Badge>
                    </div>
                    {selectedRequest.assigned_developer_id && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          Developer #{selectedRequest.assigned_developer_id}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Change Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-lg text-gray-900 mb-4">Change Status</h4>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">New Status</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newStatus && newStatus !== selectedRequest.status && (
                    <div>
                      <Label className="text-sm font-semibold">Reason for Status Change *</Label>
                      <textarea
                        className="w-full mt-2 p-3 border rounded-md resize-none"
                        rows={3}
                        value={statusReason}
                        onChange={(e) => setStatusReason(e.target.value)}
                        placeholder="Please provide a reason for this status change..."
                        required
                      />
                    </div>
                  )}
                  
                  {newStatus && newStatus !== selectedRequest.status && (
                    <Button
                      onClick={() => {
                        if (!statusReason.trim()) {
                          toast({
                            title: "Validation Error",
                            description: "Please provide a reason for the status change",
                            variant: "destructive",
                          });
                          return;
                        }
                        setIsSubmitting(true);
                        updateStatusMutation.mutate({
                          id: selectedRequest.id,
                          status: newStatus,
                          reason: statusReason,
                        });
                      }}
                      disabled={isSubmitting || updateStatusMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting || updateStatusMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        "Submit Status Change"
                      )}
                    </Button>
                  )}
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
            <TabsList className="grid w-full grid-cols-6">
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
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Product Approvals
              </TabsTrigger>
              <TabsTrigger value="sellers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Seller Approvals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <OverviewComponent />
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

            <TabsContent value="products">
              <ProductApprovalsComponent />
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

// Overview Component with real data
function OverviewComponent() {
  const { data: statistics, isLoading } = useQuery<AdminStatistics>({
    queryKey: ["/api/admin/statistics"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard - Overview</h1>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard - Overview</h1>
      </div>

      {/* Software Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Software Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total Software</span>
                <span className="text-2xl font-bold text-blue-600">{statistics?.software.total || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Active Software</span>
                <span className="text-2xl font-bold text-green-600">{statistics?.software.active || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">New Software (7 days)</span>
                <span className="text-2xl font-bold text-purple-600">{statistics?.software.newInLast7Days || 0}</span>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm"
              >
                View All Software
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats with Products & Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-600">Total Users</span>
                  <p className="text-2xl font-bold text-blue-600">{statistics?.users.total || 0}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  View Details
                </Button>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-600">Total Products</span>
                  <p className="text-2xl font-bold text-green-600">{statistics?.products.total || 0}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  View Details
                </Button>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-600">Total Projects</span>
                  <p className="text-2xl font-bold text-purple-600">{statistics?.projects.total || 0}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  View Details
                </Button>
              </div>
              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-600">Pending Requests</span>
                  <p className="text-2xl font-bold text-yellow-600">{statistics?.pendingRequests || 0}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <span className="text-sm font-medium text-gray-900">New user registered: john@example.com</span>
              </div>
              <span className="text-xs text-gray-500">10 min ago</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <span className="text-sm font-medium text-gray-900">Software approved for marketplace</span>
              </div>
              <span className="text-xs text-gray-500">30 min ago</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <span className="text-sm font-medium text-gray-900">New project request submitted</span>
              </div>
              <span className="text-xs text-gray-500">1 hour ago</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div>
                <span className="text-sm font-medium text-gray-900">External request reviewed</span>
              </div>
              <span className="text-xs text-gray-500">3 hours ago</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <div>
                <span className="text-sm font-medium text-gray-900">New product added to marketplace</span>
              </div>
              <span className="text-xs text-gray-500">Yesterday</span>
            </div>
            <div className="pt-4 border-t">
              <Button variant="outline" size="sm">
                View All Activities
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications / Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications / Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Scheduled maintenance on Aug 15, 2025 from 01:00 AM to 03:00 AM.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800">
                  New version of platform released.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Security alert: Password reset recommended for all admins.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button variant="outline" size="sm">
                View All Notifications
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="border-t pt-6">
        <p className="text-center text-sm text-gray-500">
          © 2025 SoftwareHub Admin Panel
        </p>
      </div>
    </div>
  );
}

function SellersManagementComponent() {
  const { toast } = useToast();
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});

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
      setDocumentUrls({});
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update seller status", variant: "destructive" });
    },
  });

  const handleViewDocuments = async (seller: any) => {
    setSelectedSeller(seller);
    setIsViewDialogOpen(true);
    
    // Fetch presigned URLs for documents
    const urls: Record<string, string> = {};
    
    if (seller.national_id_front) {
      try {
        const response = await fetch(`/api/r2/image-url?key=${encodeURIComponent(seller.national_id_front)}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          urls.national_id_front = data.url;
        }
      } catch (error) {
        console.error('Failed to get National ID front URL:', error);
      }
    }
    
    if (seller.national_id_back) {
      try {
        const response = await fetch(`/api/r2/image-url?key=${encodeURIComponent(seller.national_id_back)}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          urls.national_id_back = data.url;
        }
      } catch (error) {
        console.error('Failed to get National ID back URL:', error);
      }
    }
    
    if (seller.bank_account_details) {
      try {
        const response = await fetch(`/api/r2/image-url?key=${encodeURIComponent(seller.bank_account_details)}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          urls.bank_account_details = data.url;
        }
      } catch (error) {
        console.error('Failed to get bank account details URL:', error);
      }
    }
    
    setDocumentUrls(urls);
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

  const sellers = (sellersData as any)?.sellers || [];
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
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        setIsViewDialogOpen(open);
        if (!open) {
          setDocumentUrls({});
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Seller Registration Review</DialogTitle>
            <DialogDescription>
              Review seller information and documents for approval
            </DialogDescription>
          </DialogHeader>
          
          {selectedSeller && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Full Name</Label>
                    <p className="mt-1 text-gray-900">{selectedSeller.user?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Email Address</Label>
                    <p className="mt-1 text-gray-900">{selectedSeller.user?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Phone Number</Label>
                    <p className="mt-1 text-gray-900">{selectedSeller.user?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Registration Date</Label>
                    <p className="mt-1 text-gray-900">{new Date(selectedSeller.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Business Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Business Name</Label>
                    <p className="mt-1 text-gray-900">{selectedSeller.business_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Business Type</Label>
                    <p className="mt-1 text-gray-900">{selectedSeller.business_type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Tax ID</Label>
                    <p className="mt-1 text-gray-900">{selectedSeller.tax_id || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Verification Status</Label>
                    <div className="mt-1">
                      <Badge variant={selectedSeller.verification_status === 'pending' ? 'secondary' : 'default'}>
                        {selectedSeller.verification_status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {selectedSeller.business_address && (
                  <div className="mt-4">
                    <Label className="text-sm font-semibold text-gray-600">Business Address</Label>
                    <p className="mt-1 text-gray-900">{selectedSeller.business_address}</p>
                  </div>
                )}
                
                {selectedSeller.business_description && (
                  <div className="mt-4">
                    <Label className="text-sm font-semibold text-gray-600">Business Description</Label>
                    <p className="mt-1 text-gray-900 text-sm leading-relaxed">{selectedSeller.business_description}</p>
                  </div>
                )}
              </div>

              {/* Bank Information */}
              {selectedSeller.bank_account && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Bank Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 gap-2">
                      {(() => {
                        try {
                          const bankInfo = JSON.parse(selectedSeller.bank_account);
                          return (
                            <>
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Bank Name</Label>
                                <p className="mt-1 text-gray-900">{bankInfo.bank_name}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Account Number</Label>
                                <p className="mt-1 text-gray-900">{bankInfo.account_number}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-semibold text-gray-600">Account Holder</Label>
                                <p className="mt-1 text-gray-900">{bankInfo.account_holder_name}</p>
                              </div>
                            </>
                          );
                        } catch {
                          return (
                            <div>
                              <Label className="text-sm font-semibold text-gray-600">Bank Account</Label>
                              <p className="mt-1 text-gray-900">{selectedSeller.bank_account}</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Verification Documents */}
              {selectedSeller.documents_uploaded && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Verification Documents</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedSeller.national_id_front && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">National ID (Front)</h5>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/r2/download?key=${selectedSeller.national_id_front}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Size
                          </Button>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-2">
                          {documentUrls.national_id_front ? (
                            <img
                              src={documentUrls.national_id_front}
                              alt="National ID Front"
                              className="max-w-full max-h-48 mx-auto object-contain rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextSibling) {
                                  nextSibling.style.display = 'block';
                                }
                              }}
                            />
                          ) : (
                            <div className="text-center text-gray-500 py-8">
                              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                              <p>Loading image...</p>
                            </div>
                          )}
                          <div className="hidden text-center text-gray-500 py-8">
                            <FileText className="h-12 w-12 mx-auto mb-2" />
                            <p>Document preview not available</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedSeller.national_id_back && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">National ID (Back)</h5>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/r2/download?key=${selectedSeller.national_id_back}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Size
                          </Button>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-2">
                          {documentUrls.national_id_back ? (
                            <img
                              src={documentUrls.national_id_back}
                              alt="National ID Back"
                              className="max-w-full max-h-48 mx-auto object-contain rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextSibling) {
                                  nextSibling.style.display = 'block';
                                }
                              }}
                            />
                          ) : (
                            <div className="text-center text-gray-500 py-8">
                              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                              <p>Loading image...</p>
                            </div>
                          )}
                          <div className="hidden text-center text-gray-500 py-8">
                            <FileText className="h-12 w-12 mx-auto mb-2" />
                            <p>Document preview not available</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedSeller.bank_account_details && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">Bank Account Details</h5>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/r2/download?key=${selectedSeller.bank_account_details}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Size
                          </Button>
                        </div>
                        <div className="bg-gray-100 rounded-lg p-2">
                          {documentUrls.bank_account_details ? (
                            <img
                              src={documentUrls.bank_account_details}
                              alt="Bank Account Details"
                              className="max-w-full max-h-48 mx-auto object-contain rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                                if (nextSibling) {
                                  nextSibling.style.display = 'block';
                                }
                              }}
                            />
                          ) : (
                            <div className="text-center text-gray-500 py-8">
                              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                              <p>Loading image...</p>
                            </div>
                          )}
                          <div className="hidden text-center text-gray-500 py-8">
                            <FileText className="h-12 w-12 mx-auto mb-2" />
                            <p>Document preview not available</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setIsViewDialogOpen(false);
              setDocumentUrls({});
            }}>
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

// Product Approvals Component
function ProductApprovalsComponent() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionComment, setActionComment] = useState("");
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | 'request_changes' | null>(null);

  // Fetch products for approval
  const { data: productsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/products', { 
      page: currentPage, 
      search: searchQuery,
      status: statusFilter,
      category: categoryFilter
    }],
    queryFn: async () => {
      // Use existing products API
      const response = await fetch('/api/products', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      return {
        products: data.products || [],
        total: data.products?.length || 0
      };
    }
  });

  // Product action mutations
  const productActionMutation = useMutation({
    mutationFn: async ({ productId, action, comment }: { 
      productId: number; 
      action: 'approve' | 'reject' | 'request_changes';
      comment?: string;
    }) => {
      // Update product status
      const status = action === 'approve' ? 'published' : action === 'reject' ? 'rejected' : 'draft';
      const response = await apiRequest('PUT', `/api/products/${productId}`, { status });
      
      return { ...response, newStatus: status };
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: "Product status updated successfully"
      });
      
      // Update the selected product's status immediately for instant UI feedback
      if (selectedProduct && selectedProduct.id === variables.productId) {
        setSelectedProduct({
          ...selectedProduct,
          status: data.newStatus
        });
      }
      
      // Refresh the products list
      refetch();
      setShowActionDialog(false);
      setActionComment("");
      setPendingAction(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update product status",
        variant: "destructive"
      });
    }
  });

  const handleProductAction = (action: 'approve' | 'reject' | 'request_changes') => {
    setPendingAction(action);
    setShowActionDialog(true);
  };

  const confirmAction = () => {
    if (selectedProduct && pendingAction) {
      productActionMutation.mutate({
        productId: selectedProduct.id,
        action: pendingAction,
        comment: actionComment
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, text: "Draft", className: "" },
      pending: { variant: "default" as const, text: "Pending", className: "" },
      approved: { variant: "default" as const, text: "Approved", className: "bg-green-100 text-green-800" },
      rejected: { variant: "destructive" as const, text: "Rejected", className: "" },
      published: { variant: "default" as const, text: "Published", className: "bg-blue-100 text-blue-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Product Approvals</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const products = productsData?.products || [];
  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = !searchQuery || 
      product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / 10);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Product Approvals</h1>
        <p className="text-gray-600 mt-2">Review and approve marketplace products</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Productivity">Productivity</SelectItem>
                <SelectItem value="Security">Security</SelectItem>
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No products found
                </div>
              ) : (
                paginatedProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProduct?.id === product.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{product.title}</h3>
                      {getStatusBadge(product.status)}
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Seller: {product.seller_id}</p>
                      <p>Submitted: {formatDate(product.created_at)}</p>
                      <p>Price: {parseInt(product.price).toLocaleString()} ₫</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="px-3 py-2 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedProduct ? selectedProduct.title : 'Select a Product'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-6">
                {/* Images */}
                {selectedProduct.images && selectedProduct.images.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Product Images</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProduct.images.slice(0, 4).map((image: string, index: number) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-gray-600">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium">Price</h4>
                      <p className="text-sm text-gray-600">
                        {parseInt(selectedProduct.price).toLocaleString()} ₫
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Stock</h4>
                      <p className="text-sm text-gray-600">
                        {selectedProduct.stock_quantity}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium">Status</h4>
                    {getStatusBadge(selectedProduct.status)}
                  </div>

                  <div>
                    <h4 className="font-medium">Submitted by</h4>
                    <p className="text-sm text-gray-600">
                      Seller {selectedProduct.seller_id}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium">Submission Date</h4>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedProduct.created_at)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedProduct.status === 'pending' || selectedProduct.status === 'draft' ? (
                  <div className="pt-4 border-t">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleProductAction('approve')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleProductAction('reject')}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleProductAction('request_changes')}
                        variant="outline"
                        className="flex-1"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Request Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 text-center">
                      Product has already been {selectedProduct.status}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a product to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction === 'approve' && 'Approve Product'}
              {pendingAction === 'reject' && 'Reject Product'}
              {pendingAction === 'request_changes' && 'Request Changes'}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === 'approve' && 'This product will be approved and made available in the marketplace.'}
              {pendingAction === 'reject' && 'This product will be rejected and not published.'}
              {pendingAction === 'request_changes' && 'The seller will be notified to make changes before resubmission.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comment">Comment to Seller (Optional)</Label>
              <Input
                id="comment"
                placeholder="Add a comment for the seller..."
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={productActionMutation.isPending}
              className={
                pendingAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                pendingAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                ''
              }
            >
              {productActionMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm {pendingAction === 'approve' ? 'Approval' : pendingAction === 'reject' ? 'Rejection' : 'Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
