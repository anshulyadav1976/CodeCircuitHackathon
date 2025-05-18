
import { Card, Deck } from '../types';
import { generateUUID } from './helpers';

// Create a sample deck with cards
export const createSampleDeck = (): { deck: Deck, cards: Card[] } => {
  const deckId = generateUUID();
  const now = Date.now();
  
  // Create cards
  const cards: Card[] = [
    {
      id: generateUUID(),
      front: "What is spaced repetition?",
      back: "A learning technique that incorporates increasing intervals of time between subsequent review of previously learned material to boost memory retention.",
      deckId,
      createdAt: now,
      updatedAt: now,
      easinessFactor: 2.5,
      repetitions: 0,
      interval: 0,
      dueDate: now,
    },
    {
      id: generateUUID(),
      front: "What is the Forgetting Curve?",
      back: "A hypothesis by Hermann Ebbinghaus that describes the rate at which information is forgotten over time if there is no attempt to retain it.",
      deckId,
      createdAt: now,
      updatedAt: now,
      easinessFactor: 2.5,
      repetitions: 0,
      interval: 0,
      dueDate: now,
    },
    {
      id: generateUUID(),
      front: "What is the SM-2 algorithm?",
      back: "An algorithm used in spaced repetition software that calculates review intervals based on the difficulty of remembering items.",
      deckId,
      createdAt: now,
      updatedAt: now,
      easinessFactor: 2.5,
      repetitions: 0,
      interval: 0,
      dueDate: now,
    },
    {
      id: generateUUID(),
      front: "How do you use **markdown** in flashcards?",
      back: "You can use *italic*, **bold**, and `code` formatting in your cards.",
      deckId,
      createdAt: now,
      updatedAt: now,
      easinessFactor: 2.5,
      repetitions: 0,
      interval: 0,
      dueDate: now,
    },
    {
      id: generateUUID(),
      front: "What are the benefits of active recall?",
      back: "* Strengthens memory\n* Identifies knowledge gaps\n* Enhances long-term retention\n* Improves understanding of concepts",
      deckId,
      createdAt: now,
      updatedAt: now,
      easinessFactor: 2.5,
      repetitions: 0,
      interval: 0,
      dueDate: now,
    },
  ];
  
  // Create deck with card references
  const deck: Deck = {
    id: deckId,
    name: "Learning Techniques",
    description: "Cards about memory, learning, and knowledge retention methods",
    createdAt: now,
    updatedAt: now,
    cardIds: cards.map(card => card.id),
    tags: ["learning", "memory"],
  };
  
  return { deck, cards };
};
