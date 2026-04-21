import axios from "axios";

export interface TripPayload {
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Trip extends TripPayload {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export const createTrip = async (data: TripPayload): Promise<Trip> => {
  const response = await axios.post<Trip>("/api/trips", data);
  return response.data;
}; 

export const getAllTrips = async (): Promise<Trip[]> => {
  const response = await axios.get<Trip[]>("/api/trips");
  return response.data;
};

export const getTrip = async (id: string): Promise<Trip> => {
  const response = await axios.get<Trip>(`/api/trips/${id}`);
  return response.data;
};

export const updateTrip = async (id: string, data: TripPayload): Promise<Trip> => {
  const response = await axios.put<Trip>(`/api/trips/${id}`, data);
  return response.data;
};

export const deleteTrip = async (id: string): Promise<void> => {
  await axios.delete(`/api/trips/${id}`);
};