import React from "react";

export default function AuthGate({ children }){
  const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === 'true';
  if (!requireAuth) return children;
  // simple placeholder, replace with real auth
  return (
    <div style={{ padding: 24 }}>
      <h3>Sign in required</h3>
      <p>Configure auth or set VITE_REQUIRE_AUTH=false to use without login.</p>
    </div>
  );
}


