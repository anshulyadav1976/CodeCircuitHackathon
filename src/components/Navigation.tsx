import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUIStore, useStatsStore } from '../store';
import { Button } from '../components/ui/button';
import { MoonIcon, SunIcon, FlameIcon, StarIcon, ShieldCheckIcon, TrendingUpIcon } from 'lucide-react';

const Navigation: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { preferences, toggleDarkMode } = useUIStore();
  const { userStats } = useStatsStore();
  const [animateXP, setAnimateXP] = useState(false);
  const prevXPRef = useRef(userStats.xpPoints);

  useEffect(() => {
    if (userStats.xpPoints > prevXPRef.current) {
      setAnimateXP(true);
      const timer = setTimeout(() => setAnimateXP(false), 300); // Duration of animation
      prevXPRef.current = userStats.xpPoints;
      return () => clearTimeout(timer);
    }
    // Update ref if XP decreases for some reason (e.g. data reset, though not typical)
    if (userStats.xpPoints < prevXPRef.current) {
      prevXPRef.current = userStats.xpPoints;
    }
  }, [userStats.xpPoints]);

  return (
    <nav className="py-3 px-4 md:px-6 bg-card shadow-sm border-b border-border">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl md:text-2xl font-bold text-primary flex items-center">
            {t('appName')}
          </Link>
        </div>
        
        <div className="hidden md:flex items-center space-x-1 md:space-x-2">
          <NavLink to="/" currentPath={location.pathname}>
            {t('nav_decks')}
          </NavLink>
          <NavLink to="/study" currentPath={location.pathname}>
            {t('nav_study')}
          </NavLink>
          <NavLink to="/stats" currentPath={location.pathname}>
            {t('nav_stats')}
          </NavLink>
          <NavLink to="/settings" currentPath={location.pathname}>
            {t('nav_settings')}
          </NavLink>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground border-r border-border pr-2 md:pr-3">
            <div className="flex items-center gap-1" title={`Streak: ${userStats.streak} days`}>
              <FlameIcon className="h-4 w-4 text-orange-500" />
              <span>{userStats.streak}</span>
            </div>
            <div 
              className={`flex items-center gap-1 ${animateXP ? 'xp-pop' : ''}`}
              title={`XP: ${userStats.xpPoints}`}
            >
              <StarIcon className="h-4 w-4 text-yellow-500" />
              <span>{userStats.xpPoints}</span>
            </div>
            <div className="flex items-center gap-1" title={`Level: ${userStats.level}`}>
              <ShieldCheckIcon className="h-4 w-4 text-green-500" /> 
              <span>{userStats.level}</span>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => toggleDarkMode()}
            aria-label="Toggle theme"
            className="rounded-full h-8 w-8 md:h-9 md:w-9"
          >
            {preferences.darkMode ? (
              <SunIcon className="h-4 w-4 md:h-5 md:w-5" />
            ) : (
              <MoonIcon className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  currentPath: string;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, currentPath, children }) => {
  const isActive = currentPath === to || 
    (to !== '/' && currentPath.startsWith(to));
  
  return (
    <Link
      to={to}
      className={`px-2 py-1 md:px-3 md:py-2 rounded-md text-sm transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navigation;
