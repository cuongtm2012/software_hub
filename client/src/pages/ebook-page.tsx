import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageMeta } from "@/components/seo/page-meta";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, CheckCircle } from "lucide-react";

const EBOOK_CONTENT = `# Lộ trình Fullstack 6 tháng

## Tháng 1-2: Nền tảng
- HTML, CSS, JavaScript cơ bản
- Git & GitHub
- Responsive design

## Tháng 3-4: Frontend
- React.js + TypeScript
- State management, React Query
- Tailwind CSS

## Tháng 5-6: Backend & Deploy
- Node.js + Express
- PostgreSQL + Drizzle ORM
- Authentication, REST API
- Deploy Vercel + Supabase

---
Software Hub — Tư vấn lộ trình miễn phí: softwarehub.com/booking
`;

export default function EbookPage() {
  const [unlocked, setUnlocked] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([EBOOK_CONTENT], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lo-trinh-fullstack-6-thang.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PageMeta
        title="Download Ebook Lộ trình Fullstack 6 tháng miễn phí"
        description="Ebook lộ trình học Fullstack 6 tháng từ con số 0 — miễn phí, tiếng Việt. Để lại email để nhận ngay."
        url="/ebook/fullstack-roadmap"
      />
      <Header />
      <main className="flex-grow container max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <BookOpen className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Ebook: Lộ trình Fullstack 6 tháng
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Tài liệu miễn phí giúp bạn biết học gì, theo thứ tự nào, trong 6 tháng để trở thành lập trình viên Fullstack.
          </p>
        </div>

        {!unlocked ? (
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h2 className="text-lg font-semibold mb-4">Nhận ebook miễn phí</h2>
            <p className="text-sm text-gray-600 mb-6">
              Điền email và số điện thoại để tải ebook ngay lập tức.
            </p>
            <LeadCaptureForm
              source="ebook"
              sourceId="fullstack-roadmap"
              title="Nhận ebook miễn phí"
              description=""
            />
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-indigo-600 hover:underline"
                onClick={() => setUnlocked(true)}
              >
                Đã điền form? Nhấn để tải ebook
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Ebook đã sẵn sàng!</h2>
            <p className="text-gray-600 mb-6">Nhấn nút bên dưới để tải file Markdown.</p>
            <Button onClick={handleDownload} className="bg-indigo-600 hover:bg-indigo-700">
              <Download className="h-4 w-4 mr-2" />
              Tải Ebook (.md)
            </Button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
          {["Lộ trình chi tiết 6 tháng", "100% tiếng Việt", "Cập nhật 2025"].map((item) => (
            <div key={item} className="flex items-center gap-2 bg-white rounded-lg p-3 border">
              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
