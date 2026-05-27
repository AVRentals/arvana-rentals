import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Tag } from 'lucide-react';
import Footer from '@/components/Footer';

const POSTS = [
  {
    id: 1,
    slug: 'florida-road-trips-2025',
    title: 'The 8 Best Road Trips You Can Take in Florida',
    excerpt: 'From the Keys Overseas Highway to the Emerald Coast — we\'ve mapped the most breathtaking drives across the Sunshine State for your next unforgettable adventure.',
    category: 'Travel',
    readTime: '6 min read',
    date: 'Mar 18, 2025',
    img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=500&fit=crop',
    featured: true,
  },
  {
    id: 2,
    slug: 'electric-vehicles-guide',
    title: 'Your Complete Guide to Renting an EV in Florida',
    excerpt: 'Thinking about going electric for your next Florida trip? Here\'s everything you need to know — charging networks across the state, range tips, and the best EVs to rent.',
    category: 'Tips',
    readTime: '8 min read',
    date: 'Mar 10, 2025',
    img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=500&fit=crop',
    featured: false,
  },
  {
    id: 3,
    slug: 'luxury-car-miami',
    title: 'How to Make a Luxury Car Weekend in Miami Worth It',
    excerpt: 'Renting a Lamborghini or Porsche in Miami is more accessible than you think. Here\'s how to plan an unforgettable South Beach experience.',
    category: 'Luxury',
    readTime: '5 min read',
    date: 'Feb 28, 2025',
    img: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=500&fit=crop',
    featured: false,
  },
  {
    id: 4,
    slug: 'car-rental-tips-money',
    title: '7 Ways to Save Money on Your Next Florida Car Rental',
    excerpt: 'Smart booking strategies, when to book, and which add-ons to skip — our guide to getting the best deal every time on Arvana Rentals.',
    category: 'Tips',
    readTime: '4 min read',
    date: 'Feb 14, 2025',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop',
    featured: false,
  },
  {
    id: 5,
    slug: 'best-cars-florida-family-trips',
    title: 'The Best Cars for Florida Family Adventures',
    excerpt: 'Space, safety, and entertainment — we ranked the top family-friendly rentals on Arvana Rentals for Disney World trips, beach days, and everything in between.',
    category: 'Family',
    readTime: '7 min read',
    date: 'Jan 30, 2025',
    img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=500&fit=crop',
    featured: false,
  },
  {
    id: 6,
    slug: 'arvanarentals-app-update',
    title: 'Introducing the New Arvana Rentals App Experience',
    excerpt: 'We rebuilt our app from the ground up. Faster search, smarter recommendations, and a seamless booking flow — here\'s what\'s new.',
    category: 'Product',
    readTime: '3 min read',
    date: 'Jan 15, 2025',
    img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=500&fit=crop',
    featured: false,
  },
];

const CATEGORIES = ['All', 'Travel', 'Tips', 'Luxury', 'Family', 'Product'];

const CATEGORY_COLORS: Record<string, string> = {
  Travel: 'bg-blue-50 text-blue-600 border-blue-200/50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50',
  Tips: 'bg-emerald-50 text-emerald-600 border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50',
  Luxury: 'bg-gold-50 text-gold-700 border-gold-200/50 dark:bg-gold-900/20 dark:text-gold-400 dark:border-gold-800/50',
  Family: 'bg-purple-50 text-purple-600 border-purple-200/50 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50',
  Product: 'bg-cyan-50 text-cyan-600 border-cyan-200/50 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800/50',
};

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const featured = POSTS.find(p => p.featured);
  const rest = POSTS.filter(p => !p.featured && (activeCategory === 'All' || p.category === activeCategory));
  const filteredFeatured = activeCategory === 'All' || featured?.category === activeCategory ? featured : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-32 pb-16 bg-charcoal-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="section-label justify-center text-gold-400 mb-4">The Arvana Rentals Journal</div>
          <h1 className="display-xl font-serif text-white mb-4">
            Stories, guides, and<br />
            <span className="text-gold-gradient">inspiration on the road.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Road trip ideas, car tips, and the latest from the Arvana Rentals team.
          </p>
        </div>
      </section>

      {/* Category filter */}
      <section className="py-8 bg-sand dark:bg-charcoal-900/50 border-b border-border sticky top-16 z-30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-gold-gradient text-charcoal-900 shadow-gold-sm'
                    : 'bg-card border border-border text-muted-foreground hover:border-gold-400 hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

          {/* Featured post */}
          {filteredFeatured && (
            <div
              className="group cursor-pointer rounded-3xl overflow-hidden bg-card border border-border hover:border-gold-300/50 hover:shadow-gold transition-all duration-300"
              onClick={() => {}}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto overflow-hidden">
                  <img
                    src={filteredFeatured.img}
                    alt={filteredFeatured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${CATEGORY_COLORS[filteredFeatured.category]}`}>
                      Featured
                    </span>
                  </div>
                </div>
                <div className="p-8 lg:p-10 flex flex-col justify-center">
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border w-fit mb-4 ${CATEGORY_COLORS[filteredFeatured.category]}`}>
                    <Tag className="w-3 h-3" />{filteredFeatured.category}
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-3 leading-snug">{filteredFeatured.title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">{filteredFeatured.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{filteredFeatured.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{filteredFeatured.readTime}</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-bold text-gold-600 dark:text-gold-400 group-hover:gap-2 transition-all">
                      Read <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map(post => (
              <div
                key={post.id}
                className="group cursor-pointer rounded-3xl overflow-hidden bg-card border border-border hover:border-gold-300/50 hover:shadow-gold-sm transition-all duration-300"
                onClick={() => {}}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-5">
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border mb-3 ${CATEGORY_COLORS[post.category]}`}>
                    <Tag className="w-3 h-3" />{post.category}
                  </span>
                  <h3 className="font-bold text-foreground leading-snug mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {rest.length === 0 && !filteredFeatured && (
            <p className="text-center text-muted-foreground py-12">No posts in this category yet. Check back soon!</p>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-charcoal-900">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="display-lg font-serif text-white mb-3">
            Never miss a <span className="text-gold-gradient">story.</span>
          </h2>
          <p className="text-white/50 mb-8">Get the best road trip ideas and car tips delivered to your inbox weekly.</p>
          <form className="flex gap-2" onSubmit={e => { e.preventDefault(); }}>
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-gold-400 transition-colors"
            />
            <button type="submit" className="btn-gold px-6 py-3 rounded-xl font-bold flex-shrink-0">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
