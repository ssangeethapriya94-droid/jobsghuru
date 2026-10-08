export default function Loading() {
  return <div className="container-x py-10" aria-busy="true"><div className="grid gap-4 md:grid-cols-3">
    {[0, 1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-xl bg-line/60" />)}</div></div>;
}
