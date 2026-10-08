import Link from "next/link";
export default function NotFound() {
  return <div className="container-x py-24 text-center"><h1 className="font-display text-3xl font-bold">Page not found</h1>
    <p className="mt-2 text-muted">This job may have expired or been removed.</p><Link href="/jobs" className="btn-primary mt-6">Browse jobs</Link></div>;
}
