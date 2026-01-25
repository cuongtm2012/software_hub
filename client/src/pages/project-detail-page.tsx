import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { insertQuoteSchema, insertMessageSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  MessageSquare,
  SendHorizontal,
  User,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id ? parseInt(params.id, 10) : 0;
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [adminStatus, setAdminStatus] = useState("");
  const [adminPriority, setAdminPriority] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Quote form state
  const [quoteTitle, setQuoteTitle] = useState("");
  const [quoteDescription, setQuoteDescription] = useState("");
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteDeposit, setQuoteDeposit] = useState("");
  const [quoteTimelineDays, setQuoteTimelineDays] = useState("");
  const [quoteDeliverables, setQuoteDeliverables] = useState("");
  const [quoteTerms, setQuoteTerms] = useState("");

  // Project details query
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });


  // Project quotes query - disabled for external requests
  const {
    data: quotes,
    isLoading: isLoadingQuotes,
    error: quotesError,
  } = useQuery({
    queryKey: [`/api/projects/${projectId}/quotes`],
    enabled: false, // Disabled for external requests
  });

  // Project messages query - disabled for external requests
  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
    queryKey: [`/api/projects/${projectId}/messages`],
    enabled: false, // Disabled for external requests
  });

  // Submit quote form
  const quoteForm = useForm({
    resolver: zodResolver(insertQuoteSchema),
    defaultValues: {
      project_id: projectId,
      price: undefined,
      timeline: "",
      message: "",
    },
  });

  // Submit message form
  const messageForm = useForm({
    resolver: zodResolver(insertMessageSchema),
    defaultValues: {
      project_id: projectId,
      content: "",
    },
  });

  // Submit quote mutation
  const submitQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/quotes", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to submit quote");
      }
      return response.json();
    },
  });

  // Submit message mutation
  const submitMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/messages", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to send message");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'messages'] });
      messageForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update project status mutation
  const updateProjectStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/projects/${id}/status`, { status });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update project status");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Project status updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update project status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update admin fields mutation (for external requests)
  const updateAdminFieldsMutation = useMutation({
    mutationFn: async (data: { status?: string; priority?: string; admin_notes?: string }) => {
      const res = await apiRequest("PUT", `/api/admin/external-requests/${projectId}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update request");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Request updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      // Reset form
      setAdminStatus("");
      setAdminPriority("");
      setAdminNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create quote mutation (for external requests)
  const createQuoteMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      price: number;
      deposit_amount: number;
      timeline_days: number;
      deliverables: string[];
      terms_conditions?: string;
    }) => {
      const res = await apiRequest("POST", `/api/admin/external-requests/${projectId}/quotes`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create quote");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote created successfully",
        description: "The quote has been sent to the client",
      });
      // Reset form
      setQuoteTitle("");
      setQuoteDescription("");
      setQuotePrice("");
      setQuoteDeposit("");
      setQuoteTimelineDays("");
      setQuoteDeliverables("");
      setQuoteTerms("");
      // Refresh quotes list
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/quotes`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create quote",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  // Update quote status mutation
  const updateQuoteStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/quotes/${id}/status`, { status });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update quote status");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote status updated",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'quotes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update quote status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle quote submission
  const onSubmitQuote = (data: any) => {
    submitQuoteMutation.mutate(data);
  };

  // Handle message submission
  const onSubmitMessage = (data: any) => {
    submitMessageMutation.mutate(data);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    // Map admin statuses to client-friendly display
    // Admin sees: pending, contacted, in_progress, completed, rejected, cancelled
    // Client sees: pending, in_progress, completed, cancelled

    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'contacted':
        // Admin status: show as "Contacted" for admin, "Pending" for client
        return user?.role === 'admin'
          ? <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Contacted</Badge>
          : <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      case 'rejected':
        // Admin status: show as "Rejected" for admin, "Cancelled" for client
        return user?.role === 'admin'
          ? <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
          : <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Check if current user is the client who created the project
  const isClient = user?.id === (project as any)?.client_id;

  // Check if current user is a developer who has submitted a quote
  const isDeveloperWithQuote = user?.role === 'developer' && Array.isArray(quotes) && quotes.some((quote: any) => quote.developer_id === user.id);

  // Check if there's an accepted quote
  const hasAcceptedQuote = Array.isArray(quotes) && quotes.some((quote: any) => quote.status === 'accepted');

  // Loading and error states
  const isLoading = isLoadingProject || isLoadingQuotes || isLoadingMessages;
  const error = projectError || quotesError || messagesError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
        <Header />
        <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
        <Header />
        <main className="flex-grow container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
            <h2 className="text-lg font-medium text-red-800 mb-2">Error loading project</h2>
            <p className="text-red-600">The project could not be found or you don't have permission to view it.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/dashboard')}
            >
              Back to My Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />

      <main className="flex-grow container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Dashboard
          </Button>

          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{(project as any)?.title || "Project Details"}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-gray-500">Project #{(project as any)?.id}</p>
                <span className="text-gray-300">•</span>
                <p className="text-gray-500">
                  <Clock className="inline-block h-3 w-3 mr-1" />
                  Created on {formatDate((project as any)?.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {getStatusBadge((project as any)?.status)}

              {isClient && (project as any)?.status === 'pending' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                      Cancel Project
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this project?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. Developers will no longer be able to submit quotes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => updateProjectStatusMutation.mutate({ id: (project as any)?.id, status: 'cancelled' })}
                      >
                        Confirm Cancellation
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {isClient && (project as any)?.status === 'in_progress' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      Mark as Completed
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Mark project as completed?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will finalize the project. Make sure all deliverables have been received to your satisfaction.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateProjectStatusMutation.mutate({ id: (project as any)?.id, status: 'completed' })}
                      >
                        Confirm Completion
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>

        {/* Admin Actions Panel - Only visible to admins */}
        {user?.role === 'admin' && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Admin Actions
              </CardTitle>
              <CardDescription>
                Manage request status, priority, and internal notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Status</label>
                  <Select value={adminStatus} onValueChange={setAdminStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder={(project as any)?.status || "Select status"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Set Priority</label>
                  <Select value={adminPriority} onValueChange={setAdminPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder={(project as any)?.priority || "Select priority"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Internal Notes</label>
                <Textarea
                  placeholder="Add internal notes (visible only to admins)..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                {(project as any)?.admin_notes && (
                  <div className="mt-2 p-3 bg-gray-100 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-1">Previous Notes:</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{(project as any)?.admin_notes}</p>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <Button
                onClick={() => {
                  const updates: any = {};
                  if (adminStatus) updates.status = adminStatus;
                  if (adminPriority) updates.priority = adminPriority;
                  if (adminNotes) updates.admin_notes = adminNotes;

                  if (Object.keys(updates).length > 0) {
                    updateAdminFieldsMutation.mutate(updates);
                  } else {
                    toast({
                      title: "No changes to save",
                      description: "Please update at least one field",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={updateAdminFieldsMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {updateAdminFieldsMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Quote Panel - Only visible to admins */}
        {user?.role === 'admin' && (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Create Quote
              </CardTitle>
              <CardDescription>
                Create a detailed quote for this external request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quote Title *</label>
                <Input
                  placeholder="e.g., E-commerce Website Development"
                  value={quoteTitle}
                  onChange={(e) => setQuoteTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Detailed description of the work to be done..."
                  value={quoteDescription}
                  onChange={(e) => setQuoteDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Price */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Price (VND) *</label>
                  <Input
                    type="text"
                    placeholder="50,000,000"
                    value={quotePrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setQuotePrice(value ? parseInt(value).toLocaleString('vi-VN') : '');
                    }}
                  />
                </div>

                {/* Deposit */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deposit (VND) *</label>
                  <Input
                    type="text"
                    placeholder="15,000,000"
                    value={quoteDeposit}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setQuoteDeposit(value ? parseInt(value).toLocaleString('vi-VN') : '');
                    }}
                  />
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Timeline (Days) *</label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={quoteTimelineDays}
                    onChange={(e) => setQuoteTimelineDays(e.target.value)}
                  />
                </div>
              </div>

              {/* Deliverables */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Deliverables *</label>
                <Textarea
                  placeholder="Enter each deliverable on a new line:&#10;- Fully functional website&#10;- Admin dashboard&#10;- Mobile responsive design&#10;- 3 months support"
                  value={quoteDeliverables}
                  onChange={(e) => setQuoteDeliverables(e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-gray-500">Enter each deliverable on a new line</p>
              </div>

              {/* Terms & Conditions */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Terms & Conditions</label>
                <Textarea
                  placeholder="Payment terms, warranty, support details, etc..."
                  value={quoteTerms}
                  onChange={(e) => setQuoteTerms(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Create Button */}
              <Button
                onClick={() => {
                  // Validation
                  if (!quoteTitle || !quoteDescription || !quotePrice || !quoteDeposit || !quoteTimelineDays || !quoteDeliverables) {
                    toast({
                      title: "Missing required fields",
                      description: "Please fill in all required fields marked with *",
                      variant: "destructive",
                    });
                    return;
                  }

                  // Parse deliverables (split by newlines and filter empty)
                  const deliverables = quoteDeliverables
                    .split('\n')
                    .map(d => d.trim())
                    .filter(d => d.length > 0);

                  // Parse numbers (remove formatting)
                  const price = parseFloat(quotePrice.replace(/[^0-9]/g, ''));
                  const deposit = parseFloat(quoteDeposit.replace(/[^0-9]/g, ''));
                  const timelineDays = parseInt(quoteTimelineDays);

                  createQuoteMutation.mutate({
                    title: quoteTitle,
                    description: quoteDescription,
                    price,
                    deposit_amount: deposit,
                    timeline_days: timelineDays,
                    deliverables,
                    terms_conditions: quoteTerms || undefined,
                  });
                }}
                disabled={createQuoteMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {createQuoteMutation.isPending ? "Creating Quote..." : "Create & Send Quote"}
              </Button>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-md">
            <TabsTrigger value="details" className="text-sm rounded-sm data-[state=active]:bg-[#004080] data-[state=active]:text-white">
              Project Details
            </TabsTrigger>
            <TabsTrigger value="quotes" className="text-sm rounded-sm data-[state=active]:bg-[#004080] data-[state=active]:text-white">
              Quotes {Array.isArray(quotes) && quotes.length > 0 && `(${quotes.length})`}
            </TabsTrigger>
            <TabsTrigger value="messages" className="text-sm rounded-sm data-[state=active]:bg-[#004080] data-[state=active]:text-white">
              Messages {Array.isArray(messages) && messages.length > 0 && `(${messages.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-[#004080] mb-2">
                      {project.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        {project.client_name || 'Anonymous Client'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{(project as any)?.project_description || (project as any)?.description || "No description provided."}</p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Technical Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{(project as any)?.requirements || "No specific technical requirements provided."}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-gray-400" />
                    <p className="text-lg font-medium">
                      {(project as any)?.budget ? `${parseFloat((project as any).budget).toLocaleString('vi-VN')} ₫` : "Not specified"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                    <p className="text-lg font-medium">
                      {(project as any)?.timeline || ((project as any)?.deadline ? formatDate((project as any).deadline) : "Not specified")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {user?.role === 'developer' && (project as any)?.status === 'pending' && !isDeveloperWithQuote && (
              <Card className="bg-white shadow-sm border-blue-200">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <CardTitle>Submit a Quote</CardTitle>
                  <CardDescription>
                    Provide your estimated price and timeline for this project
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...quoteForm}>
                    <form onSubmit={quoteForm.handleSubmit(onSubmitQuote)} className="space-y-4">
                      <FormField
                        control={quoteForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (VND)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter your price in VND"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              The total price you're quoting for this project
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={quoteForm.control}
                        name="timeline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timeline</FormLabel>
                            <FormControl>
                              <Input placeholder="E.g., 2 weeks, 1 month" {...field} />
                            </FormControl>
                            <FormDescription>
                              How long will it take you to complete this project?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={quoteForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Explain your approach, experience with similar projects, etc."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Additional information to support your quote
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-[#004080] hover:bg-[#003366] text-white"
                        disabled={submitQuoteMutation.isPending}
                      >
                        {submitQuoteMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting Quote...
                          </>
                        ) : (
                          "Submit Quote"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="quotes" className="space-y-6">
            {!Array.isArray(quotes) || quotes.length === 0 ? (
              <Card className="bg-white shadow-sm p-6 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {isClient
                    ? "No developers have submitted quotes for this project yet."
                    : user?.role === 'developer' && !isDeveloperWithQuote
                      ? "Be the first developer to submit a quote for this project."
                      : "There are no quotes available for this project."}
                </p>
                {user?.role === 'developer' && !isDeveloperWithQuote && (project as any)?.status === 'pending' && (
                  <Button
                    onClick={() => setActiveTab("details")}
                    className="bg-[#004080] hover:bg-[#003366] text-white"
                  >
                    Submit a Quote
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {Array.isArray(quotes) && quotes.map((quote: any) => (
                  <Card key={quote.id} className={`bg-white shadow-sm ${quote.status === 'accepted' ? 'border-green-200' : ''}`}>
                    <CardHeader className={`flex flex-row items-start justify-between pb-3 ${quote.status === 'accepted' ? 'bg-green-50 border-b border-green-100' : ''}`}>
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          {quote.title || `Quote from ${quote.developer?.name || `Developer #${quote.developer_id}`}`}
                          {quote.status === 'accepted' && (
                            <CheckCircle className="ml-2 h-5 w-5 text-green-600" />
                          )}
                        </CardTitle>
                        <CardDescription>
                          Submitted on {formatDate(quote.created_at)}
                          {quote.developer?.name && !quote.title && ` by ${quote.developer.name}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(quote.status)}

                        {isClient && quote.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => updateQuoteStatusMutation.mutate({ id: quote.id, status: 'rejected' })}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => updateQuoteStatusMutation.mutate({ id: quote.id, status: 'accepted' })}
                              disabled={updateQuoteStatusMutation.isPending || hasAcceptedQuote}
                            >
                              {updateQuoteStatusMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Accept
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {/* Description */}
                      {quote.description && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{quote.description}</p>
                        </div>
                      )}

                      {/* Price, Deposit, Timeline Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Total Price</h4>
                          <p className="text-lg font-semibold text-gray-900">
                            {parseFloat(quote.price).toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                        {quote.deposit_amount && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 mb-1">Deposit Required</h4>
                            <p className="text-lg font-semibold text-gray-900">
                              {parseFloat(quote.deposit_amount).toLocaleString('vi-VN')} ₫
                            </p>
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Timeline</h4>
                          <p className="text-lg font-semibold text-gray-900">
                            {quote.timeline_days ? `${quote.timeline_days} days` : quote.timeline}
                          </p>
                        </div>
                      </div>

                      {/* Deliverables */}
                      {quote.deliverables && Array.isArray(quote.deliverables) && quote.deliverables.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Deliverables</h4>
                          <ul className="space-y-2">
                            {quote.deliverables.map((deliverable: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{deliverable}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Terms & Conditions */}
                      {quote.terms_conditions && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Terms & Conditions</h4>
                          <p className="text-gray-700 whitespace-pre-wrap text-sm">{quote.terms_conditions}</p>
                        </div>
                      )}

                      {/* Legacy Message Field */}
                      {quote.message && !quote.description && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Message</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{quote.message}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Project Communication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto p-2">
                  {Array.isArray(messages) && messages.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${message.sender_id === user?.id
                          ? 'bg-[#004080] text-white'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {message.sender_id === user?.id ? 'You' : message.sender?.name || `User #${message.sender_id}`}
                          </span>
                          <span className="text-xs opacity-70">
                            {formatDate(message.created_at)} at {formatTime(message.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {((project as any)?.status === 'in_progress' || (project as any)?.status === 'pending') && (isClient || isDeveloperWithQuote || hasAcceptedQuote) && (
                  <div className="mt-4">
                    <Separator className="my-4" />
                    <Form {...messageForm}>
                      <form onSubmit={messageForm.handleSubmit(onSubmitMessage)} className="space-y-4">
                        <FormField
                          control={messageForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Message</FormLabel>
                              <div className="flex space-x-2">
                                <FormControl>
                                  <Textarea
                                    placeholder="Type your message here..."
                                    className="min-h-[80px] resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <Button
                                  type="submit"
                                  className="self-end bg-[#004080] hover:bg-[#003366] text-white"
                                  disabled={submitMessageMutation.isPending || !field.value}
                                >
                                  {submitMessageMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <SendHorizontal className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Send message</span>
                                </Button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}