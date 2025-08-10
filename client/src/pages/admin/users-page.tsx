import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, 
  Loader2, 
  Search, 
  UsersRound, 
  AlertTriangle 
} from "lucide-react";

// Role definitions for display
const roleDefinitions = {
  admin: {
    label: "Admin",
    color: "bg-red-500"
  },
  user: {
    label: "User",
    color: "bg-blue-500"
  },
  developer: {
    label: "Developer",
    color: "bg-green-500"
  },
  client: {
    label: "Client",
    color: "bg-purple-500"
  },
  seller: {
    label: "Seller",
    color: "bg-amber-500"
  },
  buyer: {
    label: "Buyer",
    color: "bg-cyan-500"
  }
};

interface User {
  id: number;
  name: string;
  email: string;
  role: keyof typeof roleDefinitions;
  created_at: string;
}

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  
  // Fetch users from API
  const { 
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError
  } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/users');
      return response.json();
    }
  });
  
  // Handle role change mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number, role: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/users/${userId}/role`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to update role",
        description: error.message || "An error occurred while updating the role.",
      });
    }
  });

  // Handle password reset mutation
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
  
  // Filter users based on search term
  const filteredUsers = usersData?.users?.filter((user: User) => {
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      roleDefinitions[user.role].label.toLowerCase().includes(searchTermLower)
    );
  });
  
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsEditDialogOpen(true);
  };
  
  const handleRoleUpdate = () => {
    if (!selectedUser || !selectedRole) return;
    
    updateRoleMutation.mutate({
      userId: selectedUser.id,
      role: selectedRole
    });
  };

  const handlePasswordReset = () => {
    if (!selectedUser) return;
    
    resetPasswordMutation.mutate({
      userId: selectedUser.id
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => navigate('/admin')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Admin
          </Button>
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UsersRound className="mr-2 h-5 w-5" />
              All Users
            </CardTitle>
            <CardDescription>
              View and manage all user accounts in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {isLoadingUsers ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : usersError ? (
              <div className="text-center py-8 text-red-500">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium">Error loading users</h3>
                <p className="text-sm">Please try again later</p>
              </div>
            ) : filteredUsers?.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: User) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={roleDefinitions[user.role].color}>
                          {roleDefinitions[user.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditClick(user)}
                        >
                          Edit Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <UsersRound className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                {searchTerm ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">No users found</h3>
                    <p className="text-muted-foreground">
                      No users match your search criteria.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">No users available</h3>
                    <p className="text-muted-foreground">
                      There are no users in the system yet.
                    </p>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Manage settings for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={selectedRole}
                  onValueChange={setSelectedRole}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleDefinitions).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label>Password Reset</Label>
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Reset to default password</span>
                    <span className="text-xs text-muted-foreground">New password: abcd1234</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePasswordReset}
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
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRoleUpdate}
                disabled={updateRoleMutation.isPending}
              >
                {updateRoleMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}