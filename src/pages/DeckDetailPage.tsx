import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDeckStore, useCardStore } from '../store';
import { Card as ShadCard, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CardEditor from '../components/CardEditor';
import DeckStudyStats from '../components/DeckStudyStats';
import { formatRelativeDate } from '../utils/dateUtils';
import { isCardDue } from '../utils/sm2';
import { type Card } from '../types';
import { encodeDeckForURL } from '../utils/shareUtils';
import { useToast } from "@/components/ui/use-toast";
import { Share2Icon } from 'lucide-react';

const DeckDetailPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const decks = useDeckStore((state) => state.decks);
  const deleteDeckAction = useDeckStore.getState().deleteDeck;
  const addCardToDeckAction = useDeckStore.getState().addCardToDeck;
  const removeCardFromDeckAction = useDeckStore.getState().removeCardFromDeck;

  const cards = useCardStore((state) => state.cards);
  const addCardAction = useCardStore.getState().addCard;
  const updateCardAction = useCardStore.getState().updateCard;
  const deleteCardAction = useCardStore.getState().deleteCard;

  const [isEditingCard, setIsEditingCard] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<Partial<Card> | null>(null);
  const [showCardEditor, setShowCardEditor] = useState<boolean>(false);

  const deck = deckId ? decks[deckId] : null;
  const deckCards = React.useMemo(() => 
    deck
      ? deck.cardIds.map((cardId) => cards[cardId]).filter(Boolean) as Card[]
      : []
  , [deck, cards]);
  
  const dueCards = React.useMemo(() => deckCards.filter(isCardDue), [deckCards]);
  
  const handleShareDeck = async () => {
    if (!deck || !deckCards) return;

    const deckDataForShare = {
      name: deck.name,
      description: deck.description,
      tags: deck.tags,
    };
    const cardsDataForShare = deckCards.map(card => ({ front: card.front, back: card.back }));

    const encodedData = encodeDeckForURL(deckDataForShare, cardsDataForShare);

    if (encodedData) {
      const baseUrl = `${window.location.origin}${window.location.pathname}`.replace(/\/+$/, '');
      const shareUrl = `${baseUrl}#/import-shared-deck?data=${encodedData}`;
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied!",
          description: "Shareable link for this deck has been copied to your clipboard.",
        });
      } catch (err) {
        console.error('Failed to copy link: ', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy the link to your clipboard. You can copy it manually from the console.",
          variant: "destructive",
        });
        console.log("Manual copy link:", shareUrl);
      }
    } else {
      toast({
        title: "Share Failed",
        description: "Could not generate a shareable link for this deck.",
        variant: "destructive",
      });
    }
  };
  
  const handleAddNewCardClick = () => {
    setEditingCard({ front: '', back: '' });
    setIsEditingCard(false);
    setShowCardEditor(true);
  };
  
  const handleEditCardClick = (card: Card) => {
    setEditingCard({ ...card });
    setIsEditingCard(true);
    setShowCardEditor(true);
  };
  
  const handleCardEditorChange = (updates: Partial<Card>) => {
    setEditingCard(prev => ({ ...prev, ...updates }));
  };

  const handleSaveCard = () => {
    if (!deckId || !editingCard) return;

    if (isEditingCard && editingCard.id) {
      updateCardAction(editingCard.id, { front: editingCard.front, back: editingCard.back });
    } else {
      if (editingCard.front && editingCard.back) {
        const newCompleteCard = addCardAction({
          front: editingCard.front,
          back: editingCard.back,
          deckId: deckId,
        });
        addCardToDeckAction(deckId, newCompleteCard.id);
      }
    }
    setShowCardEditor(false);
    setEditingCard(null);
  };
  
  const handleCancelCardEdit = () => {
    setShowCardEditor(false);
    setEditingCard(null);
  };
  
  const handleDeleteCard = (cardId: string) => {
    if (!deckId || !confirm('Are you sure you want to delete this card?')) return;
    removeCardFromDeckAction(deckId, cardId);
    deleteCardAction(cardId);
  };
  
  const handleDeleteDeck = () => {
    if (!deck || !confirm(`Are you sure you want to delete the deck "${deck.name}"? This will also delete all its cards.`)) return;
    if (deck.cardIds) {
        deck.cardIds.forEach(cardId => {
            deleteCardAction(cardId);
        });
    }
    deleteDeckAction(deck.id);
    navigate('/');
  };
  
  if (!deck && deckId) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-6">Deck not found</h1>
        <Link to="/">
          <Button>Go back to decks</Button>
        </Link>
      </div>
    );
  }

  if (!deckId) {
      return <div className="container mx-auto py-12 px-4 text-center">Loading deck...</div>;
  }
  
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {deck ? (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
              <p className="text-muted-foreground mb-4">{deck.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {deck.tags?.map(tag => (
                  <span key={tag} className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/study/${deckId}`}>
                  <Button disabled={dueCards.length === 0 && deckCards.length > 0} >
                    Study ({dueCards.length} due)
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleAddNewCardClick}>
                  Add Card
                </Button>
                <Button variant="outline" onClick={handleShareDeck} title="Share this deck">
                  <Share2Icon className="mr-2 h-4 w-4" /> Copy Share Link
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteDeck}
                >
                  Delete Deck
                </Button>
              </div>
            </div>
          </div>
          
          {deckCards.length > 0 && (
            <div className="mb-8">
              <DeckStudyStats deckId={deckId} cards={deckCards} />
            </div>
          )}
          
          {showCardEditor && (
            <ShadCard className="mb-8">
              <CardHeader>
                <CardTitle>
                  {isEditingCard ? 'Edit Card' : 'Add New Card'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardEditor
                  card={editingCard || { front: '', back: '' }}
                  onChange={handleCardEditorChange}
                  onSave={handleSaveCard}
                  onCancel={handleCancelCardEdit}
                />
              </CardContent>
            </ShadCard>
          )}
          
          {deckCards.length > 0 ? (
            <div className="space-y-6">
              {deckCards.map((card) => (
                <ShadCard key={card.id} className="overflow-hidden">
                  <div className="md:grid md:grid-cols-2">
                    <div className="p-6 border-b md:border-b-0 md:border-r border-border">
                      <h3 className="text-lg font-medium mb-2">Front</h3>
                      <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: card.front }} />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-medium mb-2">Back</h3>
                      <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: card.back }} />
                    </div>
                  </div>
                  <div className="bg-muted/30 p-4 border-t border-border flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {formatRelativeDate(card.updatedAt)}
                      {isCardDue(card) && (
                        <span className="ml-2 text-primary font-medium"> Due now</span>
                      )}
                    </span>
                    <div className="space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditCardClick(card)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </ShadCard>
              ))}
            </div>
          ) : (
            !showCardEditor && (
              <div className="text-center py-12 bg-card rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium mb-2">No cards in this deck</h3>
                <p className="text-muted-foreground mb-6">
                  Add your first card to get started
                </p>
                <Button onClick={handleAddNewCardClick}>
                  Add a Card
                </Button>
              </div>
            )
          )}
        </>
      ) : (
        <div className="container mx-auto py-12 px-4 text-center">
             <h1 className="text-2xl font-bold mb-6">Deck not found or still loading...</h1>
             <Link to="/">
               <Button>Go back to decks</Button>
             </Link>
        </div>
      )}
    </div>
  );
};

export default DeckDetailPage;
