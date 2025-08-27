import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export default function PolicyDialog({ open, onClose }){
  const [policy, setPolicy] = useState(null);
  useEffect(() => {
    if (!open) return;
    fetch(`${API}/policy`).then(r=>r.json()).then(setPolicy).catch(()=>setPolicy({ error: 'failed to load' }));
  }, [open]);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Active Policy</DialogTitle>
      <DialogContent>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace' }}>{JSON.stringify(policy, null, 2)}</pre>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}


