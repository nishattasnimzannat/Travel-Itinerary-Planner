export interface TransportSegment {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  carrier: string;
  number: string;
}

export interface Transport {
  id: string;
  tripId: string;
  type: string;
  segments: TransportSegment[];
  bookingReference?: string;
}
