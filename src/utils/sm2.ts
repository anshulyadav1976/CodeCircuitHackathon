
import { ReviewResult, Card } from '../types';

// Implementation of SuperMemo SM-2 algorithm
// See: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2

/**
 * Calculate the next interval based on SM-2 algorithm
 * @param card The flashcard to calculate interval for
 * @param result Review result (0-3)
 * @returns The updated card with new SM-2 parameters
 */
export function calculateNextInterval(card: Card, result: ReviewResult): Card {
  const updatedCard = { ...card };
  
  // If response is less than 3, reset repetitions
  if (result < ReviewResult.GOOD) {
    updatedCard.repetitions = 0;
    updatedCard.interval = 1;
  } else {
    // Update easiness factor
    updatedCard.easinessFactor = Math.max(
      1.3, // Minimum EF value
      card.easinessFactor + (0.1 - (4 - result) * (0.08 + (4 - result) * 0.02))
    );
    
    // Calculate interval based on repetitions
    if (updatedCard.repetitions === 0) {
      updatedCard.interval = 1;
    } else if (updatedCard.repetitions === 1) {
      updatedCard.interval = 6;
    } else {
      updatedCard.interval = Math.round(card.interval * card.easinessFactor);
    }
    
    // Increment repetition counter
    updatedCard.repetitions += 1;
  }
  
  // Calculate next due date based on interval (in days)
  const now = new Date();
  const nextDueDate = new Date();
  nextDueDate.setDate(now.getDate() + updatedCard.interval);
  nextDueDate.setHours(0, 0, 0, 0);
  
  updatedCard.dueDate = nextDueDate.getTime();
  updatedCard.lastReviewed = Date.now();
  
  return updatedCard;
}

/**
 * Checks if a card is due for review
 * @param card The card to check
 * @returns Boolean indicating if card is due
 */
export function isCardDue(card: Card): boolean {
  if (!card.dueDate) return true; // New cards are always due
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return card.dueDate <= now.getTime();
}

/**
 * Gets the due cards from a list
 * @param cards Array of cards
 * @returns Array of due cards
 */
export function getDueCards(cards: Card[]): Card[] {
  return cards.filter(isCardDue);
}

/**
 * Calculate XP points based on review result
 * @param result Review result
 * @returns XP points earned
 */
export function calculateXP(result: ReviewResult): number {
  switch (result) {
    case ReviewResult.FORGOT: return 1;
    case ReviewResult.HARD: return 2;
    case ReviewResult.GOOD: return 3;
    case ReviewResult.EASY: return 5;
    default: return 0;
  }
}
