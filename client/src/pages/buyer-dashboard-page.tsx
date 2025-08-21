import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { StatsCard } from "@/components/StatsCard";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ShoppingCart,
    Heart,
    Download,
    Star,
    RefreshCw,
    Search,
    Eye,
    TrendingUp,
    Package,
} from "lucide-react";

interface BuyerStats {
    totalPurchases: number;
    totalFavorites: number;
    totalDownloads: number;
    reviewsWritten: number;
    purchasesTrend?: { value: number; isPositive: boolean };
    favoritesTrend?: { value: number; isPositive: boolean };
    downloadsTrend?: { value: number; isPositive: boolean };
    reviewsTrend?: { value: number; isPositive: boolean };
}

interface Purchase {
    id: number;
    product_title: string;
    seller_name: string;
    price: number;
    status: string;
    purchased_at: string;
    download_url?: string;
}

export default function BuyerDashboardPage() {
    const { user } = useAuth();
    const [, navigate] = useLocation();
    const [searchQuery, setSearchQuery] = useState("");

    // Redirect if not buyer
    if (!user || (user.role !== "buyer" && user.role !== "user")) {
        navigate("/");
        return null;
    }

    // Fetch buyer statistics
    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<BuyerStats>({
        queryKey: ["/api/buyer/stats"],
        initialData: {
            totalPurchases: 0,
            totalFavorites: 0,
            totalDownloads: 0,
            reviewsWritten: 0,
        },
    });

    // Fetch purchase history
    const { data: purchasesData, isLoading: purchasesLoading, refetch: refetchPurchases } = useQuery<{ purchases: Purchase[] }>({
        queryKey: ["/api/buyer/purchases"],
        initialData: { purchases: [] },
    });

    const purchases = purchasesData?.purchases || [];

    // Filter purchases
    const filteredPurchases = purchases.filter((purchase) =>
        purchase.product_title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRefresh = () => {
        refetchStats();
        refetchPurchases();
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            completed: "default",
            pending: "secondary",
            cancelled: "destructive",
            processing: "outline",
        };
        return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
    };

    return (
        <>
            <Header />
            <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto p-6 space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                Buyer Dashboard
                            </h1>
                            <p className="text-muted-foreground">
                                View your purchases, favorites, and download history
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRefresh}
                                aria-label="Refresh data"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button onClick={() => navigate("/marketplace")}>
                                <Package className="w-4 h-4 mr-2" />
                                Browse Software
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statsLoading ? (
                            <>
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-32 w-full" />
                                ))}
                            </>
                        ) : (
                            <>
                                <StatsCard
                                    title="Total Purchases"
                                    value={stats?.totalPurchases || 0}
                                    icon={ShoppingCart}
                                    trend={stats?.purchasesTrend}
                                    description="Items bought"
                                    testId="stat-total-purchases"
                                />
                                <StatsCard
                                    title="Favorites"
                                    value={stats?.totalFavorites || 0}
                                    icon={Heart}
                                    trend={stats?.favoritesTrend}
                                    description="Saved items"
                                    testId="stat-total-favorites"
                                />
                                <StatsCard
                                    title="Downloads"
                                    value={stats?.totalDownloads || 0}
                                    icon={Download}
                                    trend={stats?.downloadsTrend}
                                    description="Files downloaded"
                                    testId="stat-total-downloads"
                                />
                                <StatsCard
                                    title="Reviews Written"
                                    value={stats?.reviewsWritten || 0}
                                    icon={Star}
                                    trend={stats?.reviewsTrend}
                                    description="Product reviews"
                                    testId="stat-reviews-written"
                                />
                            </>
                        )}
                    </div>

                    {/* Purchase History Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Purchase History
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <TrendingUp className="w-4 h-4" />
                                <span>{filteredPurchases.length} purchases</span>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search purchases..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Purchases Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                            {purchasesLoading ? (
                                <div className="p-8 space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            ) : filteredPurchases.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Seller</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPurchases.map((purchase) => (
                                            <TableRow key={purchase.id}>
                                                <TableCell className="font-medium">
                                                    {purchase.product_title}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {purchase.seller_name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    ${purchase.price}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(purchase.purchased_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {purchase.download_url && (
                                                            <Button variant="ghost" size="sm">
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center py-12">
                                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No purchases yet
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {searchQuery
                                            ? "No purchases match your search"
                                            : "Start shopping to see your purchase history here"}
                                    </p>
                                    {!searchQuery && (
                                        <Button onClick={() => navigate("/marketplace")}>
                                            <Package className="w-4 h-4 mr-2" />
                                            Browse Marketplace
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4 border-t">
                        <span>Last updated: {new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
