"use client";

import { motion } from "framer-motion";
import { slideInFromTop, slideInFromLeft } from "@/lib/motion";

export const ContributeSection = () => {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="w-full max-w-[1300px] mx-auto px-4 sm:px-8 py-10 sm:py-16"
        >
            <motion.p
                variants={slideInFromTop}
                className="text-center text-lg font-semibold tracking-widest uppercase mb-4"
                style={{ color: "#a855f7" }}
            >
                Contribute
            </motion.p>

            <motion.h2
                variants={slideInFromLeft(0.2)}
                className="text-white text-3xl sm:text-5xl md:text-6xl font-bold text-center mb-4 sm:mb-5 leading-tight"
            >
                Get started to drive your data in minutes
            </motion.h2>

            <motion.p
                variants={slideInFromLeft(0.4)}
                className="text-gray-400 text-center max-w-[680px] mx-auto mb-12 leading-relaxed"
            >
                Join CurbAI&apos;s development community today! Your contributions are greatly
                appreciated and will be duly acknowledged. Don&apos;t hesitate and be part of
                the CurbAI adventure!
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                <motion.div
                    variants={slideInFromLeft(0.5)}
                    className="rounded-xl border border-[#2a2b38] overflow-hidden flex flex-col"
                    style={{ background: "#16172a" }}
                >
                    <div className="flex-1 p-4 sm:p-6 font-mono text-sm leading-relaxed overflow-hidden min-h-[220px] sm:min-h-[400px]" style={{ background: "#1a1b26" }}>
                        <div className="flex gap-1.5 mb-3">
                            <div className="w-3 h-3 rounded-full bg-red-500/60" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                            <div className="w-3 h-3 rounded-full bg-green-500/60" />
                        </div>
                        <div className="space-y-2 text-[13px]">
                            <p><span className="text-blue-400">if</span> <span className="text-gray-300">(bookingSeat) {"{"}</span></p>
                            <p className="pl-4"><span className="text-purple-300">reachedRuleUid</span> <span className="text-gray-400">= bookingSeat.boo...</span></p>
                            <p><span className="text-gray-500">{"}"}</span></p>
                            <p><span className="text-purple-300">originalRescheduledBooking</span> <span className="text-gray-400">= await getSto...</span></p>
                            <div className="flex items-center gap-2 mt-2 bg-[#7042f8]/20 border border-[#7042f8]/40 rounded px-2 py-1">
                                <span className="bg-purple-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">15</span>
                                <span className="text-yellow-300">await</span>
                                <span className="text-white">userEvent</span>
                                <span className="text-gray-400">.clear(input);</span>
                            </div>
                            <p><span className="text-blue-400">if</span> <span className="text-gray-300">(originalRescheduledBooking) {"{"}</span></p>
                            <p className="pl-4"><span className="text-red-400">throw new</span> <span className="text-orange-300">HttpError</span><span className="text-gray-400">{"({ statusCode: 404"}</span></p>
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-white font-bold text-xl mb-2">Fix bugs</h3>
                        <p className="text-gray-400 text-base">
                            Help us identify unwanted behaviors in the product and fix them.{" "}
                            <span style={{ color: "#a855f7" }} className="cursor-pointer hover:underline">in the product</span>
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    variants={slideInFromLeft(0.65)}
                    className="rounded-xl border border-[#2a2b38] overflow-hidden flex flex-col"
                    style={{ background: "#16172a" }}
                >
                    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 min-h-[220px] sm:min-h-[400px]" style={{ background: "#1a1b26" }}>
                        <div className="w-full max-w-[340px]">
                            <div className="rounded-t-lg border border-[#2a2b38] px-4 py-3 flex items-center gap-2" style={{ background: "#1d1e2e" }}>
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                                </div>
                                <span className="text-gray-400 text-sm ml-1">Scenario Manager</span>
                            </div>
                            <div className="rounded-b-lg border border-t-0 border-[#2a2b38] p-6 flex flex-col items-center gap-4" style={{ background: "#13141f" }}>
                                <div className="w-full h-3 rounded bg-[#2a2b38]" />
                                <div className="w-4/5 h-3 rounded bg-[#2a2b38]" />
                                <div className="w-3/4 h-3 rounded bg-[#2a2b38]" />
                                <div className="w-2/3 h-3 rounded bg-[#2a2b38]" />
                                <div
                                    className="mt-3 px-6 py-3 rounded-full text-white text-sm font-semibold cursor-pointer flex items-center gap-2 shadow-lg"
                                    style={{ background: "#7042f8" }}
                                >
                                    Implement now
                                    <span className="text-white opacity-70">▼</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-white font-bold text-xl mb-2">Implement features</h3>
                        <p className="text-gray-400 text-base">
                            Chose one of the incoming features from our list, or develop your own.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    variants={slideInFromLeft(0.8)}
                    className="rounded-xl border border-[#2a2b38] overflow-hidden flex flex-col"
                    style={{ background: "#16172a" }}
                >
                    <div className="flex-1 p-4 sm:p-6 text-sm min-h-[220px] sm:min-h-[400px]" style={{ background: "#1a1b26" }}>
                        <div className="flex items-center gap-3 mb-5 text-gray-400">
                            <span className="bg-[#2a2b38] px-3 py-1 rounded text-xs font-medium">✓ 10 Open</span>
                            <span className="bg-[#2a2b38] px-3 py-1 rounded text-xs font-medium">4 Reviewed</span>
                        </div>
                        <div className="space-y-3">
                            <div className="border border-[#2a2b38] rounded-xl p-4" style={{ background: "#1d1e2e" }}>
                                <p className="text-gray-300 text-sm mb-2">⊙ Multiple selection of scenarios in Scenario...</p>
                                <p className="text-gray-500 text-xs">#107 opened 30 min ago by Marina Gosselin</p>
                            </div>
                            <div className="border border-[#2a2b38] rounded-xl p-4" style={{ background: "#1d1e2e" }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-1 rounded text-xs font-bold text-white" style={{ background: "#7042f8" }}>New issue</span>
                                    <span className="px-2 py-1 rounded text-xs border" style={{ borderColor: "#7042f8", color: "#a855f7" }}>Improvement</span>
                                </div>
                                <p className="text-gray-300 text-sm mb-2">Feature: Add validation for date picker</p>
                                <p className="text-gray-500 text-xs">#108 opened 1 hour ago by John Lulo</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-white font-bold text-xl mb-2">Submit feedback</h3>
                        <p className="text-gray-400 text-base">
                            Tell us what you love and what{" "}
                            <span style={{ color: "#a855f7" }} className="cursor-pointer hover:underline">you would improve</span>{" "}
                            in CurbAI.
                        </p>
                    </div>
                </motion.div>

            </div>
        </motion.div>
    );
};
