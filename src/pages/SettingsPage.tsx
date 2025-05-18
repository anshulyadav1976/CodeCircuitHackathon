
import React from 'react';
import Settings from '../components/Settings';

const SettingsPage: React.FC = () => {
  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      <div className="flex flex-col justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure the application to your preferences
          </p>
        </div>
      </div>
      
      <Settings />
    </div>
  );
};

export default SettingsPage;
