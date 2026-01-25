import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/textarea";
import { Software, Review, InsertReview } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Download, Monitor, Calendar, ArrowLeft, ExternalLink, FileText, Shield } from "lucide-react";
import { format } from "date-fns";
import { getShortDescription } from "@/lib/translations";
import { useState } from "react";

interface ReviewWithUser extends Review {
    user_name?: string;
}

export default function SoftwareDetailPage() {
    const { id } = useParams();
    const [, navigate] = useLocation();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [userRating, setUserRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");

    // Fetch software details
    const {
        data: software,
        isLoading: isLoadingSoftware,
        error: softwareError
    } = useQuery<Software>({
        queryKey: ["/api/softwares", id],
        queryFn: async () => {
            const response = await fetch(`/api/softwares/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("Software not found");
                }
                throw new Error("Failed to fetch software");
            }
            return response.json();
        },
        enabled: !!id,
    });

    // Fetch reviews for the software
    const { data: reviews, isLoading: isLoadingReviews } = useQuery<ReviewWithUser[]>({
        queryKey: ["/api/reviews/software", id],
        queryFn: async () => {
            if (!id) return [];
            const res = await fetch(`/api/reviews/software/${id}`);
            if (!res.ok) throw new Error("Failed to fetch reviews");
            return res.json();
        },
        enabled: !!id,
    });

    // Submit review mutation
    const submitReviewMutation = useMutation({
        mutationFn: async (reviewData: InsertReview) => {
            if (!id) throw new Error("Software ID not available");
            const res = await apiRequest("POST", `/api/reviews/software/${id}`, reviewData);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Đã gửi đánh giá",
                description: "Đánh giá của bạn đã được gửi thành công.",
            });
            setReviewComment("");
            setUserRating(5);
            // Invalidate the reviews query to reload the data
            if (id) {
                queryClient.invalidateQueries({ queryKey: ["/api/reviews/software", id] });
            }
        },
        onError: (error: Error) => {
            toast({
                title: "Gửi đánh giá thất bại",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleSubmitReview = () => {
        if (!software || !user) return;

        if (!reviewComment.trim()) {
            toast({
                title: "Cần có đánh giá",
                description: "Vui lòng viết nhận xét cho đánh giá của bạn.",
                variant: "destructive",
            });
            return;
        }

        const reviewData: InsertReview = {
            target_type: "software",
            target_id: software.id,
            rating: userRating,
            comment: reviewComment,
        };

        submitReviewMutation.mutate(reviewData);
    };

    // Calculate average rating
    const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (isLoadingSoftware) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-[#004080]" />
                </main>
                <Footer />
            </div>
        );
    }

    if (softwareError || !software) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy phần mềm</h2>
                        <p className="text-gray-600 mb-6">Phần mềm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                        <Button onClick={() => navigate("/")} className="bg-[#004080] hover:bg-[#003366]">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay về trang chủ
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-grow">
                {/* Breadcrumb */}
                <div className="bg-white border-b">
                    <div className="w-full px-[4%] py-4">
                        <button
                            onClick={() => navigate("/")}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-[#004080] transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại trang chủ
                        </button>
                    </div>
                </div>

                {/* Software Details */}
                <section className="py-8">
                    <div className="w-full px-[4%]">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column - Image and Quick Actions */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-20">
                                    {/* Software Image */}
                                    <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                                        {software.image_url ? (
                                            <img
                                                src={software.image_url}
                                                alt={software.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Monitor className="h-20 w-20 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                Free
                                            </span>
                                        </div>
                                    </div>

                                    {/* Download Section */}
                                    <div className="p-6 space-y-4">
                                        <a
                                            href={software.download_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={`Tải xuống ${software.name}`}
                                            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-[#004080] hover:bg-[#003366] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004080] transition-all cursor-pointer"
                                        >
                                            <Download className="h-5 w-5 mr-2" />
                                            Tải ngay
                                        </a>

                                        {software.documentation_link && (
                                            <a
                                                href={software.documentation_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Xem tài liệu hướng dẫn"
                                                className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004080] transition-all cursor-pointer"
                                            >
                                                <FileText className="h-5 w-5 mr-2" />
                                                Tài liệu
                                            </a>
                                        )}

                                        {/* Software Info */}
                                        <div className="pt-4 border-t border-gray-200 space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Phiên bản:</span>
                                                <span className="font-medium text-gray-900">{software.version || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Nhà phát triển:</span>
                                                <span className="font-medium text-gray-900">{software.vendor || "N/A"}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Giấy phép:</span>
                                                <span className="font-medium text-gray-900">{software.license || "Free"}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Nền tảng:</span>
                                                <span className="font-medium text-gray-900">{software.platform.join(", ")}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Details and Reviews */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Header */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{software.name}</h1>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                                                    <span>Ngày thêm: {format(new Date(software.created_at), "dd/MM/yyyy")}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <StarRating value={averageRating || 0} size="lg" />
                                            <span className="ml-2 text-lg font-medium text-gray-700">
                                                {averageRating ? averageRating.toFixed(1) : "Chưa có đánh giá"}
                                            </span>
                                            {reviews && reviews.length > 0 && (
                                                <span className="ml-1 text-sm text-gray-500">({reviews.length} đánh giá)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả chi tiết</h2>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{software.description}</p>
                                </div>

                                {/* Installation Instructions */}
                                {software.installation_instructions && (
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                            <Shield className="h-5 w-5 mr-2 text-[#004080]" />
                                            Hướng dẫn cài đặt
                                        </h2>
                                        <div className="prose prose-sm max-w-none text-gray-700">
                                            <p className="whitespace-pre-wrap">{software.installation_instructions}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Reviews Section */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Đánh giá</h2>

                                    {user ? (
                                        <div className="mb-8 border border-gray-300 rounded-lg p-6 bg-gray-50">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Viết đánh giá của bạn</h3>
                                            <div className="flex items-center mb-4">
                                                <span className="text-sm text-gray-600 mr-3">Đánh giá của bạn:</span>
                                                <StarRating
                                                    value={userRating}
                                                    onChange={setUserRating}
                                                    readonly={false}
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <Textarea
                                                    id="comment"
                                                    placeholder="Viết đánh giá của bạn..."
                                                    value={reviewComment}
                                                    onChange={(e) => setReviewComment(e.target.value)}
                                                    rows={4}
                                                    className="resize-none"
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={handleSubmitReview}
                                                    disabled={submitReviewMutation.isPending}
                                                    className="bg-[#004080] hover:bg-[#003366] inline-flex items-center"
                                                >
                                                    {submitReviewMutation.isPending && (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    )}
                                                    Gửi đánh giá
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-8 bg-gray-50 rounded-lg p-6 text-center">
                                            <p className="text-gray-600">
                                                Vui lòng{" "}
                                                <Button
                                                    variant="link"
                                                    className="p-0 h-auto text-[#004080] hover:text-[#003366]"
                                                    onClick={() => navigate("/auth")}
                                                >
                                                    đăng nhập
                                                </Button>{" "}
                                                để viết đánh giá.
                                            </p>
                                        </div>
                                    )}

                                    {/* Reviews List */}
                                    <div className="space-y-6">
                                        {isLoadingReviews ? (
                                            <div className="flex justify-center py-8">
                                                <Loader2 className="h-8 w-8 animate-spin text-[#004080]" />
                                            </div>
                                        ) : reviews?.length ? (
                                            reviews.map((review) => (
                                                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center">
                                                            <Avatar className="h-10 w-10 rounded-full">
                                                                <AvatarFallback>{getInitials(review.user_name || "User")}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="ml-3">
                                                                <span className="font-medium text-gray-900">{review.user_name || "User"}</span>
                                                                <div className="flex items-center mt-1">
                                                                    <StarRating value={review.rating} size="sm" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {format(new Date(review.created_at), "dd/MM/yyyy")}
                                                        </span>
                                                    </div>
                                                    <div className="ml-13">
                                                        <p className="text-gray-700">{review.comment}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                                <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
