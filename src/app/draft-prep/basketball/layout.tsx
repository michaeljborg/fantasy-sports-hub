import type { Metadata } from "next";
import { draftApp, DraftShell } from "@/components/draft/draft-shell";

export const metadata: Metadata = {
  title: { default: draftApp.name, template: `%s · ${draftApp.shortName}` },
};

export default function BasketballLayout({ children }: LayoutProps<"/draft-prep/basketball">) {
  return <DraftShell sport="basketball">{children}</DraftShell>;
}
