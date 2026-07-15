"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, MessageCircle, Plus, X } from "lucide-react";

type SnsLinks = {
  instagram?: string;
  kakaoChannel?: string;
  naverBlog?: string;
};

// 사이트 전역(RootLayout)에 떠 있는 플로팅 버튼.
// 탭하면 인스타/카카오채널/블로그 아이콘이 위로 펼쳐집니다.
export function FloatingSnsButton({ instagram, kakaoChannel, naverBlog }: SnsLinks) {
  const [open, setOpen] = useState(false);

  const items = [
    kakaoChannel && { href: kakaoChannel, label: "카카오 채널 상담", icon: MessageCircle, bg: "bg-[#FEE500]", fg: "text-black" },
    instagram && { href: instagram, label: "인스타그램", icon: Instagram, bg: "bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-500", fg: "text-white" },
    naverBlog && { href: naverBlog, label: "네이버 블로그", icon: MessageCircle, bg: "bg-[#03C75A]", fg: "text-white" },
  ].filter(Boolean) as { href: string; label: string; icon: typeof Instagram; bg: string; fg: string }[];

  if (items.length === 0) return null;

  return (
    <div
      className="fixed right-6 z-50 flex flex-col items-end gap-3"
      style={{ bottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 0.75rem))" }}
    >
      <AnimatePresence>
        {open &&
          items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2"
            >
              <span className="rounded-full bg-black/80 px-3 py-1 text-xs text-white">
                {item.label}
              </span>
              <Link
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg ${item.bg} ${item.fg}`}
              >
                <item.icon size={20} />
              </Link>
            </motion.div>
          ))}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "닫기" : "SNS로 문의하기"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl"
      >
        <motion.span animate={{ rotate: open ? 45 : 0 }}>
          {open ? <X size={22} /> : <Plus size={22} />}
        </motion.span>
      </button>
    </div>
  );
}
