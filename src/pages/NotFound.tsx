import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, Car } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 illustration */}
        <div className="relative mb-8">
          <div className="text-[10rem] font-extrabold text-muted leading-none select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-gold-500/10 rounded-full flex items-center justify-center">
              <Car className="w-12 h-12 text-gold-500" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mb-3">
          Page not found
        </h1>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          Looks like this car drove off! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="default" size="lg" onClick={() => navigate('/')} className="gap-2">
            <Home className="w-4 h-4" /> Go home
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/search')} className="gap-2">
            <Search className="w-4 h-4" /> Browse cars
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
