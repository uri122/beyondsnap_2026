"use client";

import React from "react";
import { motion } from "framer-motion";
import { JustifiedText } from "@/components/common/JustifiedText";

const ABOUT_DATA = {
  philosophy: [
    {
      id: "01",
      title: "Beyond Time",
      description: "두분을 위한 단 하루의 시간을 있는 그대로 담아냅니다.",
    },
    {
      id: "02",
      title: "Beyond Natural",
      description: "스냅의 고유의 뜻처럼 자연스러움을 담아냅니다.",
    },
    {
      id: "03",
      title: "Beyond Snap",
      description: "비욘드의 감성을 이해하는 작가만 담습니다.",
    },
    {
      id: "04",
      title: "Beyond Memories",
      description: "10년후에도 꺼내보아도 좋은 그런 사진을 담습니다.",
    },
  ],
  teams: [
    {
      role: "수석작가",
      roleEn: "Chief Photographers",
      members: ["김한결", "김민지", "이종연", "조윤재"],
    },
    {
      role: "메인작가",
      roleEn: "Photographers",
      members: [
        "김소희",
        "김승찬",
        "김영빈",
        "김종현",
        "송영일",
        "이용수",
        "정다인",
        "조아현",
        "주청은",
        "지단비",
        "최원",
        "최우리",
      ],
    },
    {
      role: "아이폰 & 영상",
      roleEn: "iPhone & Video",
      members: ["김주연", "이소연", "원철홍", "이현우", "문지원"],
    },
  ],
};

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-6xl 2xl:max-w-9xl 4xl:max-w-10xl text-stone-900">
      <h1 className="text-center mt-10 font-serif italic text-4xl text-neutral-400 tracking-widest md:tracking-[0.5em]">
        ABOUT
      </h1>

      {/* Philosophy Section */}
      <motion.section
        className="pt-24 pb-20 md:pt-42 md:pb-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-12 lg:gap-16 4xl:gap-22 md:text-center 2xl:text-left">
          {ABOUT_DATA.philosophy.map((item) => {
            const [firstWord, ...restWords] = item.title.split(" ");
            const restOfTitle = restWords.join(" ");
            return (
              <motion.div
                key={item.id}
                variants={fadeUp}
                className="relative flex flex-col gap-4 py-6"
              >
                <div className="absolute top-0 left-0 w-1/2 h-[2px] bg-accent-rose md:left-[50%] md:transform md:-translate-x-1/2 2xl:left-0 2xl:translate-x-0"></div>

                <h2 className="text-3xl 2xl:text-4xl font-serif italic tracking-wide text-stone-900 leading-tight">
                  <span className="text-accent-rose font-light mr-2">
                    {firstWord}
                  </span>
                  {restOfTitle}
                </h2>

                <p className="text-stone-600 text-sm md:text-base leading-relaxed font-light word-keep mt-2 2xl:mt-4">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Photographers Guide Section */}
      <motion.section
        className="max-w-6xl mx-auto mt-10 md:mt-25"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <motion.div
          variants={fadeUp}
          className="mb-12 border-t border-accent-rose-line pt-8 flex items-center gap-4"
        >
          <span className="w-2 h-2 rounded-full bg-accent-rose-line block"></span>
          <h2 className="font-serif text-sm xl:text-xl font-semibold tracking-[0.2em] uppercase text-stone-400">
            Photographer Guide
          </h2>
        </motion.div>

        <div className="space-y-12 md:space-y-16 p-4">
          {ABOUT_DATA.teams.map((team, idx) => (
            <motion.div key={idx} variants={fadeUp} className="relative">
              <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3 mb-5">
                <h3 className="text-sm md:text-base font-medium text-stone-700 tracking-wide">
                  {team.role}
                </h3>
                <span className="text-[10px] font-light tracking-[0.15em] text-stone-400 uppercase">
                  {team.roleEn}
                </span>
              </div>

              <ul className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-4">
                {team.members.map((member, mIdx) => (
                  <li key={mIdx} className="text-sm align-middle">
                    <JustifiedText text={member} width="3em" />
                    <span className="text-stone-500 pl-2">작가</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </section>
  );
}
