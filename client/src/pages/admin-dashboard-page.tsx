import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle2, Clock, FileText, DollarSign, MessagesSquare, RefreshCw, ExternalLink, Loader2, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for the admin dashboard
interface ExternalRequest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  project_description: string;
  status: string;
  created_at: string;
}

interface ProjectData {
  title: string;
  description: string;
  requirements: string;
  budget: number;
  deadline: string;
}

interface Software {
  id: number;
  name: string;
  description: string;
  category_id: number;
  platform: string[];
  download_link: string;
  image_url?: string;
  status: string;
  created_at: string;
  created_by: number;
}

// Simple Software List Component
function SoftwareListComponent() {
  const [, navigate] = useLocation();
  
  const { data: softwareData, isLoading } = useQuery<{ softwares: Software[], total: number }>({
    queryKey: ['/api/admin/softwares'],
  });

  const { data: categories } = useQuery<{ id: number; name: string; }[]>({
    queryKey: ['/api/categories'],
  });

  const getCategoryName = (categoryId: number) => {
    return categories?.find(cat => cat.id === categoryId)?.name || "Unknown";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Software List</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Software List ({softwareData?.total || 0})</h3>
        <Button 
          variant="default" 
          className="bg-[#004080] hover:bg-[#003366]"
          onClick={() => navigate('/admin/software')}
        >
          Manage All Software
        </Button>
      </div>
      
      {softwareData?.softwares && softwareData.softwares.length > 0 ? (
        <div className="space-y-2">
          {softwareData.softwares.slice(0, 5).map((software) => (
            <div key={software.id} className="flex items-center space-x-4 p-4 border rounded hover:bg-gray-50">
              {software.image_url ? (
                <img 
                  src={software.image_url} 
                  alt={software.name}
                  className="h-12 w-12 rounded object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-500" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">{software.name}</h4>
                  <Badge variant={
                    software.status === 'approved' ? 'default' :
                    software.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {software.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 truncate">{software.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <span>Category: {getCategoryName(software.category_id)}</span>
                  <span>Platforms: {software.platform.slice(0, 2).join(', ')}</span>
                  {software.platform.length > 2 && <span>+{software.platform.length - 2} more</span>}
                </div>
              </div>
              
              <Button variant="outline" size="sm" asChild>
                <a href={software.download_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          ))}
          
          {softwareData.softwares.length > 5 && (
            <div className="text-center pt-2">
              <Button variant="outline" onClick={() => navigate('/admin/software')}>
                View All {softwareData.total} Software
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Software Found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first software listing.</p>
          <Button onClick={() => navigate('/admin/software')}>
            Add Software
          </Button>
        </div>
      )}
    </div>
  );
}

// Simple User List Component
function UserListComponent() {
  const [, navigate] = useLocation();
  
  const { data: usersData, isLoading } = useQuery<{ users: any[], total: number }>({
    queryKey: ['/api/admin/users'],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">User List</h3>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">User List ({usersData?.total || 0})</h3>
        <Button 
          variant="default" 
          onClick={() => navigate('/admin/users')}
        >
          Manage All Users
        </Button>
      </div>
      
      {usersData?.users && usersData.users.length > 0 ? (
        <div className="space-y-2">
          {usersData.users.slice(0, 5).map((user) => (
            <div key={user.id} className="flex items-center space-x-4 p-4 border rounded hover:bg-gray-50">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">{user.name || 'Unknown User'}</h4>
                  <Badge variant={
                    user.role === 'admin' ? 'default' :
                    user.role === 'developer' ? 'secondary' : 'outline'
                  }>
                    {user.role || 'user'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 truncate">{user.email}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <span>Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</span>
                  {user.last_login && <span>Last login: {new Date(user.last_login).toLocaleDateString()}</span>}
                </div>
              </div>
              
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </div>
          ))}
          
          {usersData.users.length > 5 && (
            <div className="text-center pt-2">
              <Button variant="outline" onClick={() => navigate('/admin/users')}>
                View All {usersData.total} Users
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Users Found</h3>
          <p className="text-gray-600 mb-4">There are no users in the system yet.</p>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [selectedRequest, setSelectedRequest] = useState<ExternalRequest | null>(null);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState<ProjectData>({
    title: "",
    description: "",
    requirements: "",
    budget: 0,
    deadline: ""
  });
  
  // Check if user is admin, redirect if not
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You don't have permission to view the admin dashboard",
        variant: "destructive"
      });
    }
  }, [user, navigate, toast]);

  // Fetch external requests
  const { 
    data: externalRequestsData,
    isLoading: isLoadingRequests 
  } = useQuery<{ requests: ExternalRequest[], total: number }>({
    queryKey: ['/api/external-requests'],
    enabled: !!user && user.role === 'admin'
  });

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest("PUT", `/api/external-requests/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/external-requests'] });
      toast({
        title: "Status Updated",
        description: "Request status has been updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Convert to project mutation
  const convertToProjectMutation = useMutation({
    mutationFn: async ({ id, projectData }: { id: number, projectData: ProjectData }) => {
      const response = await apiRequest("POST", `/api/external-requests/${id}/convert`, projectData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/external-requests'] });
      setIsConvertDialogOpen(false);
      toast({
        title: "Project Created",
        description: "External request has been converted to a project"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Handle request selection for conversion
  const handleRequestSelect = (request: ExternalRequest) => {
    setSelectedRequest(request);
    // Parse project details from description
    const lines = request.project_description.split("\n");
    let title = "";
    let description = "";
    let requirements = "";
    let budget = 0;
    
    for (const line of lines) {
      if (line.startsWith("Project Name:")) {
        title = line.replace("Project Name:", "").trim();
      } else if (line.startsWith("Description:")) {
        description = line.replace("Description:", "").trim();
      } else if (line.startsWith("Requirements:")) {
        requirements = line.replace("Requirements:", "").trim();
      } else if (line.startsWith("Budget:")) {
        const budgetStr = line.replace("Budget:", "").trim();
        budget = parseInt(budgetStr) || 0;
      }
    }
    
    setProjectFormData({
      title,
      description,
      requirements,
      budget,
      deadline: ""
    });
    
    setIsConvertDialogOpen(true);
  };

  // Handle convert form submission
  const handleConvert = () => {
    if (!selectedRequest) return;
    
    convertToProjectMutation.mutate({
      id: selectedRequest.id,
      projectData: projectFormData
    });
  };

  // Handle status change
  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  // If not admin, show unauthorized message
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to view this page.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage software submissions, external requests, and user accounts</p>
        </div>

        <Tabs defaultValue="external-requests" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="external-requests">External Requests</TabsTrigger>
            <TabsTrigger value="software-submissions">Software Submissions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="external-requests">
            <Card>
              <CardHeader>
                <CardTitle>External Project Requests</CardTitle>
                <CardDescription>
                  View and manage project requests from external clients
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isLoadingRequests ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : externalRequestsData?.requests && externalRequestsData.requests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {externalRequestsData.requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.id}</TableCell>
                          <TableCell className="font-medium">{request.name}</TableCell>
                          <TableCell>{request.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                request.status === 'new' ? 'bg-blue-500' :
                                request.status === 'contacted' ? 'bg-amber-500' :
                                request.status === 'converted' ? 'bg-green-500' :
                                'bg-red-500'
                              }
                            >
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Request Details",
                                    description: <div className="mt-2 text-sm">
                                      <p className="font-bold">Description:</p>
                                      <p className="whitespace-pre-wrap">{request.project_description}</p>
                                    </div>,
                                  });
                                }}
                              >
                                View
                              </Button>
                              
                              {request.status !== 'converted' && (
                                <Select
                                  defaultValue={request.status}
                                  onValueChange={(value) => handleStatusChange(request.id, value)}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              
                              {request.status !== 'converted' && request.status !== 'rejected' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleRequestSelect(request)}
                                >
                                  Convert to Project
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No External Requests</h3>
                    <p className="text-muted-foreground">There are no external project requests yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="software-submissions">
            <Card>
              <CardHeader>
                <CardTitle>Software Management</CardTitle>
                <CardDescription>
                  Manage software listings, add new software, and approve submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SoftwareListComponent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserListComponent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>
                  Manage all projects in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Project Management</h3>
                  <p className="text-muted-foreground">This feature is coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Convert to Project Dialog */}
        <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Convert to Project</DialogTitle>
              <DialogDescription>
                Review and confirm project details before converting this external request.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  className="col-span-3"
                  value={projectFormData.title}
                  onChange={(e) => setProjectFormData({...projectFormData, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="budget" className="text-right">
                  Budget
                </Label>
                <Input
                  id="budget"
                  type="number"
                  className="col-span-3"
                  value={projectFormData.budget}
                  onChange={(e) => setProjectFormData({...projectFormData, budget: parseFloat(e.target.value)})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deadline" className="text-right">
                  Deadline
                </Label>
                <Input
                  id="deadline"
                  type="date"
                  className="col-span-3"
                  value={projectFormData.deadline}
                  onChange={(e) => setProjectFormData({...projectFormData, deadline: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3"
                  rows={4}
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({...projectFormData, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="requirements" className="text-right">
                  Requirements
                </Label>
                <Textarea
                  id="requirements"
                  className="col-span-3"
                  rows={4}
                  value={projectFormData.requirements}
                  onChange={(e) => setProjectFormData({...projectFormData, requirements: e.target.value})}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleConvert}
                disabled={convertToProjectMutation.isPending}
              >
                {convertToProjectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  'Convert to Project'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}