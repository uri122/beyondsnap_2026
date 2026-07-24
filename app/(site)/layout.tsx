import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { getSiteSettings } from "@/lib/data/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings([
    "sns_instagram",
    "sns_kakao_channel",
    "sns_naver_blog",
  ]);

  return (
    <div className="flex min-h-screen flex-col pb-12 md:pb-0">
      <Header
        instagram={settings.sns_instagram}
        kakaoChannel={settings.sns_kakao_channel}
        naverBlog={settings.sns_naver_blog}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
