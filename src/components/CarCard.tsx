import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Zap, MapPin, Users, Fuel } from 'lucide-react';
import { Car } from '@/types';
import { formatCurrency, toggleSavedCar, isCarSaved, cn } from '@/lib/utils';

interface CarCardProps {
  car: Car;
  className?: string;
}

const categoryLabel: Record<string, string> = {
  economy: 'Economy',
  suv: 'SUV',
  luxury: 'Luxury',
  electric: 'Electric',
  sports: 'Sports',
};

const categoryStyle: Record<string, string> = {
  economy: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  suv:     'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  luxury:  'bg-gold-500/15 text-gold-700 dark:text-gold-400',
  electric:'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
  sports:  'bg-rose-500/15 text-rose-600 dark:text-rose-400',
};

const CarCard: React.FC<CarCardProps> = ({ car, className }) => {
  const [saved, setSaved]       = useState(isCarSaved(car.id));
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered]   = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(toggleSavedCar(car.id));
  };

  const mainImage = imgError
    ? 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=500&fit=crop'
    : (car.images[0] || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=500&fit=crop');

  return (
    <Link
      to={`/cars/${car.id}`}
      className={cn('group block outline-none', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="car-card rounded-3xl overflow-hidden bg-card border border-border/60 shadow-card">

        {/* ── Image ── */}
        <div className="relative overflow-hidden h-52 bg-muted">
          <img
            src={mainImage}
            alt={`${car.year} ${car.make} ${car.model}`}
            className="car-card-img w-full h-full object-cover"
            onError={() => setImgError(true)}
          />

          {/* Dark overlay on hover */}
          <div className={`absolute inset-0 bg-charcoal-900/30 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`} />

          {/* Top-left: category + EV badge */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${categoryStyle[car.category] || 'bg-muted text-muted-foreground'}`}>
              {categoryLabel[car.category] || car.category}
            </span>
            {car.fuel_type === 'electric' && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 backdrop-blur-sm flex items-center gap-1">
                <Zap className="w-2.5 h-2.5" /> EV
              </span>
            )}
          </div>

          {/* Instant badge */}
          {car.is_available && (
            <div className="absolute bottom-3 left-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/90 text-white backdrop-blur-sm flex items-center gap-1">
                ⚡ Instant Book
              </span>
            </div>
          )}

          {/* Heart button */}
          <button
            onClick={handleSave}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
              saved
                ? 'bg-red-500 text-white'
                : 'bg-white/90 dark:bg-charcoal-800/90 backdrop-blur-sm text-charcoal-400 hover:text-red-500'
            }`}
            aria-label={saved ? 'Remove from saved' : 'Save car'}
          >
            <Heart className={cn('w-3.5 h-3.5 transition-all', saved && 'fill-current')} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="p-4 pt-3.5">

          {/* Title */}
          <h3 className="font-extrabold text-foreground text-[15px] leading-tight mb-1.5 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
            {car.year} {car.make} {car.model}
          </h3>

          {/* Rating + location */}
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
              <span className="font-bold text-foreground">{car.rating.toFixed(1)}</span>
              <span>({car.total_trips})</span>
            </div>
            <span className="text-border">·</span>
            <div className="flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />
              <span>{car.city}</span>
            </div>
          </div>

          {/* Specs row */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-lg px-2 py-1">
              <Users className="w-3 h-3" />
              <span>{car.seats}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 rounded-lg px-2 py-1">
              <Fuel className="w-3 h-3" />
              <span className="capitalize">{car.fuel_type}</span>
            </div>
            {car.features.slice(0, 1).map(f => (
              <div key={f} className="text-xs text-muted-foreground bg-muted/60 rounded-lg px-2 py-1 truncate max-w-[80px]">
                {f}
              </div>
            ))}
            {car.features.length > 1 && (
              <div className="text-xs text-muted-foreground bg-muted/60 rounded-lg px-2 py-1">
                +{car.features.length - 1}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="gold-divider mb-3.5" />

          {/* Price + CTA */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-foreground">
                {formatCurrency(car.daily_rate)}
              </span>
              <span className="text-muted-foreground text-xs font-medium">/day</span>
            </div>

            <button className="btn-gold text-xs px-4 py-2 rounded-xl group-hover:shadow-gold-sm">
              Book now
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;
