import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    Star,
    Download,
    ShoppingCart,
    Share2,
    CheckCircle,
    Info,
    Heart,
    MessageCircle,
    ThumbsUp,
    X,
    Minus,
    Plus
} from "lucide-react";

const relatedProducts = [
    {
        id: 1,
        name: 'ChatGPT Plus Toolkit',
        rating: 4.8,
        reviews: 156,
        price: '150,000₫',
        originalPrice: '200,000₫',
        discount: -25,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop'
    },
    {
        id: 2,
        name: 'Cinema Pro Video',
        rating: 4.9,
        reviews: 203,
        price: '183,000₫',
        originalPrice: '250,000₫',
        discount: -27,
        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop'
    },
    {
        id: 3,
        name: 'Advanced Forensics',
        rating: 4.7,
        reviews: 89,
        price: '280,000₫',
        originalPrice: '400,000₫',
        discount: -30,
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop'
    },
    {
        id: 4,
        name: 'Microsoft 365 Lifetime',
        rating: 4.9,
        reviews: 512,
        price: '435,000₫',
        originalPrice: '650,000₫',
        discount: -33,
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop'
    },
];

export default function MarketplaceDetailPage() {
    const [, navigate] = useLocation();
    const params = useParams();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('overview');
    const [cartSidebarOpen, setCartSidebarOpen] = useState(false);
    const [cartQuantity, setCartQuantity] = useState(1);
    const [cartComment, setCartComment] = useState('');

    // Mock data - replace with actual API call
    const product = {
        id: params.id || '1',
        name: 'Crypto Trading Bot Premium',
        description: 'Bot giao dịch cryptocurrency tự động với AI',
        price: '8,000,000₫',
        originalPrice: '10,000,000₫',
        discount: -20,
        rating: 4.7,
        reviews: 924,
        downloads: 1200,
        stock: 142,
        category: 'Sản phẩm số',
        seller: {
            name: 'Verified Seller',
            verified: true,
            rating: 4.9,
            sales: 1231
        },
        image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600&h=400&fit=crop'
    };

    const handleAddToCart = () => {
        // Add to cart logic
        alert(`Đã thêm ${cartQuantity} sản phẩm vào giỏ hàng!`);
        setCartSidebarOpen(false);
        setCartQuantity(1);
        setCartComment('');
    };

    const calculateTotal = () => {
        const priceString = product.price?.replace(/[.,₫]/g, '') || '0';
        const price = parseInt(priceString);
        return (price * cartQuantity).toLocaleString('vi-VN');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <main className="flex-grow">
                {/* Breadcrumb */}
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <button onClick={() => navigate('/')} className="hover:text-gray-900">Trang chủ</button>
                            <span>/</span>
                            <button onClick={() => navigate('/marketplace')} className="hover:text-gray-900">Marketplace</button>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">Sản phẩm số</span>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Quay lại danh sách
                    </button>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content - 2 columns */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Product Info Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="grid md:grid-cols-2 gap-6 p-6">
                                    {/* Product Image */}
                                    <div className="relative">
                                        <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {product.discount && (
                                            <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                                                {product.discount}%
                                            </div>
                                        )}
                                        <div className="absolute bottom-3 left-3 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5">
                                            <CheckCircle className="w-4 h-4" />
                                            Uy tín và khả năng tốt
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex flex-col">
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

                                        {/* Rating */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= Math.floor(product.rating)
                                                                ? 'text-amber-400 fill-current'
                                                                : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="font-semibold text-gray-900">{product.rating}</span>
                                            <span className="text-gray-500">({product.reviews} đánh giá)</span>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-6">
                                            <div className="flex items-baseline gap-3 mb-1">
                                                <span className="text-3xl font-bold text-slate-700">{product.price}</span>
                                                {product.originalPrice && (
                                                    <span className="text-lg text-gray-400 line-through">{product.originalPrice}</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">Còn: {product.stock} sản phẩm</div>
                                        </div>

                                        {/* Seller Info */}
                                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold">
                                                        V
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900">{product.seller.name}</div>
                                                        <div className="text-xs text-gray-500">Online 2 giờ trước</div>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm">
                                                    Xem shop
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>⭐ {product.seller.rating}</span>
                                                <span>•</span>
                                                <span>+{product.seller.sales} đã bán</span>
                                            </div>
                                        </div>

                                        {/* Quantity */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Số lượng</label>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={quantity}
                                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                    className="w-20 h-10 text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                                                />
                                                <button
                                                    onClick={() => setQuantity(quantity + 1)}
                                                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    +
                                                </button>
                                                <span className="text-sm text-gray-500">{product.stock} sản phẩm có sẵn</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 mt-auto">
                                            <Button
                                                onClick={() => navigate('/marketplace/checkout')}
                                                className="flex-1 bg-slate-700 hover:bg-slate-800 text-white"
                                                size="lg"
                                            >
                                                <ShoppingCart className="w-5 h-5 mr-2" />
                                                Mua ngay
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setCartQuantity(quantity);
                                                    setCartSidebarOpen(true);
                                                }}
                                                variant="outline"
                                                className="px-4"
                                                size="lg"
                                            >
                                                Thêm vào giỏ hàng
                                            </Button>
                                        </div>

                                        {/* Additional Actions */}
                                        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                                            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                                                <Heart className="w-5 h-5" />
                                                <span className="text-sm">Yêu thích</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                                                <Share2 className="w-5 h-5" />
                                                <span className="text-sm">Chia sẻ</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                                                <MessageCircle className="w-5 h-5" />
                                                <span className="text-sm">Chat ngay</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="border-b">
                                    <div className="flex gap-8 px-6">
                                        {[
                                            { id: 'overview', label: 'Mô tả sản phẩm' },
                                            { id: 'features', label: 'Tính năng nổi bật' },
                                            { id: 'download', label: 'Chi tiết tải xuống' },
                                            { id: 'reviews', label: 'Đánh giá' },
                                        ].map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                                        ? 'border-slate-700 text-slate-900 font-semibold'
                                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6">
                                    {activeTab === 'overview' && (
                                        <div className="prose prose-slate max-w-none">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">Giới thiệu sản phẩm ChatGPT Plus</h3>
                                            <p className="text-gray-700 leading-relaxed mb-4">
                                                ChatGPT Plus là giải pháp toàn diện của OpenAI, cung cấp cho bạn quyền truy cập vào GPT-4 mạnh mẽ với khả năng xử lý ngôn ngữ tự nhiên vượt trội. Với gói này, bạn sẽ có trải nghiệm nhanh hơn, ưu tiên truy cập ngay cả trong giờ cao điểm, và được sử dụng các tính năng mới nhất.
                                            </p>

                                            <h4 className="text-lg font-bold text-gray-900 mb-3 mt-6">Tính năng nổi bật</h4>
                                            <ul className="space-y-2">
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span>Truy cập GPT-4 với khả năng suy luận và phân tích vượt trội</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span>Tốc độ phản hồi nhanh hơn, ưu tiên truy cập</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span>Truy cập các tính năng mới nhất và cập nhật liên tục</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span>Hỗ trợ đa ngôn ngữ và xử lý ngữ cảnh phức tạp</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span>Tích hợp DALL-E 3 để tạo hình ảnh từ văn bản</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                    <span>Advanced Data Analysis - Phân tích dữ liệu chuyên sâu</span>
                                                </li>
                                            </ul>

                                            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                                <div className="flex gap-3">
                                                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                                    <div className="text-sm text-amber-800">
                                                        <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            <li>Tài khoản được cung cấp là tài khoản riêng, 100% an toàn</li>
                                                            <li>Không chia sẻ với người khác để tránh bị khóa tài khoản</li>
                                                            <li>Liên hệ ngay nếu có vấn đề về tài khoản trong 24 giờ</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'features' && (
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">Phần hộp với gì?</h3>
                                            <ul className="space-y-3">
                                                {[
                                                    'Tài khoản ChatGPT Plus chính chủ, không giới hạn thời gian sử dụng',
                                                    'Login email: Đăng nhập qua email, dễ sử dụng',
                                                    'Sinh viên: Hỗ trợ tài liệu, nghiên cứu, viết luận văn',
                                                    'Content Creator: Viết script, sáng tạo nội dung, tạo ý tưởng',
                                                    'Doanh nghiệp: Hỗ trợ tự động hóa, phân tích dữ liệu, customer support',
                                                    'Web ngườ dùng: Trợ lý cá nhân, học tập, giải trí và nhiều hơn nữa'
                                                ].map((feature, index) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <span className="text-gray-700">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">Quy trình nhận hàng</h3>
                                            <ol className="space-y-3">
                                                {[
                                                    'Đặt hàng và thanh toán',
                                                    'Nhận tài khoản qua email hoặc WhatsApp trong 1-5 phút',
                                                    'Đăng nhập và bắt đầu sử dụng ChatGPT Plus ngay lập tức',
                                                    'Bắt đầu sử dụng ChatGPT Plus ngay lập tức'
                                                ].map((step, index) => (
                                                    <li key={index} className="flex gap-3">
                                                        <div className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                            {index + 1}
                                                        </div>
                                                        <span className="text-gray-700 pt-1">{step}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    )}

                                    {activeTab === 'download' && (
                                        <div className="text-gray-700">
                                            <p>Chi tiết tải xuống sẽ được cung cấp sau khi mua hàng.</p>
                                        </div>
                                    )}

                                    {activeTab === 'reviews' && (
                                        <div className="text-gray-700">
                                            <p>Chưa có đánh giá nào.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - 1 column */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-20 space-y-6">
                                {/* Related Products */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm liên quan</h3>
                                    <div className="space-y-4">
                                        {relatedProducts.map((item) => (
                                            <div
                                                key={item.id}
                                                className="group cursor-pointer"
                                                onClick={() => navigate(`/marketplace/${item.id}`)}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                        {item.discount && (
                                                            <div className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                                                                {item.discount}%
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 group-hover:text-slate-700">
                                                            {item.name}
                                                        </h4>
                                                        <div className="flex items-center gap-1 mb-2">
                                                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                                                            <span className="text-xs font-semibold">{item.rating}</span>
                                                            <span className="text-xs text-gray-500">({item.reviews})</span>
                                                        </div>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-sm font-bold text-slate-700">{item.price}</span>
                                                            {item.originalPrice && (
                                                                <span className="text-xs text-gray-400 line-through">{item.originalPrice}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Cart Sidebar */}
            {cartSidebarOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                        onClick={() => setCartSidebarOpen(false)}
                    />

                    {/* Sidebar */}
                    <div className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 animate-slide-in-right flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-bold">Thêm vào giỏ hàng</h2>
                                <button
                                    onClick={() => setCartSidebarOpen(false)}
                                    className="p-1.5 hover:bg-slate-600 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-slate-200 text-xs">Vui lòng điền thông tin đơn hàng</p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <form onSubmit={(e) => { e.preventDefault(); handleAddToCart(); }} className="space-y-4">
                                {/* Product Info */}
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex gap-3">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-base font-bold text-slate-700">{product.price}</span>
                                                {product.originalPrice && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        {product.originalPrice}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                <div>
                                    <label className="block font-semibold text-gray-900 mb-2 text-sm">
                                        Số lượng <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setCartQuantity(Math.max(1, cartQuantity - 1))}
                                                className="p-2 hover:bg-gray-100 transition-colors"
                                            >
                                                <Minus className="w-4 h-4 text-gray-600" />
                                            </button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={cartQuantity}
                                                onChange={(e) => setCartQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                                className="w-16 px-3 py-2 text-center font-bold border-x-2 focus:outline-none focus:bg-slate-50 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setCartQuantity(cartQuantity + 1)}
                                                className="p-2 hover:bg-gray-100 transition-colors"
                                            >
                                                <Plus className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>
                                        <span className="text-xs text-gray-600">
                                            Còn lại: <span className="font-semibold text-slate-700">{product.stock} sp</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Comment/Note */}
                                <div>
                                    <label className="block font-semibold text-gray-900 mb-2 text-sm">
                                        Ghi chú đơn hàng
                                        <span className="text-xs font-normal text-gray-500 ml-2">(Tùy chọn)</span>
                                    </label>
                                    <textarea
                                        value={cartComment}
                                        onChange={(e) => setCartComment(e.target.value)}
                                        placeholder="Nhập ghi chú cho đơn hàng của bạn (ví dụ: yêu cầu đặc biệt, thời gian giao hàng...)"
                                        rows={3}
                                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-700 focus:border-transparent resize-none text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        💡 Ghi chú sẽ được gửi đến người bán để xử lý đơn hàng tốt hơn
                                    </p>
                                </div>

                                {/* Price Summary */}
                                <div className="bg-slate-50 rounded-lg p-3 border-2 border-slate-200">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-gray-700 text-sm">
                                            <span>Đơn giá:</span>
                                            <span className="font-semibold">{product.price}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-700 text-sm">
                                            <span>Số lượng:</span>
                                            <span className="font-semibold">x{cartQuantity}</span>
                                        </div>
                                        <div className="border-t-2 border-slate-300 pt-2 flex justify-between">
                                            <span className="font-bold text-gray-900">Tổng cộng:</span>
                                            <span className="font-bold text-slate-700 text-lg">{calculateTotal()}₫</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2">
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-bold flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        Thêm vào giỏ hàng
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCartSidebarOpen(false)}
                                        className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                                    >
                                        Tiếp tục mua sắm
                                    </button>
                                </div>

                                {/* Trust Info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-blue-900 mb-1 text-sm">Cam kết bảo vệ người mua</h4>
                                            <ul className="text-xs text-blue-800 space-y-0.5">
                                                <li>✓ Hoàn tiền 100% nếu sản phẩm không đúng mô tả</li>
                                                <li>✓ Hỗ trợ 24/7 trong quá trình sử dụng</li>
                                                <li>✓ Bảo hành trọn đời sản phẩm</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
