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
import { AddToCart } from "@/components/add-to-cart";

export default function MarketplacePage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch marketplace products from API
  const { data: marketplaceData, isLoading } = useQuery<{products: Product[]}>({
    queryKey: ["/api/marketplace/products"],
  });

  const marketplaceStores: Product[] = marketplaceData?.products || [];

  // Sample marketplace store data for fallback (if no API data)
  const sampleStores = [
    {
      id: 1,
      name: "Premium Gmail Accounts",
      description: "Verified Gmail accounts with phone verification and recovery options",
      image: "https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r5.png",
      price: "$5.99",
      rating: 4.8,
      seller: "DigitalStore Pro",
      category: "accounts",
      inStock: 150
    },
    {
      id: 2,
      name: "Microsoft Office 365 License",
      description: "Lifetime Microsoft Office 365 activation key for all applications",
      image: "https://img-prod-cms-rt-microsoft-com.akamaized.net/cms/api/am/imageFileData/RE4DtQa",
      price: "$29.99",
      rating: 4.9,
      seller: "SoftwarePlus",
      category: "software",
      inStock: 89
    },
    {
      id: 3,
      name: "Adobe Creative Cloud",
      description: "Full Adobe Creative Suite with Photoshop, Illustrator, Premiere Pro",
      image: "https://www.adobe.com/content/dam/cc/icons/Creative_Cloud.svg",
      price: "$39.99",
      rating: 4.7,
      seller: "CreativeHub",
      category: "software",
      inStock: 67
    },
    {
      id: 4,
      name: "Spotify Premium Account",
      description: "1-year Spotify Premium subscription with no ads and offline downloads",
      image: "https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png",
      price: "$12.99",
      rating: 4.6,
      seller: "StreamingDeals",
      category: "subscriptions",
      inStock: 234
    },
    {
      id: 5,
      name: "Windows 11 Pro License",
      description: "Genuine Windows 11 Professional activation key with lifetime support",
      image: "https://logos-world.net/wp-content/uploads/2021/08/Windows-11-Logo.png",
      price: "$19.99",
      rating: 4.8,
      seller: "TechLicenses",
      category: "software",
      inStock: 156
    },
    {
      id: 6,
      name: "Netflix Premium Accounts",
      description: "Shared Netflix premium accounts with 4K streaming and multiple screens",
      image: "https://assets.nflxext.com/ffe/siteui/common/icons/nficon2016.png",
      price: "$8.99",
      rating: 4.4,
      seller: "StreamShare",
      category: "subscriptions",
      inStock: 78
    }
  ];

  const categories = [
    { id: "all", name: "All Categories", count: marketplaceStores.length },
    { id: "Software", name: "Software", count: marketplaceStores.filter((s: Product) => s.category === "Software").length },
    { id: "Digital Tools", name: "Digital Tools", count: marketplaceStores.filter((s: Product) => s.category === "Digital Tools").length },
    { id: "Services", name: "Services", count: marketplaceStores.filter((s: Product) => s.category === "Services").length }
  ];

  const filteredStores = selectedCategory === "all" 
    ? marketplaceStores 
    : marketplaceStores.filter((store: Product) => store.category === selectedCategory);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Online Marketplace</h1>
            <p className="text-gray-600 mt-2">Premium accounts, software licenses, and digital subscriptions</p>
          </div>
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
            {categories.map((cat) => (
              <Badge 
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                className="cursor-pointer px-3 py-1 text-sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name} ({cat.count})
              </Badge>
            ))}
          </div>
        </div>

        {/* Store Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader className="p-4 pb-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStores.map((store: Product) => (
              <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-100">
                  {store.images && store.images.length > 0 ? (
                    <img
                      src={store.images[0]}
                      alt={store.title}
                      className="w-full h-full object-contain p-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/200x150?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">
                      📦
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-100 text-green-800">
                      {store.stock_quantity} in stock
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">{store.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">{store.avg_rating || "No rating"}</span>
                    </div>
                    <span className="text-xs text-gray-500">by Seller</span>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{store.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#004080]">${store.price}</span>
                    <Badge variant="outline" className="text-xs">
                      {store.category}
                    </Badge>
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 space-y-2">
                  <Link to={`/marketplace/product/${store.id}`} className="block">
                    <Button className="w-full bg-[#004080] hover:bg-[#003366] text-white">
                      <Box className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                  <AddToCart
                    productId={parseInt(store.id.toString())}
                    productName={store.title}
                    price={parseFloat(store.price.toString())}
                    stockQuantity={store.stock_quantity}
                    variant="compact"
                    className="w-full"
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {filteredStores.length === 0 && (
          <div className="text-center py-10">
            <Box className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500">No items available in this category.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}