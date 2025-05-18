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

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { preferences, updatePreferences } = useUIStore();
  const [reminderTime, setReminderTime] = useState(preferences.reminderTime || '09:00');
  const [dailyGoal, setDailyGoal] = useState(preferences.dailyGoal.toString());
  const [importFile, setImportFile] = useState<File | null>(null);
  
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
    </div>
  );
};

export default Settings;
