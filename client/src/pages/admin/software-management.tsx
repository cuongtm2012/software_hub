import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Download, Star, Loader2, Package, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Validation schema for software form
const softwareSchema = z.object({
  name: z.string().min(1, "Software name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  category_id: z.string().min(1, "Category is required"),
  platform: z.array(z.string()).min(1, "At least one platform is required"),
  download_link: z.string().url("Must be a valid URL"),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal(""))
});

type SoftwareFormData = z.infer<typeof softwareSchema>;

interface Software {
  id: number;
  name: string;
  description: string;
  category_id: number;
  platform: string[];
  download_link: string;
  image_url?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  version?: string;
  license_type?: string;
  rating?: number;
  tags?: string;
}

interface Category {
  id: number;
  name: string;
}

const PLATFORMS = ["windows", "mac", "linux", "android", "ios", "web"];
const LICENSE_TYPES = ["Free", "Trial", "Paid"];

export default function SoftwareManagement() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<Software | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch software list
  const { 
    data: softwareData, 
    isLoading: isLoadingSoftware 
  } = useQuery<{ softwares: Software[], total: number }>({
    queryKey: ['/api/admin/software'],
  });

  // Fetch categories
  const { 
    data: categoriesData 
  } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Form for adding/editing software
  const form = useForm<SoftwareFormData>({
    resolver: zodResolver(softwareSchema),
    defaultValues: {
      name: "",
      description: "",
      category_id: "",
      platform: [],
      download_link: "",
      image_url: ""
    }
  });

  // Add software mutation
  const addSoftwareMutation = useMutation({
    mutationFn: async (data: SoftwareFormData) => {
      const response = await apiRequest("POST", "/api/admin/software", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/software'] });
      queryClient.invalidateQueries({ queryKey: ['/api/softwares'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Software Added",
        description: "Software has been added successfully and is now live"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add software",
        variant: "destructive"
      });
    }
  });

  // Update software mutation
  const updateSoftwareMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<SoftwareFormData> }) => {
      const response = await apiRequest("PUT", `/api/admin/software/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/software'] });
      queryClient.invalidateQueries({ queryKey: ['/api/softwares'] });
      setIsEditDialogOpen(false);
      setEditingSoftware(null);
      form.reset();
      toast({
        title: "Software Updated",
        description: "Software has been updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update software",
        variant: "destructive"
      });
    }
  });

  // Delete software mutation
  const deleteSoftwareMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/software/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/software'] });
      queryClient.invalidateQueries({ queryKey: ['/api/softwares'] });
      toast({
        title: "Software Deleted",
        description: "Software has been deleted successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete software",
        variant: "destructive"
      });
    }
  });

  // Update software status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: "approved" | "rejected" }) => {
      const response = await apiRequest("PUT", `/api/admin/software/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/software'] });
      queryClient.invalidateQueries({ queryKey: ['/api/softwares'] });
      toast({
        title: "Status Updated",
        description: "Software status has been updated successfully"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (software: Software) => {
    setEditingSoftware(software);
    form.reset({
      name: software.name,
      description: software.description,
      category_id: software.category_id.toString(),
      platform: software.platform,
      download_link: software.download_link,
      image_url: software.image_url || ""
    });
    setIsEditDialogOpen(true);
  };

  const onSubmit = (data: SoftwareFormData) => {
    const formattedData = {
      ...data,
      category_id: parseInt(data.category_id)
    };

    if (editingSoftware) {
      updateSoftwareMutation.mutate({ id: editingSoftware.id, data: formattedData });
    } else {
      addSoftwareMutation.mutate(formattedData);
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categoriesData?.find(cat => cat.id === categoryId)?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Software Management</h2>
          <p className="text-muted-foreground">Manage software listings, add new software, and update existing entries</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#004080] hover:bg-[#003366]">
              <Plus className="h-4 w-4 mr-2" />
              Add Software
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Software</DialogTitle>
              <DialogDescription>
                Fill in the details to add a new software listing
              </DialogDescription>
            </DialogHeader>
            <SoftwareForm 
              form={form} 
              onSubmit={onSubmit} 
              isSubmitting={addSoftwareMutation.isPending}
              categories={categoriesData || []}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Software List */}
      <Card>
        <CardHeader>
          <CardTitle>Software Listings</CardTitle>
          <CardDescription>
            {softwareData?.total ? `${softwareData.total} software entries` : "No software entries"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSoftware ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : softwareData?.softwares && softwareData.softwares.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {softwareData.softwares.map((software) => (
                  <TableRow key={software.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {software.image_url ? (
                          <img 
                            src={software.image_url} 
                            alt={software.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium">{software.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {software.description.length > 50 
                              ? `${software.description.substring(0, 50)}...` 
                              : software.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryName(software.category_id)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {software.platform.slice(0, 2).map((platform) => (
                          <Badge key={platform} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                        {software.platform.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{software.platform.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          software.status === 'approved' ? 'bg-green-500' :
                          software.status === 'pending' ? 'bg-amber-500' :
                          'bg-red-500'
                        }
                      >
                        {software.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(software)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        
                        {software.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => updateStatusMutation.mutate({ id: software.id, status: "approved" })}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => updateStatusMutation.mutate({ id: software.id, status: "rejected" })}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Software</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{software.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSoftwareMutation.mutate(software.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={software.download_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Software Found</h3>
              <p className="text-muted-foreground mb-4">Get started by adding your first software listing.</p>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#004080] hover:bg-[#003366]">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Software
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Software</DialogTitle>
            <DialogDescription>
              Update the software details
            </DialogDescription>
          </DialogHeader>
          <SoftwareForm 
            form={form} 
            onSubmit={onSubmit} 
            isSubmitting={updateSoftwareMutation.isPending}
            categories={categoriesData || []}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Software Form Component
function SoftwareForm({ 
  form, 
  onSubmit, 
  isSubmitting, 
  categories 
}: { 
  form: any, 
  onSubmit: (data: SoftwareFormData) => void, 
  isSubmitting: boolean,
  categories: Category[]
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Software Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter software name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the software features and functionality..."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platforms * (Select multiple)</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map((platform) => (
                  <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value?.includes(platform) || false}
                      onChange={(e) => {
                        const currentPlatforms = field.value || [];
                        if (e.target.checked) {
                          field.onChange([...currentPlatforms, platform]);
                        } else {
                          field.onChange(currentPlatforms.filter(p => p !== platform));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{platform}</span>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="download_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Download URL *</FormLabel>
              <FormControl>
                <Input 
                  type="url" 
                  placeholder="https://example.com/download" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="url" 
                  placeholder="https://example.com/image.png" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isSubmitting} className="bg-[#004080] hover:bg-[#003366]">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Saving..." : "Save Software"}
          </Button>
        </div>
      </form>
    </Form>
  );
}