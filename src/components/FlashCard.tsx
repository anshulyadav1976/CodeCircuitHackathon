import React, { useState, useEffect } from 'react';
import { Card as CardType, ReviewResult } from '../types';
import { parseMarkdown } from '../utils/helpers';
import { formatRelativeDate } from '../utils/dateUtils';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

interface FlashCardProps {
  card: CardType;
  onResult?: (result: ReviewResult) => void;
  editable?: boolean;
  onEdit?: () => void;
}

const FlashCard: React.FC<FlashCardProps> = ({
  card,
  onResult,
  editable = false,
  onEdit
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  
  useEffect(() => {
    setIsFlipped(false);
    setIsAnswered(false);
  }, [card.id]);
  
  const handleFlip = () => {
    if (!isAnswered) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleFlip();
    }
  };
  
  const handleResult = (result: ReviewResult) => {
    setIsAnswered(true);
    if (onResult) {
      onResult(result);
    }
  };
  
  const renderDueDate = () => {
    if (!card.dueDate) return null;
    
    return (
      <div className="text-xs text-muted-foreground mt-2">
        {formatRelativeDate(card.dueDate)}
      </div>
    );
  };
  
  return (
    <div 
      className="flip-card w-full h-[350px] max-w-lg mx-auto cursor-pointer perspective-1000"
      onClick={editable ? undefined : handleFlip}
      onKeyDown={editable ? undefined : handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isFlipped}
      aria-label={`Flashcard: ${card.front}. ${isFlipped ? 'Showing back.' : 'Showing front.'} Press Enter or Space to flip.`}
    >
      <div 
        className={`flip-card-inner w-full h-full relative preserve-3d transition-transform duration-500 ${
          isFlipped ? 'transform rotate-y-180' : ''
        }`}
      >
        {/* Front */}
        <div 
          className="flip-card-front w-full h-full rounded-xl bg-card shadow-lg p-6 flex flex-col backface-hidden"
          aria-hidden={isFlipped}
        >
          <div className="flex-1 flex items-center justify-center">
            <div className="prose prose-lg dark:prose-invert max-w-full">
              <div 
                dangerouslySetInnerHTML={{ __html: parseMarkdown(card.front) }} 
                className="text-center text-xl"
              />
            </div>
          </div>
          
          {editable && (
            <div className="mt-auto text-center">
              <Button variant="outline" onClick={onEdit}>
                Edit
              </Button>
            </div>
          )}
          
          {!editable && (
            <div className="text-center text-muted-foreground text-sm mt-4">
              Click to flip
            </div>
          )}
          
          {renderDueDate()}
        </div>
        
        {/* Back */}
        <div 
          className="flip-card-back w-full h-full rounded-xl bg-card shadow-lg p-6 flex flex-col backface-hidden transform rotate-y-180"
          aria-hidden={!isFlipped}
        >
          <div className="flex-1 flex items-center justify-center">
            <div className="prose prose-lg dark:prose-invert max-w-full">
              <div 
                dangerouslySetInnerHTML={{ __html: parseMarkdown(card.back) }} 
                className="text-center text-xl"
              />
            </div>
          </div>
          
          {!editable && !isAnswered && (
            <div className="mt-auto grid grid-cols-4 gap-2">
              <Button 
                variant="destructive" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleResult(ReviewResult.FORGOT);
                }}
                aria-label="Mark card as Forgot"
              >
                Forgot
              </Button>
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleResult(ReviewResult.HARD);
                }}
                aria-label="Mark card as Hard"
              >
                Hard
              </Button>
              <Button 
                variant="default" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleResult(ReviewResult.GOOD);
                }}
                aria-label="Mark card as Good"
              >
                Good
              </Button>
              <Button 
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleResult(ReviewResult.EASY);
                }}
                aria-label="Mark card as Easy"
              >
                Easy
              </Button>
            </div>
          )}
          
          {editable && (
            <div className="mt-auto text-center">
              <Button variant="outline" onClick={onEdit}>
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
