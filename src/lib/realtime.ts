import { useEffect, useState } from "react";

export interface RealtimeEvent {
  id: string;
  kind: string;
  title: string;
  at: string;
}

export function useRealtimeFeed(url = "/api/events"): RealtimeEvent[] {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  useEffect(() => {
    let source: EventSource | null = null;
    let stopped = false;
    try {
      source = new EventSource(url);
      source.onmessage = (msg) => {
        if (stopped) return;
        try {
          const data = JSON.parse(msg.data) as RealtimeEvent;
          setEvents((prev) => [data, ...prev].slice(0, 20));
        } catch {
          // ignore malformed frames
        }
      };
      source.onerror = () => {
        source?.close();
      };
    } catch {
      // SSE unavailable (static preview): stay silent with empty feed
    }
    return () => {
      stopped = true;
      source?.close();
    };
  }, [url]);

  return events;
}
