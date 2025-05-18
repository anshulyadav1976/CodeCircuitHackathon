
import React from 'react';
import { useStatsStore } from '../store';
import { formatNumber } from '../utils/helpers';
import { formatStudyTime } from '../utils/dateUtils';

const ProgressStats: React.FC = () => {
  const { userStats } = useStatsStore();
  
  // Calculate XP needed for next level
  const currentLevelXP = Math.pow(userStats.level - 1, 2) * 100;
  const nextLevelXP = Math.pow(userStats.level, 2) * 100;
  const xpForCurrentLevel = userStats.xpPoints - currentLevelXP;
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
  const progressPercent = (xpForCurrentLevel / xpNeededForNextLevel) * 100;
  
  return (
    <div className="bg-card rounded-lg shadow-sm p-6 border">
      <h2 className="text-xl font-bold mb-4">Your Progress</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Level</div>
          <div className="text-3xl font-bold">{userStats.level}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Streak</div>
          <div className="text-3xl font-bold">{userStats.streak} days</div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>XP Progress</span>
          <span>
            {formatNumber(xpForCurrentLevel)} / {formatNumber(xpNeededForNextLevel)} XP
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Cards Reviewed</div>
          <div className="text-xl font-semibold">{formatNumber(userStats.totalCardsReviewed)}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground mb-1">Study Time</div>
          <div className="text-xl font-semibold">{formatStudyTime(userStats.totalStudyTime)}</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressStats;
