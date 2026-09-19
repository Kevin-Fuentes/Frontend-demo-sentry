"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="wrap err-box">
      <h2>Algo salió mal 😵</h2>
      <p>El error fue reportado a Sentry.</p>
      <button className="btn" onClick={() => reset()}>Reintentar</button>
    </div>
  );
}
