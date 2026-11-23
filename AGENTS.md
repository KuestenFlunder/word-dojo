This is an Expo/React Native application: an English vocabulary trainer for a child (grade 5/6) with dyslexia. It runs on the web (static export, publicly hosted) and on the iPad. Prioritize cross-platform compatibility (web + iOS tablet, portrait and landscape) and performance.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npm start                   # start the dev server
npm run web                 # start the dev server and open the web app
npm test                    # Jest (jest-expo)
npm run typecheck           # tsc --noEmit
npm run build:web           # static web export into dist/ (expo export -p web)
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run tests and typecheck before declaring any task done. For changes that touch screens or configuration, also run `npm run build:web`: the static export renders every route in Node, so code that touches `window` or storage outside an effect breaks there first.

## Structure

- `src/app/` — Expo Router routes. Every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code outside `src/app/`.
- `src/data/` — vocabulary sets (`VocabSet`), one file per unit part, registered in `src/data/index.ts`. Word `id`s are persisted in the child's progress: never rename or reuse them.
- `src/learning/` — learning logic (Leitner boxes, spelling check and diff, writing reducer, session, rewards, persistence). Pure functions, no React, fully tested. Rule changes belong here, not in screens.
- `assets/art/`, `tools/art/` — illustrations and their tooling.
- Import alias: `@/*` → `src/*`.

## Learning rules that must hold

- Never punish: stars are only ever added. A wrong written answer costs nothing; the child copies the correct word until it matches, then moves on.
- Progress (box) is tracked per word AND per mode (`en-de`, `de-en`, `schreiben`).
- Everything is stored locally through the `ProgressStorage` interface (AsyncStorage; `localStorage` on the web). No login, no network.

## Navigation & Routing

- Use **Expo Router** for all navigation. Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries. Docs: https://docs.expo.dev/versions/latest/index.md
- Every dependency must work on the web too; check before adding.
