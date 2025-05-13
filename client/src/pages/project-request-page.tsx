import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Code, FileCog, FileCode, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Project request form schema
const projectRequestSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Phone must be at least 6 characters").optional(),
  company: z.string().optional(),
  project_name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  requirements: z.string().min(10, "Requirements must be at least 10 characters"),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

type ProjectRequestFormValues = z.infer<typeof projectRequestSchema>;

export default function ProjectRequestPage() {
  const { toast } = useToast();
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Form definition
  const form = useForm<ProjectRequestFormValues>({
    resolver: zodResolver(projectRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      project_name: "",
      description: "",
      requirements: "",
      budget: "",
      timeline: "",
    },
  });

  // Create external request mutation
  const createExternalRequestMutation = useMutation({
    mutationFn: async (data: ProjectRequestFormValues) => {
      const response = await apiRequest("POST", "/api/external-requests", {
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        company: data.company || "",
        project_name: data.project_name,
        description: data.description,
        requirements: data.requirements,
        budget: data.budget || "",
        timeline: data.timeline || "",
        status: "pending",
      });
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Project request submitted",
        description: "We have received your project request and will contact you soon.",
      });
      setFormSubmitted(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error submitting request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(data: ProjectRequestFormValues) {
    createExternalRequestMutation.mutate(data);
  }

  if (formSubmitted) {
    return (
      <div className="container py-10">
        <Alert className="max-w-3xl mx-auto bg-green-50 border-green-200">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 text-xl font-semibold">Request Submitted Successfully!</AlertTitle>
          <AlertDescription className="text-green-700 mt-2">
            <p className="mb-3">Thank you for submitting your project request. Our team will review your requirements and get back to you soon.</p>
            <p className="mb-3">Please check your email for confirmation. If you have any urgent questions, feel free to contact us directly.</p>
            <Button 
              variant="outline" 
              className="mt-2 bg-white text-green-600 border-green-300 hover:bg-green-50"
              onClick={() => setFormSubmitted(false)}
            >
              Submit Another Request
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight mb-3 text-[#004080]">Request a Custom Project</h1>
            <p className="text-muted-foreground mb-6">
              Fill out the form below to request a custom software development project. Our team will review your requirements and contact you shortly.
            </p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your company (optional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="project_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="A brief name for your project" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your project in detail. What problem are you trying to solve?" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical Requirements *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List key features, technologies, or specific requirements" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Budget</FormLabel>
                        <FormControl>
                          <Input placeholder="Your budget range" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="timeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Timeline</FormLabel>
                        <FormControl>
                          <Input placeholder="When do you need this completed?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto bg-[#004080] hover:bg-[#003366]"
                    disabled={createExternalRequestMutation.isPending}
                  >
                    {createExternalRequestMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit Project Request
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
          <div className="w-full md:w-80 lg:w-96 shrink-0">
            <div className="sticky top-20">
              <div className="space-y-6">
                <Card className="bg-[#f8f9fa] border-[#e9ecef]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[#004080]">Why Choose Our Services?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <Code className="h-5 w-5 text-[#ffcc00] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Expert Development Team</p>
                          <p className="text-sm text-muted-foreground">Our specialists have years of experience in diverse technologies</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <FileCog className="h-5 w-5 text-[#ffcc00] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Custom Solutions</p>
                          <p className="text-sm text-muted-foreground">Tailored development to match your specific requirements</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <FileCode className="h-5 w-5 text-[#ffcc00] shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">End-to-End Service</p>
                          <p className="text-sm text-muted-foreground">From planning to deployment and ongoing support</p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[#004080]">Project Request Process</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4 list-decimal pl-5">
                      <li className="text-sm">
                        <span className="font-medium">Submit your request</span>
                        <p className="text-muted-foreground">Fill out the form with your project details</p>
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Initial consultation</span>
                        <p className="text-muted-foreground">Our team will contact you to discuss requirements</p>
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Proposal and quote</span>
                        <p className="text-muted-foreground">Receive a detailed proposal with timeline and costs</p>
                      </li>
                      <li className="text-sm">
                        <span className="font-medium">Development begins</span>
                        <p className="text-muted-foreground">Once approved, our team starts working on your project</p>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
                
                <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-sm font-medium">Required fields are marked with *</AlertTitle>
                  <AlertDescription className="text-xs text-blue-700 mt-1">
                    The more details you provide, the better we can understand your needs.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}