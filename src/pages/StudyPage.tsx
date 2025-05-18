import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDeckStore, useCardStore, useStatsStore } from '../store';
import FlashCard from '../components/FlashCard';
import { Card, ReviewResult, ReviewSession } from '../types';
import { getDueCards } from '../utils/sm2';
import { isCardDue } from '../utils/sm2';
import { shuffleArray } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatStudyTime } from '../utils/dateUtils';
import { toast } from "@/components/ui/use-toast";
import confetti from 'canvas-confetti';
import { Card as UICard } from '@/components/ui/card';

const StudyPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { decks } = useDeckStore();
  const { cards } = useCardStore();
  const { userStats: initialUserStats, addReviewSession, updateStreak, addStudyTime } = useStatsStore();
  const reviewCardAction = useCardStore.getState().reviewCard;
  const getUserStats = useStatsStore.getState; // To get fresh stats
  
  const flashCardRef = useRef<HTMLDivElement>(null); // Ref for the FlashCard component

  // Get deck and cards
  const deck = deckId ? decks[deckId] : null;
  const deckCards: Card[] = deck
    ? deck.cardIds.map((cardId) => cards[cardId]).filter(Boolean)
    : [];
  
  // Study state
  const [studyCards, setStudyCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [reviewResults, setReviewResults] = useState<{cardId: string, result: ReviewResult}[]>([]);
  const [sessionStartTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasShuffled, setHasShuffled] = useState(false);
  
  const confettiRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (deck && deckCards.length > 0 && !hasShuffled) {
      let cardsToStudy = getDueCards(deckCards);
      if (cardsToStudy.length === 0) {
        cardsToStudy = [...deckCards];
      }
      setStudyCards(shuffleArray(cardsToStudy));
      setHasShuffled(true);
      // Focus the first card when study cards are set
      flashCardRef.current?.focus(); 
    }
  }, [deck, deckCards, hasShuffled]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isCompleted) return; // Don't navigate if session is done

      if (event.key === 'ArrowLeft') {
        if (currentCardIndex > 0) {
          setCurrentCardIndex(prevIndex => prevIndex - 1);
        }
      } else if (event.key === 'ArrowRight') {
        if (currentCardIndex < studyCards.length - 1) {
          setCurrentCardIndex(prevIndex => prevIndex + 1);
        } else if (currentCardIndex === studyCards.length - 1 && studyCards.length > 0) {
          // Optionally, if on the last card and press right, finish session or show a message
          // For now, it just stays on the last card. Or we can call finishSession()
          // if (!isCompleted) finishSession(); // Example: finish session
        }
      }
      // Space and Enter are handled by the FlashCard component itself for flipping
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentCardIndex, studyCards.length, isCompleted]);

  // Focus FlashCard when currentCardIndex changes
  useEffect(() => {
    flashCardRef.current?.focus();
  }, [currentCardIndex]);
  
  // Trigger confetti when completing a session
  useEffect(() => {
    if (isCompleted && confettiRef.current) {
      const rect = confettiRef.current.getBoundingClientRect();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth, 
          y: (rect.top + rect.height / 2) / window.innerHeight 
        }
      });
    }
  }, [isCompleted]);
  
  const currentCard = studyCards[currentCardIndex];
  const progress = studyCards.length > 0 
    ? ((currentCardIndex) / studyCards.length) * 100 
    : 0;
  
  // Handle card result
  const handleCardResult = (result: ReviewResult) => {
    if (!currentCard) return;
    
    const statsBeforeReview = { ...getUserStats().userStats }; // Capture stats before review

    setReviewResults([
      ...reviewResults, 
      { cardId: currentCard.id, result }
    ]);
    
    reviewCardAction(currentCard.id, result); // This action will update XP and potentially level in the store
    
    const statsAfterReview = getUserStats().userStats; // Get fresh stats

    // Check for level up
    if (statsAfterReview.level > statsBeforeReview.level) {
      toast({
        title: "Level Up!",
        description: `Congratulations, you've reached level ${statsAfterReview.level}! Keep up the great work.`,
      });
      if (confettiRef.current) { // Reuse existing confetti ref if page structure allows
        const rect = confettiRef.current.getBoundingClientRect();
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { 
            x: (rect.left + rect.width / 2) / window.innerWidth, 
            y: (rect.top + rect.height / 2) / window.innerHeight 
          },
          zIndex: 1000 // Ensure confetti is on top
        });
      } else { // Fallback confetti if ref isn't suitable (e.g. not on completion screen)
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, zIndex: 1000 });
      }
    }

    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      finishSession();
    }
  };
  
  // Complete the study session
  const finishSession = () => {
    // Create review session
    const session: ReviewSession = {
      id: uuidv4(),
      date: Date.now(),
      deckId: deckId!,
      duration: Date.now() - sessionStartTime,
      cardsReviewed: reviewResults,
    };
    
    // Update stats
    addReviewSession(session);
    updateStreak(Date.now());
    addStudyTime(session.duration);
    
    // Show success
    setIsCompleted(true);
    
    // Get good results count
    const goodResults = reviewResults.filter(
      r => r.result >= ReviewResult.GOOD
    ).length;
    
    const accuracy = goodResults / reviewResults.length;
    
    // Show toast based on performance
    if (accuracy >= 0.8) {
      toast({
        title: "Excellent work!",
        description: `You got ${goodResults} out of ${reviewResults.length} cards correct.`,
      });
    } else if (accuracy >= 0.6) {
      toast({
        title: "Good job!",
        description: `You got ${goodResults} out of ${reviewResults.length} cards correct.`,
      });
    } else {
      toast({
        title: "Keep practicing!",
        description: `You got ${goodResults} out of ${reviewResults.length} cards correct.`,
      });
    }
  };
  
  // If no deck found
  if (!deck) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-6">Deck not found</h1>
        <Link to="/">
          <Button>Go back to decks</Button>
        </Link>
      </div>
    );
  }
  
  // If no cards in deck
  if (deckCards.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-6">No cards in this deck</h1>
        <p className="text-muted-foreground mb-6">
          Add some cards first before studying.
        </p>
        <Link to={`/decks/${deckId}`}>
          <Button>Back to deck</Button>
        </Link>
      </div>
    );
  }
  
  // Session completed view
  if (isCompleted) {
    // Calculate stats
    const goodResults = reviewResults.filter(
      r => r.result >= ReviewResult.GOOD
    ).length;
    const accuracy = (goodResults / reviewResults.length) * 100;
    const duration = Date.now() - sessionStartTime;
    
    return (
      <div className="container mx-auto py-12 px-4 max-w-lg" ref={confettiRef}>
        <UICard className="text-center p-8">
          <h1 className="text-3xl font-bold mb-6">Session Complete!</h1>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">{reviewResults.length}</div>
              <div className="text-sm text-muted-foreground">Cards Reviewed</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">{accuracy.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">
                {formatStudyTime(duration).split(' ')[0]}
              </div>
              <div className="text-sm text-muted-foreground">Time</div>
            </div>
          </div>
          
          <div className="space-y-2 mb-8">
            <h3 className="font-semibold">Results</h3>
            <div className="flex justify-between text-sm">
              <div>Forgotten:</div>
              <div className="font-medium">
                {reviewResults.filter(r => r.result === ReviewResult.FORGOT).length}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div>Hard:</div>
              <div className="font-medium">
                {reviewResults.filter(r => r.result === ReviewResult.HARD).length}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div>Good:</div>
              <div className="font-medium">
                {reviewResults.filter(r => r.result === ReviewResult.GOOD).length}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <div>Easy:</div>
              <div className="font-medium">
                {reviewResults.filter(r => r.result === ReviewResult.EASY).length}
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Link to={`/decks/${deckId}`}>
              <Button variant="outline">
                Back to Deck
              </Button>
            </Link>
            <Button onClick={() => {
              setCurrentCardIndex(0);
              setReviewResults([]);
              setIsCompleted(false);
              setHasShuffled(false);
            }}>
              Study Again
            </Button>
          </div>
        </UICard>
      </div>
    );
  }
  
  // No cards due
  if (studyCards.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-6">No cards due for review</h1>
        <p className="text-muted-foreground mb-6">
          All cards in this deck have been reviewed recently.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to={`/decks/${deckId}`}>
            <Button variant="outline">
              Back to Deck
            </Button>
          </Link>
          <Button 
            onClick={() => {
              setStudyCards([...shuffleArray(deckCards)]);
              setHasShuffled(true);
            }}
          >
            Study Anyway
          </Button>
        </div>
      </div>
    );
  }
  
  // Main study view
  return (
    <div className="container mx-auto py-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <Link to={deckId ? `/decks/${deckId}` : '/'} className="text-sm text-primary hover:underline">
            Back to {deck ? deck.name : 'Decks'}
          </Link>
          <span className="text-sm text-muted-foreground">
            Card {currentCardIndex + 1} of {studyCards.length}
          </span>
        </div>
        <Progress value={progress} className="w-full h-2 mb-4" />
        {currentCard ? (
          <div ref={flashCardRef}> {/* Wrap FlashCard in a div to attach the ref */} 
            <FlashCard 
              card={currentCard} 
              onResult={handleCardResult} 
            />
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading cards...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPage;

