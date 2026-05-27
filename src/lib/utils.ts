import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, differenceInDays, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
}

export function calculateDays(startDate: string, endDate: string): number {
  return Math.max(1, differenceInDays(parseISO(endDate), parseISO(startDate)));
}

export function calculateBookingTotal(dailyRate: number, days: number) {
  const subtotal = dailyRate * days;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + serviceFee;
  return { subtotal, serviceFee, total };
}

export function getStarRating(rating: number): string {
  return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getSavedCars(): string[] {
  try {
    return JSON.parse(localStorage.getItem('savedCars') || '[]');
  } catch {
    return [];
  }
}

export function toggleSavedCar(carId: string): boolean {
  const saved = getSavedCars();
  const index = saved.indexOf(carId);
  if (index === -1) {
    saved.push(carId);
    localStorage.setItem('savedCars', JSON.stringify(saved));
    return true;
  } else {
    saved.splice(index, 1);
    localStorage.setItem('savedCars', JSON.stringify(saved));
    return false;
  }
}

export function isCarSaved(carId: string): boolean {
  return getSavedCars().includes(carId);
}

export function getTheme(): 'light' | 'dark' {
  return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
}

export function setTheme(theme: 'light' | 'dark') {
  localStorage.setItem('theme', theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}
