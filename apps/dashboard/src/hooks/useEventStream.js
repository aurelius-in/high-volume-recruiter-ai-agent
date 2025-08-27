import { useEffect, useRef } from "react";

export function useEventStream(url, onEvent) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    if (!url) return;
    const es = new EventSource(url, { withCredentials: false });
    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        handlerRef.current?.({ type: "message", data });
      } catch (_) {
        // ignore parse errors
      }
    };
    es.addEventListener("audit", (evt) => {
      try {
        const data = JSON.parse(evt.data);
        handlerRef.current?.({ type: "audit", data });
      } catch (_) {}
    });
    es.onerror = () => {
      // browser will retry automatically
    };
    return () => es.close();
  }, [url]);
}


