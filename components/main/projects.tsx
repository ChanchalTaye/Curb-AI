"use client";

import { motion } from "framer-motion";
import { slideInFromLeft, slideInFromTop } from "@/lib/motion";

export const Projects = () => {
  return (
    <section
      id="projects"
      className="flex flex-col items-center justify-center py-12 sm:py-20 px-4 sm:px-6 w-full mt-0 sm:-mt-24 md:-mt-48"
    >
      <div className="w-full max-w-[1200px] mx-auto">

        <motion.h2
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={slideInFromTop}
          className="text-white text-3xl sm:text-5xl md:text-6xl font-bold text-center leading-tight mb-8 sm:mb-14"
        >
          Easy to learn,
          <br />
          pleasure to work with
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={slideInFromLeft(0.1)}
            className="rounded-2xl border border-[#2a2b38] overflow-hidden flex flex-col p-6"
            style={{ background: "#111218" }}
          >
            <p className="text-white text-sm font-semibold leading-snug mb-4">
              <span className="font-bold">Threat Scenarios made easy with CurbAI Studio.</span>{" "}
              <span className="text-gray-400">A powerful VS Code extension that unlocks a convenient graphical editor.</span>
            </p>
            <div className="flex-1 relative rounded-xl overflow-hidden min-h-[180px]" style={{ background: "#16172a" }}>
              <svg className="w-full h-full absolute inset-0" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg">
                <line x1="175" y1="45" x2="80" y2="110" stroke="#3a3b4e" strokeWidth="1.5" strokeDasharray="4" />
                <line x1="175" y1="45" x2="240" y2="110" stroke="#3a3b4e" strokeWidth="1.5" strokeDasharray="4" />
                <line x1="80" y1="110" x2="80" y2="145" stroke="#7042f8" strokeWidth="1.5" />
                <line x1="240" y1="110" x2="240" y2="145" stroke="#7042f8" strokeWidth="1.5" />
                <rect x="130" y="28" width="90" height="34" rx="8" fill="#1d1e2e" stroke="#3a3b4e" />
                <circle cx="143" cy="45" r="5" fill="#7042f8" />
                <text x="152" y="49" fill="#e2e8f0" fontSize="11" fontFamily="sans-serif">planning</text>
                <rect x="195" y="28" width="90" height="34" rx="8" fill="#1d1e2e" stroke="#3a3b4e" />
                <circle cx="208" cy="45" r="5" fill="#7042f8" />
                <text x="217" y="49" fill="#e2e8f0" fontSize="11" fontFamily="sans-serif">prediction</text>
                <rect x="40" y="95" width="95" height="34" rx="8" fill="#1d1e2e" stroke="#3a3b4e" />
                <circle cx="53" cy="112" r="5" fill="#06b6d4" />
                <text x="62" y="116" fill="#e2e8f0" fontSize="11" fontFamily="sans-serif">my scenario</text>
                <rect x="200" y="95" width="80" height="34" rx="8" fill="#1d1e2e" stroke="#3a3b4e" />
                <circle cx="213" cy="112" r="5" fill="#06b6d4" />
                <text x="222" y="116" fill="#e2e8f0" fontSize="11" fontFamily="sans-serif">dataset</text>
              </svg>
            </div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={slideInFromTop}
            className="rounded-2xl border border-[#2a2b38] overflow-hidden flex flex-col p-6"
            style={{ background: "#111218" }}
          >
            <p className="text-white text-sm font-semibold leading-snug mb-4">
              <span className="font-bold">Tasks Scheduler.</span>{" "}
              <span className="text-gray-400">Get your methods invoked at a certain time or intervals.</span>
            </p>
            <div className="flex-1 flex items-center justify-center min-h-[180px]">
              <div className="relative w-36 h-36">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#2a2b38" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#a855f7" strokeWidth="8"
                    strokeDasharray="326.7" strokeDashoffset="82" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-white text-2xl font-bold">09:16</span>
                  <span className="text-gray-500 text-[10px] mt-0.5">11:51</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={slideInFromLeft(0.2)}
            className="rounded-2xl border border-[#2a2b38] overflow-hidden flex flex-col p-6"
            style={{ background: "#111218" }}
          >
            <p className="text-white text-sm font-semibold leading-snug mb-6">
              <span className="font-bold">Customize styles.</span>{" "}
              <span className="text-gray-400">Enjoy a variety of predefined themes or build your own.</span>
            </p>
            <div className="flex-1 flex flex-col gap-4 justify-center min-h-[180px]">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm w-12">Color</span>
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-4 h-4 rounded-full bg-red-500" />
                  <div className="w-4 h-4 rounded-full bg-gray-400" />
                  <div className="w-4 h-4 rounded-full bg-blue-500" />
                  <div className="w-4 h-4 rounded-full bg-gray-600" />
                </div>
              </div>
              <button className="w-full py-2.5 rounded-xl border border-[#3a3b4e] text-white text-sm font-medium hover:bg-[#1d1e2e] transition-colors">
                Get started
              </button>
              <div className="flex items-center justify-between border border-[#3a3b4e] rounded-xl px-4 py-2.5">
                <span className="text-gray-300 text-sm">Inter Medium</span>
                <span className="text-gray-500 text-xs">▾</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={slideInFromLeft(0.3)}
            className="rounded-2xl border border-[#2a2b38] overflow-hidden flex flex-col p-6"
            style={{ background: "#111218" }}
          >
            <p className="text-white text-sm font-semibold leading-snug mb-4">
              <span className="font-bold">Multi-users.</span>{" "}
              <span className="text-gray-400">Each end-user has his own state enabling multi-user support.</span>
            </p>
            <div className="flex-1 min-h-[180px]">
              <div className="rounded-xl overflow-hidden border border-[#2a2b38]">
                <div className="grid grid-cols-2 text-xs text-gray-500 px-4 py-2 border-b border-[#2a2b38]" style={{ background: "#16172a" }}>
                  <span>City</span><span>Status</span>
                </div>
                {[
                  { city: "Madrid", status: "Cancelled", badge: null },
                  { city: "San Rafael", status: "Idle", badge: { label: "User 2", color: "#7042f8" } },
                  { city: "Singapore", status: "Active", badge: { label: "User 1", color: "#a855f7" } },
                  { city: "New York", status: "Cancelled", badge: null },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-2 text-xs text-gray-400 px-4 py-2.5 border-b border-[#2a2b38] last:border-0 relative" style={{ background: "#111218" }}>
                    <span className="text-gray-300">{row.city}</span>
                    <div className="flex items-center gap-2">
                      <span>{row.status}</span>
                      {row.badge && (
                        <span className="absolute left-1 px-2 py-0.5 rounded-full text-[10px] text-white font-medium" style={{ background: row.badge.color }}>
                          {row.badge.label}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={slideInFromTop}
            className="rounded-2xl border border-[#2a2b38] overflow-hidden flex flex-col p-6"
            style={{ background: "#111218" }}
          >
            <p className="text-white text-sm font-semibold leading-snug mb-4">
              <span className="font-bold">Long jobs.</span>{" "}
              <span className="text-gray-400">Run heavy tasks in the background without slowing down experience.</span>
            </p>
            <div className="flex-1 flex items-center justify-center min-h-[180px]">
              <div
                className="px-8 py-4 rounded-full text-white font-semibold text-base cursor-pointer shadow-2xl flex items-center gap-2 hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg, #7042f8, #a855f7)" }}
              >
                Run the task
                <span className="opacity-70 text-sm">▼</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={slideInFromLeft(0.4)}
            className="rounded-2xl border border-[#2a2b38] overflow-hidden flex flex-col p-6"
            style={{ background: "#111218" }}
          >
            <p className="text-white text-sm font-semibold leading-snug mb-4">
              <span className="font-bold">Explore threats with</span>{" "}
              <span style={{ color: "#a855f7" }}>CurbAI Chat.</span>{" "}
              <span className="text-gray-400">Leverage the LLM-based application to explore security data using only natural languages.</span>
            </p>
            <div className="flex-1 flex gap-3 min-h-[180px]">
              <div className="flex-1 rounded-xl border border-[#2a2b38] overflow-hidden text-[9px] text-gray-500" style={{ background: "#16172a" }}>
                <div className="grid grid-cols-3 gap-1 px-2 py-1 border-b border-[#2a2b38] text-[8px] text-gray-600">
                  <span>ID</span><span>Date</span><span>Status</span>
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-3 gap-1 px-2 py-1.5 border-b border-[#2a2b38] last:border-0">
                    <span>{`TH-${1042 + i}`}</span>
                    <span>{`23/0${i + 1}/25`}</span>
                    <span className={i % 3 === 0 ? "text-purple-400" : "text-gray-500"}>{i % 3 === 0 ? "Active" : "Resolved"}</span>
                  </div>
                ))}
                <div className="mx-2 mb-2 mt-1 border border-[#3a3b4e] rounded-lg px-2 py-1.5 text-[9px] text-gray-400">
                  plot sales by product in chart
                </div>
              </div>
              <div className="w-28 rounded-xl border border-[#2a2b38] p-2 flex flex-col" style={{ background: "#16172a" }}>
                <span className="text-[9px] text-gray-400 mb-2">Sales by product</span>
                <svg viewBox="0 0 80 50" className="flex-1">
                  <polyline points="0,40 15,30 30,35 45,15 60,20 75,10" fill="none" stroke="#a855f7" strokeWidth="2" />
                  <polyline points="0,45 15,38 30,42 45,28 60,32 75,25" fill="none" stroke="#06b6d4" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
