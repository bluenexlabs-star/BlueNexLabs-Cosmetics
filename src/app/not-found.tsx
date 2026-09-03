export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="display text-3xl text-navy-900">Page not found</h1>
      <p className="mt-3 text-slate-600">
        That URL is not in the catalog or the research hub.
      </p>
      <a href="/shop" className="mt-6 inline-block text-cyan-800 underline">
        Back to shop
      </a>
    </div>
  );
}
