import { AvailabilityWindowForm } from "../components/AvailabilityWindowForm";
import { AvailabilityWindowList } from "../components/AvailabilityWindowList";
import { WeeklyAvailabilityEditor } from "../components/WeeklyAvailabilityEditor";
import { BlockedTimeForm } from "../components/BlockedTimeForm";

export function StaffAvailabilityPage() {
  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h2>Staff Availability</h2>
          <p>Recurring weekly ranges plus one-off blocked time.</p>
        </div>
      </div>
      <WeeklyAvailabilityEditor />
      <AvailabilityWindowForm />
      <BlockedTimeForm />
      <AvailabilityWindowList />
    </div>
  );
}

