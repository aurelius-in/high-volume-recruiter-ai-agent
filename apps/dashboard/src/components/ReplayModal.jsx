import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

export default function ReplayModal({ open, onClose, events }){
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!open || !events?.length) return;
    setIdx(0);
    let i = 0;
    const timer = setInterval(() => {
      i = i + 1;
      if (i >= events.length) {
        clearInterval(timer);
      } else {
        setIdx(i);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [open, events]);

  const current = events?.[idx];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Replay Conversation</DialogTitle>
      <DialogContent>
        {current ? (
          <div>
            <Typography variant="body2" gutterBottom>
              <span style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Noto Sans", Arial, Helvetica, "Apple Color Emoji", "Segoe UI Emoji"' }}>
                {new Date(current.ts * 1000).toLocaleTimeString()}
              </span> — {current.actor} :: {current.action}
            </Typography>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace' }}>{JSON.stringify(current.payload, null, 2)}</pre>
            <Typography variant="caption">Step {idx+1} of {events.length}</Typography>
          </div>
        ) : (
          <Typography variant="body2">No events to replay.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}


