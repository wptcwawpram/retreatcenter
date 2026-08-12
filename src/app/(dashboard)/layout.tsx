import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — desktop only, mobile uses sheet */}
      <DashboardSidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto bg-luxury/60 backdrop-blur-sm p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
