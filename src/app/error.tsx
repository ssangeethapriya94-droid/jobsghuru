"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // If Next.js internal redirect or not-found error, let Next.js handle it
  if (
    error?.message === "NEXT_REDIRECT" ||
    error?.digest?.startsWith("NEXT_REDIRECT") ||
    error?.message === "NEXT_NOT_FOUND" ||
    error?.digest?.startsWith("NEXT_NOT_FOUND")
  ) {
    throw error;
  }

  return (
    <div className="container-x py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted">We couldn't load this page. Try again in a moment.</p>
      <button onClick={reset} className="btn-primary mt-6">
        Try again
      </button>
    </div>
  );
}
