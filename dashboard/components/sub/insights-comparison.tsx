"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { slideInFromTop } from "@/lib/motion";

const THREAT_POINTS = [
    { x: 15, y: 20 }, { x: 28, y: 35 }, { x: 42, y: 18 }, { x: 55, y: 42 },
    { x: 67, y: 28 }, { x: 30, y: 55 }, { x: 48, y: 65 }, { x: 72, y: 50 },
    { x: 20, y: 70 }, { x: 60, y: 75 }, { x: 38, y: 82 }, { x: 80, y: 30 },
    { x: 12, y: 48 }, { x: 85, y: 62 }, { x: 50, y: 30 }, { x: 25, y: 88 },
    { x: 70, y: 88 }, { x: 88, y: 78 }, { x: 35, y: 10 }, { x: 65, y: 12 },
];

export const InsightsComparison = () => {
    const [sliderValue, setSliderValue] = useState(49);

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={slideInFromTop}
            className="w-full max-w-[900px] mx-auto px-4"
        >
            <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-center">
                Optimized for insights
            </h2>

            <div className="rounded-2xl border border-[#2a2b38] overflow-hidden" style={{ background: "#111218" }}>
                <div className="grid grid-cols-1 md:grid-cols-2 md:divide-x divide-[#2a2b38]">

                    <div className="p-4 sm:p-5 border-b border-[#2a2b38] md:border-b-0">
                        <p className="text-white font-semibold text-base mb-3">With CurbAI</p>

                        <div className="relative flex items-center gap-3 mb-4">
                            <div className="absolute -top-5 text-xs text-white bg-[#2a2b38] px-2 py-0.5 rounded"
                                style={{ left: `calc(${sliderValue}% - 14px)` }}>
                                {sliderValue}
                            </div>
                            <input
                                type="range" min={1} max={100} value={sliderValue}
                                onChange={(e) => setSliderValue(Number(e.target.value))}
                                className="w-full h-1 appearance-none cursor-pointer rounded-full"
                                style={{
                                    background: `linear-gradient(to right, #ef4444 ${sliderValue}%, #3f3f46 ${sliderValue}%)`
                                }}
                            />
                        </div>

                        <div
                            className="relative w-full rounded-xl overflow-hidden"
                            style={{ height: "280px", background: "#1a1b26" }}
                        >
                            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="grid-left" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid-left)" />
                                <path d="M0 140 Q100 120 200 150 Q300 180 400 160" stroke="#3b82f6" strokeWidth="18" fill="none" opacity="0.4" />
                                <path d="M0 150 Q100 130 200 160 Q300 190 400 170" stroke="#1d4ed8" strokeWidth="8" fill="none" opacity="0.3" />
                                {[...Array(8)].map((_, i) => (
                                    <rect key={i} x={20 + (i % 4) * 95} y={20 + Math.floor(i / 4) * 90} width="70" height="60" rx="4"
                                        fill="#2a2b38" opacity="0.5" />
                                ))}
                            </svg>

                            {THREAT_POINTS.slice(0, Math.floor(sliderValue / 5)).map((pt, i) => (
                                <div key={i}
                                    className="absolute w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]"
                                    style={{ left: `${pt.x}%`, top: `${pt.y}%`, transform: "translate(-50%,-50%)" }}
                                />
                            ))}

                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-green-400 text-[11px] font-medium">Live · {sliderValue} threats detected</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-5">
                        <p className="text-white font-semibold text-base mb-3">Traditional Tools</p>

                        <div className="relative flex items-center gap-3 mb-4">
                            <div className="absolute -top-5 text-xs text-white bg-[#2a2b38] px-2 py-0.5 rounded"
                                style={{ left: `calc(${sliderValue}% - 14px)` }}>
                                {sliderValue}
                            </div>
                            <div className="w-full h-1 rounded-full" style={{
                                background: `linear-gradient(to right, #ef4444 ${sliderValue}%, #3f3f46 ${sliderValue}%)`
                            }} />
                        </div>

                        <div
                            className="relative w-full rounded-xl overflow-hidden flex items-center justify-center"
                            style={{ height: "280px", background: "#1a1b26" }}
                        >
                            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="grid-right" width="40" height="40" patternUnits="userSpaceOnUse">
                                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.5" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#grid-right)" />
                                <path d="M0 140 Q100 120 200 150 Q300 180 400 160" stroke="#3b82f6" strokeWidth="18" fill="none" opacity="0.4" />
                                <path d="M0 150 Q100 130 200 160 Q300 190 400 170" stroke="#1d4ed8" strokeWidth="8" fill="none" opacity="0.3" />
                                {[...Array(8)].map((_, i) => (
                                    <rect key={i} x={20 + (i % 4) * 95} y={20 + Math.floor(i / 4) * 90} width="70" height="60" rx="4"
                                        fill="#2a2b38" opacity="0.5" />
                                ))}
                            </svg>

                            <div className="flex flex-col items-center gap-2 z-10">
                                <svg className="animate-spin w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                <span className="text-gray-400 text-sm font-medium">Analyzing...</span>
                            </div>

                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                                <span className="text-yellow-300 text-[11px] font-medium">Processing...</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
};
