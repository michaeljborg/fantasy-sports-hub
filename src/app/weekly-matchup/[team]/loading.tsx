/**
 * Every page under [team] reads `params`, which can't be in the shared App Shell.
 * This boundary keeps the layout (header, tabs) instant while the page streams in.
 */
export default function Loading() {
  return <div aria-busy="true" className="min-h-96" />;
}
