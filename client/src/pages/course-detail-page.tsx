import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    ArrowLeft,
    User,
    Tag,
    BarChart,
    Globe,
    Clock,
    Loader2
} from "lucide-react";
import { CourseThumbnail } from "@/components/course-thumbnail";

export default function CourseDetailPage() {
    const [, params] = useRoute("/courses/:id");
    const [, navigate] = useLocation();
    const courseId = params?.id;

    // Fetch course details
    const { data: course, isLoading, error } = useQuery({
        queryKey: ["/api/courses", courseId],
        queryFn: async () => {
            const response = await fetch(`/api/courses/${courseId}`);
            if (!response.ok) throw new Error("Failed to fetch course");
            return response.json();
        },
        enabled: !!courseId,
    });

    // Fetch related courses (same topic)
    const { data: relatedCourses } = useQuery({
        queryKey: ["/api/courses/related", course?.topic],
        queryFn: async () => {
            if (!course?.topic) return [];
            const response = await fetch(`/api/courses?topic=${course.topic}&limit=4`);
            if (!response.ok) return [];
            const data = await response.json();
            return data.courses?.filter((c: any) => c.id !== courseId) || [];
        },
        enabled: !!course?.topic,
    });

    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<any[]>([]);

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        // Add comment (mock for now)
        setComments([
            {
                id: Date.now(),
                user: "User",
                content: comment,
                createdAt: new Date().toISOString(),
            },
            ...comments,
        ]);
        setComment("");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mx-auto mb-4" />
                        <p className="text-gray-600">Đang tải khóa học...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy khóa học</h2>
                        <Button onClick={() => navigate("/courses")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại danh sách
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const playlistId = course.playlist_id || course.youtube_url.match(/list=([^&]+)/)?.[1] || "";
    const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;

    const levelColors = {
        beginner: "bg-green-100 text-green-800",
        intermediate: "bg-yellow-100 text-yellow-800",
        advanced: "bg-red-100 text-red-800",
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            <Header />

            <main className="flex-grow">
                {/* Back Button */}
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/courses")}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại danh sách khóa học
                        </Button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Video Player */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="aspect-video bg-black">
                                    <iframe
                                        src={embedUrl}
                                        title={course.title}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>

                            {/* Course Info */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>

                                <div className="flex flex-wrap gap-4 mb-6">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <User className="h-5 w-5" />
                                        <span>{course.instructor}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Tag className="h-5 w-5" />
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                                            {course.topic}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BarChart className="h-5 w-5 text-gray-700" />
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${levelColors[course.level as keyof typeof levelColors] || "bg-gray-100 text-gray-800"
                                            }`}>
                                            {course.level}
                                        </span>
                                    </div>
                                    {course.language && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Globe className="h-5 w-5" />
                                            <span>{course.language}</span>
                                        </div>
                                    )}
                                </div>

                                {course.description && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-3">Mô tả</h2>
                                        <p className="text-gray-700 leading-relaxed">{course.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Comments Section */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Bình luận ({comments.length})</h2>

                                {/* Comment Form */}
                                <form onSubmit={handleSubmitComment} className="mb-8">
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Viết bình luận của bạn..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none"
                                        rows={4}
                                    />
                                    <div className="mt-3 flex justify-end">
                                        <Button
                                            type="submit"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                            disabled={!comment.trim()}
                                        >
                                            Gửi bình luận
                                        </Button>
                                    </div>
                                </form>

                                {/* Comments List */}
                                <div className="space-y-4">
                                    {comments.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                                    ) : (
                                        comments.map((c) => (
                                            <div key={c.id} className="border-b border-gray-200 pb-4 last:border-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{c.user}</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {new Date(c.createdAt).toLocaleDateString('vi-VN')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 ml-13">{c.content}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Related Courses */}
                            {relatedCourses && relatedCourses.length > 0 && (
                                <div className="bg-white rounded-xl shadow-md p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Khóa học liên quan</h2>
                                    <div className="space-y-4">
                                        {relatedCourses.map((relatedCourse: any) => (
                                            <div
                                                key={relatedCourse.id}
                                                onClick={() => navigate(`/courses/${relatedCourse.id}`)}
                                                className="group cursor-pointer border border-gray-200 rounded-lg p-3 hover:border-indigo-600 hover:shadow-md transition-all"
                                            >
                                                <div className="aspect-video rounded-lg mb-3 overflow-hidden relative">
                                                    <CourseThumbnail
                                                        videoUrl={relatedCourse.youtube_url || relatedCourse.thumbnail_url || ''}
                                                        title={relatedCourse.title}
                                                        fallbackGradient="from-indigo-400 to-purple-600"
                                                    />
                                                </div>
                                                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors">
                                                    {relatedCourse.title}
                                                </h3>
                                                <p className="text-xs text-gray-600 mt-1">{relatedCourse.instructor}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
