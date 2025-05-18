
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStatsStore } from '../store';
import { Card as CardType } from '../types';
import { isCardDue } from '../utils/sm2';
import { formatRelativeDate } from '../utils/dateUtils';

interface DeckStudyStatsProps {
  deckId: string;
  cards: CardType[];
}

const DeckStudyStats: React.FC<DeckStudyStatsProps> = ({ deckId, cards }) => {
  const { reviewSessions, userStats } = useStatsStore();
  
  const dueCards = cards.filter(isCardDue);
  const duePercentage = cards.length > 0 ? (dueCards.length / cards.length) * 100 : 0;
  
  // Get deck-specific review sessions
  const deckSessions = reviewSessions.filter(session => session.deckId === deckId);
  
  // Calculate stats
  const totalReviews = deckSessions.reduce(
    (sum, session) => sum + session.cardsReviewed.length, 
    0
  );
  
  const goodReviews = deckSessions.reduce(
    (sum, session) => sum + session.cardsReviewed.filter(r => r.result >= 2).length, 
    0
  );
  
  const accuracy = totalReviews > 0 ? (goodReviews / totalReviews) * 100 : 0;
  
  // Get last study session date
  const lastStudied = deckSessions.length > 0 
    ? Math.max(...deckSessions.map(s => s.date))
    : null;

  // Get next due date
  const nextDueDate = dueCards.length > 0 
    ? Math.min(...dueCards.map(c => c.dueDate || Infinity))
    : null;

  if (cards.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Study Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Due Cards */}
          <div>
            <div className="flex justify-between mb-1 text-sm">
              <span>Cards due for review</span>
              <span className="font-medium">{dueCards.length} of {cards.length}</span>
            </div>
            <Progress value={duePercentage} className="h-2" />
          </div>
          
          {/* Accuracy */}
          {totalReviews > 0 && (
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Overall accuracy</span>
                <span className="font-medium">{accuracy.toFixed(0)}%</span>
              </div>
              <Progress value={accuracy} className="h-2" />
            </div>
          )}
          
          {/* Last studied */}
          {lastStudied && (
            <div className="text-sm flex justify-between">
              <span>Last studied:</span>
              <span className="text-muted-foreground">
                {formatRelativeDate(lastStudied)}
              </span>
            </div>
          )}
          
          {/* Next review due */}
          {nextDueDate && nextDueDate !== Infinity && (
            <div className="text-sm flex justify-between">
              <span>Next review due:</span>
              <span className={`${nextDueDate <= Date.now() ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {formatRelativeDate(nextDueDate)}
              </span>
            </div>
          )}
          
          {/* Total reviews */}
          <div className="text-sm flex justify-between">
            <span>Total reviews:</span>
            <span className="font-medium">{totalReviews}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeckStudyStats;
