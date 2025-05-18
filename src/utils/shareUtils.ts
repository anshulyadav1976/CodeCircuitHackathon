import pako from 'pako';
import { Deck, Card } from '../types'; // Assuming types are defined here

interface ShareableDeckData {
  deck: {
    name: string;
    description?: string;
    tags?: string[];
  };
  cards: {
    front: string;
    back: string;
  }[];
}

export const encodeDeckForURL = (deckData: ShareableDeckData['deck'], cardsData: ShareableDeckData['cards']): string | null => {
  try {
    const dataToEncode: ShareableDeckData = { deck: deckData, cards: cardsData };
    const jsonString = JSON.stringify(dataToEncode);
    const compressed = pako.deflate(jsonString, { to: 'string' }); // Compress to string for easier btoa
    // btoa only works with strings that can be represented by a single byte for each character.
    // For broader compatibility, especially with UTF-8 characters from JSON, we should convert to a byte array first.
    // However, pako.deflate with { to: 'string' } should produce a string that is safe for btoa if it's primarily latin1.
    // A more robust way for arbitrary binary data from deflate is to convert Uint8Array to base64.
    // Let's refine this to handle binary data from pako.deflate more robustly for base64 encoding.
    const compressedBinary = pako.deflate(jsonString); // Get Uint8Array
    const base64Encoded = btoa(String.fromCharCode.apply(null, Array.from(compressedBinary)));
    return base64Encoded;
  } catch (error) {
    console.error("Error encoding deck for URL:", error);
    return null;
  }
};

export const decodeDeckFromURL = (encodedData: string): ShareableDeckData | null => {
  try {
    const binaryString = atob(encodedData);
    const charArray = binaryString.split('').map(char => char.charCodeAt(0));
    const compressedBinary = new Uint8Array(charArray);
    const jsonString = pako.inflate(compressedBinary, { to: 'string' });
    const decodedData: ShareableDeckData = JSON.parse(jsonString);
    
    // Basic validation
    if (!decodedData || !decodedData.deck || !decodedData.cards || !decodedData.deck.name) {
        console.error("Decoded data is missing essential fields.");
        return null;
    }
    return decodedData;
  } catch (error) {
    console.error("Error decoding deck from URL:", error);
    return null;
  }
}; 