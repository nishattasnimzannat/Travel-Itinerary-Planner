// Shared types for client-side trip data (stored in localStorage)
export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface BudgetCategory {
  food: number;
  transport: number;
  accommodation: number;
  activities: number;
  other: number;
}

export interface LocalExpense {
  id: string;
  tripId: string;
  category: keyof BudgetCategory;
  amount: number;
  currency: string;
  description: string;
  date: string;
}

export interface LocalAccommodation {
  id: string;
  tripId: string;
  name: string;
  address: string;
  checkIn: string;
  checkOut: string;
  pricePerNight: number;
  currency: string;
  confirmationNumber?: string;
}

export interface TransportSegment {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  carrier: string;
  number: string;
}

export interface LocalTransport {
  id: string;
  tripId: string;
  type: 'flight' | 'train' | 'bus' | 'car';
  segments: TransportSegment[];
  bookingReference?: string;
}

// --- LocalStorage helpers ---
export const store = {
  getTrips: (): Trip[] => JSON.parse(localStorage.getItem('trips') || '[]'),
  saveTrips: (trips: Trip[]) => localStorage.setItem('trips', JSON.stringify(trips)),

  getBudget: (tripId: string): BudgetCategory =>
    JSON.parse(localStorage.getItem(`budget_${tripId}`) || 'null') || {
      food: 0, transport: 0, accommodation: 0, activities: 0, other: 0,
    },
  saveBudget: (tripId: string, b: BudgetCategory) =>
    localStorage.setItem(`budget_${tripId}`, JSON.stringify(b)),

  getExpenses: (tripId: string): LocalExpense[] =>
    JSON.parse(localStorage.getItem(`expenses_${tripId}`) || '[]'),
  saveExpenses: (tripId: string, e: LocalExpense[]) =>
    localStorage.setItem(`expenses_${tripId}`, JSON.stringify(e)),

  getAccommodations: (tripId: string): LocalAccommodation[] =>
    JSON.parse(localStorage.getItem(`accommodations_${tripId}`) || '[]'),
  saveAccommodations: (tripId: string, a: LocalAccommodation[]) =>
    localStorage.setItem(`accommodations_${tripId}`, JSON.stringify(a)),

  getTransports: (tripId: string): LocalTransport[] =>
    JSON.parse(localStorage.getItem(`transports_${tripId}`) || '[]'),
  saveTransports: (tripId: string, t: LocalTransport[]) =>
    localStorage.setItem(`transports_${tripId}`, JSON.stringify(t)),
};

export const uid = () => Math.random().toString(36).slice(2, 10);
