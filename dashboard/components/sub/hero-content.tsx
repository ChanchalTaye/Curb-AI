"use client";

import { SparklesIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import {
  slideInFromLeft,
  slideInFromTop,
} from "@/lib/motion";

export const HeroContent = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center px-4 sm:px-6 mt-28 sm:mt-40 md:mt-52 w-full z-[20] text-center"
    >
      <motion.div
        variants={slideInFromTop}
        className="flex items-center gap-2 py-2 px-3 sm:px-4 mb-6 sm:mb-8 rounded-full border border-white/30 bg-black/50 backdrop-blur-sm"
      >
        <SparklesIcon className="text-purple-400 h-4 w-4 flex-shrink-0" />
        <span className="text-white text-[11px] sm:text-[13px] font-medium tracking-wide">
          Enterprise AI Security &amp; Productivity Platform
        </span>
      </motion.div>

      <motion.div
        variants={slideInFromLeft(0.5)}
        className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-[900px] mb-4 sm:mb-6 px-2"
      >
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-500">
          CurbAI
        </span>{" "}
        Autonomous Intelligence for Modern Enterprises.
      </motion.div>

      <motion.p
        variants={slideInFromLeft(0.8)}
        className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-[680px] mb-8 sm:mb-10 leading-relaxed px-2"
      >
        CurbAI unifies cybersecurity monitoring, productivity intelligence, and
        autonomous AI agents into a single scalable enterprise operating system.
      </motion.p>

      <motion.div
        variants={slideInFromLeft(1)}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0"
      >
        <a
          className="px-8 py-3 bg-white text-black font-bold text-sm tracking-wider rounded-lg cursor-pointer hover:bg-gray-200 transition-all uppercase text-center"
        >
          Get Started
        </a>
        <a
          className="px-8 py-3 bg-transparent text-white font-bold text-sm tracking-wider rounded-lg cursor-pointer border border-white hover:bg-white hover:text-black transition-all uppercase text-center"
        >
          Learn More
        </a>
      </motion.div>
    </motion.div>
  );
};
