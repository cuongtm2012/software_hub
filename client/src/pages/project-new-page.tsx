import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { insertProjectSchema, InsertProject } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function ProjectNewPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Create validation schema
  const formSchema = insertProjectSchema.extend({
    deadline: insertProjectSchema.shape.deadline.optional().refine(
      (date) => {
        if (!date) return true;
        return new Date(date) > new Date();
      },
      {
        message: "Deadline must be in the future",
      }
    ),
  });
  
  // Initialize form
  const form = useForm<InsertProject>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      budget: undefined,
      deadline: undefined,
    },
  });
  
  // Submit mutation
  const createProjectMutation = useMutation({
    mutationFn: async (data: InsertProject) => {
      const res = await apiRequest("POST", "/api/projects", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create project");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Project created successfully",
        description: "Developers can now view your project and submit quotes.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects/client'] });
      navigate('/projects');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create project",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: InsertProject) => {
    createProjectMutation.mutate(data);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      
      <main className="flex-grow container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/projects')}
            className="mb-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-500 mt-1">
            Describe your project in detail to attract the best developers
          </p>
        </div>
        
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Provide complete information to help developers understand your requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., E-commerce Website Development" {...field} />
                      </FormControl>
                      <FormDescription>
                        Choose a clear, descriptive title for your project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your project in detail..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide an overview of the project, its goals, and background
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technical Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List specific technical requirements, features, technologies..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include technologies, features, and any specific requirements
                      </FormDescription>
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
                        <FormLabel>Budget (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your budget in USD"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Specify your budget range in USD
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deadline (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            placeholder="Select a deadline"
                            {...field}
                            value={field.value?.toString().split('T')[0] || ''}
                          />
                        </FormControl>
                        <FormDescription>
                          When do you need this project completed?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <CardFooter className="px-0 pb-0 pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-[#004080] hover:bg-[#003366] text-white"
                    disabled={createProjectMutation.isPending}
                  >
                    {createProjectMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Creating Project...
                      </>
                    ) : (
                      "Create Project"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}