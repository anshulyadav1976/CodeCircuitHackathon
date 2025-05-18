import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeckForm from '../DeckForm'; // Adjust path as necessary
import { Deck } from '../../types'; // Adjust path for types

describe('DeckForm Component', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  it('should render with initial empty fields', () => {
    render(<DeckForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toHaveValue('');
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toHaveValue('');
    // Assuming tags input is identifiable, e.g., by placeholder or a label
    // For simplicity, tags input testing is omitted here but would follow similar pattern
  });

  it('should render with initialData if provided', () => {
    const initialData: Partial<Deck> = {
      name: 'Test Deck',
      description: 'Test Description',
      tags: ['tag1', 'tag2'],
    };
    render(<DeckForm initialData={initialData} onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    expect(screen.getByLabelText(/Name/i)).toHaveValue('Test Deck');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Test Description');
    // Add checks for tags if input allows displaying them from initialData
  });

  it('should update input fields on user typing', () => {
    render(<DeckForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'New Deck Name' } });
    expect(nameInput).toHaveValue('New Deck Name');

    const descriptionInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    expect(descriptionInput).toHaveValue('New Description');
  });

  it('should call onSave with form data when save button is clicked', () => {
    render(<DeckForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Save Test' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Saving this deck.' } });
    // Add interaction for tags input here if needed

    fireEvent.click(screen.getByRole('button', { name: /Save Deck/i })); // Or whatever the save button text is
    
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith({
      name: 'Save Test',
      description: 'Saving this deck.',
      tags: [], // Assuming tags are empty if not interacted with, or test tag interaction separately
    });
  });

  it('should not call onSave if name is empty (if validation exists and prevents it)', () => {
    // This test depends on the form's internal validation logic preventing save
    // CreateDeckPage.tsx has a check: if (!deckFormData.name) { console.error("Deck name is required"); return; }
    // DeckForm itself calls onSave directly. The validation is in CreateDeckPage.
    // So, DeckForm WILL call onSave. If validation was in DeckForm, this test would be different.
    render(<DeckForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /Save Deck/i }));
    expect(mockOnSave).toHaveBeenCalledTimes(1); // DeckForm calls onSave; parent handles validation
    expect(mockOnSave).toHaveBeenCalledWith({ name: '', description: '', tags: [] });
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<DeckForm onSave={mockOnSave} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
}); 