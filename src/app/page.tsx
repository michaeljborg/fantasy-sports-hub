import Link from "next/link";

type AppEntry = {
  name: string;
  description: string;
  href: string;
};

const apps: AppEntry[] = [
  {
    name: "Fantasy Weekly Matchup Dashboard",
    description:
      "See this week's head-to-head matchup and which categories you're set to win, lose, or flip.",
    href: "/weekly-matchup",
  },
  {
    name: "Fantasy Draft Prep",
    description: "Prepare rankings and strategy ahead of your draft.",
    href: "/draft-prep",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">
        Fantasy Sports Hub
      </h1>
      <p className="mt-3 text-lg text-foreground/70">
        Your fantasy tools in one place.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {apps.map((app) => (
          <li
            key={app.name}
            className="flex flex-col rounded-xl border border-foreground/15 p-6"
          >
            <h2 className="text-lg font-medium">{app.name}</h2>
            <p className="mt-2 flex-1 text-sm text-foreground/70">
              {app.description}
            </p>
            <Link
              href={app.href}
              className="mt-6 inline-flex w-fit rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              Open
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
