
// Card-related types
export interface Card {
  id: string;
  front: string;
  back: string;
  deckId: string;
  createdAt: number;
  updatedAt: number;
  lastReviewed?: number;
  // SM-2 algorithm fields
  easinessFactor: number; // initial value: 2.5
  repetitions: number; // number of successful repetitions
  interval: number; // interval in days
  dueDate: number; // timestamp for next review
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  cardIds: string[]; // References to cards
  tags?: string[];
}

// SM-2 review result
export enum ReviewResult {
  FORGOT = 0, // Complete blackout
  HARD = 1, // Incorrect but familiar
  GOOD = 2, // Correct with difficulty
  EASY = 3, // Correct without difficulty
}

// Review stats
export interface ReviewSession {
  id: string;
  date: number; // timestamp of session
  deckId: string;
  duration: number; // in ms
  cardsReviewed: {
    cardId: string;
    result: ReviewResult;
  }[];
}

// User preferences
export interface UserPreferences {
  darkMode: boolean;
  notificationsEnabled: boolean;
  reminderTime?: string; // in HH:MM format
  dailyGoal: number; // Number of cards to review per day
}

// User stats
export interface UserStats {
  streak: number;
  lastStudyDate?: number;
  totalCardsReviewed: number;
  totalStudyTime: number;
  xpPoints: number;
  level: number;
}

// Store state types
export interface CardState {
  cards: Record<string, Card>;
  loading: boolean;
  error: string | null;
  
  // Card actions
  addCard: (card: Card) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  setCardDueDate: (id: string, dueDate: number) => void;
}

export interface DeckState {
  decks: Record<string, Deck>;
  activeDeckId: string | null;
  loading: boolean;
  error: string | null;
  
  // Deck actions
  addDeck: (deck: Deck) => void;
  updateDeck: (id: string, updates: Partial<Deck>) => void;
  deleteDeck: (id: string) => void;
  setActiveDeck: (deckId: string | null) => void;
  addCardToDeck: (deckId: string, cardId: string) => void;
  removeCardFromDeck: (deckId: string, cardId: string) => void;
}

export interface StatsState {
  reviewSessions: ReviewSession[];
  userStats: UserStats;
  loading: boolean;
  error: string | null;
  
  // Stats actions
  addReviewSession: (session: ReviewSession) => void;
  updateStreak: (date: number) => void;
  addXP: (points: number) => void;
  incrementCardsReviewed: (count?: number) => void;
  addStudyTime: (timeMs: number) => void;
}

export interface UIState {
  preferences: UserPreferences;
  isCardFlipped: boolean;
  currentView: 'decks' | 'review' | 'edit' | 'stats';
  
  // UI actions
  toggleDarkMode: () => void;
  toggleCardFlip: () => void;
  setCardFlip: (flipped: boolean) => void;
  setCurrentView: (view: 'decks' | 'review' | 'edit' | 'stats') => void;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}
