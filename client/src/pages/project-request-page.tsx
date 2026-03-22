import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Plus,
  X,
  Calendar,
  DollarSign,
  Loader2
} from "lucide-react";

const popularTechs = [
  'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB',
  'Express.js', 'Vue.js', 'Angular', 'Laravel', 'Flask',
  'Redux', 'Kubernetes', 'Firebase', 'GraphQL', 'REST API'
];

export default function ProjectRequestPage() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    projectName: '',
    description: '',
    technicalRequirements: '',
    budget: '',
    deliveryDate: '',
  });

  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [customTech, setCustomTech] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    setError(null);

    // Validate required fields
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập họ và tên');
      return;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!formData.projectName.trim()) {
      setError('Vui lòng nhập tên dự án');
      return;
    }
    if (!formData.description.trim()) {
      setError('Vui lòng nhập mô tả dự án');
      return;
    }

    // Set loading state
    setIsSubmitting(true);

    try {
      // Prepare request data
      const requestData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.companyName,
        title: formData.projectName, // Add project name as title
        project_description: formData.description,
        requirements: `${formData.technicalRequirements}\n\nCông nghệ: ${selectedTechs.join(', ')}`,
        budget: formData.budget || null,
        timeline: formData.deliveryDate || null,
        status: 'pending'
      };

      // Submit to API
      const response = await fetch('/api/external-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        credentials: 'include', // Include cookies for session
      });

      if (!response.ok) {
        throw new Error('Không thể gửi yêu cầu. Vui lòng thử lại.');
      }

      const result = await response.json();
      console.log('✅ Request submitted successfully:', result);

      // Navigate to success page
      navigate('/request-project/success');
    } catch (err) {
      console.error('❌ Error submitting request:', err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  const toggleTech = (tech: string) => {
    if (selectedTechs.includes(tech)) {
      setSelectedTechs(selectedTechs.filter(t => t !== tech));
    } else {
      setSelectedTechs([...selectedTechs, tech]);
    }
  };

  const addCustomTech = () => {
    if (customTech && !selectedTechs.includes(customTech)) {
      setSelectedTechs([...selectedTechs, customTech]);
      setCustomTech('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Về trang chủ
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Yêu cầu dự án tùy chỉnh</h1>
                <p className="text-gray-600 mb-8">
                  Điền vào form bên dưới để yêu cầu dự án phát triển phần mềm tùy chỉnh. Team của chúng tôi sẽ xem xét yêu cầu và liên hệ với bạn sớm.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+84 123 456 789"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tên công ty
                      </label>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Công ty của bạn (tùy chọn)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Project Information */}
                  <div className="border-t pt-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Chi tiết dự án</h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tên dự án <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.projectName}
                          onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                          placeholder="Tên ngắn gọn cho dự án của bạn"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Mô tả dự án <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Mô tả chi tiết dự án của bạn. Bạn đang cố gắng giải quyết vấn đề gì?"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Yêu cầu kỹ thuật
                        </label>
                        <textarea
                          rows={4}
                          value={formData.technicalRequirements}
                          onChange={(e) => setFormData({ ...formData, technicalRequirements: e.target.value })}
                          placeholder="Liệt kê các tính năng chính, công nghệ hoặc yêu cầu cụ thể"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Công nghệ phổ biến
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {popularTechs.map((tech) => (
                            <button
                              key={tech}
                              type="button"
                              onClick={() => toggleTech(tech)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedTechs.includes(tech)
                                ? 'bg-slate-700 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                              {tech}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customTech}
                            onChange={(e) => setCustomTech(e.target.value)}
                            placeholder="Thêm công nghệ khác"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTech())}
                          />
                          <button
                            type="button"
                            onClick={addCustomTech}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>

                        {selectedTechs.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedTechs.map((tech) => (
                              <span
                                key={tech}
                                className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-sm"
                              >
                                {tech}
                                <button
                                  type="button"
                                  onClick={() => toggleTech(tech)}
                                  className="hover:bg-slate-200 rounded-full p-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Ngân sách dự tính (VND)
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              value={formData.budget}
                              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                              placeholder="VD: 10,000,000"
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Ngày giao dự kiến
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="date"
                              value={formData.deliveryDate}
                              onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="border-t pt-6">
                    {error && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                      </div>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-8 py-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        'Gửi yêu cầu dự án'
                      )}
                    </Button>
                    <p className="text-sm text-gray-500 text-center mt-3">
                      <span className="text-red-500">*</span> Các trường bắt buộc được đánh dấu. Yêu cầu thường được xem xét trong 24-48 giờ.
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                {/* Why Choose Us */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-xl p-6 border border-slate-600">
                  <h3 className="text-xl font-bold mb-4 text-white">Tại sao chọn chúng tôi?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div>
                        <div className="font-semibold mb-1">Đội ngũ phát triển chuyên nghiệp</div>
                        <p className="text-slate-200 text-sm">Chuyên gia của chúng tôi có nhiều năm kinh nghiệm trong các công nghệ đa dạng</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div>
                        <div className="font-semibold mb-1">Giải pháp tùy chỉnh</div>
                        <p className="text-slate-200 text-sm">Phát triển phù hợp với nhu cầu cụ thể của bạn</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div>
                        <div className="font-semibold mb-1">Dịch vụ toàn diện</div>
                        <p className="text-slate-200 text-sm">Từ lập kế hoạch đến triển khai và hỗ trợ liên tục</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Process Timeline */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Quy trình yêu cầu dự án</h3>
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          1
                        </div>
                        <div className="w-0.5 h-full bg-slate-200 mt-2" />
                      </div>
                      <div className="pb-4">
                        <div className="font-semibold text-gray-900 mb-1">Gửi yêu cầu</div>
                        <p className="text-sm text-gray-600">Điền form với chi tiết dự án của bạn</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                        <div className="w-0.5 h-full bg-slate-200 mt-2" />
                      </div>
                      <div className="pb-4">
                        <div className="font-semibold text-gray-900 mb-1">Tư vấn ban đầu</div>
                        <p className="text-sm text-gray-600">Team chúng tôi sẽ liên hệ để thảo luận yêu cầu</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          3
                        </div>
                        <div className="w-0.5 h-full bg-slate-200 mt-2" />
                      </div>
                      <div className="pb-4">
                        <div className="font-semibold text-gray-900 mb-1">Đề xuất & báo giá</div>
                        <p className="text-sm text-gray-600">Nhận đề xuất chi tiết với timeline và chi phí</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          4
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">Bắt đầu phát triển</div>
                        <p className="text-sm text-gray-600">Sau khi được phê duyệt, team bắt đầu làm việc</p>
                      </div>
                    </li>
                  </ol>
                </div>

                {/* Contact Info */}
                <div className="bg-gray-100 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Cần hỗ trợ?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Team của chúng tôi sẵn sàng giúp bạn hiểu rõ hơn về quy trình.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">📧 admin@in2sight.com</p>
                    <p className="text-gray-700">📞 +84 123 456 789</p>
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
