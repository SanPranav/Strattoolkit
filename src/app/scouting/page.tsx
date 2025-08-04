import { execPocketbase } from "@/lib/pbaseServer";
import { Suspense } from "react";
import ScoutingForm from "./ScoutingForm";
import Loading from "./loading";

export default async function ScoutingPage() {
  const { scoutingConfig, userId } = await execPocketbase(async (pb) => {
    try {
      const record = await pb
        .collection("Settings")
        .getFirstListItem("key='ScoutingConfig'");
      return { scoutingConfig: record.value, userId: pb.authStore.record?.id };
    } catch (e) {
      console.warn("[ScoutingPage]", e);
      return { scoutingConfig: [] };
    }
  });

  return (
    <div className="h-screen bg-background">
      {/* Mobile/Desktop responsive container */}
      <div className="container mx-auto h-screen flex flex-col md:pt-3">
        {/* Desktop header - hidden on mobile */}
        <div className="hidden md:flex flex-shrink-0 mb-4 justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Scouting Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Submit match data for team analysis
            </p>
          </div>
        </div>
        <Suspense fallback={<Loading />}>
          <ScoutingForm config={scoutingConfig} userId={userId || ""} />
        </Suspense>
      </div>
    </div>
  );
}
