import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageBreadcrumb, createBreadcrumbs } from "@/components/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, 
  Plus, 
  Calendar, 
  DollarSign, 
  Clock, 
  User,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ProjectsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch projects based on user role and filters
  const { data: projectsData, isLoading, error } = useQuery({
    queryKey: ['/api/projects', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      
      const response = await fetch(`/api/projects?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return response.json();
    },
    enabled: !!user,
  });

  const projects = projectsData?.projects || [];
  const projectsCount = projectsData?.count || 0;

  // Filter projects by search term
  const filteredProjects = projects.filter((project: any) => 
    project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.project_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
        <Header />
        <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
            <p className="text-gray-600 mb-6">Please log in to view projects.</p>
            <Button onClick={() => navigate('/auth')} className="bg-[#004080] hover:bg-[#003366]">
              Login
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Projects", isCurrentPage: true }
        ]}
      />
      
      <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#004080] mb-2">Projects</h1>
            <p className="text-gray-600">
              {user.role === 'admin' ? 'Manage all projects' : 
               user.role === 'developer' ? 'View available projects and your assignments' :
               'Your project requests and collaborations'}
            </p>
          </div>
          
          {(user.role === 'buyer' || user.role === 'client') && (
            <Button 
              onClick={() => navigate('/project-new')}
              className="bg-[#004080] hover:bg-[#003366] text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Projects</h2>
            <p className="text-gray-600 mb-4">Unable to fetch projects. Please try again.</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No matching projects found' : 'No projects available'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms or filters.' : 
               user.role === 'buyer' || user.role === 'client' ? 'Create your first project to get started.' :
               'Projects will appear here when available.'}
            </p>
            {(user.role === 'buyer' || user.role === 'client') && !searchTerm && (
              <Button 
                onClick={() => navigate('/project-new')}
                className="bg-[#004080] hover:bg-[#003366] text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project: any) => (
              <Card key={project.id} className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg text-[#004080] line-clamp-2">
                      {project.title || `Project Request #${project.id}`}
                    </CardTitle>
                    <Badge className={getStatusColor(project.status)}>
                      {formatStatus(project.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {project.project_description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Client Info */}
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="mr-2 h-4 w-4" />
                      <span>{project.name}</span>
                    </div>
                    
                    {/* Budget */}
                    {project.budget && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span>${Number(project.budget).toLocaleString()}</span>
                      </div>
                    )}
                    
                    {/* Deadline */}
                    {project.deadline && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Due: {formatDate(project.deadline)}</span>
                      </div>
                    )}
                    
                    {/* Created Date */}
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Created: {formatDate(project.created_at)}</span>
                    </div>
                    
                    {/* Technology Stack */}
                    {project.technology_stack && project.technology_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {project.technology_stack.slice(0, 3).map((tech: string, index: number) => (
                          <span 
                            key={index}
                            className="inline-block px-2 py-1 text-xs rounded-full bg-[#004080]/10 text-[#004080]"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technology_stack.length > 3 && (
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                            +{project.technology_stack.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      variant="outline"
                      size="sm"
                      className="w-full border-[#004080] text-[#004080] hover:bg-[#f0f7ff]"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Projects Count */}
        {filteredProjects.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Showing {filteredProjects.length} of {projectsCount} projects
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}