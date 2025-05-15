import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { ExternalRequest, InsertExternalRequest, insertExternalRequestSchema } from "@shared/schema";

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
import { AlertCircle, ArrowLeft, CheckCircle2, Code, FileCog, FileCode, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

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
  const [, navigate] = useLocation();
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
        // Combine all project details into the project_description field
        project_description: `
Project Name: ${data.project_name}
Company: ${data.company || 'N/A'}
Description: ${data.description}
Requirements: ${data.requirements}
Budget: ${data.budget || 'N/A'}
Timeline: ${data.timeline || 'N/A'}
        `.trim(),
        status: "new",
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
      <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
        <Header />
        <main className="flex-grow">
          <div className="container py-10">
            <div className="mb-6">
              <Button
                variant="outline"
                className="flex items-center text-[#004080]"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <Alert className="max-w-3xl mx-auto bg-green-50 border-green-200">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800 text-xl font-semibold">Request Submitted Successfully!</AlertTitle>
              <AlertDescription className="text-green-700 mt-2">
                <p className="mb-3">Thank you for submitting your project request. Our team will review your requirements and get back to you soon.</p>
                <p className="mb-3">Please check your email for confirmation. If you have any urgent questions, feel free to contact us directly.</p>
                <div className="flex flex-wrap gap-4 mt-4">
                  <Button 
                    variant="outline" 
                    className="bg-white text-green-600 border-green-300 hover:bg-green-50"
                    onClick={() => setFormSubmitted(false)}
                  >
                    Submit Another Request
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white text-[#004080] border-[#004080] hover:bg-[#004080]/10"
                    onClick={() => navigate('/')}
                  >
                    Return to Home
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      <main className="flex-grow bg-gray-50">
        <div className="container px-4 sm:px-6 py-12 max-w-6xl mx-auto">
          <div className="mb-8">
            <Button
              variant="outline"
              className="flex items-center text-[#004080] hover:bg-[#004080]/5 border-[#004080]/30 transition-all duration-200"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
                  <h1 className="text-3xl font-bold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#004080] to-[#0066cc]">Request a Custom Project</h1>
                  <p className="text-gray-600 mb-6">
                    Fill out the form below to request a custom software development project. Our team will review your requirements and contact you shortly.
                  </p>
                
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Your Name <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Full name" 
                                  className="border-gray-300 focus-visible:ring-[#004080]" 
                                  {...field} 
                                />
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
                              <FormLabel className="text-gray-700">Email Address <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your email" 
                                  className="border-gray-300 focus-visible:ring-[#004080]" 
                                  {...field} 
                                />
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
                              <FormLabel className="text-gray-700">Phone Number</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your phone number" 
                                  className="border-gray-300 focus-visible:ring-[#004080]" 
                                  {...field} 
                                />
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
                              <FormLabel className="text-gray-700">Company Name</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your company (optional)" 
                                  className="border-gray-300 focus-visible:ring-[#004080]" 
                                  {...field} 
                                />
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
                            <FormLabel className="text-gray-700">Project Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="A brief name for your project" 
                                className="border-gray-300 focus-visible:ring-[#004080]" 
                                {...field} 
                              />
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
                            <FormLabel className="text-gray-700">Project Description <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your project in detail. What problem are you trying to solve?" 
                                className="min-h-[120px] border-gray-300 focus-visible:ring-[#004080]" 
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
                            <FormLabel className="text-gray-700">Technical Requirements <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="List key features, technologies, or specific requirements" 
                                className="min-h-[120px] border-gray-300 focus-visible:ring-[#004080]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">Estimated Budget</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Your budget range" 
                                  className="border-gray-300 focus-visible:ring-[#004080]" 
                                  {...field} 
                                />
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
                              <FormLabel className="text-gray-700">Expected Timeline</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="When do you need this completed?" 
                                  className="border-gray-300 focus-visible:ring-[#004080]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="pt-6">
                        <Button 
                          type="submit" 
                          className="w-full md:w-auto bg-gradient-to-r from-[#004080] to-[#003366] hover:from-[#003366] hover:to-[#002040] text-white py-6 px-8"
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
              </div>
              
              <div className="w-full md:w-72 lg:w-80 shrink-0 mb-8 md:mb-0">
                <div className="sticky top-20">
                  <div className="space-y-5">
                    <Card className="bg-gradient-to-br from-[#f0f6ff] to-[#fafcff] border-[#e9ecef] shadow-sm">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-[#004080] text-lg">Why Choose Our Services?</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 pt-0">
                        <ul className="space-y-3">
                          <li className="flex gap-3">
                            <div className="p-2 rounded-full bg-[#004080]/10 h-9 w-9 flex items-center justify-center">
                              <Code className="h-5 w-5 text-[#004080]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">Expert Development Team</p>
                              <p className="text-sm text-gray-600">Our specialists have years of experience in diverse technologies</p>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <div className="p-2 rounded-full bg-[#004080]/10 h-9 w-9 flex items-center justify-center">
                              <FileCog className="h-5 w-5 text-[#004080]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">Custom Solutions</p>
                              <p className="text-sm text-gray-600">Tailored development to match your specific requirements</p>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <div className="p-2 rounded-full bg-[#004080]/10 h-9 w-9 flex items-center justify-center">
                              <FileCode className="h-5 w-5 text-[#004080]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">End-to-End Service</p>
                              <p className="text-sm text-gray-600">From planning to deployment and ongoing support</p>
                            </div>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-sm border-[#e9ecef]">
                      <CardHeader className="pb-2 pt-4 px-4">
                        <CardTitle className="text-[#004080] text-lg">Project Request Process</CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 pt-0">
                        <ol className="space-y-3 list-decimal pl-5">
                          <li className="text-sm">
                            <span className="font-medium text-gray-800">Submit your request</span>
                            <p className="text-gray-600">Fill out the form with your project details</p>
                          </li>
                          <li className="text-sm">
                            <span className="font-medium text-gray-800">Initial consultation</span>
                            <p className="text-gray-600">Our team will contact you to discuss requirements</p>
                          </li>
                          <li className="text-sm">
                            <span className="font-medium text-gray-800">Proposal and quote</span>
                            <p className="text-gray-600">Receive a detailed proposal with timeline and costs</p>
                          </li>
                          <li className="text-sm">
                            <span className="font-medium text-gray-800">Development begins</span>
                            <p className="text-gray-600">Once approved, our team starts working on your project</p>
                          </li>
                        </ol>
                      </CardContent>
                    </Card>
                    
                    <Alert className="bg-blue-50 border-blue-200 text-blue-800 shadow-sm p-4">
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
      </main>
      <Footer />
    </div>
  );
}