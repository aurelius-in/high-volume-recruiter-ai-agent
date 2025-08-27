import React from "react";

export default function TimezoneFooter(){
  const now = new Date();
  const ksa = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }));
  return (
    <div style={{ padding: 8, textAlign: "right", color: "#666", fontSize: 12 }}>
      Local: {now.toLocaleTimeString()} • KSA: {ksa.toLocaleTimeString("en-GB", { hour12: false })}
    </div>
  );
}


