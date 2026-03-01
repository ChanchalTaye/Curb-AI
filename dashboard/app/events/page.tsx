import { fetchRecentEvents } from "@/lib/api";
import { checkBackendHealth } from "@/lib/api";

// Category colour map
const CATEGORY_COLORS: Record<string, string> = {
    navigation: "#7042f8",
    tab_management: "#06b6d4",
    page_engagement: "#22c55e",
    download: "#ef4444",
    session_timing: "#f59e0b",
    extension_change: "#a855f7",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
    const [events, isHealthy] = await Promise.all([
        fetchRecentEvents(50),
        checkBackendHealth(),
    ]);

    return (
        <main className="min-h-screen bg-[#030014] pt-24 pb-20 px-4 sm:px-6">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            className="w-2.5 h-2.5 rounded-full animate-pulse"
                            style={{ background: isHealthy ? "#22c55e" : "#ef4444" }}
                        />
                        <span
                            className="text-sm font-medium"
                            style={{ color: isHealthy ? "#22c55e" : "#ef4444" }}
                        >
                            {isHealthy ? "Backend Connected · localhost:8001" : "Backend Offline · Start Docker"}
                        </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
                        Live Event Feed
                    </h1>
                    <p className="text-gray-400 text-base max-w-xl">
                        Real-time browser activity captured by the CurbAI Chrome extension and stored in PostgreSQL.
                    </p>
                </div>

                {/* Stats bar */}
                {events.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
                        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
                            const count = events.filter((e) => e.event_category === cat).length;
                            return (
                                <div
                                    key={cat}
                                    className="rounded-xl border border-[#2a2b38] p-3 text-center"
                                    style={{ background: "#111218" }}
                                >
                                    <div className="text-2xl font-bold" style={{ color }}>{count}</div>
                                    <div className="text-[11px] text-gray-500 capitalize mt-1">
                                        {cat.replace("_", " ")}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Events table */}
                {events.length === 0 ? (
                    <div
                        className="rounded-2xl border border-[#2a2b38] p-16 text-center"
                        style={{ background: "#111218" }}
                    >
                        <div className="text-gray-500 text-lg mb-2">No events yet</div>
                        <p className="text-gray-600 text-sm max-w-sm mx-auto">
                            Install the Chrome extension, browse a few websites, and events will appear here automatically.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-2xl border border-[#2a2b38] overflow-hidden" style={{ background: "#111218" }}>
                        <div className="grid grid-cols-12 text-xs text-gray-500 px-5 py-3 border-b border-[#2a2b38] bg-[#16172a]">
                            <span className="col-span-3">Category · Type</span>
                            <span className="col-span-5">Payload</span>
                            <span className="col-span-2">Received</span>
                            <span className="col-span-2">Session</span>
                        </div>
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="grid grid-cols-12 px-5 py-3 border-b border-[#1a1b2e] last:border-0 hover:bg-[#13141f] transition-colors"
                            >
                                <div className="col-span-3 flex items-start gap-2">
                                    <span
                                        className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                        style={{ background: CATEGORY_COLORS[event.event_category] ?? "#888", marginTop: "6px" }}
                                    />
                                    <div>
                                        <div className="text-white text-xs font-medium capitalize">
                                            {event.event_category.replace("_", " ")}
                                        </div>
                                        <div className="text-gray-500 text-[11px]">{event.event_type}</div>
                                    </div>
                                </div>
                                <div className="col-span-5 text-gray-400 text-[11px] font-mono truncate pr-4 self-center">
                                    {JSON.stringify(event.payload).slice(0, 120)}
                                </div>
                                <div className="col-span-2 text-gray-600 text-[11px] self-center">
                                    {event.server_received_at
                                        ? new Date(event.server_received_at).toLocaleTimeString()
                                        : "—"}
                                </div>
                                <div className="col-span-2 text-gray-600 text-[11px] font-mono truncate self-center">
                                    {event.session_id?.slice(0, 8) ?? "—"}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
