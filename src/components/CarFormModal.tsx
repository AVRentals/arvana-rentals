import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, CarCategory, Transmission, FuelType } from '@/types';

const CATEGORIES: CarCategory[] = ['economy', 'suv', 'luxury', 'electric', 'sports'];
const TRANSMISSIONS: Transmission[] = ['auto', 'manual'];
const FUEL_TYPES: FuelType[] = ['gasoline', 'diesel', 'electric', 'hybrid'];

const selectClass = 'w-full rounded-xl border px-3 py-2.5 text-sm bg-muted outline-none focus:ring-2 focus:ring-gold-400 mt-1.5';

export interface CarFormValues {
  make: string; model: string; year: number; color: string;
  license_plate: string; vin: string; description: string;
  category: CarCategory; daily_rate: number;
  weekly_rate: string; monthly_rate: string;
  location: string; city: string; state: string;
  seats: number; transmission: Transmission; fuel_type: FuelType;
  features: string; images: string;
  is_available: boolean;
  odometer: string; gps_provider: string;
  purchase_price: string; purchase_date: string;
}

const blankValues: CarFormValues = {
  make: '', model: '', year: new Date().getFullYear(), color: '',
  license_plate: '', vin: '', description: '',
  category: 'economy', daily_rate: 50,
  weekly_rate: '', monthly_rate: '',
  location: '', city: '', state: 'FL',
  seats: 5, transmission: 'auto', fuel_type: 'gasoline',
  features: '', images: '',
  is_available: true,
  odometer: '', gps_provider: 'Trackhawk',
  purchase_price: '', purchase_date: '',
};

export const carToFormValues = (car: Car): CarFormValues => ({
  make: car.make, model: car.model, year: car.year, color: car.color,
  license_plate: car.license_plate || '', vin: car.vin || '', description: car.description || '',
  category: car.category, daily_rate: car.daily_rate,
  weekly_rate: car.weekly_rate?.toString() || '', monthly_rate: car.monthly_rate?.toString() || '',
  location: car.location, city: car.city, state: car.state,
  seats: car.seats, transmission: car.transmission, fuel_type: car.fuel_type,
  features: (car.features || []).join(', '), images: (car.images || []).join(', '),
  is_available: car.is_available,
  odometer: car.odometer?.toString() || '', gps_provider: car.gps_provider || '',
  purchase_price: car.purchase_price?.toString() || '', purchase_date: car.purchase_date || '',
});

export const formValuesToCarData = (v: CarFormValues): Record<string, unknown> => ({
  make: v.make, model: v.model, year: Number(v.year), color: v.color,
  license_plate: v.license_plate || null, vin: v.vin || null, description: v.description || `${v.year} ${v.make} ${v.model}`,
  category: v.category, daily_rate: Number(v.daily_rate),
  weekly_rate: v.weekly_rate ? Number(v.weekly_rate) : null,
  monthly_rate: v.monthly_rate ? Number(v.monthly_rate) : null,
  location: v.location, city: v.city, state: v.state,
  seats: Number(v.seats), transmission: v.transmission, fuel_type: v.fuel_type,
  features: v.features.split(',').map(f => f.trim()).filter(Boolean),
  images: v.images.split(',').map(f => f.trim()).filter(Boolean),
  is_available: v.is_available,
  is_approved: true,
  odometer: v.odometer ? Number(v.odometer) : null,
  gps_provider: v.gps_provider || null,
  purchase_price: v.purchase_price ? Number(v.purchase_price) : null,
  purchase_date: v.purchase_date || null,
});

interface Props {
  initial?: Car | null;
  onCancel: () => void;
  onSave: (values: CarFormValues) => void | Promise<void>;
}

const CarFormModal: React.FC<Props> = ({ initial, onCancel, onSave }) => {
  const [values, setValues] = useState<CarFormValues>(initial ? carToFormValues(initial) : blankValues);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof CarFormValues>(key: K, val: CarFormValues[K]) =>
    setValues(v => ({ ...v, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.make || !values.model || !values.year) return;
    setSaving(true);
    await onSave(values);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white dark:bg-[#1A1A2E] rounded-2xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white dark:bg-[#1A1A2E] z-10">
          <h2 className="text-lg font-extrabold">{initial ? 'Edit Car' : 'Add New Car'}</h2>
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><Label>Make</Label><Input value={values.make} onChange={e => set('make', e.target.value)} placeholder="Toyota" /></div>
            <div><Label>Model</Label><Input value={values.model} onChange={e => set('model', e.target.value)} placeholder="Camry" /></div>
            <div><Label>Year</Label><Input type="number" value={values.year} onChange={e => set('year', Number(e.target.value))} /></div>
            <div><Label>Color</Label><Input value={values.color} onChange={e => set('color', e.target.value)} placeholder="Black" /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label>VIN</Label><Input value={values.vin} onChange={e => set('vin', e.target.value)} placeholder="17-character VIN" /></div>
            <div><Label>License plate</Label><Input value={values.license_plate} onChange={e => set('license_plate', e.target.value)} /></div>
          </div>

          <div>
            <Label>Description (shown to renters)</Label>
            <Input value={values.description} onChange={e => set('description', e.target.value)} placeholder="Clean, reliable daily driver..." />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <Label>Category</Label>
              <select className={selectClass} value={values.category} onChange={e => set('category', e.target.value as CarFormValues['category'])}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label>Transmission</Label>
              <select className={selectClass} value={values.transmission} onChange={e => set('transmission', e.target.value as CarFormValues['transmission'])}>
                {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label>Fuel type</Label>
              <select className={selectClass} value={values.fuel_type} onChange={e => set('fuel_type', e.target.value as CarFormValues['fuel_type'])}>
                {FUEL_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><Label>Daily rate ($)</Label><Input type="number" value={values.daily_rate} onChange={e => set('daily_rate', Number(e.target.value))} /></div>
            <div><Label>Weekly rate ($) <span className="text-muted-foreground font-normal">optional</span></Label><Input type="number" value={values.weekly_rate} onChange={e => set('weekly_rate', e.target.value)} placeholder="e.g. 400" /></div>
            <div><Label>Monthly rate ($) <span className="text-muted-foreground font-normal">optional</span></Label><Input type="number" value={values.monthly_rate} onChange={e => set('monthly_rate', e.target.value)} placeholder="e.g. 1600" /></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><Label>Seats</Label><Input type="number" value={values.seats} onChange={e => set('seats', Number(e.target.value))} /></div>
            <div>
              <Label>Available for booking?</Label>
              <select className={selectClass} value={values.is_available ? 'yes' : 'no'} onChange={e => set('is_available', e.target.value === 'yes')}>
                <option value="yes">Yes</option>
                <option value="no">No (hidden from site)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><Label>Pickup location</Label><Input value={values.location} onChange={e => set('location', e.target.value)} placeholder="Neighborhood/area" /></div>
            <div><Label>City</Label><Input value={values.city} onChange={e => set('city', e.target.value)} /></div>
            <div><Label>State</Label><Input value={values.state} onChange={e => set('state', e.target.value)} placeholder="FL" /></div>
          </div>

          <div>
            <Label>Photo URL(s) — comma-separated, first one is the main photo</Label>
            <Input value={values.images} onChange={e => set('images', e.target.value)} placeholder="https://..., https://..." />
          </div>

          <div>
            <Label>Features — comma-separated</Label>
            <Input value={values.features} onChange={e => set('features', e.target.value)} placeholder="Bluetooth, Backup Camera, AC" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><Label>Odometer (mi)</Label><Input type="number" value={values.odometer} onChange={e => set('odometer', e.target.value)} /></div>
            <div><Label>GPS provider</Label><Input value={values.gps_provider} onChange={e => set('gps_provider', e.target.value)} placeholder="Trackhawk" /></div>
            <div><Label>Purchase price ($)</Label><Input type="number" value={values.purchase_price} onChange={e => set('purchase_price', e.target.value)} /></div>
            <div><Label>Purchase date</Label><Input type="date" value={values.purchase_date} onChange={e => set('purchase_date', e.target.value)} /></div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t sticky bottom-0 bg-white dark:bg-[#1A1A2E]">
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="flex-1 font-bold" disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Save changes' : 'Add car'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CarFormModal;
