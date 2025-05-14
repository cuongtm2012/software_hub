import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Code, ExternalLink, MoveRight } from "lucide-react";
import { Link } from "wouter";

type SampleProject = {
  id: number;
  name: string;
  description: string;
  technologies: string[];
  outcome: string;
  image?: string;
};

const sampleProjects: SampleProject[] = [
  {
    id: 1,
    name: "E-Commerce Platform",
    description: "Full-stack online store with payment integration",
    technologies: ["React", "Node.js", "Stripe"],
    outcome: "Increased client sales by 30% within 3 months",
  },
  {
    id: 2,
    name: "Mobile Health App",
    description: "Cross-platform app for health tracking and reminders",
    technologies: ["Flutter", "Firebase"],
    outcome: "Rated 4.8/5 by users for usability",
  },
  {
    id: 3,
    name: "Custom CRM System",
    description: "Tailored CRM for small businesses with reporting features",
    technologies: ["Angular", ".NET Core"],
    outcome: "Improved client workflow efficiency by 40%",
  },
  {
    id: 4,
    name: "SaaS Dashboard",
    description: "Real-time analytics dashboard for SaaS providers",
    technologies: ["Vue.js", "Python", "AWS"],
    outcome: "Reduced data processing time by 50%",
  },
];

export function PortfolioShowcase() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <Code className="w-6 h-6 text-[#004080]" />
          </div>
          <CardTitle className="text-[#004080]">Post Your Project</CardTitle>
          <CardDescription>Describe your software needs and requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm">
            Define your project scope, timeline, and budget. Our detailed request form helps you provide all the information developers need to understand your requirements.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/request-project">
            <Button variant="outline" className="text-[#004080] border-[#004080]/30 hover:bg-blue-50 w-full">
              Create Project Request
              <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#004080]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <CardTitle className="text-[#004080]">Find Developers</CardTitle>
          <CardDescription>Connect with skilled professionals</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm">
            Browse developer portfolios, review their skills and past projects. Choose the right talent for your project based on experience and expertise.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/portfolios/gallery">
            <Button variant="outline" className="text-[#004080] border-[#004080]/30 hover:bg-blue-50 w-full">
              Browse Portfolios
              <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#004080]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 7h10" />
              <path d="M7 12h10" />
              <path d="M7 17h10" />
            </svg>
          </div>
          <CardTitle className="text-[#004080]">Manage Projects</CardTitle>
          <CardDescription>Track progress and collaborate effectively</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-sm">
            Manage milestones, communicate with developers, and track progress all in one place. Our platform provides tools for seamless collaboration.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/projects">
            <Button variant="outline" className="text-[#004080] border-[#004080]/30 hover:bg-blue-50 w-full">
              View Projects
              <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}