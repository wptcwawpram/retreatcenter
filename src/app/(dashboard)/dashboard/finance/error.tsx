"use client";

import { useEffect } from "react";

export default function FinanceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Finance page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="text-center space-y-2">
        <h2 className="text-lg font-semibold text-red-500">Finance Error</h2>
        <p className="text-sm text-muted-foreground max-w-md">{error.message}</p>
        {error.digest && <p className="text-xs text-muted-foreground/60 font-mono">Digest: {error.digest}</p>}
      </div>
      <button onClick={reset} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
        Try again
      </button>
    </div>
  );
}
