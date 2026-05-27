import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Car, Calendar, DollarSign, MessageCircle,
  Settings, Plus, Star, TrendingUp, Check, X, Edit, Eye,
  EyeOff, ChevronRight, AlertCircle, Send, Users
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { sampleCars, sampleBookings, sampleReviews, monthlyEarnings } from '@/data/sampleData';
import { formatCurrency, formatDate, formatDateShort, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'warning',
  confirmed: 'success',
  active: 'electric',
  completed: 'secondary',
  cancelled: 'destructive',
};

const HostDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('overview');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [messageInput, setMessageInput] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>('conv-1');

  const hostCars = sampleCars.filter(c => c.host_id === 'host-1');
  const hostBookings = sampleBookings;

  const totalEarnings = monthlyEarnings[monthlyEarnings.length - 1].earnings;
  const activeBookings = hostBookings.filter(b => b.status === 'confirmed' || b.status === 'active').length;
  const totalTrips = hostCars.reduce((s, c) => s + c.total_trips, 0);
  const avgRating = hostCars.reduce((s, c) => s + c.rating, 0) / Math.max(hostCars.length, 1);

  const filteredBookings = bookingFilter === 'all'
    ? hostBookings
    : hostBookings.filter(b => b.status === bookingFilter);

  const sampleMessages = [
    { id: 'conv-1', renter: 'Jennifer Park', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', lastMessage: 'Will the car be fully charged?', time: '2m ago', unread: true, car: 'Tesla Model 3' },
    { id: 'conv-2', renter: 'Marcus Johnson', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face', lastMessage: 'Thanks for the smooth handoff!', time: '1h ago', unread: false, car: 'BMW M4' },
    { id: 'conv-3', renter: 'Amanda Torres', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', lastMessage: 'Can I pick up 30 min early?', time: '3h ago', unread: true, car: 'Porsche 911' },
  ];

  const chatMessages = [
    { id: 1, sender: 'Jennifer Park', content: 'Hi! Just wanted to confirm — will the Tesla be fully charged when I pick it up?', time: '10:30 AM', isMe: false },
    { id: 2, sender: 'Me', content: 'Hi Jennifer! Absolutely, I always have it at 100% for pickup. I\'ll also leave a charging cable in the trunk just in case.', time: '10:35 AM', isMe: true },
    { id: 3, sender: 'Jennifer Park', content: 'That\'s amazing, thank you! What\'s the wifi password for the car?', time: '10:36 AM', isMe: false },
    { id: 4, sender: 'Me', content: 'It connects automatically to your phone via Bluetooth. You can also use the built-in LTE for free!', time: '10:40 AM', isMe: true },
    { id: 5, sender: 'Jennifer Park', content: 'Will the car be fully charged? 😊', time: '10:45 AM', isMe: false },
  ];

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'cars', label: 'My Cars', icon: Car },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e0e1e] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border shadow-sm p-4 lg:sticky lg:top-24">
              {/* Host info */}
              <div className="flex items-center gap-3 p-3 mb-4 bg-muted rounded-xl">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>{profile?.full_name ? getInitials(profile.full_name) : 'H'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-bold truncate">{profile?.full_name || 'Host'}</p>
                  <p className="text-xs text-[#E94560] font-semibold">⭐ Superhost</p>
                </div>
              </div>

              {/* Nav items */}
              <nav className="space-y-1">
                {navItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveNav(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeNav === id
                        ? 'bg-[#1A1A2E] text-white dark:bg-[#E94560]'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {id === 'messages' && sampleMessages.filter(m => m.unread).length > 0 && (
                      <span className="ml-auto w-5 h-5 bg-[#E94560] text-white text-xs rounded-full flex items-center justify-center">
                        {sampleMessages.filter(m => m.unread).length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t">
                <Button variant="amber" size="sm" className="w-full gap-2 font-bold"
                  onClick={() => navigate('/host/list-car')}>
                  <Plus className="w-4 h-4" /> Add new car
                </Button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* OVERVIEW */}
            {activeNav === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h1 className="text-2xl font-extrabold">Good morning, {profile?.full_name?.split(' ')[0] || 'Host'}! 👋</h1>
                  <p className="text-muted-foreground mt-0.5">Here's what's happening with your listings today</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'This month', value: formatCurrency(totalEarnings), icon: <DollarSign className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', change: '+18%' },
                    { label: 'Active bookings', value: activeBookings, icon: <Calendar className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', change: `${activeBookings} now` },
                    { label: 'Total trips', value: totalTrips, icon: <Car className="w-5 h-5" />, color: 'text-[#E94560]', bg: 'bg-red-50 dark:bg-red-900/20', change: 'All time' },
                    { label: 'Avg rating', value: avgRating.toFixed(1), icon: <Star className="w-5 h-5" />, color: 'text-[#F5A623]', bg: 'bg-amber-50 dark:bg-amber-900/20', change: '★ Superhost' },
                  ].map(({ label, value, icon, color, bg, change }) => (
                    <div key={label} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm">
                      <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-3`}>
                        {icon}
                      </div>
                      <div className="text-2xl font-extrabold text-foreground">{value}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
                      <div className={`text-xs font-semibold mt-1 ${color}`}>{change}</div>
                    </div>
                  ))}
                </div>

                {/* Revenue chart */}
                <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-extrabold text-lg">Revenue overview</h3>
                      <p className="text-muted-foreground text-sm">Last 6 months</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-green-600 font-bold text-sm">
                      <TrendingUp className="w-4 h-4" /> +23% vs last period
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={monthlyEarnings}>
                      <defs>
                        <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E94560" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#E94560" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false}
                        tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
                      <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Earnings']}
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }} />
                      <Area type="monotone" dataKey="earnings" stroke="#E94560" strokeWidth={2.5}
                        fill="url(#earningsGrad)" dot={{ fill: '#E94560', strokeWidth: 2, r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upcoming bookings */}
                  <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-extrabold">Upcoming this week</h3>
                      <button onClick={() => setActiveNav('bookings')} className="text-[#E94560] text-sm font-semibold hover:underline">View all</button>
                    </div>
                    <div className="space-y-3">
                      {hostBookings.slice(0, 3).map(booking => (
                        <div key={booking.id} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                          <div className="w-9 h-9 bg-[#E94560]/10 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-[#E94560]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{booking.car?.make} {booking.car?.model}</p>
                            <p className="text-xs text-muted-foreground">{formatDateShort(booking.start_date)} → {formatDateShort(booking.end_date)}</p>
                          </div>
                          <Badge variant={STATUS_COLORS[booking.status] as 'warning' | 'success' | 'electric' | 'secondary' | 'destructive'}>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent reviews */}
                  <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-extrabold">Recent reviews</h3>
                      <span className="text-sm text-muted-foreground">{sampleReviews.length} total</span>
                    </div>
                    <div className="space-y-4">
                      {sampleReviews.slice(0, 2).map(review => (
                        <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={review.reviewer?.avatar_url} />
                              <AvatarFallback className="text-xs">{review.reviewer?.full_name ? getInitials(review.reviewer.full_name) : 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-sm">{review.reviewer?.full_name}</span>
                            <div className="flex ml-auto">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-[#F5A623] text-[#F5A623]' : 'text-muted'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MY CARS */}
            {activeNav === 'cars' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-extrabold">My Cars</h1>
                  <Button variant="red" onClick={() => navigate('/host/list-car')} className="gap-2">
                    <Plus className="w-4 h-4" /> Add new car
                  </Button>
                </div>
                <div className="space-y-4">
                  {hostCars.map(car => (
                    <div key={car.id} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                      <img src={car.images[0]} alt={car.make}
                        className="w-32 h-24 rounded-xl object-cover flex-shrink-0"
                        onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=150&fit=crop')} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-extrabold text-base">{car.year} {car.make} {car.model}</h3>
                            <p className="text-muted-foreground text-sm capitalize">{car.category} · {car.city}, {car.state}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm">
                              <span className="font-bold text-[#E94560]">{formatCurrency(car.daily_rate)}/day</span>
                              <span className="text-muted-foreground">·</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                                <span className="font-semibold">{car.rating}</span>
                              </div>
                              <span className="text-muted-foreground">·</span>
                              <span className="text-muted-foreground">{car.total_trips} trips</span>
                            </div>
                          </div>
                          <Badge variant={car.is_available ? 'success' : 'secondary'}>
                            {car.is_available ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/cars/${car.id}`)}>
                            <Eye className="w-3.5 h-3.5" /> View
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast('Edit coming soon!')}>
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground"
                            onClick={() => toast(car.is_available ? 'Car deactivated' : 'Car activated')}>
                            {car.is_available ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {car.is_available ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOOKINGS */}
            {activeNav === 'bookings' && (
              <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Bookings</h1>

                {/* Status tabs */}
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(s => (
                    <button
                      key={s}
                      onClick={() => setBookingFilter(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${
                        bookingFilter === s
                          ? 'bg-[#1A1A2E] text-white border-[#1A1A2E] dark:bg-white dark:text-[#1A1A2E]'
                          : 'border-border hover:border-[#E94560]'
                      }`}
                    >
                      {s} {s === 'all' && `(${hostBookings.length})`}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {filteredBookings.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-[#1A1A2E] rounded-2xl border">
                      <Calendar className="w-12 h-12 text-muted mx-auto mb-3" />
                      <p className="text-muted-foreground font-semibold">No {bookingFilter} bookings</p>
                    </div>
                  ) : filteredBookings.map(booking => (
                    <div key={booking.id} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3">
                          <img src={booking.car?.images[0]} alt=""
                            className="w-16 h-12 rounded-xl object-cover flex-shrink-0"
                            onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=100&h=80&fit=crop')} />
                          <div>
                            <p className="font-extrabold text-base">{booking.car?.year} {booking.car?.make} {booking.car?.model}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(booking.start_date)} → {formatDate(booking.end_date)} · {booking.total_days} days
                            </p>
                            <p className="text-sm font-bold text-[#E94560] mt-0.5">{formatCurrency(booking.total_amount)}</p>
                          </div>
                        </div>
                        <Badge variant={STATUS_COLORS[booking.status] as 'warning' | 'success' | 'electric' | 'secondary' | 'destructive'}>
                          {booking.status}
                        </Badge>
                      </div>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          <Button variant="red" size="sm" className="gap-1.5 flex-1"
                            onClick={() => toast.success('Booking accepted!')}>
                            <Check className="w-3.5 h-3.5" /> Accept
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 flex-1 text-[#E94560] border-[#E94560]"
                            onClick={() => toast('Booking declined')}>
                            <X className="w-3.5 h-3.5" /> Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EARNINGS */}
            {activeNav === 'earnings' && (
              <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Earnings</h1>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'This month', value: formatCurrency(totalEarnings), icon: '📅' },
                    { label: 'Last 6 months', value: formatCurrency(monthlyEarnings.reduce((s, m) => s + m.earnings, 0)), icon: '📈' },
                    { label: 'Available to pay out', value: formatCurrency(totalEarnings * 0.85), icon: '💳' },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm text-center">
                      <div className="text-3xl mb-2">{icon}</div>
                      <div className="text-2xl font-extrabold">{value}</div>
                      <div className="text-sm text-muted-foreground mt-1">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-6 shadow-sm">
                  <h3 className="font-extrabold mb-4">Monthly breakdown</h3>
                  <div className="space-y-3">
                    {monthlyEarnings.map(({ month, earnings }) => (
                      <div key={month} className="flex items-center gap-4">
                        <span className="w-8 text-sm text-muted-foreground font-medium">{month}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-[#E94560] rounded-full transition-all duration-500"
                            style={{ width: `${(earnings / Math.max(...monthlyEarnings.map(m => m.earnings))) * 100}%` }} />
                        </div>
                        <span className="text-sm font-bold w-16 text-right">{formatCurrency(earnings)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold">Payout history</h3>
                    <Button variant="amber" size="sm" className="gap-1.5 font-bold"
                      onClick={() => toast.success('Payout requested!')}>
                      <DollarSign className="w-4 h-4" /> Request payout
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      { date: 'Mar 1, 2026', amount: 4352, method: 'Bank transfer', status: 'paid' },
                      { date: 'Feb 1, 2026', amount: 3646, method: 'Bank transfer', status: 'paid' },
                      { date: 'Jan 1, 2026', amount: 3123, method: 'Bank transfer', status: 'paid' },
                    ].map(payout => (
                      <div key={payout.date} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-semibold">{payout.date}</p>
                          <p className="text-muted-foreground text-xs">{payout.method}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatCurrency(payout.amount)}</p>
                          <p className="text-xs text-green-600 font-semibold capitalize">{payout.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {activeNav === 'messages' && (
              <div className="animate-fade-in">
                <h1 className="text-2xl font-extrabold mb-6">Messages</h1>
                <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border shadow-sm overflow-hidden" style={{ height: 560 }}>
                  <div className="flex h-full">
                    {/* Conversation list */}
                    <div className="w-72 border-r flex-shrink-0 overflow-y-auto">
                      {sampleMessages.map(conv => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv.id)}
                          className={`w-full flex items-start gap-3 p-4 border-b hover:bg-muted transition-colors text-left ${selectedConversation === conv.id ? 'bg-muted' : ''}`}
                        >
                          <div className="relative">
                            <img src={conv.avatar} alt={conv.renter}
                              className="w-10 h-10 rounded-full object-cover" />
                            {conv.unread && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#E94560] border-2 border-white rounded-full" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`text-sm font-bold truncate ${conv.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {conv.renter}
                              </p>
                              <span className="text-xs text-muted-foreground flex-shrink-0">{conv.time}</span>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{conv.car}</p>
                            <p className={`text-xs truncate mt-0.5 ${conv.unread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                              {conv.lastMessage}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Chat area */}
                    <div className="flex-1 flex flex-col">
                      {/* Chat header */}
                      <div className="p-4 border-b flex items-center gap-3">
                        <img src={sampleMessages.find(m => m.id === selectedConversation)?.avatar}
                          className="w-9 h-9 rounded-full object-cover" alt="" />
                        <div>
                          <p className="font-bold text-sm">{sampleMessages.find(m => m.id === selectedConversation)?.renter}</p>
                          <p className="text-xs text-muted-foreground">{sampleMessages.find(m => m.id === selectedConversation)?.car}</p>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {chatMessages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              msg.isMe
                                ? 'bg-[#1A1A2E] text-white dark:bg-[#E94560] rounded-br-sm'
                                : 'bg-muted text-foreground rounded-bl-sm'
                            }`}>
                              {msg.content}
                              <div className={`text-xs mt-1 ${msg.isMe ? 'text-white/60' : 'text-muted-foreground'}`}>
                                {msg.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Input */}
                      <div className="p-4 border-t flex gap-2">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={e => setMessageInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && messageInput.trim()) { toast.success('Message sent!'); setMessageInput(''); }}}
                          placeholder="Type a message..."
                          className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#E94560]"
                        />
                        <Button variant="red" size="icon" onClick={() => { if (messageInput.trim()) { toast.success('Message sent!'); setMessageInput(''); }}}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {activeNav === 'settings' && (
              <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Settings</h1>
                <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-6 shadow-sm">
                  <h3 className="font-extrabold mb-4">Host preferences</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Instant booking', desc: 'Allow renters to book without approval', enabled: true },
                      { label: 'SMS notifications', desc: 'Get texts for new bookings and messages', enabled: true },
                      { label: 'Email notifications', desc: 'Receive booking updates via email', enabled: false },
                    ].map(({ label, desc, enabled }) => (
                      <div key={label} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-semibold text-sm">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        <button className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-[#E94560]' : 'bg-muted'}`}
                          onClick={() => toast(`${label} ${enabled ? 'disabled' : 'enabled'}`)}>
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : ''}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
