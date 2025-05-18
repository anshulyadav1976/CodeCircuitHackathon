import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DeckDetailPage from './pages/DeckDetailPage';
import StudyPage from './pages/StudyPage';
import StudyDeckListPage from './pages/StudyDeckListPage';
import CreateDeckPage from './pages/CreateDeckPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from "./pages/NotFound";
import ImportSharedDeckPage from './pages/ImportSharedDeckPage';
import { useUIStore } from './store';

// Initialize query client
const queryClient = new QueryClient();

// Initialize Zustand store persistence

const App = () => {
  // Register service worker for notifications
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(error => {
          console.log('Service worker registration failed:', error);
        });
      });
    }
  }, []);

  // Effect for Dark Mode
  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Apply initial theme from store
    applyTheme(useUIStore.getState().preferences.darkMode);

    // Subscribe to theme changes
    const unsubscribe = useUIStore.subscribe(
      (state) => state.preferences.darkMode,
      (isDark) => applyTheme(isDark)
    );

    return () => {
      unsubscribe(); // Cleanup subscription on unmount
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="decks/new" element={<CreateDeckPage />} />
              <Route path="decks/:deckId" element={<DeckDetailPage />} />
              <Route path="study" element={<StudyDeckListPage />} />
              <Route path="study/:deckId" element={<StudyPage />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="import-shared-deck" element={<ImportSharedDeckPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
