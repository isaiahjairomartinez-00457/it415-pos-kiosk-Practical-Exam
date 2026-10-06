import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <div className="card max-w-lg p-8 text-center">
        <h1 className="text-2xl font-extrabold">Page not found</h1>
        <p className="mt-3 text-ink-muted">The requested kiosk page does not exist.</p>
        <Link className="button-primary mt-6 inline-flex" href="/">
          Return to kiosk
        </Link>
      </div>
    </main>
  );
}