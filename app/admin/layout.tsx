import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// 관리자 화면은 색인 제외
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="flex h-14 items-center justify-between border-b border-border px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} />
          사이트로 돌아가기
        </Link>
        <span className="text-sm font-medium text-muted-foreground">비욘드스냅 관리자</span>
      </div>

      {children}
    </div>
  );
}