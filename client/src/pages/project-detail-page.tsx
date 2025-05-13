import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default function ProjectDetailPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id ? parseInt(params.id, 10) : 0;
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  
  // Project details query
  const {
    data: project,
    isLoading: isLoadingProject,
    error: projectError,
  } = useQuery({
    queryKey: ['/api/projects', projectId],
    queryFn: undefined,
    enabled: !!projectId,
  });
  
  // Project quotes query
  const {
    data: quotes,
    isLoading: isLoadingQuotes,
    error: quotesError,
  } = useQuery({
    queryKey: ['/api/quotes/project', projectId],
    queryFn: undefined,
    enabled: !!projectId,
  });
  
  // Project messages query
  const {
    data: messages,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useQuery({
    queryKey: ['/api/messages/project', projectId],
    queryFn: undefined,
    enabled: !!projectId,
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
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote submitted successfully",
        description: "The client will review your proposal.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes/project', projectId] });
      quoteForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit quote",
        description: error.message,
        variant: "destructive",
      });
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
      queryClient.invalidateQueries({ queryKey: ['/api/messages/project', projectId] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/quotes/project', projectId] });
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
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Check if current user is the client who created the project
  const isClient = user?.id === project?.client_id;
  
  // Check if current user is a developer who has submitted a quote
  const isDeveloperWithQuote = user?.role === 'developer' && quotes?.some((quote: any) => quote.developer_id === user.id);
  
  // Check if there's an accepted quote
  const hasAcceptedQuote = quotes?.some((quote: any) => quote.status === 'accepted');
  
  // Loading and error states
  const isLoading = isLoadingProject || isLoadingQuotes || isLoadingMessages;
  const error = projectError || quotesError || messagesError;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#004080]" />
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
              onClick={() => navigate('/projects')}
            >
              Back to Projects
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
            onClick={() => navigate('/projects')}
            className="mb-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-gray-500">Project #{project.id}</p>
                <span className="text-gray-300">•</span>
                <p className="text-gray-500">
                  <Clock className="inline-block h-3 w-3 mr-1" />
                  Created on {formatDate(project.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusBadge(project.status)}
              
              {isClient && project.status === 'pending' && (
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
                        onClick={() => updateProjectStatusMutation.mutate({ id: project.id, status: 'cancelled' })}
                      >
                        Confirm Cancellation
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              
              {isClient && project.status === 'in_progress' && (
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
                        onClick={() => updateProjectStatusMutation.mutate({ id: project.id, status: 'completed' })}
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
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white border border-gray-200 p-1 rounded-md">
            <TabsTrigger value="details" className="text-sm rounded-sm data-[state=active]:bg-[#004080] data-[state=active]:text-white">
              Project Details
            </TabsTrigger>
            <TabsTrigger value="quotes" className="text-sm rounded-sm data-[state=active]:bg-[#004080] data-[state=active]:text-white">
              Quotes {quotes?.length > 0 && `(${quotes.length})`}
            </TabsTrigger>
            <TabsTrigger value="messages" className="text-sm rounded-sm data-[state=active]:bg-[#004080] data-[state=active]:text-white">
              Messages {messages?.length > 0 && `(${messages.length})`}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Technical Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{project.requirements || "No specific technical requirements provided."}</p>
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
                      {project.budget ? `$${parseFloat(project.budget).toFixed(2)} USD` : "Not specified"}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Deadline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                    <p className="text-lg font-medium">
                      {project.deadline ? formatDate(project.deadline) : "Not specified"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {user?.role === 'developer' && project.status === 'pending' && !isDeveloperWithQuote && (
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
                            <FormLabel>Price (USD)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Enter your price in USD"
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
            {quotes?.length === 0 ? (
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
                {user?.role === 'developer' && !isDeveloperWithQuote && project.status === 'pending' && (
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
                {quotes.map((quote: any) => (
                  <Card key={quote.id} className={`bg-white shadow-sm ${quote.status === 'accepted' ? 'border-green-200' : ''}`}>
                    <CardHeader className={`flex flex-row items-start justify-between pb-3 ${quote.status === 'accepted' ? 'bg-green-50 border-b border-green-100' : ''}`}>
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          Quote from {quote.developer?.name || `Developer #${quote.developer_id}`}
                          {quote.status === 'accepted' && (
                            <CheckCircle className="ml-2 h-5 w-5 text-green-600" />
                          )}
                        </CardTitle>
                        <CardDescription>
                          Submitted on {formatDate(quote.created_at)}
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
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Price</h4>
                          <p className="text-lg font-semibold text-gray-900">${parseFloat(quote.price).toFixed(2)} USD</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Timeline</h4>
                          <p className="text-lg font-semibold text-gray-900">{quote.timeline}</p>
                        </div>
                      </div>
                      
                      {quote.message && (
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
                <CardTitle>Project Communication</CardTitle>
                <CardDescription>
                  Messages between the client and developer
                </CardDescription>
              </CardHeader>
              <CardContent>
                {messages?.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Start the conversation to discuss project details.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto p-2">
                    {messages.map((message: any) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${
                            message.sender_id === user?.id
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
                )}
                
                {(project.status === 'in_progress' || project.status === 'pending') && (isClient || isDeveloperWithQuote || hasAcceptedQuote) && (
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