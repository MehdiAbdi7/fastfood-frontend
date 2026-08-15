import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { ProfileCard } from "@/components/settings/ProfileCard";
import { ServiceManagementCard } from "@/components/settings/ServiceManagementCard";
import { AppearanceCard } from "@/components/settings/AppearanceCard";
import { SessionCard } from "@/components/settings/SessionCard";

export default function ParametresPage() {
  return (
    <DashboardShell>
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <ProfileCard />
        <ServiceManagementCard />
        <AppearanceCard />
        <SessionCard />
      </div>
    </DashboardShell>
  );
}
