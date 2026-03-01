"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { slideInFromLeft, slideInFromRight, slideInFromTop } from "@/lib/motion";

export const Newsletter = () => {
    const [email, setEmail] = useState("");

    return (
        <section className="w-full pt-10 sm:pt-16 pb-8 px-4 sm:px-6 relative overflow-hidden mt-0 sm:-mt-16 md:-mt-32">
            <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-12">

                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={slideInFromLeft(0.2)}
                    className="flex-1 relative h-[320px] hidden md:block"
                >
                    <div
                        className="absolute rounded-2xl border border-[#2a2b38]"
                        style={{
                            background: "linear-gradient(135deg, #111218, #1a1b26)",
                            width: "75%", height: "90px",
                            top: "20px", left: "0",
                            transform: "skewY(-6deg)",
                            boxShadow: "0 0 40px 4px rgba(168,85,247,0.08)",
                        }}
                    />
                    <div
                        className="absolute rounded-2xl border border-[#2a2b38]"
                        style={{
                            background: "linear-gradient(135deg, #111218, #1a1b26)",
                            width: "75%", height: "90px",
                            top: "130px", left: "10%",
                            transform: "skewY(-6deg)",
                            boxShadow: "0 0 40px 4px rgba(168,85,247,0.12)",
                        }}
                    >
                        <div className="absolute right-4 bottom-4 w-6 h-6 rounded-full" style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)", opacity: 0.8 }} />
                    </div>
                    <div
                        className="absolute rounded-2xl border border-[#2a2b38]"
                        style={{
                            background: "linear-gradient(135deg, #111218, #1a1b26)",
                            width: "75%", height: "90px",
                            top: "240px", left: "5%",
                            transform: "skewY(-6deg)",
                            boxShadow: "0 0 60px 8px rgba(168,85,247,0.18)",
                        }}
                    >
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full" style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)", opacity: 0.9 }} />
                    </div>
                    <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 70%, rgba(168,85,247,0.15) 0%, transparent 60%)" }} />
                </motion.div>

                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true }}
                    variants={slideInFromRight(0.2)}
                    className="flex-1 flex flex-col gap-5"
                >
                    <motion.p
                        variants={slideInFromTop}
                        className="text-sm font-semibold tracking-widest uppercase"
                        style={{ color: "#a855f7" }}
                    >
                        Stay tuned
                    </motion.p>

                    <h2 className="text-white text-4xl md:text-5xl font-bold leading-tight">
                        Subscribe to the Newsletter
                    </h2>

                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-[440px]">
                        Subscribe to CurbAI&apos;s newsletter and stay informed of the latest news!
                        We send four mails per year plus a few more for very special announcements.
                    </p>

                    <div className="flex items-center rounded-full border border-[#3a3b4e] overflow-hidden max-w-[480px]" style={{ background: "#111218" }}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email address"
                            className="flex-1 bg-transparent px-6 py-3.5 text-sm text-gray-300 placeholder-gray-500 outline-none"
                        />
                        <button
                            className="px-6 py-3.5 text-white font-semibold text-sm rounded-full transition-opacity hover:opacity-90 whitespace-nowrap"
                            style={{ background: "linear-gradient(135deg, #7042f8, #a855f7)" }}
                        >
                            Subscribe now
                        </button>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};
