import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { ProductForm } from "@/components/product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PageBreadcrumb, createBreadcrumbs } from "@/components/page-breadcrumb";

export default function MarketplaceSellerEditPage() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id);

  return (
    <Layout>
      <PageBreadcrumb
        items={createBreadcrumbs.sellerProductEdit()}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Product</h1>
        </div>

        {isNaN(productId) ? (
          <div className="text-center py-10">
            <h2 className="text-xl text-red-600">Invalid Product ID</h2>
            <p className="mt-2">The product ID is not valid.</p>
            <Link href="/dashboard">
              <Button className="mt-4">Return to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <ProductForm productId={productId} isEdit={true} />
        )}
      </div>
    </Layout>
  );
}