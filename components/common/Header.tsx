"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "ABOUT" },
  { href: "/ceremony", label: "CEREMONY" },
  { href: "/products", label: "PRODUCTS" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isMain = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 메뉴 열려있는 동안 배경 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 uppercase tracking-widest text-xs ${
        isMain && !isScrolled
          ? "bg-transparent text-white"
          : "bg-white/60 backdrop-blur-sm text-neutral-800 border-b border-neutral-100"
      }`}
>
      <div className="mx-auto flex h-25 items-center justify-between px-10">
        <Link href="/" className="flex items-center">
          <Image src="/images/logo.png" alt="Beyond Snap Photography" width={200} height={100} priority />
        </Link>

        {/* 데스크톱 네비 (md 이상에서만 표시) */}
        <nav className="hidden items-center gap-8 text-sm md:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 모바일 햄버거 버튼 (md 미만에서만 표시) */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="메뉴 열기"
          className="md:hidden"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* 모바일 전체화면 메뉴 패널
          z-[100]으로 플로팅 SNS 버튼(z-50)보다 위에 오도록 해서 겹쳐서 안 눌리던 문제 해결 */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background md:hidden">
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-border px-4">
            <Image src="/images/logo.png" alt="Beyond Snap Photography" width={160} height={80} />
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="메뉴 닫기">
              <X size={22} />
            </button>
          </div>

          <nav className="flex flex-col overflow-y-auto px-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-border py-4 text-base"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
