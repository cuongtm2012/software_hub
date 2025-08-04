import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Eye, Edit, Trash2, Filter, Upload, FileText, Download, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

type SoftwareStatus = 'pending' | 'approved' | 'rejected';

interface Software {
  id: number;
  name: string;
  description: string;
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

export default function SoftwareManagement() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<SoftwareFilters>({
    search: '',
    status: 'all',
    type: 'all',
    license: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedSoftware, setSelectedSoftware] = useState<Software | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Software>>({});

  // Fetch software list with filters
  const { data: softwareData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/software', { 
      page: currentPage, 
      limit: pageSize,
      ...filters 
    }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.license !== 'all' && { license: filters.license }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo })
      });
      
      const response = await fetch(`/api/admin/software?${params}`);
      if (!response.ok) throw new Error('Failed to fetch software');
      return response.json();
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Update software mutation
  const updateSoftwareMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<Software> }) => {
      const response = await apiRequest('PUT', `/api/admin/software/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Software updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/software'] });
      setIsEditModalOpen(false);
      setSelectedSoftware(null);
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
      const response = await apiRequest('DELETE', `/api/admin/software/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Software deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/software'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete software",
        variant: "destructive"
      });
    }
  });

  const handleFilterChange = (key: keyof SoftwareFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      type: 'all',
      license: 'all',
      dateFrom: '',
      dateTo: ''
    });
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
    updateSoftwareMutation.mutate({
      id: selectedSoftware.id,
      updates: editFormData
    });
  };

  const handleDeleteSoftware = (id: number) => {
    if (confirm('Are you sure you want to delete this software?')) {
      deleteSoftwareMutation.mutate(id);
    }
  };

  const getStatusBadge = (status: SoftwareStatus) => {
    const variants: Record<SoftwareStatus, any> = {
      'approved': 'default',
      'pending': 'secondary',
      'rejected': 'destructive'
    };
    
    const labels: Record<SoftwareStatus, string> = {
      'approved': 'Active',
      'pending': 'Under Review',
      'rejected': 'Deprecated'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const software = softwareData?.softwares || [];
  const totalPages = Math.ceil((softwareData?.total || 0) / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Software Management</h1>
          <p className="text-muted-foreground">Manage software catalog and approvals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import List
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Software
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search software..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="approved">Active</SelectItem>
                  <SelectItem value="pending">Under Review</SelectItem>
                  <SelectItem value="rejected">Deprecated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div>
              <Label>Type</Label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                  <SelectItem value="game">Game</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* License Filter */}
            <div>
              <Label>License</Label>
              <Select value={filters.license} onValueChange={(value) => handleFilterChange('license', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="open-source">Open Source</SelectItem>
                  <SelectItem value="proprietary">Proprietary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <Button variant="outline" onClick={handleResetFilters} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Software Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Software Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading software...
                  </TableCell>
                </TableRow>
              ) : software.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No software found
                  </TableCell>
                </TableRow>
              ) : (
                software.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{(currentPage - 1) * pageSize + index + 1}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.version || '1.0.0'}</TableCell>
                    <TableCell>{item.vendor || 'Unknown'}</TableCell>
                    <TableCell>{item.license || 'Free'}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>{format(new Date(item.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewSoftware(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSoftware(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSoftware(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className="w-10"
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Software Details</DialogTitle>
          </DialogHeader>
          {selectedSoftware && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Software Name</Label>
                  <p>{selectedSoftware.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Version</Label>
                  <p>{selectedSoftware.version || '1.0.0'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Vendor</Label>
                  <p>{selectedSoftware.vendor || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="font-semibold">License</Label>
                  <p>{selectedSoftware.license || 'Free'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <p>{getStatusBadge(selectedSoftware.status)}</p>
                </div>
                <div>
                  <Label className="font-semibold">Date Added</Label>
                  <p>{format(new Date(selectedSoftware.created_at), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              
              <div>
                <Label className="font-semibold">Description</Label>
                <p className="mt-1">{selectedSoftware.description}</p>
              </div>

              <div>
                <Label className="font-semibold">Platform</Label>
                <div className="flex gap-2 mt-1">
                  {selectedSoftware.platform.map(p => (
                    <Badge key={p} variant="outline">{p}</Badge>
                  ))}
                </div>
              </div>

              {selectedSoftware.installation_instructions && (
                <div>
                  <Label className="font-semibold">Installation Instructions</Label>
                  <p className="mt-1">{selectedSoftware.installation_instructions}</p>
                </div>
              )}

              {selectedSoftware.documentation_link && (
                <div>
                  <Label className="font-semibold">Documentation</Label>
                  <a 
                    href={selectedSoftware.documentation_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-1 block"
                  >
                    View Documentation
                  </a>
                </div>
              )}

              {selectedSoftware.admin_notes && (
                <div>
                  <Label className="font-semibold">Admin Notes</Label>
                  <p className="mt-1">{selectedSoftware.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Software</DialogTitle>
          </DialogHeader>
          {selectedSoftware && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Software Name</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-version">Version</Label>
                  <Input
                    id="edit-version"
                    value={editFormData.version || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, version: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-vendor">Vendor</Label>
                  <Input
                    id="edit-vendor"
                    value={editFormData.vendor || ''}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-license">License</Label>
                  <Select
                    value={editFormData.license || ''}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, license: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="open-source">Open Source</SelectItem>
                      <SelectItem value="proprietary">Proprietary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editFormData.status || ''}
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value as SoftwareStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Active</SelectItem>
                      <SelectItem value="pending">Under Review</SelectItem>
                      <SelectItem value="rejected">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-instructions">Installation Instructions</Label>
                <Textarea
                  id="edit-instructions"
                  value={editFormData.installation_instructions || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, installation_instructions: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="edit-documentation">Documentation Link</Label>
                <Input
                  id="edit-documentation"
                  value={editFormData.documentation_link || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, documentation_link: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label htmlFor="edit-admin-notes">Admin Notes</Label>
                <Textarea
                  id="edit-admin-notes"
                  value={editFormData.admin_notes || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                  rows={3}
                  placeholder="Internal notes for administrators..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={updateSoftwareMutation.isPending}
            >
              {updateSoftwareMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}