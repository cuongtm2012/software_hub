import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
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
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";

interface Portfolio {
  id: number;
  title: string;
  description: string;
  images: string[];
  demo_link?: string | null;
  technologies: string[];
}

export default function PortfolioEditPage() {
  const params = useParams<{ id: string }>();
  const portfolioId = params?.id;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [newTechnology, setNewTechnology] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState("");

  const { data: portfolio, isLoading } = useQuery<Portfolio>({
    queryKey: ["/api/portfolios", portfolioId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/portfolios/${portfolioId}`);
      if (!res.ok) throw new Error("Không tìm thấy portfolio");
      return res.json();
    },
    enabled: !!portfolioId,
  });

  const form = useForm<InsertPortfolio>({
    resolver: zodResolver(insertPortfolioSchema),
    defaultValues: {
      title: "",
      description: "",
      images: [],
      demo_link: "",
      technologies: [],
    },
  });

  useEffect(() => {
    if (portfolio) {
      form.reset({
        title: portfolio.title,
        description: portfolio.description,
        demo_link: portfolio.demo_link || "",
        images: portfolio.images || [],
        technologies: portfolio.technologies || [],
      });
      setTechnologies(portfolio.technologies || []);
      setImages(portfolio.images || []);
    }
  }, [portfolio, form]);

  const updatePortfolioMutation = useMutation({
    mutationFn: async (data: InsertPortfolio) => {
      const res = await apiRequest("PUT", `/api/portfolios/${portfolioId}`, {
        ...data,
        images,
        technologies,
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Cập nhật portfolio thất bại");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Đã cập nhật portfolio",
        description: "Dự án portfolio đã được lưu thành công.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios/developer"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolios", portfolioId] });
      navigate("/portfolios");
    },
    onError: (error: Error) => {
      toast({
        title: "Cập nhật thất bại",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPortfolio) => {
    updatePortfolioMutation.mutate(data);
  };

  const handleAddTechnology = () => {
    if (newTechnology.trim() && !technologies.includes(newTechnology.trim())) {
      setTechnologies([...technologies, newTechnology.trim()]);
      setNewTechnology("");
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech));
  };

  const handleAddImage = () => {
    if (newImage.trim() && !images.includes(newImage.trim())) {
      setImages([...images, newImage.trim()]);
      setNewImage("");
    }
  };

  const handleRemoveImage = (img: string) => {
    setImages(images.filter((i) => i !== img));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#004080]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Không tìm thấy portfolio.</p>
          <Button onClick={() => navigate("/portfolios")} variant="outline">
            Quay lại
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />

      <main className="flex-grow container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/portfolios")}
            className="mb-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại Portfolio
          </Button>

          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa dự án</h1>
          <p className="text-gray-500 mt-1">Cập nhật thông tin dự án portfolio của bạn</p>
        </div>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Chi tiết dự án</CardTitle>
            <CardDescription>Chỉnh sửa thông tin dự án đã hoàn thành</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên dự án</FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Website thương mại điện tử" {...field} />
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
                      <FormLabel>Mô tả dự án</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả dự án, vai trò của bạn, thách thức và giải pháp..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="demo_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link demo (tuỳ chọn)</FormLabel>
                      <FormControl>
                        <Input type="url" placeholder="https://example.com/demo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Công nghệ sử dụng</FormLabel>
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
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex">
                    <Input
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      placeholder="VD: React, Node.js"
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
                    </Button>
                  </div>
                </div>

                <div>
                  <FormLabel>Hình ảnh dự án</FormLabel>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 mb-3">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className="relative rounded-md overflow-hidden border border-gray-200"
                      >
                        <img src={img} alt={`Ảnh ${index + 1}`} className="w-full h-40 object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img)}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                        >
                          <X className="h-4 w-4" />
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
                    </Button>
                  </div>
                </div>

                <CardFooter className="px-0 pb-0 pt-6">
                  <Button
                    type="submit"
                    className="w-full bg-[#004080] hover:bg-[#003366] text-white"
                    disabled={updatePortfolioMutation.isPending}
                  >
                    {updatePortfolioMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
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
