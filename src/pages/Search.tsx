import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal, MapPin, X, ChevronDown, ChevronUp,
  LayoutGrid, Map as MapIcon, ArrowUpDown, Search as SearchIcon, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import CarCard from '@/components/CarCard';
import { CarCardSkeleton } from '@/components/LoadingSkeleton';
import { categories } from '@/data/sampleData';
import { getCarsWithFallback } from '@/lib/supabase';
import { Car } from '@/types';
import { formatCurrency } from '@/lib/utils';
import Footer from '@/components/Footer';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'top_rated', label: 'Top Rated' },
];

const TRANSMISSION_OPTIONS = [
  { value: 'all', label: 'Any' },
  { value: 'auto', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
];

const FUEL_OPTIONS = [
  { value: 'all', label: 'Any' },
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'diesel', label: 'Diesel' },
];

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cars, setCars] = useState<Car[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('recommended');

  // Filter state
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [minSeats, setMinSeats] = useState(1);
  const [transmission, setTransmission] = useState('all');
  const [fuelType, setFuelType] = useState('all');
  const [instantBook, setInstantBook] = useState(false);
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || '');

  // Load real fleet data (falls back to local data if Supabase isn't connected yet)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCarsWithFallback().then(data => {
      if (!cancelled) {
        setCars(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...cars];

    if (selectedCategory !== 'all') result = result.filter(c => c.category === selectedCategory);
    result = result.filter(c => c.daily_rate >= priceRange[0] && c.daily_rate <= priceRange[1]);
    if (minSeats > 1) result = result.filter(c => c.seats >= minSeats);
    if (transmission !== 'all') result = result.filter(c => c.transmission === transmission);
    if (fuelType !== 'all') result = result.filter(c => c.fuel_type === fuelType);
    if (instantBook) result = result.filter(c => c.is_available);
    if (locationQuery) result = result.filter(c =>
      c.city.toLowerCase().includes(locationQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(locationQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'price_asc': result.sort((a, b) => a.daily_rate - b.daily_rate); break;
      case 'price_desc': result.sort((a, b) => b.daily_rate - a.daily_rate); break;
      case 'top_rated': result.sort((a, b) => b.rating - a.rating); break;
      default: result.sort((a, b) => b.total_trips - a.total_trips);
    }

    return result;
  }, [cars, selectedCategory, priceRange, minSeats, transmission, fuelType, instantBook, locationQuery, sortBy]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 1500]);
    setMinSeats(1);
    setTransmission('all');
    setFuelType('all');
    setInstantBook(false);
  };

  const hasActiveFilters = selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 1500
    || minSeats > 1 || transmission !== 'all' || fuelType !== 'all' || instantBook;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Price range */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm">Price per day</h3>
          <span className="text-sm text-muted-foreground font-medium">
            {formatCurrency(priceRange[0])} – {formatCurrency(priceRange[1])}
          </span>
        </div>
        <Slider
          min={0} max={1500} step={10}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mt-2"
        />
      </div>

      <div className="border-t" />

      {/* Categories */}
      <div>
        <h3 className="font-bold text-sm mb-3">Car type</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setSelectedCategory(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedCategory === id
                  ? 'bg-charcoal-900 text-white border-charcoal-900 dark:bg-white dark:text-charcoal-900'
                  : 'border-border hover:border-gold-400 hover:text-gold-600'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t" />

      {/* Seats */}
      <div>
        <h3 className="font-bold text-sm mb-3">Minimum seats</h3>
        <div className="flex gap-2">
          {[1, 2, 4, 5, 7].map(n => (
            <button
              key={n}
              onClick={() => setMinSeats(n)}
              className={`w-10 h-10 rounded-lg text-sm font-bold border transition-all ${
                minSeats === n
                  ? 'bg-gold-500 text-white border-gold-400'
                  : 'border-border hover:border-gold-400'
              }`}
            >
              {n === 7 ? '7+' : n}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t" />

      {/* Transmission */}
      <div>
        <h3 className="font-bold text-sm mb-3">Transmission</h3>
        <div className="flex gap-2">
          {TRANSMISSION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setTransmission(opt.value)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                transmission === opt.value
                  ? 'bg-charcoal-900 text-white border-charcoal-900 dark:bg-white dark:text-charcoal-900'
                  : 'border-border hover:border-gold-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t" />

      {/* Fuel type */}
      <div>
        <h3 className="font-bold text-sm mb-3">Fuel type</h3>
        <div className="grid grid-cols-2 gap-2">
          {FUEL_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFuelType(opt.value)}
              className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                fuelType === opt.value
                  ? 'bg-charcoal-900 text-white border-charcoal-900 dark:bg-white dark:text-charcoal-900'
                  : 'border-border hover:border-gold-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t" />

      {/* Instant book toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm">Instant book</h3>
          <p className="text-xs text-muted-foreground">No approval needed</p>
        </div>
        <button
          onClick={() => setInstantBook(!instantBook)}
          className={`relative w-12 h-6 rounded-full transition-colors ${instantBook ? 'bg-gold-500' : 'bg-muted'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${instantBook ? 'translate-x-6' : ''}`} />
        </button>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full gap-2 text-gold-600 border-gold-400">
          <X className="w-4 h-4" /> Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Top search bar */}
      <div className="sticky top-16 z-30 bg-background border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-xl px-3 py-2 border border-border max-w-md">
            <SearchIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              value={locationQuery}
              onChange={e => setLocationQuery(e.target.value)}
              placeholder="Search by city or location..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
            />
            {locationQuery && (
              <button onClick={() => setLocationQuery('')}>
                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative hidden sm:block">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none bg-muted border border-border rounded-xl px-4 py-2 pr-8 text-sm font-semibold outline-none focus:ring-2 focus:ring-gold-400 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* View toggle */}
          <div className="flex border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-charcoal-900 text-white' : 'hover:bg-muted'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2.5 transition-colors ${viewMode === 'map' ? 'bg-charcoal-900 text-white' : 'hover:bg-muted'}`}
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile filter toggle */}
          <Button
            variant={hasActiveFilters ? 'gold' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasActiveFilters && <span className="w-4 h-4 bg-white/20 rounded-full text-xs flex items-center justify-center">!</span>}
          </Button>
        </div>

        {/* Mobile filter dropdown */}
        {showFilters && (
          <div className="lg:hidden border-t bg-background px-4 py-4 max-h-[60vh] overflow-y-auto">
            <FilterPanel />
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-36 bg-card rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-lg">Filters</h2>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-gold-600 font-semibold hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-extrabold text-foreground">
                  {loading ? 'Searching...' : `${filteredAndSorted.length} cars available`}
                </h1>
                {locationQuery && (
                  <p className="text-muted-foreground text-sm flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" /> {locationQuery}
                  </p>
                )}
              </div>
            </div>

            {viewMode === 'map' ? (
              /* Map placeholder */
              <div className="relative rounded-2xl overflow-hidden border border-border bg-muted" style={{ height: 600 }}>
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=600&fit=crop"
                  alt="Map view"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white dark:bg-charcoal-900 rounded-2xl p-6 text-center shadow-xl max-w-sm">
                    <MapIcon className="w-12 h-12 text-gold-500 mx-auto mb-3" />
                    <h3 className="font-bold text-lg mb-1">Interactive Map</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Connect Google Maps or Mapbox to enable the interactive map view with real car locations.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setViewMode('grid')}>
                      View as grid
                    </Button>
                  </div>
                </div>
                {/* Fake car pins */}
                {filteredAndSorted.slice(0, 5).map((car, i) => (
                  <div
                    key={car.id}
                    className="absolute bg-charcoal-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg cursor-pointer hover:bg-gold-500 transition-colors"
                    style={{ top: `${20 + i * 12}%`, left: `${15 + i * 14}%` }}
                  >
                    ${car.daily_rate}/day
                  </div>
                ))}
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <CarCardSkeleton key={i} />)}
              </div>
            ) : filteredAndSorted.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 text-4xl">🔍</div>
                <h3 className="text-2xl font-extrabold mb-2">No cars found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Try adjusting your filters or searching in a different location.
                </p>
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" /> Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSorted.map(car => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Search;
