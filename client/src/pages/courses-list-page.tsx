import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import {
    BookOpen,
    Loader2,
    Filter,
    Search
} from "lucide-react";
import { Pagination } from "@/components/pagination";
import { CourseThumbnail } from "@/components/course-thumbnail";

export default function CoursesListPage() {
    const [location, navigate] = useLocation();
    const searchParams = new URLSearchParams(location.split('?')[1] || '');

    // State from URL parameters
    const [topic, setTopic] = useState(searchParams.get('topic') || 'all');
    const [level, setLevel] = useState(searchParams.get('level') || 'all');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (topic !== 'all') params.set('topic', topic);
        if (level !== 'all') params.set('level', level);
        if (searchQuery) params.set('search', searchQuery);
        if (page !== 1) params.set('page', page.toString());

        const newUrl = `/courses${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);
    }, [topic, level, searchQuery, page]);

    // Fetch course topics
    const { data: topicsData } = useQuery({
        queryKey: ["/api/courses/topics"],
        queryFn: async () => {
            const response = await fetch("/api/courses/topics");
            if (!response.ok) throw new Error("Failed to fetch topics");
            return response.json();
        },
    });

    // Fetch courses with filters
    const { data: coursesData, isLoading: isLoadingCourses, error: coursesError } = useQuery({
        queryKey: ["/api/courses", topic, level, searchQuery, page],
        queryFn: async () => {
            const params = new URLSearchParams();

            // Add filters
            if (topic !== 'all') params.set('topic', topic);
            if (level !== 'all') params.set('level', level);
            if (searchQuery) params.set('search', searchQuery);
            params.set('offset', ((page - 1) * 30).toString());
            params.set('limit', '30');

            const response = await fetch(`/api/courses?${params.toString()}`);
            if (!response.ok) throw new Error("Failed to fetch courses");
            return response.json();
        },
    });

    const handleFilterChange = (filterType: string, value: string) => {
        if (filterType === 'topic') setTopic(value);
        if (filterType === 'level') setLevel(value);
        setPage(1); // Reset to first page when filters change
    };

    const totalPages = Math.ceil((coursesData?.total || 0) / 30);

    // Get current topic name for display
    const getCurrentTopicName = () => {
        if (topic === 'all') return 'Tất cả khóa học';
        return topic;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white py-16">
                    <div className="w-full px-[4%]">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                    <BookOpen className="h-8 w-8" />
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
                                    {getCurrentTopicName()}
                                </h1>
                            </div>
                            <p className="text-xl text-slate-200">
                                Khám phá {coursesData?.total || 0}+ khóa học lập trình tiếng Việt miễn phí
                            </p>
                        </div>
                    </div>
                </section>

                <div className="w-full px-[4%] py-8">
                    {/* Compact Search & Filter Bar - Single Line */}
                    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6">
                        <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap">
                            {/* Search Bar - Flexible Width */}
                            <div className="relative flex-grow min-w-[280px] lg:max-w-[400px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm khóa học..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full h-[38px] pl-10 pr-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Topic Filter - Compact */}
                            <select
                                value={topic}
                                onChange={(e) => handleFilterChange('topic', e.target.value)}
                                className="h-[38px] px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all bg-white min-w-[180px]"
                            >
                                <option value="all">Tất cả chủ đề ({topicsData?.reduce((sum: number, t: any) => sum + t.count, 0) || 0})</option>
                                {topicsData?.map((topicItem: any) => (
                                    <option key={topicItem.topic} value={topicItem.topic}>
                                        {topicItem.topic} ({topicItem.count})
                                    </option>
                                ))}
                            </select>

                            {/* Level Filter - Compact */}
                            <select
                                value={level}
                                onChange={(e) => handleFilterChange('level', e.target.value)}
                                className="h-[38px] px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all bg-white min-w-[150px]"
                            >
                                <option value="all">Tất cả trình độ</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    {/* Hashtags Section */}
                    {topicsData && topicsData.length > 0 && (
                        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Chủ đề phổ biến</h3>
                            <div className="flex flex-wrap gap-2">
                                {topicsData.slice(0, 15).map((topicItem: any) => (
                                    <button
                                        key={topicItem.topic}
                                        onClick={() => {
                                            setTopic(topicItem.topic);
                                            setPage(1);
                                        }}
                                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${topic === topicItem.topic
                                            ? 'bg-indigo-600 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span>#</span>
                                        <span>{topicItem.topic}</span>
                                        <span className="text-xs opacity-75">({topicItem.count})</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {isLoadingCourses ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-16 w-16 animate-spin text-indigo-600 mb-4" />
                            <p className="text-gray-600">Đang tải khóa học...</p>
                        </div>
                    ) : coursesError ? (
                        <div className="text-center py-20 bg-white rounded-xl shadow-md">
                            <div className="p-4 bg-red-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Search className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-red-600 mb-2">Lỗi tải khóa học</h3>
                            <p className="text-gray-500">Vui lòng thử lại sau.</p>
                        </div>
                    ) : (
                        <>
                            {/* Results Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="text-sm font-medium text-gray-700">
                                    Hiển thị <span className="text-indigo-600 font-bold">{coursesData?.courses?.length || 0}</span> trong tổng số <span className="text-indigo-600 font-bold">{coursesData?.total || 0}</span> khóa học
                                </div>
                            </div>

                            {/* Courses Grid - Responsive (matches home page) */}
                            {coursesData?.courses?.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
                                    {coursesData.courses.map((course: any) => (
                                        <div
                                            key={course.id}
                                            className="group overflow-hidden border border-gray-200 rounded-xl hover:shadow-2xl hover:border-indigo-600 transition-all duration-300 flex flex-col h-full bg-white cursor-pointer"
                                            onClick={() => navigate(`/courses/${course.id}`)}
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative pt-[60%] overflow-hidden">
                                                <CourseThumbnail
                                                    videoUrl={course.youtube_url || course.thumbnail_url || ''}
                                                    title={course.title}
                                                    fallbackGradient="from-indigo-400 to-purple-600"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                                {/* Level Badge */}
                                                <div className="absolute top-3 right-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${course.level === 'beginner' ? 'bg-green-500 text-white' :
                                                        course.level === 'intermediate' ? 'bg-yellow-500 text-white' :
                                                            'bg-red-500 text-white'
                                                        }`}>
                                                        {course.level}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Course Info */}
                                            <div className="p-4 flex-grow flex flex-col">
                                                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                                                    {course.title}
                                                </h3>

                                                <div className="mt-auto space-y-2">
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <span className="truncate">{course.instructor}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                                                            {course.topic}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-xl shadow-md">
                                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy khóa học</h3>
                                    <p className="text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8">
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
            </main>

            <Footer />
        </div>
    );
}
