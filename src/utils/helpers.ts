
/**
 * Generates a UUID
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Create a new card
 */
export const createNewCard = (deckId: string, front = '', back = '') => {
  return {
    id: generateUUID(),
    front,
    back,
    deckId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    easinessFactor: 2.5,
    repetitions: 0,
    interval: 0,
    dueDate: Date.now(),
  };
};

/**
 * Create a new deck
 */
export const createNewDeck = (name: string, description: string = '') => {
  return {
    id: generateUUID(),
    name,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    cardIds: [],
    tags: [],
  };
};

/**
 * Shuffles an array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Parses markdown text (simple version)
 */
export const parseMarkdown = (text: string): string => {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Code
  text = text.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // Lists
  text = text.replace(/^\s*\*\s+(.*?)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
  
  // Line breaks
  text = text.replace(/\n/g, '<br />');
  
  return text;
};

/**
 * Formats numbers with commas for thousands
 */
export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
