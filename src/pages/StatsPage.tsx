
import React from 'react';
import StatsChart from '../components/StatsChart';

const StatsPage: React.FC = () => {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Statistics</h1>
          <p className="text-muted-foreground">
            Track your learning progress
          </p>
        </div>
      </div>
      
      <StatsChart />
    </div>
  );
};

export default StatsPage;
