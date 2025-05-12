import { Layout } from "@/components/layout";
import { ProductForm } from "@/components/product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function MarketplaceSellerNewPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/marketplace/seller">
            <Button variant="ghost" size="sm" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Seller Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Add New Product</h1>
        </div>

        <ProductForm />
      </div>
    </Layout>
  );
}