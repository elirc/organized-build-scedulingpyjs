import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="content-shell">
        <Header />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
