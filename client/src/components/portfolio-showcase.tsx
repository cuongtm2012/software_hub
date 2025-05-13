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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#004080] mb-3">Successful Projects</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our showcase of completed projects from top developers in our community
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {sampleProjects.map((project) => (
            <Card key={project.id} className="bg-white hover:shadow-lg transition-all duration-300 h-full flex flex-col">
              <div className="relative pt-[60%] bg-gray-100">
                {project.image ? (
                  <img 
                    src={project.image}
                    alt={project.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Code className="h-12 w-12 text-gray-300" />
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-[#004080]">{project.name}</CardTitle>
                <CardDescription>{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="py-2 flex-grow">
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.technologies.map((tech, index) => (
                    <span 
                      key={index} 
                      className="inline-block px-2 py-1 text-xs rounded-full bg-[#004080]/10 text-[#004080]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-700 border-l-2 border-[#ffcc00] pl-3 italic">
                  {project.outcome}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="link"
                  className="text-[#004080] hover:text-[#003366] p-0 h-auto flex items-center gap-1"
                  asChild
                >
                  <Link href="/project-request">
                    <span>Request Similar Project</span>
                    <MoveRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            className="bg-[#004080] hover:bg-[#003366] text-white"
            asChild
          >
            <Link href="/portfolios/gallery">
              Browse All Developer Portfolios <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}