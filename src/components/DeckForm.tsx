
import React, { useState, useEffect } from 'react';
import { Deck } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

interface DeckFormProps {
  deck?: Partial<Deck>;
  onSave: (deck: Partial<Deck>) => void;
  onCancel: () => void;
}

const DeckForm: React.FC<DeckFormProps> = ({
  deck = {},
  onSave,
  onCancel
}) => {
  const [name, setName] = useState(deck.name || '');
  const [description, setDescription] = useState(deck.description || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...deck, name, description });
  };
  
  const isValid = Boolean(name.trim());
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Deck Name</Label>
        <Input
          id="name"
          placeholder="e.g. Spanish Vocabulary"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What are you learning with this deck?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid}>
          Save
        </Button>
      </div>
    </form>
  );
};

export default DeckForm;
