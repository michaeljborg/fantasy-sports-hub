import type { Metadata } from "next";
import { draftApp, DraftShell } from "@/components/draft/draft-shell";

export const metadata: Metadata = {
  title: { default: draftApp.name, template: `%s · ${draftApp.shortName}` },
};

export default function HockeyLayout({ children }: LayoutProps<"/draft-prep/hockey">) {
  return <DraftShell sport="hockey">{children}</DraftShell>;
}
