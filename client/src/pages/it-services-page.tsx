import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
    ArrowRight,
    CheckCircle,
    Code,
    Laptop,
    Smartphone,
    Database,
    Cloud,
    Shield
} from "lucide-react";

const services = [
    {
        icon: Code,
        title: 'Phát triển tùy chỉnh',
        description: 'Giải pháp phần mềm được xây dựng từ đầu để phù hợp với yêu cầu kinh doanh độc đáo của bạn',
        color: 'amber'
    },
    {
        icon: Laptop,
        title: 'Web Applications',
        description: 'Ứng dụng web hiện đại, responsive với công nghệ mới nhất như React, Vue và Angular',
        color: 'amber'
    },
    {
        icon: Smartphone,
        title: 'Mobile Apps',
        description: 'Ứng dụng di động native và cross-platform cho iOS và Android',
        color: 'slate'
    },
    {
        icon: Database,
        title: 'Thiết kế Database',
        description: 'Kiến trúc cơ sở dữ liệu mở rộng và tối ưu cho ứng dụng hiệu suất cao',
        color: 'amber'
    },
    {
        icon: Cloud,
        title: 'Giải pháp Cloud',
        description: 'Di chuyển, triển khai và quản lý trên AWS, Azure và Google Cloud',
        color: 'amber'
    },
    {
        icon: Shield,
        title: 'Bảo mật & Testing',
        description: 'Kiểm tra bảo mật toàn diện, penetration testing và đảm bảo chất lượng',
        color: 'slate'
    },
];

const successProjects = [
    {
        id: 1,
        title: 'Corporate Pulse',
        description: 'Website giới thiệu công ty hiện đại với analytics thời gian thực',
        category: 'Web Development',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Three.js'],
        metrics: {
            improvement: '47% traffic tăng',
            timeline: '3 tháng',
            result: 'Cải thiện tương tác người dùng 47% trong 4 tháng sau khi ra mắt'
        },
        status: 'Hoàn thành',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop'
    },
    {
        id: 2,
        title: 'PageTurner Plus',
        description: 'Hệ thống quản lý nhà sách với theo dõi tồn kho',
        category: 'Full-Stack App',
        technologies: ['Node.js', 'Express', 'PostgreSQL', 'React'],
        metrics: {
            improvement: '65% nhanh hơn',
            timeline: '5 tháng',
            result: 'Giảm 65% thời gian quản lý tồn kho cho chuỗi 12 chi nhánh'
        },
        status: 'Hoàn thành',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop'
    },
    {
        id: 3,
        title: 'StyleStock',
        description: 'Hệ thống quản lý cửa hàng quần áo với tích hợp barcode',
        category: 'E-commerce',
        technologies: ['React', 'Django', 'PostgreSQL', 'Stripe'],
        metrics: {
            improvement: '89% chính xác',
            timeline: '4 tháng',
            result: 'Cải thiện độ chính xác tồn kho lên 89.8% và giảm 35% hàng dư thừa'
        },
        status: 'Hoàn thành',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop'
    },
    {
        id: 4,
        title: 'QuickBite',
        description: 'App giao đồ ăn nhanh với theo dõi thời gian thực',
        category: 'Mobile App',
        technologies: ['React Native', 'Firebase', 'Google Maps API', 'Stripe'],
        metrics: {
            improvement: '15,000+ downloads',
            timeline: '6 tháng',
            result: 'Xử lý hơn 15,000 đơn hàng trong tháng đầu với đánh giá 4.8 sao'
        },
        status: 'Hoàn thành',
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&h=400&fit=crop'
    },
    {
        id: 5,
        title: 'TaleScape',
        description: 'App đọc sách tương tác với kể chuyện bằng audio',
        category: 'Mobile App',
        technologies: ['Flutter', 'Firebase', 'AWS S3', 'GraphQL'],
        metrics: {
            improvement: 'Featured App Store',
            timeline: '7 tháng',
            result: 'Được giới thiệu trong "Apps We Love" với 230,000+ downloads'
        },
        status: 'Hoàn thành',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop'
    },
    {
        id: 6,
        title: 'SportsPulse',
        description: 'App tin tức và tỷ số thể thao thời gian thực',
        category: 'Mobile App',
        technologies: ['React Native', 'Node.js', 'MongoDB', 'WebSocket'],
        metrics: {
            improvement: '50,000+ users',
            timeline: '5 tháng',
            result: 'Giữ chân 50,000+ người dùng hàng ngày với phiên trung bình 32 phút'
        },
        status: 'Hoàn thành',
        image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop'
    },
];

export default function ITServicesPage() {
    const [, navigate] = useLocation();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-white">
                                Dịch vụ IT & Phát triển tùy chỉnh
                            </h1>
                            <p className="text-xl text-slate-200 mb-8">
                                Kết nối với các nhà phát triển có tay nghề cao để xây dựng dự án phần mềm tùy chỉnh.
                                Gửi yêu cầu, nhận báo giá và cộng tác an toàn qua nền tảng của chúng tôi.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    onClick={() => navigate('/request-project')}
                                    className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold"
                                    size="lg"
                                >
                                    <span className="flex items-center justify-center">
                                        Gửi yêu cầu dự án
                                        <ArrowRight className="ml-2 w-5 h-5" />
                                    </span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20 font-semibold"
                                    size="lg"
                                >
                                    Xem bảng giá
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Dịch vụ của chúng tôi
                            </h2>
                            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                                Dịch vụ phát triển toàn diện để biến ý tưởng của bạn thành hiện thực
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service, index) => {
                                const Icon = service.icon;
                                const bgColor = service.color === 'amber' ? 'bg-amber-100' : 'bg-slate-100';
                                const iconColor = service.color === 'amber' ? 'text-amber-600' : 'text-slate-700';
                                const hoverBg = 'group-hover:bg-slate-700';

                                return (
                                    <div
                                        key={index}
                                        className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all group border border-gray-100"
                                    >
                                        <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center mb-4 ${hoverBg} transition-colors`}>
                                            <Icon className={`w-7 h-7 ${iconColor} group-hover:text-white transition-colors`} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                                        <p className="text-gray-600">{service.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Process Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Quy trình làm việc
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Quy trình đơn giản, minh bạch từ ý tưởng đến triển khai
                            </p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-8">
                            {[
                                { step: '1', title: 'Gửi yêu cầu', description: 'Điền form dự án với yêu cầu và ngân sách của bạn' },
                                { step: '2', title: 'Tư vấn ban đầu', description: 'Team của chúng tôi liên hệ để thảo luận nhu cầu và timeline' },
                                { step: '3', title: 'Đề xuất & Báo giá', description: 'Nhận đề xuất chi tiết với timeline và chi phí' },
                                { step: '4', title: 'Bắt đầu phát triển', description: 'Sau khi được phê duyệt, team bắt đầu làm việc trên dự án' },
                            ].map((item, index) => (
                                <div key={index} className="relative">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-lg">
                                            {item.step}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                                        <p className="text-gray-600 text-sm">{item.description}</p>
                                    </div>
                                    {index < 3 && (
                                        <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-slate-700 to-slate-300" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Success Projects */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Dự án thành công
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Khám phá các dự án đã hoàn thành từ các developer hàng đầu
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {successProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all overflow-hidden group border border-gray-100 flex flex-col"
                                >
                                    <div className="relative h-48 bg-gray-100 overflow-hidden flex-shrink-0">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" />
                                            {project.status}
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="text-xs text-slate-700 font-semibold mb-2 bg-slate-100 inline-block px-2 py-1 rounded self-start">
                                            {project.category}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">{project.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{project.description}</p>

                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {project.technologies.map((tech, i) => (
                                                <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="border-t pt-4 space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Timeline:</span>
                                                <span className="font-semibold text-gray-900">{project.metrics.timeline}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Kết quả:</span>
                                                <span className="font-semibold text-slate-700">{project.metrics.improvement}</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-500 italic mt-3 pt-3 border-t">
                                            {project.metrics.result}
                                        </p>

                                        <Button
                                            onClick={() => navigate('/request-project')}
                                            className="w-full mt-auto bg-slate-700 hover:bg-slate-800 text-white"
                                            size="sm"
                                        >
                                            <span className="flex items-center justify-center w-full">
                                                Yêu cầu dự án tương tự
                                                <ArrowRight className="ml-2 w-4 h-4" />
                                            </span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                            Sẵn sàng bắt đầu dự án của bạn?
                        </h2>
                        <p className="text-xl text-slate-200 mb-8">
                            Nhận tư vấn miễn phí và báo giá cho dự án phát triển phần mềm tùy chỉnh của bạn
                        </p>
                        <Button
                            onClick={() => navigate('/request-project')}
                            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold shadow-xl"
                            size="lg"
                        >
                            Bắt đầu ngay
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
