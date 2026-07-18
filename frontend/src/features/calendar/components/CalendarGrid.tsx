import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchCalendarWeek } from "../../../api/calendar.api";
import { LoadingState } from "../../../components/LoadingState";
import { CalendarToolbar } from "./CalendarToolbar";
import { TimezoneSelector } from "./TimezoneSelector";
import { StaffCalendarColumn } from "./StaffCalendarColumn";

export function CalendarPage({ mode }: { mode: "day" | "week" | "month" }) {
  const [startDate, setStartDate] = useState("2026-06-15");
  const [timezone, setTimezone] = useState("America/Chicago");
  const query = useQuery({
    queryKey: ["calendar", mode, startDate, timezone],
    queryFn: () => fetchCalendarWeek({ startDate, timezone })
  });

  if (query.isLoading) {
    return <LoadingState label="Loading calendar..." />;
  }

  const appointments = query.data?.appointments ?? [];

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h2>{mode[0].toUpperCase() + mode.slice(1)} Calendar</h2>
          <p>Timezone-aware appointment display for scheduling operations.</p>
        </div>
      </div>
      <div className="filter-bar">
        <CalendarToolbar date={startDate} onDateChange={setStartDate} />
        <TimezoneSelector value={timezone} onChange={setTimezone} />
      </div>
      <StaffCalendarColumn label="Appointments" appointments={appointments} timezone={timezone} />
    </div>
  );
}

