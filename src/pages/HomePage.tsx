
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DeckList from '../components/DeckList';
import { useDeckStore } from '../store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const HomePage: React.FC = () => {
  const { decks } = useDeckStore();
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Flashcards</h1>
          <p className="text-muted-foreground">
            Manage your flashcard decks and start studying
          </p>
        </div>
      </div>
      
      <DeckList />
    </div>
  );
};

export default HomePage;
