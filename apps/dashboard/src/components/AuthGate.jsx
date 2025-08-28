import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

export default function AuthGate({ children }){
  const requireAuth = import.meta.env.VITE_REQUIRE_AUTH === 'true';
  if (!requireAuth) return children;
  // Only call the hook when auth is required to avoid runtime errors if Provider is absent
  const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  if (isLoading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!isAuthenticated) {
    return (
      <div style={{ padding: 24 }}>
        <h3>Sign in required</h3>
        <button onClick={() => loginWithRedirect()}>Sign in</button>
        <p>Set VITE_REQUIRE_AUTH=false to disable auth in local demos.</p>
      </div>
    );
  }
  return (
    <div>
      <div style={{ textAlign: 'right', padding: 8 }}>
        <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Sign out</button>
      </div>
      {children}
    </div>
  );
}


