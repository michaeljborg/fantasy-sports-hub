import type { Metadata } from "next";
import { draftApp, DraftShell } from "@/components/draft/draft-shell";

export const metadata: Metadata = {
  title: { default: draftApp.name, template: `%s · ${draftApp.shortName}` },
};

export default function FootballLayout({ children }: LayoutProps<"/draft-prep/football">) {
  return <DraftShell sport="football">{children}</DraftShell>;
}
