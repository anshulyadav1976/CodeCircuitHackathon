import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useStatsStore, useUIStore } from '../store';
import { ReviewResult, UserPreferences } from '../types';
import { 
  startOfDay, startOfWeek, startOfMonth, 
  endOfDay, endOfWeek, endOfMonth,
  eachDayOfInterval, format, isWithinInterval, isToday
} from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2 } from 'lucide-react';

const StatsChart: React.FC = () => {
  const { reviewSessions, userStats } = useStatsStore();
  const { preferences } = useUIStore();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Calculate date ranges
  const now = new Date();
  const getDateRange = () => {
    switch (period) {
      case 'daily':
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
      case 'weekly':
        return {
          start: startOfWeek(now),
          end: endOfWeek(now)
        };
      case 'monthly':
        return {
          start: startOfMonth(now),
          end: endOfMonth(now)
        };
      default:
        return {
          start: startOfDay(now),
          end: endOfDay(now)
        };
    }
  };
  
  const dateRange = useMemo(() => getDateRange(), [period, now]);
  
  // Filter sessions within date range
  const filteredSessions = useMemo(() => 
    reviewSessions.filter(session => 
      isWithinInterval(new Date(session.date), dateRange)
    )
  , [reviewSessions, dateRange]);
  
  // Prepare data for daily review counts
  const dailyReviewData = useMemo(() => {
    const rangeToUse = (period === 'daily') 
        ? { start: startOfDay(now), end: endOfDay(now) } // For daily tab, always show today
        : dateRange; // For weekly/monthly, use selected range for x-axis
    
    const days = eachDayOfInterval(rangeToUse);
    
    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      // Count reviews for this day
      const dayReviews = reviewSessions.filter(session => 
        isWithinInterval(new Date(session.date), { start: dayStart, end: dayEnd })
      );
      
      // Count cards reviewed
      const cardsReviewed = dayReviews.reduce(
        (sum, session) => sum + session.cardsReviewed.length, 
        0
      );
      
      return {
        date: format(day, 'MMM dd'),
        reviews: cardsReviewed,
        isToday: isToday(day) // Add flag for today
      };
    });
  }, [reviewSessions, dateRange, period, now]);
  
  // Calculate cards reviewed today for the daily goal
  const cardsReviewedToday = useMemo(() => {
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    return reviewSessions
      .filter(session => isWithinInterval(new Date(session.date), { start: todayStart, end: todayEnd }))
      .reduce((sum, session) => sum + session.cardsReviewed.length, 0);
  }, [reviewSessions, now]);
  
  // Prepare data for accuracy
  const getAccuracyData = () => {
    // Count totals for each result
    const resultCounts = filteredSessions.flatMap(
      session => session.cardsReviewed
    ).reduce((acc, { result }) => {
      acc[result] = (acc[result] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    return [
      { name: 'Forgot', value: resultCounts[ReviewResult.FORGOT] || 0, color: '#f43f5e' },
      { name: 'Hard', value: resultCounts[ReviewResult.HARD] || 0, color: '#f59e0b' },
      { name: 'Good', value: resultCounts[ReviewResult.GOOD] || 0, color: '#3b82f6' },
      { name: 'Easy', value: resultCounts[ReviewResult.EASY] || 0, color: '#22c55e' },
    ];
  };
  
  // Accuracy data
  const accuracyData = useMemo(() => getAccuracyData(), [filteredSessions]);
  const totalReviews = accuracyData.reduce((sum, item) => sum + item.value, 0);
  
  const dailyGoal = preferences.dailyGoal || 0;
  const dailyGoalAchieved = cardsReviewedToday >= dailyGoal;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Study Overview</CardTitle>
          <CardDescription>
            Your study activity and progress for the selected period.
          </CardDescription>
          <div className="mt-2">
            <Tabs defaultValue="daily" onValueChange={(v) => setPeriod(v as 'daily' | 'weekly' | 'monthly')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily">Today</TabsTrigger>
                <TabsTrigger value="weekly">This Week</TabsTrigger>
                <TabsTrigger value="monthly">This Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyReviewData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="reviews" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Study Accuracy</CardTitle>
            <CardDescription>
              Breakdown of review results for the selected period.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accuracyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {totalReviews === 0 && (
              <div className="text-center text-muted-foreground mt-4">
                No review data available for this period
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Progress</CardTitle>
            <CardDescription>
              Your learning achievements and goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground">Today's Goal</dt>
                <dd className={`font-semibold flex items-center ${dailyGoalAchieved ? 'text-green-500' : ''}`}>
                  {dailyGoalAchieved && <CheckCircle2 className="h-4 w-4 mr-1" />}
                  {cardsReviewedToday} / {dailyGoal} cards
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">Current Streak</dt>
                <dd className="font-semibold">{userStats.streak} days</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total Cards Reviewed</dt>
                <dd className="font-semibold">{userStats.totalCardsReviewed}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total XP</dt>
                <dd className="font-semibold">{userStats.xpPoints} XP</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Level</dt>
                <dd className="font-semibold">{userStats.level}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-1">XP to Next Level</dt>
                <dd>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300 ease-in-out"
                      style={{ 
                        width: `${Math.min(
                          ((userStats.xpPoints - (Math.pow(userStats.level - 1, 2) * 100)) / 
                          ((Math.pow(userStats.level, 2) - Math.pow(userStats.level - 1, 2)) * 100)) * 100, 
                          100
                        )}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 text-right">
                    {userStats.xpPoints - (Math.pow(userStats.level - 1, 2) * 100)} / {(Math.pow(userStats.level, 2) - Math.pow(userStats.level - 1, 2)) * 100} XP
                  </div>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsChart;
