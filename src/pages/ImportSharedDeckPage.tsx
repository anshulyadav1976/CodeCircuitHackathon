import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { decodeDeckFromURL } from '../utils/shareUtils';
import { useDeckStore, useCardStore } from '../store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { ThumbsUpIcon, AlertTriangleIcon, InboxIcon } from 'lucide-react';

interface DecodedShareData {
  deck: { name: string; description?: string; tags?: string[] };
  cards: { front: string; back: string }[];
}

const ImportSharedDeckPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const addDeck = useDeckStore.getState().addDeck;
  const addCard = useCardStore.getState().addCard;
  const addCardToDeck = useDeckStore.getState().addCardToDeck; 

  const [decodedData, setDecodedData] = useState<DecodedShareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      const result = decodeDeckFromURL(data);
      if (result) {
        setDecodedData(result);
      } else {
        setError('Invalid or corrupted share link. Could not decode deck data.');
      }
    } else {
      setError('No share data found in the link.');
    }
  }, [searchParams]);

  const handleImportDeck = () => {
    if (!decodedData) return;
    setIsImporting(true);

    try {
      // 1. Add the deck
      const newDeck = addDeck({
        name: decodedData.deck.name,
        description: decodedData.deck.description || '',
        tags: decodedData.deck.tags || [],
      });

      // 2. Add cards to the new deck
      decodedData.cards.forEach(cardData => {
        const newCard = addCard({
          front: cardData.front,
          back: cardData.back,
          deckId: newDeck.id, // Link to the newly created deck
        });
        addCardToDeck(newDeck.id, newCard.id); // Ensure card ID is added to deck's cardIds list
      });

      toast({
        title: "Deck Imported!",
        description: `The deck "${newDeck.name}" has been successfully added to your collection.`,
      });
      navigate(`/decks/${newDeck.id}`); // Navigate to the newly imported deck
    } catch (e) {
      console.error("Error importing shared deck:", e);
      setError('An error occurred while importing the deck.');
      toast({
        title: "Import Failed",
        description: "Could not import the deck. Please try again.",
        variant: "destructive",
      });
      setIsImporting(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Card className="max-w-md mx-auto p-8">
          <CardHeader>
            <AlertTriangleIcon className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-2xl">Import Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link to="/">
              <Button variant="outline">Go to My Decks</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!decodedData) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <p>Loading shared deck...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <InboxIcon className="w-12 h-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl">Shared Deck Found!</CardTitle>
          <CardDescription>
            A deck has been shared with you. Would you like to import it?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{decodedData.deck.name}</h3>
            {decodedData.deck.description && (
              <p className="text-sm text-muted-foreground">{decodedData.deck.description}</p>
            )}
          </div>
          <p><span className="font-medium">{decodedData.cards.length}</span> cards will be imported.</p>
          {decodedData.deck.tags && decodedData.deck.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Tags:</span>
              {decodedData.deck.tags.map(tag => (
                <span key={tag} className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Link to="/">
              <Button variant="outline" disabled={isImporting}>Cancel</Button>
            </Link>
            <Button onClick={handleImportDeck} disabled={isImporting}>
              {isImporting ? 'Importing...' : 'Import This Deck'}
              {!isImporting && <ThumbsUpIcon className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportSharedDeckPage; 