/**
 * CurbAI API client — connects the Next.js dashboard to the Python Ingestion Service.
 * 
 * Backend URL defaults to http://localhost:8001 for local dev.
 * Set NEXT_PUBLIC_BACKEND_URL in .env.local to override for production.
 */

export const BACKEND_URL = "http://localhost:8001";

export interface BrowserEvent {
    id: string;
    event_category: string;
    event_type: string;
    event_timestamp: string;
    server_received_at: string;
    payload: Record<string, unknown>;
    session_id: string | null;
}

export interface EventsResponse {
    events: BrowserEvent[];
    total: number;
}

/** Fetch the most recent events from the Ingestion Service. */
export async function fetchRecentEvents(limit = 20): Promise<BrowserEvent[]> {
    try {
        const res = await fetch(`${BACKEND_URL}/ingest/events/recent?limit=${limit}`, {
            cache: "no-store",
        });
        if (!res.ok) throw new Error(`Backend responded ${res.status}`);
        const data: EventsResponse = await res.json();
        return data.events;
    } catch {
        return [];
    }
}

/** Check if the backend is reachable. */
export async function checkBackendHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${BACKEND_URL}/health`, { cache: "no-store" });
        return res.ok;
    } catch {
        return false;
    }
}
