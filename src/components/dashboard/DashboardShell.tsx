import { AuthGuard } from "./AuthGuard";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { Topbar } from "./Topbar";
import { ToastContainer } from "@/features/toast/ToastContainer";

interface DashboardShellProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function DashboardShell({ children, adminOnly = false }: DashboardShellProps) {
  return (
    <AuthGuard adminOnly={adminOnly}>
      {/* .dashboard-shell bascule le curseur système (voir globals.css) —
          la précision prime sur l'identité visuelle ici, contrairement au site public */}
      <div className="dashboard-shell flex min-h-screen bg-background">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-x-clip px-4 pb-24 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:pb-8">
            {children}
          </main>
        </div>

        <BottomNav />
      </div>

      <ToastContainer />
    </AuthGuard>
  );
}
