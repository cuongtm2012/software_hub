import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { insertPortfolioSchema, InsertPortfolio } from "@shared/schema";
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
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";

export default function PortfolioNewPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [newTechnology, setNewTechnology] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState("");
  
  // Create validation schema
  const formSchema = insertPortfolioSchema;
  
  // Initialize form
  const form = useForm<InsertPortfolio>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      images: [],
      demo_link: "",
      technologies: [],
    },
  });
  
  // Submit mutation
  const createPortfolioMutation = useMutation({
    mutationFn: async (data: InsertPortfolio) => {
      const res = await apiRequest("POST", "/api/portfolios", {
        ...data,
        images,
        technologies,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create portfolio");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Portfolio created successfully",
        description: "Your new portfolio project has been added.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/portfolios/developer'] });
      navigate('/portfolios');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create portfolio",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission handler
  const onSubmit = (data: InsertPortfolio) => {
    createPortfolioMutation.mutate(data);
  };
  
  // Handle add technology
  const handleAddTechnology = () => {
    if (newTechnology.trim() && !technologies.includes(newTechnology.trim())) {
      setTechnologies([...technologies, newTechnology.trim()]);
      setNewTechnology("");
    }
  };
  
  // Handle remove technology
  const handleRemoveTechnology = (tech: string) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };
  
  // Handle add image URL
  const handleAddImage = () => {
    if (newImage.trim() && !images.includes(newImage.trim())) {
      setImages([...images, newImage.trim()]);
      setNewImage("");
    }
  };
  
  // Handle remove image URL
  const handleRemoveImage = (img: string) => {
    setImages(images.filter(i => i !== img));
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />
      
      <main className="flex-grow container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/portfolios')}
            className="mb-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900">Add New Portfolio Project</h1>
          <p className="text-gray-500 mt-1">
            Showcase your skills and experience to potential clients
          </p>
        </div>
        
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Provide information about a project you've completed
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
                        <Input placeholder="E.g., E-commerce Website, Mobile App" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear and descriptive title for your project
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
                          placeholder="Describe the project, your role, challenges faced, and solutions implemented..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide detailed information about the project and your contribution
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="demo_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Demo Link (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="url" 
                          placeholder="https://example.com/demo" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Link to a live demo or GitHub repository
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Technologies Used</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {technologies.map((tech, index) => (
                      <div 
                        key={index} 
                        className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full flex items-center"
                      >
                        {tech}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTechnology(tech)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {tech}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <Input
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      placeholder="E.g., React, Node.js, Python"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTechnology}
                      className="ml-2"
                      disabled={!newTechnology.trim()}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add technology</span>
                    </Button>
                  </div>
                  <FormDescription className="mt-2">
                    Add the main technologies, frameworks, and languages used in this project
                  </FormDescription>
                </div>
                
                <div>
                  <FormLabel>Project Images</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 mb-3">
                    {images.map((img, index) => (
                      <div 
                        key={index} 
                        className="relative rounded-md overflow-hidden border border-gray-200"
                      >
                        <img 
                          src={img} 
                          alt={`Portfolio image ${index + 1}`} 
                          className="w-full h-40 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Invalid+Image';
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveImage(img)}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-gray-700 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove image</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <Input
                      value={newImage}
                      onChange={(e) => setNewImage(e.target.value)}
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddImage}
                      className="ml-2"
                      disabled={!newImage.trim()}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add image</span>
                    </Button>
                  </div>
                  <FormDescription className="mt-2">
                    Add URLs of images showcasing your project. Include screenshots, designs, or diagrams.
                  </FormDescription>
                </div>
                
                <CardFooter className="px-0 pb-0 pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-[#004080] hover:bg-[#003366] text-white"
                    disabled={createPortfolioMutation.isPending}
                  >
                    {createPortfolioMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Creating Portfolio...
                      </>
                    ) : (
                      "Create Portfolio"
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