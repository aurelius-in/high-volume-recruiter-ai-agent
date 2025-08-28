import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { Auth0Provider } from "@auth0/auth0-react";
import * as Sentry from "@sentry/react";

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
if (SENTRY_DSN) {
  Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 0.2 });
}

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {auth0Domain && auth0ClientId ? (
      <Auth0Provider domain={auth0Domain} clientId={auth0ClientId} authorizationParams={{ redirect_uri: window.location.origin, audience: auth0Audience }}>
        <App />
      </Auth0Provider>
    ) : (
      <App />
    )}
  </React.StrictMode>
);


