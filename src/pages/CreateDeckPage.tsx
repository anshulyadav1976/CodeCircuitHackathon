import React from 'react';
import { useNavigate } from 'react-router-dom';
import DeckForm from '../components/DeckForm';
import { useDeckStore } from '../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Deck } from '../types';

const CreateDeckPage: React.FC = () => {
  const navigate = useNavigate();
  const addDeckAction = useDeckStore.getState().addDeck;
  
  const handleSave = (deckFormData: { name?: string; description?: string; tags?: string[] }) => {
    if (!deckFormData.name) {
      console.error("Deck name is required");
      return;
    }
    const newDeck = addDeckAction({
      name: deckFormData.name, 
      description: deckFormData.description || '',
      tags: deckFormData.tags || [],
    });
    navigate(`/decks/${newDeck.id}`);
  };
  
  const handleCancel = () => {
    navigate('/');
  };
  
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Deck</CardTitle>
          <CardDescription>
            Add information about your new flashcard deck
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeckForm onSave={handleSave} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateDeckPage;
