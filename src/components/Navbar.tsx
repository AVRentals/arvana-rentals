import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Search, Bell, Gauge, ChevronDown,
  User, LayoutDashboard, Heart, Settings, LogOut, Moon, Sun,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getInitials, getTheme, setTheme } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import toast from 'react-hot-toast';

const Navbar: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [dark, setDark]             = useState(getTheme() === 'dark');
  const [searchQuery, setSearchQuery] = useState('');

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const toggleDark = () => {
    const next = dark ? 'light' : 'dark';
    setTheme(next);
    setDark(!dark);
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/search?location=${encodeURIComponent(searchQuery)}` : '/search');
  };

  // On the hero, start transparent; after scroll or on inner pages, show glass
  const showSolid = scrolled || !isHome;

  const navClass = showSolid
    ? 'bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-xl border-b border-gold-200/50 dark:border-gold-900/30 shadow-sm'
    : 'bg-transparent border-b border-transparent';

  const textClass = showSolid ? 'text-charcoal-900 dark:text-white' : 'text-white';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${navClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <span className="text-gold-gradient" style={{ fontFamily: '"Barlow Condensed", system-ui, sans-serif', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.04em', lineHeight: 1 }}>AR</span>
              <span className={`font-extrabold tracking-tight transition-colors leading-none ${textClass}`}
                style={{ fontFamily: '"Barlow Condensed", system-ui, sans-serif', fontSize: '1.35rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Arvana<span className="text-gold-500"> Rentals</span>
              </span>
            </Link>

            {/* ── Search bar (desktop, shown when scrolled or not home) ── */}
            {(!isHome || scrolled) && (
              <form
                onSubmit={handleSearch}
                className="hidden md:flex flex-1 max-w-xs mx-8 items-center gap-2 bg-muted dark:bg-charcoal-800 rounded-xl px-3 py-2 border border-border focus-within:border-gold-400 focus-within:ring-1 focus-within:ring-gold-300 transition-all duration-200"
              >
                <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="City, airport, address…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
                />
              </form>
            )}

            {/* ── Right side ── */}
            <div className="flex items-center gap-1.5">

              {/* Dark mode toggle */}
              <button
                onClick={toggleDark}
                className={`p-2 rounded-full transition-colors hidden sm:flex ${
                  showSolid
                    ? 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    : 'hover:bg-white/10 text-white/80 hover:text-white'
                }`}
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {user ? (
                <>
                  {/* Notifications */}
                  <button className={`p-2 rounded-full transition-colors relative hidden sm:flex ${
                    showSolid ? 'hover:bg-muted text-muted-foreground' : 'hover:bg-white/10 text-white/80'
                  }`}>
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gold-500 rounded-full" />
                  </button>

                  {/* User dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className={`flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 border transition-all duration-200 hover:shadow-gold-sm ${
                        showSolid
                          ? 'bg-white dark:bg-charcoal-800 border-border hover:border-gold-400'
                          : 'bg-white/10 border-white/20 hover:bg-white/15'
                      }`}>
                        <Avatar className="w-7 h-7">
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback className="text-xs bg-gold-100 text-gold-700 font-bold">
                            {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <ChevronDown className={`w-3 h-3 ${showSolid ? 'text-muted-foreground' : 'text-white/70'}`} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl shadow-card border-border">
                      <DropdownMenuLabel className="font-normal px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={profile?.avatar_url} />
                            <AvatarFallback className="bg-gold-100 text-gold-700 font-bold text-sm">
                              {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm leading-none mb-1">{profile?.full_name || 'Driver'}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[130px]">{user.email}</p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => navigate('/dashboard')} className="gap-2 rounded-xl mx-1">
                        <LayoutDashboard className="w-4 h-4 text-gold-500" /> Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate('/dashboard?tab=trips')} className="gap-2 rounded-xl mx-1">
                        <Gauge className="w-4 h-4 text-gold-500" /> My Trips
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate('/dashboard?tab=saved')} className="gap-2 rounded-xl mx-1">
                        <Heart className="w-4 h-4 text-gold-500" /> Saved Cars
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => navigate('/dashboard?tab=profile')} className="gap-2 rounded-xl mx-1">
                        <Settings className="w-4 h-4" /> Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleSignOut} className="gap-2 rounded-xl mx-1 mb-1 text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/20">
                        <LogOut className="w-4 h-4" /> Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2 ml-1">
                  <button
                    onClick={() => navigate('/login')}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
                      showSolid
                        ? 'text-charcoal-700 dark:text-white/80 hover:text-charcoal-900 dark:hover:text-white hover:bg-muted'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="btn-gold px-4 py-2 text-sm rounded-xl"
                  >
                    Sign up free
                  </button>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`md:hidden p-2 rounded-xl transition-colors ${
                  showSolid ? 'hover:bg-muted' : 'hover:bg-white/10'
                } ${textClass}`}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 bg-white dark:bg-charcoal-900 shadow-2xl animate-slideIn flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-gold-gradient" style={{ fontFamily: '"Barlow Condensed", system-ui, sans-serif', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.04em', lineHeight: 1 }}>AR</span>
                <span className="font-extrabold text-lg">Arvana<span className="text-gold-500"> Rentals</span></span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User section */}
            {user && (
              <div className="mx-4 mt-4 p-3 bg-muted rounded-2xl flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-gold-100 text-gold-700 font-bold">
                    {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="font-bold text-sm truncate">{profile?.full_name || 'Driver'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            )}

            {/* Links */}
            <div className="flex-1 p-4 space-y-1">
              {[
                { label: 'Home',        icon: Gauge,             to: '/' },
                { label: 'Browse Cars', icon: Search,            to: '/search' },
              ].map(({ label, icon: Icon, to }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors font-semibold text-sm">
                  <Icon className="w-4 h-4 text-gold-500" />
                  {label}
                </Link>
              ))}

              {user ? (
                <>
                  <div className="my-2 gold-divider" />
                  <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors font-semibold text-sm">
                    <LayoutDashboard className="w-4 h-4 text-gold-500" /> Dashboard
                  </Link>
                  <Link to="/dashboard?tab=trips" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors font-semibold text-sm">
                    <Gauge className="w-4 h-4 text-gold-500" /> My Trips
                  </Link>
                  <Link to="/dashboard?tab=saved" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors font-semibold text-sm">
                    <Heart className="w-4 h-4 text-gold-500" /> Saved Cars
                  </Link>
                  <div className="my-2 gold-divider" />
                  <button onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors font-semibold text-sm">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </>
              ) : (
                <div className="pt-4 space-y-2">
                  <button className="w-full py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-muted transition-colors"
                    onClick={() => navigate('/login')}>Log in</button>
                  <button className="w-full py-2.5 rounded-xl btn-gold text-sm"
                    onClick={() => navigate('/signup')}>Sign up free</button>
                </div>
              )}
            </div>

            {/* Bottom */}
            <div className="p-4 border-t border-border">
              <button onClick={toggleDark}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors font-semibold text-sm">
                {dark ? <Sun className="w-4 h-4 text-gold-500" /> : <Moon className="w-4 h-4 text-gold-500" />}
                {dark ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
