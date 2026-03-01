"use client";

import React from "react";
import { motion } from "framer-motion";
import { BellIcon, Cog8ToothIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { slideInFromRight, slideInFromLeft } from "@/lib/motion";

const notifications = [
    {
        id: 1,
        type: "system",
        title: "Your account is pending verification.",
        description: "steve@acme.co is pending verification, please verify your account to protect against fraud and abuse.",
        time: "Today at 7:41 AM",
        actions: ["Verify now"],
        unread: true,
    },
    {
        id: 2,
        type: "user",
        title: "Joe requested to view Q4 2024 report.",
        description: "joe@acme.co requested view access to Q4 2024 report.",
        time: "Last Friday at 8:40 PM",
        actions: ["Verify now", "Deny"],
        avatar: "https://i.pravatar.cc/150?u=joe",
        unread: true,
    },
    {
        id: 3,
        type: "system",
        title: "2 new comments from Radek and Dima.",
        description: "You have 2 new comments on the Acme figma file.",
        time: "Last Monday at 13:45 PM",
        unread: true,
    },
];

interface InboxProps {
    hideSection?: boolean;
    animate?: boolean;
}

export const Inbox = ({ hideSection = false, animate = false }: InboxProps) => {
    const inVariants = hideSection ? slideInFromRight : slideInFromLeft;
    const animProps = (delay: number) =>
        animate
            ? { initial: "hidden", animate: "visible", variants: inVariants(delay) }
            : { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: inVariants(delay) };

    const content = (
        <div className="relative pl-3 sm:pl-5 pt-10 w-full max-w-[330px] mx-auto">

            <motion.div
                {...animProps(0.35)}
                className="absolute top-0 left-3 sm:left-0 right-0 rounded-2xl border border-[#252636] flex items-center gap-2 px-4 py-3.5"
                style={{ background: "#16172a" }}
            >
                <div
                    className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }}
                >
                    <div className="w-2.5 h-2.5 border-[1.5px] border-white rounded-sm rotate-45" />
                </div>
                <span className="text-gray-400 text-sm font-medium leading-none">
                    CurbAI{" "}
                    <span className="text-gray-600 font-normal">{"<Inbox />"}</span>
                </span>
            </motion.div>

            <motion.div
                {...animProps(0.6)}
                className="relative w-full rounded-2xl border border-[#252636] overflow-hidden shadow-2xl"
                style={{ background: "#1d1e30" }}
            >
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <h2 className="text-white text-lg font-bold leading-none">Inbox</h2>
                    <div className="flex items-center gap-3 text-gray-600">
                        <EllipsisHorizontalIcon className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                        <Cog8ToothIcon className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-5 px-5 border-b border-[#252636]">
                    <div className="pb-2.5 border-b-2 border-purple-500 flex items-center gap-1.5 cursor-pointer">
                        <span className="text-white font-medium text-[13px]">All</span>
                        <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none">6</span>
                    </div>
                    <div className="pb-2.5 flex items-center gap-1.5 cursor-pointer text-gray-500 text-[13px]">
                        <span>Projects</span>
                        <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none">3</span>
                    </div>
                    <div className="pb-2.5 flex items-center gap-1.5 cursor-pointer text-gray-500 text-[13px]">
                        <span className="hidden xs:inline">Announcements</span>
                        <span className="xs:hidden">Alerts</span>
                        <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none">3</span>
                    </div>
                </div>

                {notifications.map((notif, idx) => (
                    <div
                        key={notif.id}
                        className={`flex gap-3 px-5 py-4 ${idx !== notifications.length - 1 ? "border-b border-[#252636]" : ""}`}
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            {notif.avatar ? (
                                <img src={notif.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#252637" }}>
                                    <BellIcon className="w-4 h-4 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-0.5">
                                <h3 className="text-gray-100 font-semibold text-[12px] leading-snug pr-2">{notif.title}</h3>
                                {notif.unread && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 mt-1" />}
                            </div>
                            <p className="text-gray-500 text-[11px] mb-2 leading-snug">{notif.description}</p>
                            {notif.actions && (
                                <div className="flex gap-2 mb-2">
                                    {notif.actions.map((action) => (
                                        <button
                                            key={action}
                                            className="px-3 py-1 rounded-lg text-[11px] font-medium transition-all"
                                            style={
                                                action === "Verify now"
                                                    ? { background: "#7042f8", color: "#fff" }
                                                    : { background: "transparent", color: "#9ca3af", border: "1px solid #3d3f52" }
                                            }
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <span className="text-gray-600 text-[10px]">{notif.time}</span>
                        </div>
                    </div>
                ))}
            </motion.div>
        </div>
    );

    if (hideSection) return content;

    return (
        <section id="inbox" className="flex flex-col items-center justify-center h-full relative overflow-hidden py-12 sm:py-20 px-4">
            {content}
            <div className="w-full h-full absolute top-0 left-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-[#7042f820] blur-[120px] rounded-full z-[-1]" />
            </div>
        </section>
    );
};
