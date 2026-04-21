import axios from "axios";

export interface DayPlanPayload {
  day: number;
  location: string;
  notes?: string;
}

export interface DayPlan extends DayPlanPayload {
  _id: string;
  tripId: string;
  createdAt: string;
  updatedAt: string;
}

export const getDayPlans = async (tripId: string): Promise<DayPlan[]> => {
  const response = await axios.get<DayPlan[]>(`/api/trips/${tripId}/days`);
  return response.data;
};

export const createDayPlan = async (tripId: string, data: DayPlanPayload): Promise<DayPlan> => {
  const response = await axios.post<DayPlan>(`/api/trips/${tripId}/days`, data);
  return response.data;
};

export const updateDayPlan = async (tripId: string, planId: string, data: Partial<DayPlanPayload>): Promise<DayPlan> => {
  const response = await axios.put<DayPlan>(`/api/trips/${tripId}/days/${planId}`, data);
  return response.data;
};

export const deleteDayPlan = async (tripId: string, planId: string): Promise<void> => {
  await axios.delete(`/api/trips/${tripId}/days/${planId}`);
};