import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
    ShoppingCart,
    CreditCard,
    MapPin,
    Check,
    ChevronRight,
    Package,
    Truck,
    Shield
} from "lucide-react";

export default function CheckoutPage() {
    const [, navigate] = useLocation();
    const [currentStep, setCurrentStep] = useState(1);

    // Mock product data
    const product = {
        id: '1',
        name: 'Crypto Trading Bot Premium',
        category: 'Sản phẩm số',
        seller: 'Verified Seller',
        price: '8,000,000₫',
        image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=200&h=200&fit=crop'
    };

    const steps = [
        { number: 1, title: 'Giỏ hàng', icon: ShoppingCart },
        { number: 2, title: 'Thông tin', icon: MapPin },
        { number: 3, title: 'Thanh toán', icon: CreditCard },
        { number: 4, title: 'Xác nhận', icon: Check }
    ];

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        } else {
            alert('Đơn hàng đã được đặt thành công!');
            navigate('/');
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigate('/marketplace');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-grow py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => navigate('/marketplace')}
                            className="text-slate-700 hover:text-slate-900 font-semibold mb-4 inline-flex items-center gap-2"
                        >
                            ← Quay lại trang chủ
                        </button>
                        <h1 className="text-3xl font-bold text-slate-800">Thanh toán</h1>
                    </div>

                    {/* Progress Steps */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.number;
                                const isCompleted = currentStep > step.number;

                                return (
                                    <div key={step.number} className="flex items-center flex-1">
                                        <div className="flex flex-col items-center flex-1">
                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${isCompleted
                                                        ? 'bg-green-500 text-white'
                                                        : isActive
                                                            ? 'bg-slate-700 text-white'
                                                            : 'bg-gray-200 text-gray-500'
                                                    }`}
                                            >
                                                {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                            </div>
                                            <span
                                                className={`text-sm font-semibold ${isActive ? 'text-slate-800' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                                    }`}
                                            >
                                                {step.title}
                                            </span>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`flex-1 h-1 mx-4 mt-[-20px] ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                {/* Step 1: Cart */}
                                {currentStep === 1 && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Giỏ hàng của bạn</h2>
                                        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                            <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
                                                <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-sm text-gray-500">Người bán:</span>
                                                    <span className="text-sm font-semibold text-slate-700">{product.seller}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-bold text-slate-700">{product.price}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 space-y-3">
                                            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <Shield className="w-5 h-5 text-blue-600" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-blue-900">Bảo vệ người mua</p>
                                                    <p className="text-xs text-blue-700">Hoàn tiền 100% nếu sản phẩm không đúng mô tả</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                                <Truck className="w-5 h-5 text-green-600" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-green-900">Giao hàng nhanh</p>
                                                    <p className="text-xs text-green-700">Nhận sản phẩm ngay sau khi thanh toán</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Shipping Information */}
                                {currentStep === 2 && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Thông tin người nhận</h2>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nguyễn Văn A"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                                    <input
                                                        type="email"
                                                        placeholder="email@example.com"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại *</label>
                                                <input
                                                    type="tel"
                                                    placeholder="+84 123 456 789"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ *</label>
                                                <input
                                                    type="text"
                                                    placeholder="123 Đường ABC, Quận XYZ"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Thành phố *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Hồ Chí Minh"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mã bưu điện</label>
                                                    <input
                                                        type="text"
                                                        placeholder="700000"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú đơn hàng</label>
                                                <textarea
                                                    placeholder="Ghi chú thêm về đơn hàng (nếu có)"
                                                    rows={3}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Payment */}
                                {currentStep === 3 && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Thông tin thanh toán</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Số thẻ *</label>
                                                <input
                                                    type="text"
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength={19}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên trên thẻ *</label>
                                                <input
                                                    type="text"
                                                    placeholder="NGUYEN VAN A"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày hết hạn *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="MM/YY"
                                                        maxLength={5}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">CVV *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="123"
                                                        maxLength={3}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                                <div className="flex items-start gap-3">
                                                    <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-semibold text-amber-900">Thanh toán an toàn</p>
                                                        <p className="text-xs text-amber-700 mt-1">
                                                            Thông tin thẻ của bạn được mã hóa và bảo mật tuyệt đối
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Confirmation */}
                                {currentStep === 4 && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Xác nhận đơn hàng</h2>

                                        <div className="space-y-4">
                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <h3 className="font-semibold text-gray-900 mb-3">Thông tin sản phẩm</h3>
                                                <div className="flex items-center gap-4">
                                                    <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">{product.name}</p>
                                                        <p className="text-sm text-gray-600">{product.category}</p>
                                                    </div>
                                                    <span className="font-bold text-slate-700">{product.price}</span>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <h3 className="font-semibold text-gray-900 mb-3">Thông tin người nhận</h3>
                                                <div className="space-y-2 text-sm">
                                                    <p><span className="font-semibold">Họ tên:</span> Nguyễn Văn A</p>
                                                    <p><span className="font-semibold">Email:</span> email@example.com</p>
                                                    <p><span className="font-semibold">Số điện thoại:</span> +84 123 456 789</p>
                                                    <p><span className="font-semibold">Địa chỉ:</span> 123 Đường ABC, Quận XYZ, Hồ Chí Minh</p>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                <h3 className="font-semibold text-gray-900 mb-3">Phương thức thanh toán</h3>
                                                <div className="flex items-center gap-3">
                                                    <CreditCard className="w-5 h-5 text-gray-600" />
                                                    <span className="text-sm">Thẻ tín dụng/ghi nợ kết thúc bằng ****</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Tóm tắt đơn hàng</h3>

                                <div className="space-y-3 mb-4 pb-4 border-b">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Giá sản phẩm</span>
                                        <span className="font-semibold">8,000,000₫</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Phí vận chuyển</span>
                                        <span className="font-semibold text-green-600">Miễn phí</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-lg font-bold text-slate-800">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-slate-700">8,000,000₫</span>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        onClick={handleNext}
                                        className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold"
                                        size="lg"
                                    >
                                        {currentStep === 4 ? (
                                            <>
                                                <Check className="w-5 h-5 mr-2" />
                                                Tiếp tục
                                            </>
                                        ) : (
                                            <>
                                                Tiếp tục
                                                <ChevronRight className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={handleBack}
                                        variant="outline"
                                        className="w-full font-semibold"
                                        size="lg"
                                    >
                                        {currentStep === 1 ? 'Quay lại trang chủ' : 'Quay lại'}
                                    </Button>
                                </div>

                                <div className="mt-6 space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <Shield className="w-4 h-4" />
                                        <span>Thanh toán an toàn & bảo mật</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <Package className="w-4 h-4" />
                                        <span>Giao hàng ngay sau thanh toán</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
