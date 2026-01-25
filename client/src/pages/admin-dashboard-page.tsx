import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { StatsCard } from "@/components/StatsCard";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  RefreshCw,
  Bell,
  Briefcase,
} from "lucide-react";

type SortOption = "recent" | "name" | "email" | "role";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface AdminStats {
  totalUsers: number;
  totalSoftware: number;
  totalOrders: number;
  totalRevenue: number;
  usersTrend?: { value: number; isPositive: boolean };
  softwareTrend?: { value: number; isPositive: boolean };
  ordersTrend?: { value: number; isPositive: boolean };
  revenueTrend?: { value: number; isPositive: boolean };
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not admin
  if (user?.role !== "admin") {
    navigate("/");
    return null;
  }

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    initialData: {
      totalUsers: 0,
      totalSoftware: 0,
      totalOrders: 0,
      totalRevenue: 0,
    },
  });

  const handleRefresh = () => {
    refetchStats();
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage users, software, and system settings
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            aria-label="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </>
          ) : (
            <>
              <StatsCard
                title="Total Users"
                value={stats?.totalUsers || 0}
                icon={Users}
                trend={stats?.usersTrend}
                description="Registered users"
                testId="stat-total-users"
              />
              <StatsCard
                title="Total Software"
                value={stats?.totalSoftware || 0}
                icon={Package}
                trend={stats?.softwareTrend}
                description="Listed software"
                testId="stat-total-software"
              />
              <StatsCard
                title="Total Orders"
                value={stats?.totalOrders || 0}
                icon={ShoppingCart}
                trend={stats?.ordersTrend}
                description="Completed orders"
                testId="stat-total-orders"
              />
              <StatsCard
                title="Total Revenue"
                value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
                icon={DollarSign}
                trend={stats?.revenueTrend}
                description="All-time revenue"
                testId="stat-total-revenue"
              />
            </>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <a href="/admin/users" className="block">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">User Management</h3>
                  <p className="text-sm text-muted-foreground">Manage all users</p>
                </div>
              </div>
            </div>
          </a>

          <a href="/admin/projects" className="block">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Briefcase className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Project Management</h3>
                  <p className="text-sm text-muted-foreground">Manage client projects</p>
                </div>
              </div>
            </div>
          </a>

          <a href="/admin/software" className="block">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Software Management</h3>
                  <p className="text-sm text-muted-foreground">Manage software listings</p>
                </div>
              </div>
            </div>
          </a>

          <a href="/admin/push-notifications" className="block">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Push Notifications</h3>
                  <p className="text-sm text-muted-foreground">Send notifications to users</p>
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4 border-t">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </AdminLayout>
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
