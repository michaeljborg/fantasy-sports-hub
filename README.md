# Fantasy Sports Hub

Home page for fantasy sports tools:

- **Fantasy Weekly Matchup Dashboard** (in progress)
- **Fantasy Draft Prep** (coming soon)

## Run locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Theme & style

- **Design tokens:** `src/styles/theme.css`. Colors, fonts, radius, shadows and easing all live here. Each color is `light-dark(light, dark)`, and the app follows the OS theme.
- **Motion:** `src/styles/motion.css`. Page transitions use React `<ViewTransition>`: `nav-forward` slides left, `nav-back` slides right, and the app icon morphs between pages.
- **Apps registry:** `src/lib/apps.ts`. Name, route, accent color and tags for each app on the hub.
- Components use semantic classes only (`bg-surface`, `text-fg-muted`, `border-border`, `text-(--accent)` …), so restyle by editing tokens, not components.
