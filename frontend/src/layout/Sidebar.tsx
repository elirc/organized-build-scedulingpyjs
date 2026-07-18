import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/calendar/week", label: "Calendar" },
  { to: "/booking", label: "Booking" },
  { to: "/appointments", label: "Appointments" },
  { to: "/availability", label: "Availability" },
  { to: "/staff", label: "Staff" },
  { to: "/customers", label: "Customers" },
  { to: "/services", label: "Services" }
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <h1>Scheduling</h1>
      <p>Appointments, availability, reminders, and calendar workflows.</p>
      <nav>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

