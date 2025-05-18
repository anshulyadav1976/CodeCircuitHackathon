import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import { calculateNextInterval, calculateXP as calculateXPointsFromReview } from '../utils/sm2';
import { 
  Card, 
  Deck, 
  ReviewSession, 
  UserPreferences, 
  UserStats,
  CardState,
  DeckState,
  StatsState,
  UIState,
  ReviewResult
} from '../types';

// Card store
interface EnhancedCardState {
  cards: Record<string, Card>;
  addCard: (cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'easinessFactor' | 'repetitions' | 'interval' | 'dueDate'> & { deckId: string }) => Card;
  updateCard: (id: string, updates: Partial<Omit<Card, 'id'>>) => void;
  deleteCard: (id: string) => void;
  reviewCard: (cardId: string, result: ReviewResult) => void;
  getDueCardsForDeck: (deckId: string, allCards: Record<string, Card>, decks: Record<string, Deck>) => Card[];
  getDueCardsAll: (allCards: Record<string, Card>) => Card[];
}

export const useCardStore = create<EnhancedCardState>()(
  persist(
    immer((set, get) => ({
      cards: {},
      addCard: (cardData) => {
        const newId = uuidv4();
        const now = Date.now();
        const newCard: Card = {
          front: cardData.front,
          back: cardData.back,
          deckId: cardData.deckId,
          id: newId,
          createdAt: now,
          updatedAt: now,
          easinessFactor: 2.5,
          repetitions: 0,
          interval: 0,
          dueDate: now,
        };
        set((state) => {
          state.cards[newId] = newCard;
        });
        return newCard;
      },
      updateCard: (id, updates) => set((state) => {
        if (state.cards[id]) {
          state.cards[id] = { ...state.cards[id], ...updates, updatedAt: Date.now() };
        }
      }),
      deleteCard: (id) => set((state) => {
        const cardToDelete = state.cards[id];
        if (!cardToDelete) return;
        delete state.cards[id];
      }),
      reviewCard: (cardId, result) => {
        const card = get().cards[cardId];
        if (!card) return;
        const updatedCard = calculateNextInterval(card, result);
        set((state) => {
          state.cards[cardId] = updatedCard;
          state.cards[cardId].updatedAt = Date.now();
        });
        useStatsStore.getState().incrementCardsReviewed();
        const xpEarned = calculateXPointsFromReview(result);
        useStatsStore.getState().addXP(xpEarned);
      },
      getDueCardsForDeck: (deckId, allCards, allDecks) => {
        const deck = allDecks[deckId];
        if (!deck) return [];
        const now = Date.now();
        return deck.cardIds
          .map(id => allCards[id])
          .filter(card => card && card.dueDate <= now);
      },
      getDueCardsAll: (allCards) => {
        const now = Date.now();
        return Object.values(allCards).filter(card => card && card.dueDate <= now);
      }
    })),
    {
      name: 'flashcards-cards',
      storage: createJSONStorage(() => localforage),
    }
  )
);

// Deck store
interface EnhancedDeckState {
  decks: Record<string, Deck>;
  activeDeckId: string | null;
  addDeck: (deckData: Omit<Deck, 'id' | 'createdAt' | 'updatedAt' | 'cardIds'>) => Deck;
  updateDeck: (id: string, updates: Partial<Omit<Deck, 'id'>>) => void;
  deleteDeck: (id: string) => void;
  setActiveDeck: (deckId: string | null) => void;
  addCardToDeck: (deckId: string, cardId: string) => void;
  removeCardFromDeck: (deckId: string, cardId: string) => void;
}

export const useDeckStore = create<EnhancedDeckState>()(
  persist(
    immer((set, get) => ({
      decks: {},
      activeDeckId: null,
      addDeck: (deckData) => {
        const newId = uuidv4();
        const now = Date.now();
        const newDeck: Deck = {
          name: deckData.name,
          description: deckData.description,
          tags: deckData.tags || [],
          id: newId,
          createdAt: now,
          updatedAt: now,
          cardIds: [],
        };
        set((state) => {
          state.decks[newId] = newDeck;
        });
        return newDeck;
      },
      updateDeck: (id, updates) => set((state) => {
        if (state.decks[id]) {
          state.decks[id] = { ...state.decks[id], ...updates, updatedAt: Date.now() };
        }
      }),
      deleteDeck: (id) => set((state) => {
        const deckToDelete = state.decks[id];
        if (!deckToDelete) return;
        delete state.decks[id];
      }),
      setActiveDeck: (deckId) => set({ activeDeckId: deckId }),
      addCardToDeck: (deckId, cardId) => set((state) => {
        const deck = state.decks[deckId];
        if (deck && !deck.cardIds.includes(cardId)) {
          deck.cardIds.push(cardId);
          deck.updatedAt = Date.now();
        }
      }),
      removeCardFromDeck: (deckId, cardId) => set((state) => {
        const deck = state.decks[deckId];
        if (deck) {
          deck.cardIds = deck.cardIds.filter(id => id !== cardId);
          deck.updatedAt = Date.now();
        }
      })
    })),
    {
      name: 'flashcards-decks',
      storage: createJSONStorage(() => localforage),
    }
  )
);

// Stats store
interface EnhancedStatsState extends Omit<StatsState, 'loading' | 'error'> {
  playXPSound: () => void;
}

const audioContext = typeof window !== 'undefined' ? new window.AudioContext() : null;
let popSoundBuffer: AudioBuffer | null = null;

if (audioContext) {
  fetch('/sounds/pop.mp3')
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
    .then(decodedData => {
      popSoundBuffer = decodedData;
    })
    .catch(error => console.error("Failed to load sound:", error));
}

const playSound = (buffer: AudioBuffer | null) => {
  if (audioContext && buffer && audioContext.state !== 'suspended') {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
  } else if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().then(() => playSound(buffer)); // Resume context if suspended (e.g. by browser policy)
  }
};

export const useStatsStore = create<EnhancedStatsState>()(
  persist(
    immer((set, get) => ({
      reviewSessions: [],
      userStats: {
        streak: 0,
        lastStudyDate: undefined,
        totalCardsReviewed: 0,
        totalStudyTime: 0,
        xpPoints: 0,
        level: 1,
      },
      addReviewSession: (session) => set((state) => {
        state.reviewSessions.push(session);
      }),
      updateStreak: (date) => set((state) => {
        const today = new Date(date);
        today.setHours(0, 0, 0, 0);
        const lastDateMs = state.userStats.lastStudyDate;

        if (lastDateMs) {
          const lastDate = new Date(lastDateMs);
          lastDate.setHours(0, 0, 0, 0);

          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);

          if (lastDate.getTime() === yesterday.getTime()) {
            state.userStats.streak += 1;
          } else if (lastDate.getTime() !== today.getTime()) {
            state.userStats.streak = 1;
          }
        } else {
          state.userStats.streak = 1;
        }
        state.userStats.lastStudyDate = date;
      }),
      addXP: (points) => set((state) => {
        const oldXP = state.userStats.xpPoints;
        state.userStats.xpPoints += points;
        if (state.userStats.xpPoints > oldXP && points > 0) { // Play sound only if XP increased
          // Call play sound function here
          (get() as EnhancedStatsState).playXPSound();
        }
        const currentLevel = state.userStats.level;
        const newLevel = Math.floor(state.userStats.xpPoints / (currentLevel * 100)) + 1; // Simple level up logic
        if (newLevel > currentLevel) {
          state.userStats.level = newLevel;
          // Potentially play a different sound for level up?
        }
      }),
      incrementCardsReviewed: (count = 1) => set((state) => {
        state.userStats.totalCardsReviewed += count;
      }),
      addStudyTime: (timeMs) => set((state) => {
        state.userStats.totalStudyTime += timeMs;
      }),
      playXPSound: () => {
        playSound(popSoundBuffer);
      }
    })),
    {
      name: 'flashcards-stats',
      storage: createJSONStorage(() => localforage),
    }
  )
);

// UI store
interface EnhancedUIState extends Omit<UIState, 'isCardFlipped' | 'currentView'> {
  isCardFlipped: boolean;
  currentView: 'decks' | 'review' | 'edit' | 'stats';
}

export const useUIStore = create<EnhancedUIState>()(
  persist(
    immer((set) => ({
      preferences: {
        darkMode: typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false,
        notificationsEnabled: false,
        dailyGoal: 10,
      },
      isCardFlipped: false,
      currentView: 'decks',
      toggleDarkMode: () => set((state) => {
        state.preferences.darkMode = !state.preferences.darkMode;
      }),
      toggleCardFlip: () => set((state) => {
        state.isCardFlipped = !state.isCardFlipped;
      }),
      setCardFlip: (flipped) => set({ isCardFlipped: flipped }),
      setCurrentView: (view) => set({ currentView: view }),
      updatePreferences: (updates) => set((state) => {
        state.preferences = { ...state.preferences, ...updates };
      })
    })),
    {
      name: 'flashcards-ui',
      storage: createJSONStorage(() => localforage),
    }
  )
);
