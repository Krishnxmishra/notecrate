"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ padding: 40, fontFamily: "monospace" }}>
        <h2>Something went wrong!</h2>
        <pre style={{ color: "red", whiteSpace: "pre-wrap" }}>
          {error.message}
        </pre>
        <pre style={{ color: "#666", whiteSpace: "pre-wrap", fontSize: 12 }}>
          {error.stack}
        </pre>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
