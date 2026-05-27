import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Car, Heart, MessageCircle, User, Star, Calendar,
  MapPin, Edit, Camera, Check, X, Upload, Phone, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { sampleBookings, sampleCars } from '@/data/sampleData';
import { getSavedCars } from '@/lib/utils';
import { formatCurrency, formatDate, formatDateShort, getInitials } from '@/lib/utils';
import CarCard from '@/components/CarCard';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  active: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

const Dashboard: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'trips';

  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);

  const savedCarIds = getSavedCars();
  const savedCars = sampleCars.filter(c => savedCarIds.includes(c.id));

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate API call
    toast.success('Profile updated!');
    setSaving(false);
    setEditMode(false);
  };

  const upcomingTrips = sampleBookings.filter(b => ['confirmed', 'pending', 'active'].includes(b.status));
  const pastTrips = sampleBookings.filter(b => ['completed', 'cancelled'].includes(b.status));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-xl">{profile?.full_name ? getInitials(profile.full_name) : 'U'}</AvatarFallback>
            </Avatar>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center border-2 border-white">
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{profile?.full_name || 'Welcome back!'}</h1>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            {profile?.driver_license_verified && (
              <div className="flex items-center gap-1 text-green-600 text-xs font-semibold mt-1">
                <Check className="w-3.5 h-3.5" /> Identity verified
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue={initialTab}>
          <TabsList className="w-full mb-8">
            <TabsTrigger value="trips" className="flex-1 gap-1.5">
              <Car className="w-3.5 h-3.5 hidden sm:block" /> My Trips
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex-1 gap-1.5">
              <Heart className="w-3.5 h-3.5 hidden sm:block" /> Saved
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex-1 gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 hidden sm:block" /> Messages
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex-1 gap-1.5">
              <User className="w-3.5 h-3.5 hidden sm:block" /> Profile
            </TabsTrigger>
          </TabsList>

          {/* MY TRIPS */}
          <TabsContent value="trips">
            <div className="space-y-6">
              {/* Upcoming */}
              <div>
                <h2 className="text-lg font-extrabold mb-4">Upcoming trips ({upcomingTrips.length})</h2>
                {upcomingTrips.length === 0 ? (
                  <div className="bg-white dark:bg-charcoal-900 rounded-2xl border p-12 text-center shadow-sm">
                    <div className="text-5xl mb-4">🚗</div>
                    <h3 className="font-extrabold text-lg mb-2">No upcoming trips</h3>
                    <p className="text-muted-foreground mb-6">Browse our amazing selection of cars and book your next adventure!</p>
                    <Button variant="default" onClick={() => navigate('/search')}>Find a car</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingTrips.map(booking => (
                      <div key={booking.id} className="bg-white dark:bg-charcoal-900 rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex gap-4 p-5">
                          <img
                            src={booking.car?.images[0]}
                            alt={booking.car?.make}
                            className="w-32 h-24 rounded-xl object-cover flex-shrink-0"
                            onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=150&fit=crop')}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-extrabold text-base">
                                {booking.car?.year} {booking.car?.make} {booking.car?.model}
                              </h3>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 capitalize ${STATUS_COLORS[booking.status]}`}>
                                {booking.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDateShort(booking.start_date)} – {formatDateShort(booking.end_date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {booking.car?.city}
                              </div>
                            </div>
                            <div className="font-bold text-gold-600 dark:text-gold-400 mt-1">{formatCurrency(booking.total_amount)}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 px-5 pb-4">
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/cars/${booking.car_id}`)}>
                            <Car className="w-3.5 h-3.5" /> View car
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 text-gold-600 dark:text-gold-400 border-gold-400"
                            onClick={() => toast('Trip cancellation requested')}>
                            <X className="w-3.5 h-3.5" /> Cancel trip
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past trips */}
              {pastTrips.length > 0 && (
                <div>
                  <h2 className="text-lg font-extrabold mb-4">Past trips ({pastTrips.length})</h2>
                  <div className="space-y-4">
                    {pastTrips.map(booking => (
                      <div key={booking.id} className="bg-white dark:bg-charcoal-900 rounded-2xl border shadow-sm overflow-hidden opacity-75 hover:opacity-100 transition-opacity">
                        <div className="flex gap-4 p-5">
                          <img
                            src={booking.car?.images[0]}
                            alt={booking.car?.make}
                            className="w-28 h-20 rounded-xl object-cover flex-shrink-0 grayscale"
                            onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=150&fit=crop')}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h3 className="font-extrabold text-base">
                                {booking.car?.year} {booking.car?.make} {booking.car?.model}
                              </h3>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 capitalize ${STATUS_COLORS[booking.status]}`}>
                                {booking.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDate(booking.start_date)} – {formatDate(booking.end_date)} · {formatCurrency(booking.total_amount)}
                            </p>
                          </div>
                        </div>
                        {booking.status === 'completed' && (
                          <div className="px-5 pb-4">
                            <Button variant="outline" size="sm" className="gap-1.5"
                              onClick={() => toast('Review submitted! Thanks 🌟')}>
                              <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" /> Leave a review
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* SAVED CARS */}
          <TabsContent value="saved">
            {savedCars.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-charcoal-900 rounded-2xl border shadow-sm">
                <Heart className="w-16 h-16 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-extrabold mb-2">No saved cars yet</h3>
                <p className="text-muted-foreground mb-6">
                  Tap the ♡ on any car to save it here for later.
                </p>
                <Button variant="default" onClick={() => navigate('/search')}>Explore cars</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {savedCars.map(car => <CarCard key={car.id} car={car} />)}
              </div>
            )}
          </TabsContent>

          {/* MESSAGES */}
          <TabsContent value="messages">
            <div className="bg-white dark:bg-charcoal-900 rounded-2xl border shadow-sm p-12 text-center">
              <MessageCircle className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-xl font-extrabold mb-2">No messages yet</h3>
              <p className="text-muted-foreground mb-6">
                When you message a host or make a booking, your conversations will appear here.
              </p>
              <Button variant="outline" onClick={() => navigate('/search')}>Browse cars</Button>
            </div>
          </TabsContent>

          {/* PROFILE */}
          <TabsContent value="profile">
            <div className="space-y-6">
              {/* Profile edit card */}
              <div className="bg-white dark:bg-charcoal-900 rounded-2xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-extrabold">Personal information</h2>
                  <Button variant="outline" size="sm" className="gap-1.5"
                    onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}>
                    {editMode ? (
                      saving ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        <><Check className="w-3.5 h-3.5" /> Save</>
                      )
                    ) : (
                      <><Edit className="w-3.5 h-3.5" /> Edit</>
                    )}
                  </Button>
                </div>

                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-3">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="text-2xl">{profile?.full_name ? getInitials(profile.full_name) : 'U'}</AvatarFallback>
                    </Avatar>
                    {editMode && (
                      <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white"
                        onClick={() => toast('Photo upload — connect Supabase storage!')}>
                        <Camera className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Full name</Label>
                    <Input
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      disabled={!editMode}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled className="mt-1.5 opacity-60" />
                  </div>
                  <div>
                    <Label>Phone number</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        disabled={!editMode}
                        className="pl-10"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Bio</Label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      disabled={!editMode}
                      rows={3}
                      placeholder="Tell hosts a little about yourself..."
                      className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Verification card */}
              <div className="bg-white dark:bg-charcoal-900 rounded-2xl border shadow-sm p-6">
                <h2 className="text-lg font-extrabold mb-4">Account verification</h2>
                <div className="space-y-4">
                  {[
                    {
                      label: 'Email address',
                      icon: <Check className="w-4 h-4 text-green-500" />,
                      status: 'Verified',
                      color: 'text-green-600',
                      action: null,
                    },
                    {
                      label: "Driver's license",
                      icon: profile?.driver_license_verified
                        ? <Check className="w-4 h-4 text-green-500" />
                        : <FileText className="w-4 h-4 text-amber-500" />,
                      status: profile?.driver_license_verified ? 'Verified' : 'Not submitted',
                      color: profile?.driver_license_verified ? 'text-green-600' : 'text-amber-600',
                      action: !profile?.driver_license_verified ? 'Upload' : null,
                    },
                    {
                      label: 'Phone number',
                      icon: phone ? <Check className="w-4 h-4 text-green-500" /> : <Phone className="w-4 h-4 text-amber-500" />,
                      status: phone ? 'Added' : 'Not added',
                      color: phone ? 'text-green-600' : 'text-amber-600',
                      action: !phone ? 'Add' : null,
                    },
                  ].map(({ label, icon, status, color, action }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        {icon}
                        <div>
                          <p className="font-semibold text-sm">{label}</p>
                          <p className={`text-xs font-medium ${color}`}>{status}</p>
                        </div>
                      </div>
                      {action && (
                        <Button variant="outline" size="sm" onClick={() => toast(`${label} upload — connect Supabase storage!`)}>
                          <Upload className="w-3.5 h-3.5 mr-1.5" /> {action}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
