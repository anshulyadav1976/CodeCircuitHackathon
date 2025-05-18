
import React from 'react';
import { Link } from 'react-router-dom';
import { useDeckStore, useCardStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { isCardDue } from '../utils/sm2';
import { formatRelativeDate } from '../utils/dateUtils';

const StudyDeckListPage: React.FC = () => {
  const { decks } = useDeckStore();
  const { cards } = useCardStore();
  
  // Convert decks object to array
  const decksArray = Object.values(decks).sort((a, b) => b.updatedAt - a.updatedAt);
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Study</h1>
      </div>
      
      {decksArray.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decksArray.map((deck) => {
            // Get cards for this deck
            const deckCards = deck.cardIds.map((cardId) => cards[cardId]).filter(Boolean);
            // Count due cards
            const dueCards = deckCards.filter(isCardDue);
            // Get next due date (smallest due date from all cards)
            const nextDueDate = deckCards.length > 0
              ? Math.min(...deckCards.map(c => c.dueDate || Infinity))
              : null;
            
            return (
              <Card key={deck.id}>
                <CardHeader>
                  <CardTitle className="text-xl">{deck.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {deck.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Cards:</span>
                        <span className="font-medium">{deckCards.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Due now:</span>
                        <span className={`font-medium ${dueCards.length > 0 ? 'text-primary' : ''}`}>
                          {dueCards.length}
                        </span>
                      </div>
                      
                      {nextDueDate && nextDueDate !== Infinity && (
                        <div className="flex justify-between text-sm">
                          <span>Next review:</span>
                          <span className="text-muted-foreground">
                            {formatRelativeDate(nextDueDate)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-end">
                      <Link to={`/study/${deck.id}`}>
                        <Button disabled={deckCards.length === 0}>
                          {dueCards.length > 0 ? `Study (${dueCards.length} due)` : 'Study'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-2">No decks available</h3>
          <p className="text-muted-foreground mb-6">
            Create your first deck to start studying
          </p>
          <Link to="/decks/new">
            <Button>Create Deck</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default StudyDeckListPage;
