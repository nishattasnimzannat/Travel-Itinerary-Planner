export interface Accommodation {
  id: string;
  tripId: string;
  name: string;
  address?: string;
  checkIn: string;
  checkOut: string;
  cost?: number;
  currency?: string;
  confirmationNumber?: string;
}
