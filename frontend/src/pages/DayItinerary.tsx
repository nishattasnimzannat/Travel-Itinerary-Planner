import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTrip, Trip } from "../api/trips";
import {
  getDayPlans, createDayPlan, updateDayPlan, deleteDayPlan, DayPlan,
} from "../api/dayPlans";
import {
  getActivities, createActivity, updateActivity, deleteActivity,
  Activity, CATEGORIES, Category, CATEGORY_STYLES,
} from "../api/activities";

type ViewMode = "normal" | "grouped";

const DayItinerary: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [activities, setActivities] = useState<Record<string, Activity[]>>({});
  const [totalDays, setTotalDays] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // View mode and filter
  const [viewMode, setViewMode] = useState<ViewMode>("normal");
  const [activeFilters, setActiveFilters] = useState<Category[]>([]);

  // Day plan form
  const [planLocation, setPlanLocation] = useState("");
  const [planNotes, setPlanNotes] = useState("");
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planFormError, setPlanFormError] = useState("");

  // Activity form
  const [activityPlanId, setActivityPlanId] = useState<string | null>(null);
  const [actTime, setActTime] = useState("");
  const [actLocation, setActLocation] = useState("");
  const [actDescription, setActDescription] = useState("");
  const [actCategory, setActCategory] = useState<Category>("None");
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [actFormError, setActFormError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tripData = await getTrip(id!);
        setTrip(tripData);
        const start = new Date(tripData.startDate);
        const end = new Date(tripData.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(days);
        const plans = await getDayPlans(id!);
        setDayPlans(plans);
        const actMap: Record<string, Activity[]> = {};
        await Promise.all(plans.map(async (plan) => {
          actMap[plan._id] = await getActivities(id!, plan._id);
        }));
        setActivities(actMap);
      } catch {
        console.error("Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const getDayDate = (dayNumber: number) => {
    if (!trip) return "";
    const date = new Date(trip.startDate);
    date.setDate(date.getDate() + dayNumber - 1);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const toggleFilter = (cat: Category) => {
    setActiveFilters((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filterActivities = <T extends Activity>(acts: T[]): T[] => {
  if (activeFilters.length === 0) return acts;
  return acts.filter((a) => activeFilters.includes(a.category));
  };

  const plansForSelectedDay = dayPlans.filter((p) => p.day === selectedDay);

  // Get all activities for selected day (flattened)
  const allActivitiesForDay = plansForSelectedDay.flatMap(
    (plan) => (activities[plan._id] || []).map((a) => ({ ...a, planId: plan._id }))
  );

  // Grouped activities by category
  const groupedActivities = CATEGORIES.reduce((acc, cat) => {
    const filtered = filterActivities(
      allActivitiesForDay.filter((a) => a.category === cat)
    );
    if (filtered.length > 0) acc[cat] = filtered;
    return acc;
  }, {} as Record<string, (Activity & { planId: string })[]>);

  // --- Plan Handlers ---
  const handleAddOrEditPlan = async () => {
    setPlanFormError("");
    if (!planLocation.trim()) { setPlanFormError("Location is required."); return; }
    try {
      if (editingPlanId) {
        const updated = await updateDayPlan(id!, editingPlanId, { location: planLocation, notes: planNotes });
        setDayPlans((prev) => prev.map((p) => (p._id === editingPlanId ? updated : p)));
      } else {
        const newPlan = await createDayPlan(id!, { day: selectedDay, location: planLocation, notes: planNotes });
        setDayPlans((prev) => [...prev, newPlan]);
        setActivities((prev) => ({ ...prev, [newPlan._id]: [] }));
      }
      resetPlanForm();
    } catch { setPlanFormError("Something went wrong."); }
  };

  const handleEditPlan = (plan: DayPlan) => {
    setEditingPlanId(plan._id);
    setPlanLocation(plan.location);
    setPlanNotes(plan.notes || "");
    setShowPlanForm(true);
    setPlanFormError("");
    resetActivityForm();
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm("Delete this plan and all its activities?")) return;
    try {
      await deleteDayPlan(id!, planId);
      setDayPlans((prev) => prev.filter((p) => p._id !== planId));
      setActivities((prev) => { const u = { ...prev }; delete u[planId]; return u; });
    } catch { alert("Failed to delete."); }
  };

  const resetPlanForm = () => {
    setPlanLocation(""); setPlanNotes(""); setEditingPlanId(null);
    setShowPlanForm(false); setPlanFormError("");
  };

  // --- Activity Handlers ---
  const handleAddOrEditActivity = async () => {
    setActFormError("");
    if (!actTime.trim() || !actLocation.trim()) { setActFormError("Time and location are required."); return; }
    try {
      if (editingActivityId && activityPlanId) {
        const updated = await updateActivity(id!, activityPlanId, editingActivityId, {
          time: actTime, location: actLocation, description: actDescription, category: actCategory,
        });
        setActivities((prev) => ({
          ...prev,
          [activityPlanId]: prev[activityPlanId].map((a) => a._id === editingActivityId ? updated : a),
        }));
      } else if (activityPlanId) {
        const newAct = await createActivity(id!, activityPlanId, {
          time: actTime, location: actLocation, description: actDescription, category: actCategory,
        });
        setActivities((prev) => ({ ...prev, [activityPlanId]: [...(prev[activityPlanId] || []), newAct] }));
      }
      resetActivityForm();
    } catch { setActFormError("Something went wrong."); }
  };

  const handleEditActivity = (planId: string, activity: Activity) => {
    setActivityPlanId(planId);
    setEditingActivityId(activity._id);
    setActTime(activity.time);
    setActLocation(activity.location);
    setActDescription(activity.description || "");
    setActCategory(activity.category);
    setActFormError("");
    resetPlanForm();
  };

  const handleDeleteActivity = async (planId: string, activityId: string) => {
    if (!window.confirm("Delete this activity?")) return;
    try {
      await deleteActivity(id!, planId, activityId);
      setActivities((prev) => ({ ...prev, [planId]: prev[planId].filter((a) => a._id !== activityId) }));
    } catch { alert("Failed to delete."); }
  };

  const resetActivityForm = () => {
    setActivityPlanId(null); setActTime(""); setActLocation("");
    setActDescription(""); setActCategory("None");
    setEditingActivityId(null); setActFormError("");
  };

  const renderActivityCard = (activity: Activity & { planId: string }) => {
  const style = CATEGORY_STYLES[activity.category];
  return (
    <div key={activity._id} style={styles.activityCard}>
      <div style={styles.activityLeft}>
        <span style={styles.activityTime}>🕐 {activity.time}</span>
        <div style={styles.activityInfo}>
          <div style={styles.activityTopRow}>
            <p style={styles.activityLocation}>📍 {activity.location}</p>
            {activity.category && activity.category !== "None" && (
              <span style={{ ...styles.categoryBadge, color: style.color, backgroundColor: style.bg }}>
                {style.icon} {activity.category}
              </span>
            )}
          </div>
          {activity.description && <p style={styles.activityDesc}>{activity.description}</p>}
        </div>
      </div>
      <div style={styles.activityActions}>
        <button style={styles.editBtn} onClick={() => handleEditActivity(activity.planId, activity)}>Edit</button>
        <button style={styles.deleteBtn} onClick={() => handleDeleteActivity(activity.planId, activity._id)}>Delete</button>
      </div>
    </div>
  );
};

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (!trip) return <div style={styles.center}>Trip not found.</div>;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>

        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate(`/trips/${id}`)}>← Back to Trip</button>
          <h1 style={styles.title}>🗓️ {trip.tripName}</h1>
          <p style={styles.subtitle}>Daily Itinerary · {totalDays} days</p>
        </div>

        {/* Day Tabs */}
        <div style={styles.tabsWrapper}>
          <div style={styles.tabs}>
            {Array.from({ length: totalDays }, (_, i) => i + 1).map((day) => {
              const hasPlans = dayPlans.some((p) => p.day === day);
              return (
                <button key={day}
                  style={{ ...styles.tab, ...(selectedDay === day ? styles.tabActive : {}) }}
                  onClick={() => { setSelectedDay(day); resetPlanForm(); resetActivityForm(); setActiveFilters([]); }}
                >
                  <span style={styles.tabDay}>Day {day}</span>
                  <span style={styles.tabDate}>{getDayDate(day)}</span>
                  {hasPlans && <span style={styles.dot} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Content */}
        <div style={styles.content}>
          <div style={styles.dayHeader}>
            <div>
              <h2 style={styles.dayTitle}>Day {selectedDay}</h2>
              <p style={styles.dayDate}>{getDayDate(selectedDay)}</p>
            </div>
            {!showPlanForm && (
              <button style={styles.addBtn} onClick={() => setShowPlanForm(true)}>+ Add Plan</button>
            )}
          </div>

          {/* View Mode Selector */}
          <div style={styles.viewModeBar}>
            <div style={styles.modeSelector}>
              {(["normal", "grouped"] as ViewMode[]).map((mode) => (
                <button key={mode}
                  style={{ ...styles.modeBtn, ...(viewMode === mode ? styles.modeBtnActive : {}) }}
                  onClick={() => setViewMode(mode)}
                >
                  {mode === "normal" ? "📋 Normal" : "🗂️ Group by Category"}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={styles.filterBar}>
            <span style={styles.filterLabel}>Filter:</span>
            <div style={styles.filterPills}>
              {CATEGORIES.map((cat) => {
                const s = CATEGORY_STYLES[cat];
                const isActive = activeFilters.includes(cat);
                return (
                  <button key={cat}
                    style={{
                      ...styles.filterPill,
                      backgroundColor: isActive ? s.bg : "#f3f4f6",
                      color: isActive ? s.color : "#666",
                      border: isActive ? `1.5px solid ${s.color}` : "1.5px solid transparent",
                    }}
                    onClick={() => toggleFilter(cat)}
                  >
                    {s.icon} {cat}
                  </button>
                );
              })}
              {activeFilters.length > 0 && (
                <button style={styles.clearFilter} onClick={() => setActiveFilters([])}>
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          {/* Plan Form */}
          {showPlanForm && (
            <div style={styles.form}>
              <h3 style={styles.formTitle}>{editingPlanId ? "Edit Plan" : "New Plan"}</h3>
              {planFormError && <div style={styles.error}>{planFormError}</div>}
              <div style={styles.field}>
                <label style={styles.label}>Location / Place</label>
                <input type="text" placeholder="e.g. Eiffel Tower area" value={planLocation}
                  onChange={(e) => setPlanLocation(e.target.value)} style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Notes <span style={styles.optional}>(optional)</span></label>
                <textarea placeholder="Overall notes..." value={planNotes}
                  onChange={(e) => setPlanNotes(e.target.value)} rows={2} style={styles.textarea} />
              </div>
              <div style={styles.formActions}>
                <button style={styles.saveBtn} onClick={handleAddOrEditPlan}>
                  {editingPlanId ? "Save Changes" : "Add Plan"}
                </button>
                <button style={styles.cancelBtn} onClick={resetPlanForm}>Cancel</button>
              </div>
            </div>
          )}

          {/* NORMAL VIEW */}
          {viewMode === "normal" && (
            plansForSelectedDay.length === 0 && !showPlanForm ? (
              <div style={styles.empty}>
                <p>No plans for Day {selectedDay} yet.</p>
                <p style={{ fontSize: "13px", color: "#aaa" }}>Click "+ Add Plan" to get started.</p>
              </div>
            ) : (
              <div style={styles.plansList}>
                {plansForSelectedDay.map((plan) => {
                  const planActs = filterActivities(activities[plan._id] || []);
                  return (
                    <div key={plan._id} style={styles.planCard}>
                      <div style={styles.planHeader}>
                        <div style={styles.planInfo}>
                          <p style={styles.planLocation}>📍 {plan.location}</p>
                          {plan.notes && <p style={styles.planNotes}>{plan.notes}</p>}
                        </div>
                        <div style={styles.planActions}>
                          <button style={styles.editBtn} onClick={() => handleEditPlan(plan)}>Edit</button>
                          <button style={styles.deleteBtn} onClick={() => handleDeletePlan(plan._id)}>Delete</button>
                        </div>
                      </div>

                      <div style={styles.activitiesSection}>
                        <div style={styles.activitiesHeader}>
                          <span style={styles.activitiesTitle}>Activities</span>
                          <button style={styles.addActivityBtn}
                            onClick={() => { resetActivityForm(); setActivityPlanId(plan._id); resetPlanForm(); }}>
                            + Add Activity
                          </button>
                        </div>

                        {activityPlanId === plan._id && (
                          <div style={styles.activityForm}>
                            {actFormError && <div style={styles.error}>{actFormError}</div>}
                            <div style={styles.activityFormRow}>
                              <div style={styles.field}>
                                <label style={styles.label}>Time</label>
                                <input type="time" value={actTime}
                                  onChange={(e) => setActTime(e.target.value)} style={styles.input} />
                              </div>
                              <div style={{ ...styles.field, flex: 2 }}>
                                <label style={styles.label}>Location</label>
                                <input type="text" placeholder="e.g. Eiffel Tower" value={actLocation}
                                  onChange={(e) => setActLocation(e.target.value)} style={styles.input} />
                              </div>
                            </div>
                            <div style={styles.field}>
                              <label style={styles.label}>Category</label>
                              <select value={actCategory}
                                onChange={(e) => setActCategory(e.target.value as Category)}
                                style={styles.input}>
                                {CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {CATEGORY_STYLES[cat].icon} {cat}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div style={styles.field}>
                              <label style={styles.label}>Description <span style={styles.optional}>(optional)</span></label>
                              <textarea placeholder="What are you doing here?" value={actDescription}
                                onChange={(e) => setActDescription(e.target.value)} rows={2} style={styles.textarea} />
                            </div>
                            <div style={styles.formActions}>
                              <button style={styles.saveBtn} onClick={handleAddOrEditActivity}>
                                {editingActivityId ? "Save Changes" : "Add Activity"}
                              </button>
                              <button style={styles.cancelBtn} onClick={resetActivityForm}>Cancel</button>
                            </div>
                          </div>
                        )}

                        {planActs.length === 0 && activityPlanId !== plan._id ? (
                          <p style={styles.noActivities}>
                            {activeFilters.length > 0 ? "No activities match the selected filters." : "No activities yet."}
                          </p>
                        ) : (
                          <div style={styles.activitiesList}>
                            {planActs.map((activity) =>
                              renderActivityCard({ ...activity, planId: plan._id })
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* GROUPED VIEW */}
          {viewMode === "grouped" && (
            <div style={styles.plansList}>
              {Object.keys(groupedActivities).length === 0 ? (
                <div style={styles.empty}>
                  <p>No activities {activeFilters.length > 0 ? "match the selected filters" : "for this day"} yet.</p>
                </div>
              ) : (
                Object.entries(groupedActivities).map(([cat, acts]) => {
                  const s = CATEGORY_STYLES[cat as Category];
                  return (
                    <div key={cat} style={styles.groupCard}>
                      <div style={{ ...styles.groupHeader, backgroundColor: s.bg }}>
                        <span style={{ ...styles.groupTitle, color: s.color }}>
                          {s.icon} {cat}
                        </span>
                        <span style={{ ...styles.groupCount, color: s.color }}>
                          {acts.length} {acts.length === 1 ? "activity" : "activities"}
                        </span>
                      </div>
                      <div style={styles.activitiesList}>
                        {acts.map((activity) => renderActivityCard(activity))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: "100vh", backgroundColor: "#f0f4ff", padding: "20px" },
  center: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontSize: "16px", color: "#666" },
  wrapper: { maxWidth: "700px", margin: "0 auto" },
  header: { marginBottom: "24px" },
  backBtn: { background: "none", border: "none", color: "#4f46e5", fontSize: "14px", fontWeight: 600, cursor: "pointer", padding: "0 0 12px 0" },
  title: { fontSize: "26px", fontWeight: 700, color: "#1a1a2e", margin: 0 },
  subtitle: { color: "#666", marginTop: "4px", fontSize: "14px" },
  tabsWrapper: { overflowX: "auto", marginBottom: "20px" },
  tabs: { display: "flex", gap: "8px", paddingBottom: "4px" },
  tab: { display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 16px", borderRadius: "10px", border: "1px solid #ddd", backgroundColor: "#fff", cursor: "pointer", minWidth: "80px", position: "relative" },
  tabActive: { backgroundColor: "#4f46e5", border: "1px solid #4f46e5", color: "#fff" },
  tabDay: { fontSize: "13px", fontWeight: 600 },
  tabDate: { fontSize: "11px", marginTop: "2px", opacity: 0.8 },
  dot: { width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22c55e", position: "absolute", top: "6px", right: "6px" },
  content: { backgroundColor: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
  dayHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" },
  dayTitle: { fontSize: "20px", fontWeight: 700, color: "#1a1a2e", margin: 0 },
  dayDate: { fontSize: "14px", color: "#666", marginTop: "4px" },
  addBtn: { padding: "8px 16px", backgroundColor: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  viewModeBar: { marginBottom: "12px" },
  modeSelector: { display: "flex", gap: "8px" },
  modeBtn: { padding: "7px 14px", borderRadius: "8px", border: "1px solid #ddd", backgroundColor: "#f9fafb", color: "#555", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  modeBtnActive: { backgroundColor: "#4f46e5", color: "#fff", border: "1px solid #4f46e5" },
  filterBar: { display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  filterLabel: { fontSize: "13px", fontWeight: 600, color: "#888", paddingTop: "6px", whiteSpace: "nowrap" },
  filterPills: { display: "flex", flexWrap: "wrap", gap: "6px" },
  filterPill: { padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  clearFilter: { padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600, cursor: "pointer", backgroundColor: "#fee2e2", color: "#dc2626", border: "none" },
  form: { backgroundColor: "#f8f9ff", borderRadius: "12px", padding: "20px", marginBottom: "20px" },
  formTitle: { fontSize: "16px", fontWeight: 600, color: "#1a1a2e", margin: "0 0 16px 0" },
  field: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px", flex: 1 },
  label: { fontSize: "13px", fontWeight: 600, color: "#333" },
  optional: { fontWeight: 400, color: "#999" },
  input: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" },
  textarea: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6" },
  formActions: { display: "flex", gap: "10px" },
  saveBtn: { padding: "9px 20px", backgroundColor: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  cancelBtn: { padding: "9px 20px", backgroundColor: "#fff", color: "#4f46e5", border: "1px solid #c7d2fe", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" },
  error: { backgroundColor: "#fef2f2", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", marginBottom: "14px", fontSize: "13px" },
  empty: { textAlign: "center", padding: "40px 20px", color: "#999", fontSize: "15px" },
  plansList: { display: "flex", flexDirection: "column", gap: "16px" },
  planCard: { border: "1px solid #e8eaf6", borderRadius: "12px", overflow: "hidden" },
  planHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px", backgroundColor: "#f8f9ff" },
  planInfo: { flex: 1 },
  planLocation: { fontSize: "15px", fontWeight: 600, color: "#1a1a2e", margin: "0 0 4px 0" },
  planNotes: { fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.5" },
  planActions: { display: "flex", gap: "8px", marginLeft: "12px" },
  activitiesSection: { padding: "16px" },
  activitiesHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  activitiesTitle: { fontSize: "13px", fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" },
  addActivityBtn: { padding: "5px 12px", backgroundColor: "#eef2ff", color: "#4f46e5", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  activityForm: { backgroundColor: "#f8f9ff", borderRadius: "10px", padding: "16px", marginBottom: "12px" },
  activityFormRow: { display: "flex", gap: "12px" },
  noActivities: { fontSize: "13px", color: "#aaa", textAlign: "center", padding: "12px 0", margin: 0 },
  activitiesList: { display: "flex", flexDirection: "column", gap: "8px" },
  activityCard: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", backgroundColor: "#fafafa", borderRadius: "8px", padding: "12px 14px", border: "1px solid #eee" },
  activityLeft: { display: "flex", gap: "12px", flex: 1 },
  activityTime: { fontSize: "13px", fontWeight: 600, color: "#4f46e5", whiteSpace: "nowrap", minWidth: "70px" },
  activityInfo: { flex: 1 },
  activityTopRow: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "2px" },
  activityLocation: { fontSize: "14px", fontWeight: 600, color: "#1a1a2e", margin: 0 },
  categoryBadge: { fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "12px", whiteSpace: "nowrap" },
  activityDesc: { fontSize: "13px", color: "#666", margin: 0, lineHeight: "1.5" },
  activityActions: { display: "flex", gap: "6px", marginLeft: "8px" },
  editBtn: { padding: "5px 10px", backgroundColor: "#eef2ff", color: "#4f46e5", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  deleteBtn: { padding: "5px 10px", backgroundColor: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" },
  groupCard: { border: "1px solid #e8eaf6", borderRadius: "12px", overflow: "hidden" },
  groupHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" },
  groupTitle: { fontSize: "15px", fontWeight: 700 },
  groupCount: { fontSize: "12px", fontWeight: 600 },
};

export default DayItinerary; 