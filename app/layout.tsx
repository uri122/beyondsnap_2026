import type { Metadata } from "next";
import localFont from "next/font/local";
import { Lora } from "next/font/google";
import { getSiteSettings } from "@/lib/data/settings";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings(["intro_text"]);

  const title = "비욘드스냅 | Beyond Snap";
  const description = settings.intro_text || "눈부신 오늘의 순간을 기록합니다.";

  return {
    metadataBase: new URL("https://beyondsnap.co.kr"),
    title,
    description,
    openGraph: {
      title,
      description,
      locale: "ko_KR",
      type: "website",
      images: ["/images/logo.png"],
    },

    // 개발중 색인 차단
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${lora.variable}`}>
      <body className="min-h-screen font-sans selection:bg-accent-rose-tint">
        {children}
      </body>
    </html>
  );
}
