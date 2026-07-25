"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, MessageCircle } from "lucide-react";

const NAV_ITEMS = [
  { href: "/about", label: "ABOUT" },
  { href: "/ceremony", label: "CEREMONY" },
  { href: "/films", label: "FILMS" },
  // { href: "/portfolio", label: "PORTFOLIO" },
  { href: "/products", label: "PRODUCTS" },
  { href: "/faq", label: "FAQ" },
];

type SnsLinks = {
  instagram?: string;
  kakaoChannel?: string;
  naverBlog?: string;
};

export function Header({ instagram, kakaoChannel, naverBlog }: SnsLinks) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isMain = pathname === "/";
  const isTransparent = isMain && !isScrolled;
  const isNavActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false); // 데스크톱 드롭다운
  const contactRef = useRef<HTMLDivElement>(null);

  const snsItems = [
    kakaoChannel && { href: kakaoChannel, label: "KAKAO" },
    instagram && { href: instagram, label: "INSTAGRAM" },
    naverBlog && { href: naverBlog, label: "BLOG" },
  ].filter(Boolean) as { href: string; label: string }[];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 메뉴(드로어) 열려있는 동안 배경 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // 데스크톱 CONTACT 드롭다운: 바깥 클릭 또는 Esc 키로 닫기 (접근성)
  useEffect(() => {
    if (!contactOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contactRef.current &&
        !contactRef.current.contains(e.target as Node)
      ) {
        setContactOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContactOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [contactOpen]);

  // 페이지 이동 시 드롭다운/드로어 닫기
  useEffect(() => {
    setContactOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-40 uppercase tracking-widest text-xs">
        <div
          className={`relative transition-all duration-500 ${
            isTransparent
              ? "bg-transparent"
              : "bg-white/60 backdrop-blur-sm text-neutral-800 border-b border-neutral-100"
          }`}
        >
          {isTransparent && (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/50 via-white/30 to-transparent" />
          )}

          <div
            className={`relative mx-auto flex items-center justify-between px-4 md:px-6 lg:px-12 transition-all duration-400 ${isTransparent ? "h-24 lg:h-30 2xl:h-34 4xl:h-40" : "h-16 lg:h-20 2xl:h-22 4xl:h-28"}`}
          >
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="Beyond Snap Photography"
                width={256}
                height={72}
                className="w-40 lg:w-50 2xl:w-58 4xl:w-64 h-auto"
                priority
              />
            </Link>

            {/* 데스크톱 네비 (md 이상에서만 표시) */}
            <nav className="hidden items-center gap-6 lg:gap-8 xl:gap-10 text-sm lg:text-base tracking-[-0.01em] md:flex">
              {NAV_ITEMS.map((item) => {
                const active = isNavActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`transition-colors ${
                      active
                        ? "font-bold text-neutral-700"
                        : "text-neutral-900 hover:text-neutral-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {snsItems.length > 0 && (
                <div className="group relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-controls="header-contact-menu"
                    className="flex items-center gap-1 text-neutral-900 hover:text-neutral-700"
                  >
                    CONTACT
                    <ChevronDown
                      size={14}
                      aria-hidden="true"
                      className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
                    />
                  </button>

                  <div
                    id="header-contact-menu"
                    role="menu"
                    className="invisible absolute right-0 top-full w-30 pt-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-90 group-focus-within:visible group-focus-within:opacity-90"
                  >
                    <div className="border border-border bg-muted text-neutral-900 shadow-lg">
                      {snsItems.map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          role="menuitem"
                          className="block px-5 py-2 text-xs font-semibold hover:bg-neutral-300"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* 모바일 햄버거 버튼 (md 미만에서만 표시) */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="메뉴 열기"
              className="md:hidden text-neutral-600 p-2"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-[90] bg-black/40 md:hidden"
                aria-hidden="true"
              />

              <motion.div
                key="drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
                className="fixed inset-y-0 right-0 z-[100] flex w-2/3 max-w-xs flex-col bg-background text-neutral-800 shadow-2xl md:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="사이트 메뉴"
              >
                <div className="flex h-16 shrink-0 items-center justify-end border-b border-border px-4">
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="메뉴 닫기"
                  >
                    <X size={22} />
                  </button>
                </div>

                {/* 상단: 일반 네비게이션 메뉴들 */}
                <nav className="flex flex-1 flex-col overflow-y-auto px-6 py-4">
                  {NAV_ITEMS.map((item) => {
                    const active = isNavActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`border-b border-border py-4 text-base normal-case tracking-normal ${
                          active
                            ? "font-semibold text-neutral-900"
                            : "text-neutral-700"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
      {snsItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-30 bg-muted/75 backdrop-blur-md border border-neutral-200 md:hidden">
          <div className="flex flex-row-reverse h-12 w-full divide-x divide-neutral-200">
            {snsItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 bg-transparent active:bg-neutral-50 hover:bg-neutral-50 transition-colors"
              >
                {item.label === "KAKAO" && (
                  <MessageCircle size={14} className="text-accent-rose" />
                )}
                {item.label === "BLOG" && (
                  <div className="text-accent-rose">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 924.43 1000"
                      fill="currentColor"
                    >
                      <path d="M344.06 286.98c-70.27 0-135.39 22.03-188.86 59.55V70.18H0v858.3h155.2v-42.62c53.47 37.51 118.59 59.55 188.86 59.55 181.82 0 329.21-147.39 329.21-329.21s-147.4-329.22-329.21-329.22zm-14.78 514.64c-99.13 0-179.49-83.08-179.49-185.56S230.15 430.5 329.28 430.5s179.49 83.08 179.49 185.56-80.36 185.56-179.49 185.56zM862.35 0h62.08v1000h-62.08z" />
                    </svg>
                  </div>
                )}
                {item.label === "INSTAGRAM" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-accent-rose"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                )}
                <span className="text-[11px] sm:text-xs font-medium tracking-[0.1em] text-neutral-600 uppercase pt-0.5">
                  {item.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
