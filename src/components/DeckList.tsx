import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDeckStore, useCardStore } from '../store';
import { formatRelativeDate } from '../utils/dateUtils';
import { truncate } from '../utils/helpers';
import { isCardDue } from '../utils/sm2';
import { Button } from '../components/ui/button';

const DeckList: React.FC = () => {
  const { decks } = useDeckStore();
  const deleteDeckAction = useDeckStore.getState().deleteDeck;
  const { cards } = useCardStore();
  const deleteCardAction = useCardStore.getState().deleteCard;
  
  const deckItems = useMemo(() => {
    return Object.values(decks).map(deck => {
      // Count total cards in deck
      const deckCards = deck.cardIds
        .map(id => cards[id])
        .filter(card => card !== undefined);
      
      // Count due cards
      const dueCards = deckCards.filter(isCardDue);
      
      return {
        ...deck,
        totalCards: deckCards.length,
        dueCards: dueCards.length
      };
    });
  }, [decks, cards]);
  
  if (deckItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No decks yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first flashcard deck to get started
        </p>
        <Link to="/decks/new">
          <Button>
            Create First Deck
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {deckItems.map((deck) => (
        <div 
          key={deck.id}
          className="bg-card border rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 relative"
        >
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-1 pr-8">{deck.name}</h3>
            <p className="text-muted-foreground text-sm">
              {truncate(deck.description, 80)}
            </p>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Total:</span>{' '}
              <span className="font-medium">{deck.totalCards} cards</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Due:</span>{' '}
              <span className={`font-medium ${deck.dueCards > 0 ? 'text-primary' : ''}`}>
                {deck.dueCards} cards
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Link to={`/decks/${deck.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View
              </Button>
            </Link>
            
            {deck.dueCards > 0 && (
              <Link to={`/study/${deck.id}`} className="flex-1">
                <Button className="w-full">
                  Study
                </Button>
              </Link>
            )}
            
            {deck.dueCards === 0 && (
              <Link to={`/study/${deck.id}`} className="flex-1">
                <Button variant="secondary" className="w-full">
                  Review
                </Button>
              </Link>
            )}
          </div>
          
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete the deck "${deck.name}"? This will also delete all its cards.`)) {
                  // First, delete all cards associated with this deck
                  const deckToDelete = decks[deck.id]; // Get the full deck object
                  if (deckToDelete && deckToDelete.cardIds) {
                    deckToDelete.cardIds.forEach(cardId => {
                      deleteCardAction(cardId); // Call action from useCardStore
                    });
                  }
                  // Then, delete the deck itself
                  deleteDeckAction(deck.id); // Call action from useDeckStore
                }
              }}
            >
              <span className="sr-only">Delete</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </Button>
          </div>
          
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            Last updated {formatRelativeDate(deck.updatedAt)}
          </div>
        </div>
      ))}
      
      {/* Add Deck Card */}
      <Link 
        to="/decks/new"
        className="bg-card border border-dashed rounded-xl p-6 flex flex-col items-center justify-center min-h-[220px] hover:bg-muted/50 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-12 h-12 text-muted-foreground mb-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-lg font-medium">Create New Deck</span>
      </Link>
    </div>
  );
};

export default DeckList;
