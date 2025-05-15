import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function UsersManagementPage() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<Record<number, string>>({});
  
  const { data: users, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ["/api/admin/users"],
    select: (data) => data,
  });
  
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user role");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Role updated",
        description: "User role has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function handleRoleChange(userId: number, role: string) {
    setSelectedRole((prev) => ({ ...prev, [userId]: role }));
  }
  
  function handleUpdateRole(userId: number) {
    const role = selectedRole[userId];
    if (!role) return;
    
    updateRoleMutation.mutate({ userId, role });
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">User Management</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted border-b">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Current Role</th>
              <th className="px-4 py-2 text-left">New Role</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.users?.map((user) => (
              <tr key={user.id} className="border-b hover:bg-muted/50">
                <td className="px-4 py-2">{user.id}</td>
                <td className="px-4 py-2">{user.username}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <Select 
                    value={selectedRole[user.id] || ""} 
                    onValueChange={(value) => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="seller">Seller</SelectItem>
                      <SelectItem value="buyer">Buyer</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-2">
                  <Button
                    size="sm"
                    disabled={!selectedRole[user.id] || updateRoleMutation.isPending}
                    onClick={() => handleUpdateRole(user.id)}
                  >
                    {updateRoleMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : selectedRole[user.id] ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-2" />
                    )}
                    Update
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}