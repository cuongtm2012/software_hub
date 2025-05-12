import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader2, Tag, Box, Star } from "lucide-react";
import { Product } from "@shared/schema";
import { Pagination } from "@/components/pagination";
import { useAuth } from "@/hooks/use-auth";

export default function MarketplacePage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const itemsPerPage = 12;

  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/products", category, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      params.append("limit", itemsPerPage.toString());
      params.append("offset", ((page - 1) * itemsPerPage).toString());
      
      const response = await fetch(`/api/products?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      return response.json();
    },
  });

  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["/api/categories"],
  });

  const products = productData?.products || [];
  const totalProducts = productData?.total || 0;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const handleCategoryChange = (categoryName: string | null) => {
    setCategory(categoryName);
    setPage(1);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Marketplace</h1>
          {user?.role === "seller" && (
            <Link to="/marketplace/seller">
              <Button>Manage My Store</Button>
            </Link>
          )}
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Categories</h2>
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={category === null ? "default" : "outline"}
              className="cursor-pointer px-3 py-1 text-sm"
              onClick={() => handleCategoryChange(null)}
            >
              All
            </Badge>
            
            {categoriesLoading ? (
              Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-7 w-16 rounded-full" />
              ))
            ) : (
              categories?.map((cat) => (
                <Badge 
                  key={cat.id}
                  variant={category === cat.name ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1 text-sm"
                  onClick={() => handleCategoryChange(cat.name)}
                >
                  {cat.name}
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <CardHeader className="p-4 pb-0">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">Error loading products: {(error as Error).message}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10">
            <Box className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium">No products found</h3>
            <p className="mt-1 text-gray-500">
              {category 
                ? `No products available in the "${category}" category.` 
                : "There are no products available in the marketplace yet."}
            </p>
            {user?.role === "seller" && (
              <Link to="/marketplace/seller/new">
                <Button className="mt-6">Add Your First Product</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: Product) => (
                <Link key={product.id} href={`/marketplace/product/${product.id}`}>
                  <Card className="overflow-hidden h-full cursor-pointer hover:shadow-md transition-shadow">
                    <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Box className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <div className="flex items-center mt-1">
                        <Tag className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-500">{product.category}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm">
                          {product.avg_rating ? product.avg_rating.toFixed(1) : "New"}
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}