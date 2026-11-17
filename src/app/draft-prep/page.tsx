import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fantasy Draft Prep",
};

export default function DraftPrepHome() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-16">
      <Link href="/" className="text-sm text-foreground/60 hover:text-foreground">
        ← Fantasy Sports Hub
      </Link>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight">
        Fantasy Draft Prep
      </h1>
    </main>
  );
}
