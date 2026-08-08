"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`w-full ${isHome ? "" : "px-4 pt-24 pb-30 sm:px-6 lg:px-12 xl:pt-30 2xl:pt-32 4xl:py-40"}`}
    >
      {children}
    </motion.div>
  );
}
