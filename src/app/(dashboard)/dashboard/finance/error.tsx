"use client";

import { useEffect } from "react";

export default function FinanceError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Finance page error:", error);
    console.error("Stack:", error.stack);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-8">
      <div className="text-center space-y-2 max-w-lg">
        <h2 className="text-lg font-semibold text-red-500">Finance Error</h2>
        <p className="text-sm text-muted-foreground">{String(error.message)}</p>
        {error.stack && (
          <pre className="text-[10px] text-muted-foreground/60 text-left bg-muted/20 p-3 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap">
            {String(error.stack).slice(0, 1000)}
          </pre>
        )}
        {error.digest && <p className="text-xs text-muted-foreground/60 font-mono">Digest: {error.digest}</p>}
      </div>
      <button onClick={reset} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
        Try again
      </button>
    </div>
  );
}
