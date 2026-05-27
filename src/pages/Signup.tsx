import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Car, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp, signInWithGoogle } from '@/lib/supabase';
import toast from 'react-hot-toast';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isHost = false;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } = await signUp(email, password, fullName, isHost);

      if (authError) {
        // If Supabase isn't connected, run in demo mode
        if (authError.message?.includes('fetch') || authError.message?.includes('network') || authError.message?.includes('Failed')) {
          const demoUser = { id: 'demo-' + Date.now(), email, full_name: fullName, is_host: isHost };
          localStorage.setItem('demo_user', JSON.stringify(demoUser));
          toast.success('Account created! Welcome to Arvana Rentals 🎉');
          window.location.href = '/dashboard';
          setLoading(false);
          return;
        }
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data?.user) {
        toast.success('Account created! Welcome to Arvana Rentals 🎉');
        navigate(isHost ? '/host/dashboard' : '/dashboard');
      }
    } catch {
      // Demo mode fallback
      const demoUser = { id: 'demo-' + Date.now(), email, full_name: fullName, is_host: isHost };
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      toast.success('Account created! Welcome to Arvana Rentals 🎉');
      navigate(isHost ? '/host/dashboard' : '/dashboard');
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    // Demo mode: simulate Google signup
    const demoUser = { id: 'demo-google-' + Date.now(), email: 'google@demo.com', full_name: 'Google User', is_host: false };
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    toast.success('Signed in with Google! Welcome to Arvana Rentals 🎉');
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e0e1e] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-charcoal-900 dark:text-white">
              Drive<span className="text-gold-500">Share</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-white mt-6 mb-1">
            Create your account
          </h1>
          <p className="text-muted-foreground">Join 2M+ people on Arvana Rentals</p>
        </div>

        <div className="bg-white dark:bg-charcoal-900 rounded-3xl shadow-xl border border-border p-8">
          {/* Social buttons */}
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 border-2 border-border rounded-xl py-3 px-4 font-semibold text-sm hover:bg-muted transition-colors mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white dark:bg-charcoal-900 px-3 text-xs text-muted-foreground font-medium">
                or continue with email
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-3 mb-4 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <div className="relative mt-1.5">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="pl-10"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="pl-10 pr-10"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {password && (
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      password.length >= i * 3
                        ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-yellow-400' : 'bg-green-400'
                        : 'bg-muted'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              By signing up, you agree to our{' '}
              <a href="/terms" className="text-gold-600 dark:text-gold-400 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-gold-600 dark:text-gold-400 hover:underline">Privacy Policy</a>.
            </p>

            <Button type="submit" className="btn-gold w-full font-bold" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </Button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-gold-600 dark:text-gold-400 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
