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
  // Component intentionally left empty as the showcase is now 
  // directly embedded in the IT services page
  return null;
}