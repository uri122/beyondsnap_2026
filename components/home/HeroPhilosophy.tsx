"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const PHILOSOPHY_ITEMS = [
  {
    id: "01",
    title: "Beyond Time",
    description: "두 분을 위한 단 하루의 시간을 있는 그대로 담습니다",
  },
  {
    id: "02",
    title: "Beyond Natural",
    description: "스냅 고유의 뜻처럼 자연스러움을 담습니다",
  },
  {
    id: "03",
    title: "Beyond Snap",
    description: "비욘드의 전속 작가진만 두 분을 담습니다",
  },
  {
    id: "04",
    title: "Beyond Memories",
    description: "10년 후에 꺼내보아도 좋은 그런 사진을 담습니다",
  },
] as const;

const ROTATE_INTERVAL_MS = 10000;

export function HeroPhilosophy() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // 모션 최소화를 선호하는 사용자에게는 자동 전환 자체를 하지 않습니다.
    if (prefersReducedMotion) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PHILOSOPHY_ITEMS.length);
    }, ROTATE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [prefersReducedMotion]);

  const active = PHILOSOPHY_ITEMS[activeIndex];
  const [, ...restWords] = active.title.split(" ");
  const changingWord = restWords.join(" ");

  const textTransition = {
    duration: prefersReducedMotion ? 0 : 1.5,
    ease: [0.22, 1, 0.36, 1] as const,
    delay: 0.5,
  };

  const descriptionTransition = {
    ...textTransition,
    delay: prefersReducedMotion ? 0.5 : 0.8,
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-end px-6 pb-10 text-right text-white sm:pb-24 md:px-12 lg:pb-28 xl:px-16">
      <ul className="sr-only">
        {PHILOSOPHY_ITEMS.map((item) => (
          <li key={item.id}>
            {item.title} — {item.description}
          </li>
        ))}
      </ul>

      <span
        aria-hidden="true"
        className="text-[11px] font-medium uppercase tracking-[0.4em] text-white/70 translate-x-2 3xl:text-sm"
      >
        Our Philosophy
      </span>

      <div aria-hidden="true" className="mt-4 min-h-[6.5rem] sm:min-h-[7.5rem]">
        <h2 className="flex flex-col items-end font-serif italic leading-tight tracking-wide">
          <span className="font-light text-5xl lg:text-7xl 3xl:text-8xl text-accent-rose">
            Beyond
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={active.id}
              className="mt-2 inline-block text-3xl lg:text-5xl 3xl:text-6xl"
              initial={prefersReducedMotion ? false : { opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: -10 }}
              transition={textTransition}
            >
              {changingWord}
            </motion.span>
          </AnimatePresence>
        </h2>

        <AnimatePresence mode="wait">
          <motion.p
            key={active.id}
            className="mt-3 text-sm font-light text-white/85 lg:text-base 3xl:text-lg"
            initial={prefersReducedMotion ? false : { opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, x: -5 }}
            transition={descriptionTransition}
          >
            {active.description}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
