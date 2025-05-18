# FlashMaster: Your Smart Flashcard Companion

## For Users: Master Anything, Effortlessly

FlashMaster is a modern, intuitive flashcard application designed to help you learn and retain information effectively. Powered by intelligent scheduling and a clean, user-friendly interface, it adapts to your learning style, ensuring you review material at the optimal time.

**Key Features You'll Love:**

*   **Smart Flashcards:** Create and review flashcards with a smooth, interactive experience. Flip cards with a click (or Space/Enter key), and tell the app how well you knew the answer.
*   **Accessible Design:** Enhanced with ARIA attributes for screen reader compatibility.
*   **Keyboard Navigation:** Navigate through cards in a study session using Left/Right arrow keys. Flip cards using Space or Enter.
*   **Delightful Interactions:** Enjoy subtle micro-animations (like a "pop" on XP gain in the header) and sound effects (a "pop" sound when you earn XP) that make learning more engaging.
*   **Multi-Language Support:** Choose your preferred language (currently English, Spanish, & Hindi, with more to come!) for the app interface.
*   **Shareable Decks:** Easily share your decks with friends or students by copying a unique link. Opening the link allows others to import the deck into their own FlashMaster app.
*   **Adaptive Learning (SM-2 Algorithm):** Our intelligent system learns how well you know each card and schedules reviews accordingly. Cards you struggle with appear more often, while familiar cards are shown less frequently, maximizing your learning efficiency.
*   **Personalized Dashboard:** Track your progress at a glance! See your learning streaks, daily review goals, experience points (XP), and current level.
*   **Insightful Statistics:** Dive deeper into your learning habits with beautiful charts showing your review counts (today, this week, this month) and study accuracy over time.
*   **Effortless Deck Management:** Easily create new decks of flashcards, add, edit, or delete individual cards within your decks.
*   **Stay Motivated:** Earn XP for reviewing cards (with a satisfying pop sound and animation!), watch your level increase, and maintain your study streak! Get a burst of confetti for completing study sessions and leveling up.
*   **Your Data, Your Control:** Export all your decks, cards, and progress data into a single JSON file. Import data to restore your information or transfer it between devices.
*   **Light & Dark Modes:** Study comfortably, day or night, with a sleek theme toggle.
*   **Daily Reminders:** Enable notifications to get a friendly nudge when it's time for your daily review session (browser-based reminders).
*   **Responsive Design:** Enjoy a seamless experience whether you're on your desktop, tablet, or mobile phone.

**User Flow:**

1.  **Home Page:** View all your decks. Each deck shows its name, description, total cards, and how many cards are currently due for review.
2.  **Create Deck:** Click "Create New Deck," give it a name, description, and optional tags.
3.  **Deck Detail Page:** View all cards in a specific deck. Add new cards, edit or delete existing ones. Click "Copy Share Link" to get a unique URL to distribute this deck. See stats specific to that deck.
4.  **Study Session:** Start a study session for a deck. Review cards one by one (navigate with arrow keys, flip with Space/Enter). After revealing the answer, rate your recall (Forgot, Hard, Good, Easy). The app uses this to schedule the next review.
5.  **Import Shared Deck:** Open a shared deck link (e.g., `/#/import-shared-deck?data=...`). The app shows details of the shared deck and offers an option to import it into your collection.
6.  **Stats Page:** See your overall progress, including review history, accuracy charts, current streak, XP, level, and daily goal progress.
7.  **Settings Page:** Customize your experience: toggle dark mode, select application language, manage notification preferences (enable/disable, set reminder time), set daily study goals, and import/export your application data.

---

## For Developers: Technical Overview

This project is a front-end only spaced-repetition flashcard engine built with a modern React-centric tech stack, emphasizing clean code, modularity, and a good developer experience.

**Core Architecture & Features Implemented:**

*   **Framework:** React (v18+ with Hooks) and TypeScript for robust, type-safe development.
*   **State Management:** Zustand for centralized, reactive state management. Stores are consolidated into `src/store/index.ts` and include:
    *   `useDeckStore`: Manages decks (CRUD), including which cards belong to each deck.
    *   `useCardStore`: Manages individual cards (CRUD), SM-2 scheduling logic (`reviewCard` action), and selectors for due cards.
    *   `useStatsStore`: Tracks user statistics (streak, XP, level, total cards reviewed, total study time) and review session history.
    *   `useUIStore`: Manages UI-related state like user preferences (dark mode, notifications enabled, reminder time, daily goal).
*   **Persistence:** All Zustand stores leverage `persist` middleware with `localforage` (IndexedDB abstraction) to save application state in the browser. Configuration in `src/services/storage.ts`.
*   **Styling:** Tailwind CSS for utility-first styling, with custom theming for light and dark modes defined in `src/index.css`.
*   **Routing:** `react-router-dom` for client-side navigation (`App.tsx`, `src/pages/*`).
*   **Internationalization (i18n):**
    *   Uses `i18next` and `react-i18next` for multi-language support.
    *   Translations loaded from JSON files in `public/locales`.
    *   Language detection and a basic switcher implemented in Settings.
    *   Currently supports English, Spanish, and Hindi.
*   **Deck Sharing (Client-Side):**
    *   Allows users to generate a shareable URL for a deck.
    *   Deck data (name, description, tags, and cards content) is serialized, compressed using `pako` (zlib), and Base64 encoded into a URL query parameter.
    *   A dedicated route (`/import-shared-deck`) handles these URLs, allowing users to decode and import the shared deck into their local storage.
    *   Helper functions for encoding/decoding are in `src/utils/shareUtils.ts`.
*   **SM-2 Algorithm:** Custom implementation in `src/utils/sm2.ts`, integrated into `useCardStore` for adaptive card review scheduling.
*   **Charts & Visualizations:** `recharts` library used in `src/components/StatsChart.tsx` to display review counts and accuracy graphs.
*   **Component Structure:** Code is organized into reusable components located in `src/components` (e.g., `FlashCard.tsx`, `DeckList.tsx`, `StatsChart.tsx`, `Navigation.tsx`, `Layout.tsx`, UI elements in `src/components/ui`).
    *   Enhanced for accessibility with ARIA attributes.
*   **Keyboard Support:** Implemented for core study interactions (card flipping, navigation).
*   **Date & Time Logic:** `date-fns` used for all date calculations and formatting (e.g., scheduling, relative dates, stats grouping).
*   **Unique IDs:** `uuid` (v4) for generating unique IDs for decks, cards, and review sessions.
*   **Data Import/Export:** Functionality in `src/services/storage.ts` and `src/components/Settings.tsx` to export/import the entire application state (all Zustand stores) as a single JSON file (version 2 format).
*   **Notifications:** Browser-based local notifications. `src/utils/notifications.ts` handles permission requests and scheduling (using `setTimeout`). A Service Worker (`public/service-worker.js`) is registered and used to *display* notifications when messaged by the client, providing a more integrated feel.
*   **Gamification:**
    *   XP points awarded for card reviews (`useStatsStore`, `sm2.ts`).
    *   Leveling system based on XP.
    *   Streak counter updated on daily study (`useStatsStore`).
    *   Confetti (`canvas-confetti`) on study session completion and level-ups (`StudyPage.tsx`).
    *   Stats (Streak, XP, Level) displayed in the main navigation header (`Navigation.tsx`) with a pop animation on XP gain.
    *   Sound effect on XP gain.
*   **Testing:** Jest and React Testing Library are set up. Configuration in `package.json`. Example unit tests (`src/utils/__tests__/sm2.test.ts`) and component tests (`src/components/__tests__/DeckForm.test.tsx`) are provided.
*   **Linting & Formatting:** ESLint and Prettier are configured (in `package.json` and config files) to maintain code quality and consistency.
*   **Build Tool:** Vite serves as the build tool and development server.
*   **CI/CD:** A basic GitHub Actions workflow (`.github/workflows/ci.yml`) is set up for linting, testing, and optionally building the project on pushes/pull requests.
*   **Responsive Design:** Tailwind CSS facilitates responsive layouts. Key components and pages are designed to adapt to various screen sizes.
*   **Accessibility (A11y):** Initial ARIA tagging and keyboard navigation implemented. Further audit and improvements are potential enhancements.

**Folder Structure Highlights:**

*   `public/`: Static assets, including `service-worker.js` and `locales/` for translation files.
*   `src/`: Main application source code.
    *   `components/`: Reusable React components.
        *   `ui/`: Generic UI elements (likely from ShadCN/UI).
        *   `__tests__/`: Component tests.
    *   `hooks/`: Custom React hooks (if any).
    *   `lib/`: Utility functions, type definitions if not in `utils` or `types`.
    *   `pages/`: Top-level components representing application pages/routes (includes `ImportSharedDeckPage.tsx`).
    *   `services/`: Modules for external interactions (e.g., `storage.ts`).
    *   `store/`: Zustand state management (`index.ts` for consolidated store).
    *   `types/`: TypeScript type definitions (`index.ts`).
    *   `utils/`: General utility functions (`sm2.ts`, `dateUtils.ts`, `helpers.ts`, `notifications.ts`, `shareUtils.ts`).
        *   `__tests__/`: Unit tests for utilities.
    *   `App.tsx`: Root application component, router setup.
    *   `main.tsx`: Application entry point.
    *   `index.css`: Global styles, Tailwind CSS setup, theme variables.
*   `.github/workflows/`: GitHub Actions CI/CD workflows.

**Further Development Considerations & Potential Enhancements:**

*   **Expand Translations:** Add more languages and translate all user-facing strings.
*   **Markdown Deck Import/Export:** Implement parsing/formatting for deck content in Markdown.
*   **Comprehensive Test Coverage:** Expand unit, component, and integration tests to cover more scenarios and edge cases.
*   **Advanced PWA Features:** Enhance offline capabilities with more sophisticated caching strategies in the service worker.
*   **Accessibility (A11y) Audit:** Conduct a thorough review and implement improvements for accessibility.
*   **User Onboarding/Tour:** Guide new users through the application's features.
*   **Performance Optimization:** Profile and optimize critical components or state updates if needed for very large datasets. Consider URL length limitations for the deck sharing feature.
*   **Bulk Card Management:** Features like bulk editing or moving cards between decks.

