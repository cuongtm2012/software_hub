import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { CheckCircle, Home, Mail, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProjectRequestSuccessPage() {
    const [, navigate] = useLocation();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger fade-in animation
        setTimeout(() => setIsVisible(true), 100);
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-grow flex items-center justify-center py-12 px-4">
                <div
                    className={`w-full max-w-2xl transition-all duration-700 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                >
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                                <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-6 shadow-lg">
                                    <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>

                        {/* Success Message */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Gửi yêu cầu thành công!
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Team chúng tôi sẽ check và phản hồi cho bạn sớm.
                            </p>
                        </div>

                        {/* Info Cards */}
                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                                <div className="flex items-start gap-3">
                                    <div className="bg-slate-700 rounded-lg p-2 mt-1">
                                        <Clock className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Thời gian phản hồi</h3>
                                        <p className="text-sm text-gray-600">Thường trong vòng 24-48 giờ</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                                <div className="flex items-start gap-3">
                                    <div className="bg-amber-500 rounded-lg p-2 mt-1">
                                        <Mail className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Kiểm tra email</h3>
                                        <p className="text-sm text-gray-600">Chúng tôi sẽ gửi xác nhận qua email</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">Bước tiếp theo</h3>
                            <ol className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-slate-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        1
                                    </span>
                                    <span className="text-gray-700 pt-0.5">
                                        Team của chúng tôi sẽ xem xét yêu cầu dự án của bạn
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-slate-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        2
                                    </span>
                                    <span className="text-gray-700 pt-0.5">
                                        Bạn sẽ nhận được email xác nhận và thông tin liên hệ
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-slate-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        3
                                    </span>
                                    <span className="text-gray-700 pt-0.5">
                                        Chúng tôi sẽ liên hệ để tư vấn chi tiết về dự án
                                    </span>
                                </li>
                            </ol>
                        </div>

                        {/* Action Button */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={() => navigate("/")}
                                className="flex-1 px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                                size="lg"
                            >
                                <Home className="w-5 h-5 mr-2" />
                                Quay lại trang chủ
                            </Button>

                            <Button
                                onClick={() => navigate("/it-services")}
                                variant="outline"
                                className="flex-1 px-8 py-4 border-2 border-slate-700 text-slate-700 hover:bg-slate-50 font-semibold"
                                size="lg"
                            >
                                Xem dịch vụ khác
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
