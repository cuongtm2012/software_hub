import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PortfolioShowcase } from "@/components/portfolio-showcase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/pagination";
import { Link, useLocation } from "wouter";
import { 
  PlusCircle, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  ArrowRight,
  Briefcase,
  Users,
  Code,
  BarChart4,
  Loader2,
  CheckCircle,
  Star,
  Trophy,
  Monitor,
  Smartphone,
  ShoppingCart,
  BookOpen,
  Film,
  Globe,
  Award
} from "lucide-react";

// Successful projects data
const successfulProjects = [
  {
    id: 1,
    name: "Corporate Pulse",
    description: "A modern responsive company introduction website with interactive elements and integrated CMS.",
    technologies: ["React", "TypeScript", "Tailwind CSS", "Strapi CMS"],
    highlight: "Increased client inquiries by 47% within 3 months of launch.",
    icon: Monitor,
    color: "blue"
  },
  {
    id: 2,
    name: "PageTurner Plus",
    description: "Comprehensive bookstore management system with inventory tracking, sales analytics, and customer loyalty features.",
    technologies: ["Node.js", "Express", "PostgreSQL", "Redis"],
    highlight: "Reduced inventory management time by 65% for a chain with 12 locations.",
    icon: BookOpen,
    color: "green"
  },
  {
    id: 3,
    name: "StyleStock",
    description: "Clothing store management system with barcode integration, seasonal inventory planning, and staff scheduling.",
    technologies: ["React", "Django", "PostgreSQL", "Docker"],
    highlight: "Improved stock accuracy to 99.8% and reduced overstocking by 32%.",
    icon: ShoppingCart,
    color: "purple"
  },
  {
    id: 4,
    name: "QuickBite",
    description: "Fast food delivery mobile app with real-time tracking, customizable orders, and loyalty program.",
    technologies: ["React Native", "Firebase", "Google Maps API", "Stripe"],
    highlight: "Processed over 15,000 orders in first month with 4.8/5 user rating.",
    icon: Smartphone,
    color: "orange"
  },
  {
    id: 5,
    name: "TaleScape",
    description: "Interactive story reading mobile app with audio narration, animations, and parental controls.",
    technologies: ["Flutter", "Firebase", "AWS Polly", "SVG Animation"],
    highlight: "Featured in App Store's \"Apps We Love\" with 250,000+ downloads.",
    icon: BookOpen,
    color: "pink"
  },
  {
    id: 6,
    name: "CineFlix+",
    description: "Online movie streaming platform with personalized recommendations and social sharing features.",
    technologies: ["Next.js", "GraphQL", "MongoDB", "AWS S3"],
    highlight: "Achieved 98.5% uptime with smooth playback for 50,000+ concurrent users.",
    icon: Film,
    color: "red"
  },
  {
    id: 7,
    name: "SportsPulse",
    description: "Real-time sports news and scores mobile app with personalized alerts and live commentary.",
    technologies: ["React Native", "Socket.io", "Node.js", "MongoDB"],
    highlight: "Retained 78% of users after 3 months with average 22 minutes daily use.",
    icon: Smartphone,
    color: "indigo"
  },
  {
    id: 8,
    name: "VistaTour",
    description: "Tourism marketplace connecting travelers with local guides and unique experiences.",
    technologies: ["Vue.js", "Laravel", "MySQL", "Mapbox"],
    highlight: "Facilitated 10,000+ bookings across 45 countries in first year.",
    icon: Globe,
    color: "teal"
  }
];

export default function ProjectsPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [currentTab, setCurrentTab] = useState<"all" | "pending" | "in_progress" | "completed" | "cancelled">("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  
  // Client projects query
  const { 
    data: clientProjects, 
    isLoading: isLoadingClientProjects,
    error: clientProjectsError 
  } = useQuery({
    queryKey: ['/api/projects/client'],
    queryFn: undefined,
    enabled: user?.role === 'client',
  });
  
  // Developer projects query
  const { 
    data: developerProjects, 
    isLoading: isLoadingDeveloperProjects,
    error: developerProjectsError 
  } = useQuery({
    queryKey: ['/api/projects/available', { status: currentTab !== 'all' ? currentTab : undefined, page, limit }],
    queryFn: undefined,
    enabled: user?.role === 'developer',
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setCurrentTab(value as "all" | "pending" | "in_progress" | "completed" | "cancelled");
    setPage(1);
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  // Determine which projects to show based on user role
  const getProjectsToShow = () => {
    if (user?.role === 'client') {
      return clientProjects || { projects: [], total: 0 };
    } else if (user?.role === 'developer') {
      return developerProjects || { projects: [], total: 0 };
    }
    return { projects: [], total: 0 };
  };
  
  const isLoading = isLoadingClientProjects || isLoadingDeveloperProjects;
  const error = clientProjectsError || developerProjectsError;
  const { projects, total } = getProjectsToShow();
  
  // Handle role-based create button
  const handleCreateButton = () => {
    if (user?.role === 'client') {
      navigate('/projects/new');
    } else if (user?.role === 'developer') {
      navigate('/portfolios/new');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      
      <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Hub</h1>
            <p className="text-gray-500 mt-1">
              {user?.role === 'client' 
                ? 'Manage your projects and connect with developers' 
                : 'Find projects to work on and submit quotes'}
            </p>
          </div>
          
          <Button 
            onClick={handleCreateButton}
            className="bg-[#004080] hover:bg-[#003366] text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {user?.role === 'client' ? 'Create New Project' : 'Create Portfolio'}
          </Button>
        </div>
        
        {/* Successful Projects Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Trophy className="h-5 w-5 text-[#ffcc00] mr-2" />
                Successful Projects
              </h2>
              <p className="text-gray-500 mt-1">Explore our portfolio of successfully completed projects</p>
            </div>
            <Button variant="outline" className="text-[#004080] border-[#004080]">
              View All Success Stories <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {successfulProjects.slice(0, 4).map((project) => {
              // Dynamic styling based on project color
              const getColorClass = (color: string) => {
                const colorMap: Record<string, { bg: string, text: string, border: string }> = {
                  blue: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
                  green: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
                  purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
                  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
                  pink: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
                  red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
                  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
                  teal: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
                };
                return colorMap[color] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
              };
              
              const colorClasses = getColorClass(project.color);
              const IconComponent = project.icon;
              
              return (
                <Card key={project.id} className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-200">
                  <div className={`${colorClasses.bg} p-4 flex items-center justify-between border-b ${colorClasses.border}`}>
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${colorClasses.bg} mr-3`}>
                        <IconComponent className={`h-5 w-5 ${colorClasses.text}`} />
                      </div>
                      <h3 className={`font-semibold ${colorClasses.text}`}>{project.name}</h3>
                    </div>
                    <Badge variant="outline" className={`${colorClasses.bg} ${colorClasses.text} border-0`}>
                      <CheckCircle className="h-3 w-3 mr-1" /> Success
                    </Badge>
                  </div>
                  
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">{project.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.technologies.map((tech, idx) => (
                        <Badge key={idx} variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-100 pt-3 flex items-start">
                      <Star className="h-4 w-4 text-yellow-500 mt-0.5 mr-2 shrink-0" />
                      <p className="text-xs text-gray-600">{project.highlight}</p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t p-3 bg-gray-50">
                    <Button 
                      size="sm"
                      className="bg-[#004080] hover:bg-[#003366] text-white w-full text-xs h-8"
                      onClick={() => navigate('/project-request')}
                    >
                      Request Similar Project
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            {successfulProjects.slice(4, 8).map((project) => {
              const IconComponent = project.icon;
              return (
                <Card key={project.id} className="bg-white shadow-sm hover:shadow-md transition-all border border-gray-200 flex flex-col">
                  <CardHeader className="pb-3 flex-grow-0">
                    <div className="flex items-center">
                      <IconComponent className="h-5 w-5 text-[#004080] mr-2" />
                      <CardTitle className="text-sm font-medium">{project.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 flex-grow">
                    <p className="text-xs text-gray-600 line-clamp-2">{project.description}</p>
                    <div className="flex items-center mt-2 mb-1">
                      <Award className="h-3 w-3 text-yellow-500 mr-1" />
                      <p className="text-xs font-medium text-gray-700">Key Achievement</p>
                    </div>
                    <p className="text-xs text-gray-600">{project.highlight}</p>
                  </CardContent>
                  <CardFooter className="pt-3 border-t flex-grow-0">
                    <Button 
                      variant="link" 
                      className="text-[#004080] p-0 h-auto text-xs font-medium"
                      onClick={() => navigate('/project-request')}
                    >
                      Request Similar <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
        
        {/* Services summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <Briefcase className="h-8 w-8 text-[#004080] mb-2" />
              <CardTitle className="text-lg">Project Requests</CardTitle>
              <CardDescription>Submit detailed project requests for software development</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="link" 
                className="text-[#004080] p-0 h-auto font-medium"
                onClick={() => navigate('/project-request')}
              >
                Learn how it works <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <Code className="h-8 w-8 text-[#004080] mb-2" />
              <CardTitle className="text-lg">Custom Development</CardTitle>
              <CardDescription>Get custom software built by professional developers</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                variant="link" 
                className="text-[#004080] p-0 h-auto font-medium"
                onClick={() => navigate('/portfolios/gallery')}
              >
                Browse developer portfolios <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <Users className="h-8 w-8 text-[#004080] mb-2" />
              <CardTitle className="text-lg">Secure Collaboration</CardTitle>
              <CardDescription>Work directly with developers through our secure platform</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="link" className="text-[#004080] p-0 h-auto font-medium">
                View payment protection <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Filter tabs */}
        <Tabs 
          value={currentTab} 
          onValueChange={handleTabChange}
          className="mb-8"
        >
          <TabsList className="bg-white border border-gray-200 p-1 rounded-md">
            <TabsTrigger value="all" className="text-sm rounded-sm data-[state=active]:bg-[#004080] data-[state=active]:text-white">
              All Projects
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-sm rounded-sm data-[state=active]:bg-[#004080] data-[state=active]:text-white">
              Pending
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="text-sm rounded-sm data-[state=active]:bg-[#004080] data-[state=active]:text-white">
              In Progress
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-sm rounded-sm data-[state=active]:bg-[#004080] data-[state=active]:text-white">
              Completed
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="text-sm rounded-sm data-[state=active]:bg-[#004080] data-[state=active]:text-white">
              Cancelled
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Projects list */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
              <p className="text-red-800">Error loading projects. Please try again later.</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
              <BarChart4 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                {user?.role === 'client' 
                  ? "You haven't created any projects yet." 
                  : "There are no available projects that match your criteria."}
              </p>
              {user?.role === 'client' && (
                <Button 
                  onClick={() => navigate('/projects/new')}
                  className="bg-[#004080] hover:bg-[#003366] text-white"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              )}
            </div>
          ) : (
            <>
              {projects.map((project: any) => (
                <Card key={project.id} className="bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <CardDescription>Project #{project.id}</CardDescription>
                          <span className="text-gray-300">•</span>
                          <CardDescription>
                            <Clock className="inline-block h-3 w-3 mr-1" />
                            {formatDate(project.created_at)}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-gray-700 text-sm line-clamp-2">{project.description}</p>
                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                      {project.budget && (
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          <span>Budget: ${parseFloat(project.budget).toFixed(2)}</span>
                        </div>
                      )}
                      {project.deadline && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          <span>Deadline: {formatDate(project.deadline)}</span>
                        </div>
                      )}
                      {project.quotes_count !== undefined && (
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-gray-400" />
                          <span>{project.quotes_count} Quote{project.quotes_count !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3 flex justify-end">
                    <Button 
                      variant="outline" 
                      className="text-[#004080] hover:bg-[#004080] hover:text-white border-[#004080]"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              {/* Pagination */}
              {total > limit && (
                <Pagination
                  currentPage={page}
                  totalPages={Math.ceil(total / limit)}
                  onPageChange={handlePageChange}
                  className="mt-8"
                />
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Phase 2: Code Service & Product Build Module - Portfolio Showcase */}
      <PortfolioShowcase />
      
      <Footer />
    </div>
  );
}