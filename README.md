# FlashMaster Pro: Spaced Repetition Flashcards

FlashMaster Pro is a modern, front-end only spaced repetition flashcard application designed to optimize learning and memorization. Built with React, TypeScript, and Tailwind CSS, it leverages the SM-2 algorithm for efficient study scheduling. This project emphasizes an excellent user experience (UX), polished visual design, robust functionality, and high-quality code.

## ✨ Key Features

*   **Deck Management**: Create, edit, and delete decks of flashcards.
*   **Card Management**: Add, modify, and delete cards within decks. Cards support Markdown for rich text formatting.
*   **Spaced Repetition System (SRS)**: Utilizes the scientifically-proven SM-2 algorithm to schedule card reviews for optimal learning.
*   **Study Sessions**: Engage in focused study sessions with due cards.
*   **Progress Tracking & Statistics**:
    *   **Dashboard**: View detailed statistics on study habits.
    *   **Charts**: Visualize daily review counts, learning accuracy (daily/weekly/monthly views) using `recharts`.
    *   **Streaks**: Track consecutive days of study.
    *   **XP & Levels**: Earn experience points (XP) for studying and level up, providing a gamified learning experience.
*   **Data Management**:
    *   **Import/Export**: Securely back up and restore your data (decks, cards, stats) using JSON format. Includes versioning for future compatibility.
    *   **AI-Assisted Flashcard Generation**: Copy a detailed prompt from the settings page to provide to an AI (like ChatGPT, Claude, Gemini) for generating flashcard data in the correct JSON format, ready for import.
    *   **Local Storage**: All data is stored locally in the browser using `localforage` for persistence and offline access.
*   **Customization & Personalization**:
    *   **Dark/Light Mode**: Switch between themes for comfortable viewing.
    *   **Study Reminders**: Set up push notifications to remind you to study (requires service worker support).
*   **Gamification**:
    *   Confetti animation on level-up.
    *   Sound feedback on XP gain.
    *   Visual "pop" animation for XP.
*   **Shareable Decks**:
    *   Generate unique URLs to share decks with others.
    *   Decks are compressed and encoded directly in the URL for easy client-side import.
*   **Internationalization (i18n)**:
    *   Supports multiple languages: English (default), Spanish, Hindi.
    *   Easily extensible for more languages.
*   **Accessibility**:
    *   Keyboard navigation for flashcard flipping and study progression.
    *   ARIA attributes for improved screen reader compatibility.
*   **User Experience**:
    *   Intuitive and clean user interface.
    *   Micro-interactions for a more engaging experience.

## 🛠️ Tech Stack

*   **Core Framework**: React 18+
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **State Management**: Zustand (with `immer` for immutable updates and `persist` middleware)
*   **Client-Side Storage**: `localforage` (IndexedDB, WebSQL, localStorage fallback)
*   **Routing**: `react-router-dom` v6
*   **Spaced Repetition Algorithm**: SM-2
*   **Charting**: `recharts`
*   **Date/Time Utilities**: `date-fns`
*   **Unique IDs**: `uuid`
*   **Notifications**: Browser Push API (via Service Worker)
*   **Animations & Effects**: CSS Animations, `canvas-confetti`
*   **Data Compression (for sharing)**: `pako`
*   **Internationalization**: `i18next`, `react-i18next`, `i18next-http-backend`, `i18next-browser-languagedetector`
*   **Icons**: `lucide-react`
*   **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm or yarn

### Installation

1.  **Clone the repository (if applicable) or download the source code.**
    ```bash
    # git clone 
    # cd project
    ```

2.  **Navigate to the project directory.**

3.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
2.  Open your browser and navigate to `http://localhost:5173` (or the port specified in your Vite config/console output).

### Building for Production

1.  **Create a production build:**
    ```bash
    npm run build
    # or
    yarn build
    ```
    This will create an optimized static build in the `dist` folder.

2.  **Preview the production build locally (optional):**
    ```bash
    npm run preview
    # or
    yarn preview
    ```

## 🔧 Key Technical Implementations

*   **State Management (`src/store/index.ts`)**: Centralized Zustand stores (`useCardStore`, `useDeckStore`, `useStatsStore`, `useUIStore`) manage all application state. `immer` ensures safe and easy immutable state updates, while `persist` middleware (configured with `localforage`) handles data persistence.
*   **SM-2 Algorithm (`src/utils/sm2.ts`, integrated into `useCardStore`)**: The core logic for spaced repetition is encapsulated and used by the card store to update review schedules.
*   **Service Worker for Notifications (`public/service-worker.js`)**: Enables background push notifications for study reminders. Managed via `src/utils/notifications.ts`.
*   **Shareable Deck URLs (`src/utils/shareUtils.ts`)**: Decks are serialized to JSON, compressed with `pako`, and Base64 encoded to create a shareable string. A dedicated route (`/import-shared-deck`) handles decoding and importing these decks.
*   **Internationalization (`src/i18n.ts`)**: Configures `i18next` to load translations from `/public/locales/{{lng}}/translation.json` and detect user language.
