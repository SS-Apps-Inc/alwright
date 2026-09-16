# Alwright

Alwright is a small social writing app for people who want to post thoughts without the usual social-feed noise. The app is intentionally simple: write a post, choose how your page looks, decide what is public, and let people read it from a clean public web page.

The mobile app is where users sign in, post, edit their page, manage preferences, and handle billing. The web experience is public-facing: a landing page, a public feed, privacy/terms pages, and public user pages.

## What We Are Building

Alwright is not trying to be another attention-heavy social network. The main idea is:

- Write short posts with simple constraints.
- Keep a personal feed that can auto-load the latest posts or let the user choose when to load them.
- Let users design their own public page layout and post style.
- Let readers view the public feed and user pages on the web without logging in.
- Keep the app privacy-aware: users can choose whether their profile icon links to their page and whether others can copy post text.
- Support free, Starter, and Pro posting limits through RevenueCat and Supabase.

## Current Routes

Web routes:

- `/` - public landing page
- `/feed` - public feed
- `/privacy` - privacy policy
- `/terms` - terms
- `/{userId}` - public user page

Mobile app areas:

- Phone login
- Feed
- Add post
- My page and post editing
- Page preferences
- Settings, billing, account deletion, and data export

## Tech Stack

- Expo
- React Native
- Expo Router
- Supabase
- RevenueCat
- TypeScript

The app shares UI between native and web where it makes sense, with public web export support for static hosting.

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Fill in your local values:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_REVENUECAT_API_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=
```

Start development:

```bash
npx expo start
```

Run web locally:

```bash
npm run web
```

Build static web output for hosting:

```bash
npm run build:web
```

The generated site is written to `dist/`.

## Project Structure

- `app/` - Expo Router screens and route files
- `src/design-system/` - shared UI primitives and tokens
- `src/features/` - feature modules such as feed, posts, billing, marketing, and user pages
- `src/memory/` - local memory and persistent storage helpers
- `src/network/` - Supabase API and data mapping layer
- `supabase/` - SQL files for database tables, RPCs, and policies
- `public/` - static web assets and hosting files
- `scripts/` - build helper scripts

## Contributing

This repository is public so other developers can help improve Alwright. Useful contributions include:

- Cleaning up duplicated UI or business logic.
- Improving feed memory/cache behavior.
- Improving accessibility and responsive web layout.
- Hardening Supabase policies and RPCs.
- Improving RevenueCat billing sync.
- Adding focused tests around posting limits, referrals, account deletion, and public feed behavior.
- Improving Android performance and memory usage.

Before opening a pull request, run:

```bash
npx tsc --noEmit
npm run lint
```

Keep changes small and focused. If a change touches database behavior, include the Supabase SQL needed to apply it.

## Security Notes

Do not commit secrets. Real environment values, signing files, keystores, service account files, APK/AAB builds, native generated folders, and local Expo state are ignored by `.gitignore`.

Use `.env.example` to document required variables without exposing real keys.

## Status

Alwright is still evolving. The current focus is making the codebase more modular, improving public web behavior, keeping feed memory efficient, and making billing/posting rules reliable.
