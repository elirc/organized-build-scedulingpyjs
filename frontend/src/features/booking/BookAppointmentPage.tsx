import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchServices } from "../../api/services.api";
import { fetchStaff } from "../../api/staff.api";
import { useAvailableSlots } from "./hooks/useAvailableSlots";
import { useBookAppointment } from "./hooks/useBookAppointment";
import { ServiceSelect } from "./components/ServiceSelect";
import { StaffSelect } from "./components/StaffSelect";
import { DatePicker } from "./components/DatePicker";
import { AvailableSlotPicker } from "./components/AvailableSlotPicker";
import { BookingSummary } from "./components/BookingSummary";
import { RecurringAppointmentOptions } from "./components/RecurringAppointmentOptions";

export function BookAppointmentPage() {
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("2026-06-18");
  const [timezone, setTimezone] = useState("America/Chicago");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [customerId, setCustomerId] = useState("");

  const servicesQuery = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const staffQuery = useQuery({ queryKey: ["staff"], queryFn: fetchStaff });
  const slotsQuery = useAvailableSlots({ serviceId, staffId, date, timezone });

  const bookingMutation = useBookAppointment();

  const selectedService = servicesQuery.data?.find((service) => service.id === serviceId);
  const selectedStaff = staffQuery.data?.find((staff) => staff.id === staffId);

  return (
    <div className="stack">
      <div className="page-header">
        <div>
          <h2>Book Appointment</h2>
          <p>Select a service, staff member, date, and timezone-safe slot.</p>
        </div>
      </div>

      <section className="card stack">
        <div className="form-grid">
          <ServiceSelect value={serviceId} onChange={setServiceId} options={servicesQuery.data ?? []} />
          <StaffSelect value={staffId} onChange={setStaffId} options={staffQuery.data ?? []} />
          <DatePicker value={date} onChange={setDate} />

          <label>
            Timezone
            <input value={timezone} onChange={(event) => setTimezone(event.target.value)} />
          </label>

          <label>
            Customer ID
            <input value={customerId} onChange={(event) => setCustomerId(event.target.value)} placeholder="Seeded customer id" />
          </label>
        </div>
      </section>

      <section className="card stack">
        <strong>Available Slots</strong>
        <AvailableSlotPicker slots={slotsQuery.data ?? []} value={selectedSlot} onChange={setSelectedSlot} />
        {selectedSlot ? <div>Selected: {selectedSlot}</div> : null}
        <button
          type="button"
          onClick={() =>
            bookingMutation.mutate({
              customerId,
              staffId,
              serviceId,
              startTimeLocal: selectedSlot,
              timezone,
              source: "ADMIN_BOOKING"
            })
          }
          disabled={!customerId || !selectedSlot || bookingMutation.isPending}
        >
          Confirm Booking
        </button>
        {bookingMutation.isError ? <p>Booking failed. Re-check slot availability and IDs.</p> : null}
        {bookingMutation.isSuccess ? <p>Appointment created successfully.</p> : null}
      </section>
      <BookingSummary
        serviceName={selectedService?.name}
        staffName={selectedStaff?.displayName}
        selectedSlot={selectedSlot}
        timezone={timezone}
      />
      <RecurringAppointmentOptions />
    </div>
  );
}
