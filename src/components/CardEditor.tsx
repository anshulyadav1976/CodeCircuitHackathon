
import React from 'react';
import { Card } from '../types';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';

interface CardEditorProps {
  card: Partial<Card>;
  onChange: (updates: Partial<Card>) => void;
  onSave: () => void;
  onCancel: () => void;
}

const CardEditor: React.FC<CardEditorProps> = ({
  card,
  onChange,
  onSave,
  onCancel
}) => {
  const handleFrontChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ front: e.target.value });
  };
  
  const handleBackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ back: e.target.value });
  };
  
  const isValid = Boolean(card.front?.trim()) && Boolean(card.back?.trim());
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="front">Front</Label>
        <Textarea
          id="front"
          placeholder="Question or prompt"
          value={card.front || ''}
          onChange={handleFrontChange}
          className="min-h-[120px]"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="back">Back</Label>
        <Textarea
          id="back"
          placeholder="Answer"
          value={card.back || ''}
          onChange={handleBackChange}
          className="min-h-[120px]"
        />
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={!isValid}>
          Save
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>Formatting tips:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><code>**bold**</code> for <strong>bold</strong> text</li>
          <li><code>*italic*</code> for <em>italic</em> text</li>
          <li><code>`code`</code> for <code>code</code> formatting</li>
          <li><code>* item</code> for bullet lists</li>
        </ul>
      </div>
    </div>
  );
};

export default CardEditor;
