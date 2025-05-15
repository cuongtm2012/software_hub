import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2, AlertCircle, CheckCircle2, Clock, FileText, DollarSign, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

// Define types for the dashboard data
interface Project {
  id: number;
  title: string;
  status: string;
  deadline: string;
  description?: string;
  client_id?: number;
}

interface Quote {
  id: number;
  project_id: number;
  developer_id?: number;
  amount: number;
  status: string;
  description?: string;
  project?: { title: string };
  developer?: { name: string };
}

interface Payment {
  id: number;
  project_id: number;
  amount: number;
  status: string;
  createdAt: string;
  project?: { title: string };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch projects
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: undefined, // Will use the default query function
    enabled: !!user,
  });

  // Fetch quotes
  const { data: quotes, isLoading: isLoadingQuotes } = useQuery<Quote[]>({
    queryKey: ['/api/quotes'],
    queryFn: undefined, // Will use the default query function
    enabled: !!user,
  });

  // Fetch payments
  const { data: payments, isLoading: isLoadingPayments } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
    queryFn: undefined, // Will use the default query function
    enabled: !!user,
  });

  const isLoading = isLoadingProjects || isLoadingQuotes || isLoadingPayments;

  const renderProjects = () => {
    if (isLoadingProjects) {
      return (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#004080]" />
        </div>
      );
    }

    if (!projects || projects.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-lg font-medium text-center mb-1">No projects found</p>
            <p className="text-sm text-muted-foreground text-center mb-4">
              You haven't created any projects yet
            </p>
            <Button 
              onClick={() => navigate('/request-project')}
              className="bg-[#004080] hover:bg-[#003366] text-white"
            >
              Create New Project
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-4 w-4 mr-2 text-amber-500" />
                Pending
              </CardTitle>
              <CardDescription>Projects awaiting action</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                {projects?.filter(p => p.status === 'pending')?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Active
              </CardTitle>
              <CardDescription>Projects in progress</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                {projects?.filter(p => p.status === 'active')?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                Total
              </CardTitle>
              <CardDescription>All projects</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                {projects?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle>Project List</CardTitle>
            <CardDescription>Manage your projects</CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium">Project Name</th>
                    <th className="py-2 px-2 text-left font-medium">Status</th>
                    <th className="py-2 px-2 text-left font-medium">Deadline</th>
                    <th className="py-2 px-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects?.map((project) => (
                    <tr key={project.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{project.title}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          project.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : project.status === 'pending' 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-2">{new Date(project.deadline).toLocaleDateString()}</td>
                      <td className="py-2 px-2 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/quotes/${project.id}`)}
                        >
                          View Quotes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderQuotes = () => {
    if (isLoadingQuotes) {
      return (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#004080]" />
        </div>
      );
    }

    if (!quotes?.length) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-lg font-medium text-center">No quotes found</p>
            <p className="text-sm text-muted-foreground text-center">
              You haven't received any quotes yet
            </p>
          </CardContent>
        </Card>
      );
    }

    const pendingQuotes = quotes?.filter(q => q.status === 'pending') || [];

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle>Pending Quotes</CardTitle>
            <CardDescription>Review and respond to pending quotes</CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            {pendingQuotes.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No pending quotes at this time
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-2 text-left font-medium">Project</th>
                      <th className="py-2 px-2 text-left font-medium">Contractor</th>
                      <th className="py-2 px-2 text-left font-medium">Amount</th>
                      <th className="py-2 px-2 text-left font-medium">Status</th>
                      <th className="py-2 px-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingQuotes.map((quote) => (
                      <tr key={quote.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{quote.project?.title || 'Unknown Project'}</td>
                        <td className="py-2 px-2">{quote.developer?.name || 'Unknown Developer'}</td>
                        <td className="py-2 px-2">${quote.amount}</td>
                        <td className="py-2 px-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800">
                            Pending
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right space-x-1">
                          <Button 
                            variant="default" 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => navigate(`/quotes/${quote.id}`)}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-600 text-red-600 hover:bg-red-50"
                            onClick={() => navigate(`/quotes/${quote.id}`)}
                          >
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle>All Quotes</CardTitle>
            <CardDescription>View all quotes for your projects</CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium">Project</th>
                    <th className="py-2 px-2 text-left font-medium">Contractor</th>
                    <th className="py-2 px-2 text-left font-medium">Amount</th>
                    <th className="py-2 px-2 text-left font-medium">Status</th>
                    <th className="py-2 px-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes?.map((quote) => (
                    <tr key={quote.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{quote.project?.title || 'Unknown Project'}</td>
                      <td className="py-2 px-2">{quote.developer?.name || 'Unknown Developer'}</td>
                      <td className="py-2 px-2">${quote.amount}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          quote.status === 'accepted' 
                            ? 'bg-green-100 text-green-800' 
                            : quote.status === 'rejected' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/quotes/${quote.id}`)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPayments = () => {
    if (isLoadingPayments) {
      return (
        <div className="flex justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#004080]" />
        </div>
      );
    }

    if (!payments?.length) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-lg font-medium text-center">No payments found</p>
            <p className="text-sm text-muted-foreground text-center">
              You haven't made any payments yet
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle>Payment History</CardTitle>
            <CardDescription>View and manage your payments</CardDescription>
          </CardHeader>
          <CardContent className="px-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-2 text-left font-medium">Date</th>
                    <th className="py-2 px-2 text-left font-medium">Project</th>
                    <th className="py-2 px-2 text-left font-medium">Amount</th>
                    <th className="py-2 px-2 text-left font-medium">Status</th>
                    <th className="py-2 px-2 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments?.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 px-2">{payment.project?.title || 'Unknown Project'}</td>
                      <td className="py-2 px-2">${payment.amount}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          payment.status === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : payment.status === 'failed' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-amber-100 text-amber-800'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right">
                        {payment.status === 'pending' ? (
                          <Button 
                            variant="default" 
                            size="sm"
                            className="bg-[#004080] hover:bg-[#003366] text-white"
                            onClick={() => navigate(`/payments/${payment.id}`)}
                          >
                            Pay
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/payments/${payment.id}`)}
                          >
                            View
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'User Dashboard' : 'Dashboard'}
            {user?.role === 'admin' && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Admin Access
              </span>
            )}
          </h1>
          <div className="ml-auto flex gap-2">
            <Button 
              onClick={() => navigate('/request-project')}
              className="bg-[#004080] hover:bg-[#003366] text-white"
            >
              New Project
            </Button>
            {user?.role === 'admin' && (
              <Button 
                onClick={() => navigate('/admin')}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Go to Admin Panel
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mb-4">
              <TabsTrigger value="projects" className="data-[state=active]:bg-[#004080] data-[state=active]:text-white">
                <FileText className="h-4 w-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="quotes" className="data-[state=active]:bg-[#004080] data-[state=active]:text-white">
                <MessagesSquare className="h-4 w-4 mr-2" />
                Quotes
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-[#004080] data-[state=active]:text-white">
                <DollarSign className="h-4 w-4 mr-2" />
                Payments
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects" className="space-y-4">
              {renderProjects()}
            </TabsContent>
            
            <TabsContent value="quotes" className="space-y-4">
              {renderQuotes()}
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4">
              {renderPayments()}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}