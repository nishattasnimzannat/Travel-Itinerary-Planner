import axios from "axios";

export const CATEGORIES = [
  "None",
  "Sightseeing",
  "Dining",
  "Adventure",
  "Shopping",
  "Entertainment",
  "Relaxation",
  "Transport",
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_STYLES: Record<Category, { color: string; bg: string; icon: string }> = {
  None:          { color: "#888", bg: "#f3f4f6", icon: "—" },
  Sightseeing:   { color: "#1d4ed8", bg: "#dbeafe", icon: "🔭" },
  Dining:        { color: "#c2410c", bg: "#ffedd5", icon: "🍽️" },
  Adventure:     { color: "#b91c1c", bg: "#fee2e2", icon: "🧗" },
  Shopping:      { color: "#7e22ce", bg: "#f3e8ff", icon: "🛍️" },
  Entertainment: { color: "#a16207", bg: "#fef9c3", icon: "🎭" },
  Relaxation:    { color: "#15803d", bg: "#dcfce7", icon: "🧘" },
  Transport:     { color: "#374151", bg: "#f3f4f6", icon: "🚌" },
};

export interface ActivityPayload {
  time: string;
  location: string;
  description?: string;
  category?: Category;
}

export interface Activity extends ActivityPayload {
  _id: string;
  dayPlanId: string;
  tripId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export const getActivities = async (tripId: string, planId: string): Promise<Activity[]> => {
  const response = await axios.get<Activity[]>(`/api/trips/${tripId}/days/${planId}/activities`);
  return response.data;
};

export const createActivity = async (tripId: string, planId: string, data: ActivityPayload): Promise<Activity> => {
  const response = await axios.post<Activity>(`/api/trips/${tripId}/days/${planId}/activities`, data);
  return response.data;
};

export const updateActivity = async (tripId: string, planId: string, activityId: string, data: ActivityPayload): Promise<Activity> => {
  const response = await axios.put<Activity>(`/api/trips/${tripId}/days/${planId}/activities/${activityId}`, data);
  return response.data;
};

export const deleteActivity = async (tripId: string, planId: string, activityId: string): Promise<void> => {
  await axios.delete(`/api/trips/${tripId}/days/${planId}/activities/${activityId}`);
};