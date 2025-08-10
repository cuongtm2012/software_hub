import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle, FileText, User, Building, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface SellerApplication {
  id: number;
  user_id: number;
  business_name: string;
  business_type: string;
  tax_id: string;
  business_address: string;
  bank_account: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_documents: string[];
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

export function SellerApprovalPage() {
  const { toast } = useToast();
  const [selectedSeller, setSelectedSeller] = useState<SellerApplication | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch all seller applications
  const { data: sellersData, isLoading } = useQuery({
    queryKey: ["/api/admin/sellers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/sellers");
      return await res.json();
    },
  });

  // Mutation for updating seller status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, status, notes }: { userId: number; status: string; notes?: string }) => {
      const res = await apiRequest("PUT", `/api/admin/sellers/${userId}/status`, { status, notes });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sellers"] });
      setDetailsOpen(false);
      toast({
        title: "Status Updated",
        description: "Seller verification status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update seller status.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (status: 'verified' | 'rejected', notes?: string) => {
    if (!selectedSeller) return;
    
    updateStatusMutation.mutate({
      userId: selectedSeller.user_id,
      status,
      notes,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'verified':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const parseBankAccount = (bankAccountStr: string) => {
    try {
      return JSON.parse(bankAccountStr);
    } catch {
      return { bank_name: 'Unknown', account_number: 'N/A', account_holder_name: 'N/A' };
    }
  };

  const getDocumentUrl = (documentPath: string) => {
    // Use R2 download endpoint to get a presigned URL for viewing documents
    return `/api/r2/download-url?key=${encodeURIComponent(documentPath)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading seller applications...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const sellers = sellersData?.sellers || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Registration Approval</h1>
          <p className="text-gray-600 mt-2">Review and manage seller registration requests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Seller Applications</CardTitle>
            <CardDescription>
              Review seller registration requests and manage verification status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Business / Store Name</TableHead>
                  <TableHead>Contact Email</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((seller: SellerApplication, index: number) => (
                  <TableRow key={seller.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{seller.business_name}</TableCell>
                    <TableCell>{seller.user.email}</TableCell>
                    <TableCell>{format(new Date(seller.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{getStatusBadge(seller.verification_status)}</TableCell>
                    <TableCell>
                      <Dialog open={detailsOpen && selectedSeller?.id === seller.id} onOpenChange={setDetailsOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedSeller(seller)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Seller Application Details</DialogTitle>
                            <DialogDescription>
                              Review all information and documents for {seller.business_name}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedSeller && (
                            <div className="space-y-6">
                              {/* Business Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center">
                                      <Building className="h-5 w-5 mr-2" />
                                      Business Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div><strong>Business Name:</strong> {selectedSeller.business_name}</div>
                                    <div><strong>Business Type:</strong> {selectedSeller.business_type}</div>
                                    <div><strong>Tax ID:</strong> {selectedSeller.tax_id}</div>
                                    <div><strong>Business Address:</strong> {selectedSeller.business_address}</div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center">
                                      <User className="h-5 w-5 mr-2" />
                                      Contact Information
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2 text-sm">
                                    <div><strong>Contact Name:</strong> {selectedSeller.user.name}</div>
                                    <div><strong>Email:</strong> {selectedSeller.user.email}</div>
                                    {selectedSeller.user.phone && (
                                      <div><strong>Phone:</strong> {selectedSeller.user.phone}</div>
                                    )}
                                    <div><strong>User ID:</strong> {selectedSeller.user.id}</div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Payment Details */}
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Payment Details
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                  {(() => {
                                    const bankInfo = parseBankAccount(selectedSeller.bank_account);
                                    return (
                                      <>
                                        <div><strong>Bank Name:</strong> {bankInfo.bank_name}</div>
                                        <div><strong>Account Number:</strong> {bankInfo.account_number}</div>
                                        <div><strong>Account Holder:</strong> {bankInfo.account_holder_name}</div>
                                      </>
                                    );
                                  })()}
                                </CardContent>
                              </Card>

                              {/* Verification Documents */}
                              <Card>
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Verification Documents
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 border rounded">
                                      <span className="font-medium">Front side of National ID card</span>
                                      {selectedSeller.verification_documents[0] && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(`/api/r2/download?key=${encodeURIComponent(selectedSeller.verification_documents[0])}`)}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          View Image
                                        </Button>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded">
                                      <span className="font-medium">Back side of National ID card</span>
                                      {selectedSeller.verification_documents[1] && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(`/api/r2/download?key=${encodeURIComponent(selectedSeller.verification_documents[1])}`)}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          View Image
                                        </Button>
                                      )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded">
                                      <span className="font-medium">Screenshot/photo of bank account details</span>
                                      {selectedSeller.verification_documents[2] && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => window.open(`/api/r2/download?key=${encodeURIComponent(selectedSeller.verification_documents[2])}`)}
                                        >
                                          <Eye className="h-4 w-4 mr-1" />
                                          View Image
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Admin Actions */}
                              {selectedSeller.verification_status === 'pending' && (
                                <Card>
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Admin Actions</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="flex space-x-3">
                                      <Button
                                        onClick={() => handleStatusUpdate('verified')}
                                        disabled={updateStatusMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Approve Application
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleStatusUpdate('rejected')}
                                        disabled={updateStatusMutation.isPending}
                                      >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject Application
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
                {sellers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No seller applications found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}