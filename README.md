# Carbon Codex

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to optimize and load Inter while preferring the system "Segoe UI" in the font stack for a Segoe-style look.

## Design and UI

- Color palette (dark, minimal):
  - Background: `#09090b`
  - Cyan (primary-1): `#00F5FF`
  - Magenta (primary-2): `#FF00E5`
  - Violet: `#A78BFA`
  - Text gray: `#CBD5E1`

- **Header components:**
  - Custom SVG logo (`carboncodex.svg`) in public folder
  - Logo and site name are clickable links to home page
  - Navigation uses Next.js `Link` components for optimal routing
  - Globe icon from `react-icons/hi2` for language switcher
  - All colors use CSS variables for consistency
  - Reusable `NavLink` component reduces code duplication

- **Navigation behavior:**
  - Links use **magenta** (`var(--magenta)`) underline that animates from left to right on hover
  - Active links show full **magenta** underline
  - Text color stays default (from CSS), no inline color changes on hover/active
  - **Root paths (`/`, `/en`, `/es`) never show as active** — no underline
  - Active detection only works for sub-routes like `/categories`, `/writers`, `/survey`
  - Mobile menu with hamburger toggle and persistent state

- **Reusable button classes in `app/globals.css`:**
  - `.btn-primary` — solid cyan background, dark text, violet on hover
  - `.btn-secondary` — transparent with violet border/text, cyan on hover

- **Available routes:**
  - `/{locale}` — Home page (no active nav state)
  - `/{locale}/categories` — Categories page
  - `/{locale}/writers` — Writers page
  - `/{locale}/survey` — Survey page
  
  Where `{locale}` is either `en` or `es`.

Note: Segoe UI is not served by Google Fonts. We prefer the system-installed "Segoe UI" via the CSS stack and load Inter via `next/font` as a close, well-hinted fallback.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
