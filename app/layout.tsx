import type { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { getSiteSettings } from "@/lib/data/settings";
import "./globals.css";

export const metadata: Metadata = {
  title: "비욘드스냅 | 본식스냅",
  description: "비욘드스냅, 어느 하루의 눈부신 순간을 담습니다.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings(["sns_instagram", "sns_kakao_channel", "sns_naver_blog"]);

  return (
    <html lang="ko">
      <body className="min-h-screen font-sans">
        <Header
          instagram={settings.sns_instagram}
          kakaoChannel={settings.sns_kakao_channel}
          naverBlog={settings.sns_naver_blog}
        />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}