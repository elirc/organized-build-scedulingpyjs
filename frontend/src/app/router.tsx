import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layout/AppLayout";
import { RequireAuth } from "../auth/RequireAuth";
import { LoginPage } from "../auth/LoginPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { BookAppointmentPage } from "../features/booking/BookAppointmentPage";
import { CalendarDayPage } from "../features/calendar/pages/CalendarDayPage";
import { CalendarWeekPage } from "../features/calendar/pages/CalendarWeekPage";
import { CalendarMonthPage } from "../features/calendar/pages/CalendarMonthPage";
import { AppointmentListPage } from "../features/appointments/pages/AppointmentListPage";
import { AppointmentDetailPage } from "../features/appointments/pages/AppointmentDetailPage";
import { StaffAvailabilityPage } from "../features/availability/pages/StaffAvailabilityPage";
import { StaffListPage } from "../features/staff/pages/StaffListPage";
import { StaffDetailPage } from "../features/staff/pages/StaffDetailPage";
import { CreateStaffPage } from "../features/staff/pages/CreateStaffPage";
import { CustomerListPage } from "../features/customers/pages/CustomerListPage";
import { CustomerDetailPage } from "../features/customers/pages/CustomerDetailPage";
import { CreateCustomerPage } from "../features/customers/pages/CreateCustomerPage";
import { ServiceListPage } from "../features/services/pages/ServiceListPage";
import { ServiceDetailPage } from "../features/services/pages/ServiceDetailPage";
import { CreateServicePage } from "../features/services/pages/CreateServicePage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/",
    element: <RequireAuth />,
    children: [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "booking", element: <BookAppointmentPage /> },
          { path: "calendar/day", element: <CalendarDayPage /> },
          { path: "calendar/week", element: <CalendarWeekPage /> },
          { path: "calendar/month", element: <CalendarMonthPage /> },
          { path: "appointments", element: <AppointmentListPage /> },
          { path: "appointments/:id", element: <AppointmentDetailPage /> },
          { path: "availability", element: <StaffAvailabilityPage /> },
          { path: "staff", element: <StaffListPage /> },
          { path: "staff/new", element: <CreateStaffPage /> },
          { path: "staff/:id", element: <StaffDetailPage /> },
          { path: "customers", element: <CustomerListPage /> },
          { path: "customers/new", element: <CreateCustomerPage /> },
          { path: "customers/:id", element: <CustomerDetailPage /> },
          { path: "services", element: <ServiceListPage /> },
          { path: "services/new", element: <CreateServicePage /> },
          { path: "services/:id", element: <ServiceDetailPage /> }
        ]
      }
    ]
  }
]);
