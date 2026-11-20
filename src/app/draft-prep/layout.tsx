import { DraftProvider } from "@/components/draft/draft-state";
import { getDraftPool } from "@/lib/draft/draft";

/** Shares draft state across sports and tabs. */
export default function DraftPrepLayout({ children }: LayoutProps<"/draft-prep">) {
  return <DraftProvider pool={getDraftPool()}>{children}</DraftProvider>;
}
