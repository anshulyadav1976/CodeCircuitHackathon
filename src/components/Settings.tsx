import React, { useState } from 'react';
import { useUIStore } from '../store';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportData, importData } from '../services/storage';
import { requestNotificationPermission, isNotificationSupported, scheduleReminder, unscheduleReminders } from '../utils/notifications';
import { toast } from "../components/ui/use-toast";
import { useTranslation } from 'react-i18next';
import { Textarea } from "@/components/ui/textarea";
import { Copy } from 'lucide-react';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { preferences, updatePreferences } = useUIStore();
  const [reminderTime, setReminderTime] = useState(preferences.reminderTime || '09:00');
  const [dailyGoal, setDailyGoal] = useState(preferences.dailyGoal.toString());
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  
  const aiPromptText = `
You are an AI assistant helping a user create flashcards for their spaced repetition app.
Please generate a JSON object that can be imported into the app. The user will provide the topic and number of cards.

The JSON object MUST have the following top-level structure and keys:
{
  "version": 2, // App data version
  "exportDate": "YYYY-MM-DDTHH:mm:ss.sssZ", // Current ISO date string
  "deckStoreFullState": {
    "state": {
      "decks": [
        // Array of deck objects
      ]
    },
    "version": 0 // Deck store version
  },
  "cardStoreFullState": {
    "state": {
      "cards": [
        // Array of card objects
      ]
    },
    "version": 0 // Card store version
  },
  "statsStoreFullState": { // Provide a minimal valid structure
    "state": {
      "userStats": { "xp": 0, "level": 1, "cardsReviewedToday": 0, "streak": 0, "lastStudiedDate": null, "dailyGoal": 20, "longestStreak": 0, "totalCardsReviewed": 0, "totalSessions": 0, "totalStudyTime": 0, "accuracy": 100, "xpToNextLevel": 100 },
      "reviewHistory": [],
      "dailyProgress": {}
    },
    "version": 0
  },
  "uiStoreFullState": { // Provide a minimal valid structure
    "state": {
      "preferences": { "darkMode": false, "notificationsEnabled": false, "reminderTime": "09:00", "dailyGoal": 20, "showConfetti": true, "language": "en" },
      "hasHydrated": true
    },
    "version": 0
  }
}

Deck Structure (for each object in "deckStoreFullState.state.decks"):
- "id": REQUIRED. String. A unique UUID (e.g., "d1e8f7b1-3c9a-4f5e-8d7c-2b6a9e0f1d2c").
- "name": REQUIRED. String. Deck's name (e.g., "Spanish Vocabulary").
- "description": String. Deck's description (can be empty).
- "cardIds": REQUIRED. Array of strings. Each string must be a UUID of a card in "cardStoreFullState.state.cards" belonging to this deck.
- "createdAt": REQUIRED. String. ISO date string (e.g., "2023-10-27T10:00:00.000Z").
- "updatedAt": REQUIRED. String. ISO date string (e.g., "2023-10-27T10:00:00.000Z").
- "isShared": Boolean. Set to false.
- "shareId": String. Set to empty string "".

Card Structure (for each object in "cardStoreFullState.state.cards"):
- "id": REQUIRED. String. A unique UUID (e.g., "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6").
- "deckId": REQUIRED. String. The UUID of the deck this card belongs to (must match an "id" from the decks array).
- "front": REQUIRED. String. Card's front/question. Supports Markdown.
- "back": REQUIRED. String. Card's back/answer. Supports Markdown.
- "interval": REQUIRED. Number. Initial value: 1.
- "repetition": REQUIRED. Number. Initial value: 0.
- "efactor": REQUIRED. Number. Initial value: 2.5.
- "dueDate": REQUIRED. String. ISO date string for the next review. For new cards, set to today's date for immediate review.
- "createdAt": REQUIRED. String. ISO date string.
- "updatedAt": REQUIRED. String. ISO date string.
- "lastReviewed": String or null. Initial value: null.

Key Instructions for AI:
1.  Generate unique UUIDs for all "id" fields (for decks and cards).
2.  Ensure "cardIds" in decks correctly list the "id"s of their associated cards.
3.  Ensure "deckId" in cards correctly refers to the "id" of their parent deck.
4.  Set "createdAt", "updatedAt", and "dueDate" to the current date/time in ISO format. "dueDate" should make cards due today.
5.  "interval" should be 1, "repetition" 0, "efactor" 2.5, and "lastReviewed" null for new cards.
6.  Fill "deckStoreFullState.state.decks" and "cardStoreFullState.state.cards" based on user's topic and desired quantity.
7.  The "statsStoreFullState" and "uiStoreFullState" provided above are minimal examples; use them as is.
8.  Output ONLY the final JSON object. No extra text, greetings, or explanations.
`.trim();

  const handleToggleDarkMode = () => {
    const currentDarkMode = preferences.darkMode;
    updatePreferences({ darkMode: !currentDarkMode });
    // DOM manipulation will be handled by a global effect in App.tsx
  };
  
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    // Optionally, persist language choice in user preferences if desired
    // updatePreferences({ language: lang }); 
  };
  
  const handleToggleNotifications = async () => {
    if (!preferences.notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        updatePreferences({ notificationsEnabled: true });
        if (preferences.reminderTime) {
          scheduleReminder(preferences.reminderTime);
        }
        toast({
          title: "Notifications enabled",
          description: "You will receive daily reminders to study your flashcards.",
        });
      } else {
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    } else {
      updatePreferences({ notificationsEnabled: false });
      unscheduleReminders();
      toast({
        title: "Notifications disabled",
        description: "You will no longer receive daily reminders.",
      });
    }
  };
  
  const handleReminderTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReminderTime(e.target.value);
  };
  
  const handleSaveReminderTime = () => {
    unscheduleReminders();
    updatePreferences({ reminderTime });
    if (preferences.notificationsEnabled) {
      scheduleReminder(reminderTime);
      toast({
        title: "Reminder time updated",
        description: `Daily reminders set for ${reminderTime}`,
      });
    } else {
      toast({
        title: "Reminder time saved",
        description: "Enable notifications to receive reminders at this time.",
        variant: "info",
      });
    }
  };
  
  const handleDailyGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDailyGoal(e.target.value);
  };
  
  const handleSaveDailyGoal = () => {
    const goal = parseInt(dailyGoal);
    if (!isNaN(goal) && goal > 0) {
      updatePreferences({ dailyGoal: goal });
      toast({
        title: "Daily goal updated",
        description: `Your daily review goal is now ${goal} cards`,
      });
    }
  };
  
  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `flashcards-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      toast({
        title: "Export successful",
        description: "Your data has been exported successfully",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was a problem exporting your data",
        variant: "destructive",
      });
    }
  };
  
  const handleImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
    }
  };
  
  const handleImport = async () => {
    if (!importFile) return;
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        await importData(text);
        toast({
          title: "Import successful",
          description: "Your data has been imported successfully",
        });
        // Reload to show imported data
        window.location.reload();
      };
      reader.readAsText(importFile);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: "There was a problem importing your data",
        variant: "destructive",
      });
    }
  };
  
  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(aiPromptText)
      .then(() => {
        toast({
          title: "Prompt Copied!",
          description: "The AI prompt has been copied to your clipboard.",
        });
      })
      .catch(err => {
        console.error('Failed to copy prompt: ', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy the prompt. Please try again or copy manually.",
          variant: "destructive",
        });
      });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('settings_title')}</CardTitle>
          <CardDescription>
            Customize how the application looks and behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">{t('settings_dark_mode')}</Label>
            <Switch
              id="dark-mode"
              checked={preferences.darkMode}
              onCheckedChange={handleToggleDarkMode}
            />
          </div>

          <div>
            <Label htmlFor="language-select">{t('settings_language_label')}</Label>
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language-select" className="w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
                {/* Add more languages here */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('settings_notifications')}</CardTitle>
          <CardDescription>
            Configure reminder notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">
              {t('settings_notifications')}
              {!isNotificationSupported() && (
                <span className="block text-sm text-destructive">
                  Not supported in this browser
                </span>
              )}
            </Label>
            <Switch
              id="notifications"
              checked={preferences.notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
              disabled={!isNotificationSupported()}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reminder-time">{t('settings_reminder_time')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={handleReminderTimeChange}
                disabled={!preferences.notificationsEnabled}
              />
              <Button 
                onClick={handleSaveReminderTime}
                disabled={!preferences.notificationsEnabled}
              >
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Study Goals</CardTitle>
          <CardDescription>
            Set your daily study targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="daily-goal">{t('settings_daily_goal')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="daily-goal"
                type="number"
                min="1"
                max="100"
                value={dailyGoal}
                onChange={handleDailyGoalChange}
              />
              <Button onClick={handleSaveDailyGoal}>
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('settings_import_export_title')}</CardTitle>
          <CardDescription>
            Export or import your flashcard data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button onClick={handleExport} variant="outline">
              {t('settings_export_button')}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Download all your decks and cards as a JSON file
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="import-file">{t('settings_import_button')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportChange}
              />
              <Button 
                onClick={handleImport}
                disabled={!importFile}
              >
                Import
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Warning: This will replace all your current data
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate Flashcard Data with AI</CardTitle>
          <CardDescription>
            Use this prompt with an AI (like ChatGPT, Claude, Gemini, etc.) to generate flashcard data in the correct JSON format for import.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click the button below to reveal the prompt. Copy it and provide it to your chosen AI. Tell the AI the topic and number of flashcards you want.
            Once the AI generates the JSON, save it as a .json file and use the "Import Data" feature above.
          </p>
          <Button onClick={() => setShowAiPrompt(!showAiPrompt)} variant="outline">
            {showAiPrompt ? "Hide AI Prompt" : "Show AI Prompt"}
          </Button>
          {showAiPrompt && (
            <div className="space-y-2 pt-2">
              <Textarea
                readOnly
                value={aiPromptText}
                className="h-64 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
              <Button onClick={handleCopyPrompt} className="mt-2">
                <Copy className="mr-2 h-4 w-4" /> Copy Prompt
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings_data_management')}</CardTitle>
          <CardDescription>
            Export or import your flashcard data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Button onClick={handleExport} variant="outline">
              {t('settings_export_button')}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Download all your decks and cards as a JSON file
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="import-file">{t('settings_import_button')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleImportChange}
              />
              <Button 
                onClick={handleImport}
                disabled={!importFile}
              >
                Import
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Warning: This will replace all your current data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
