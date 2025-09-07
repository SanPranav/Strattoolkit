"use server";

import { Suspense } from "react";

import { execPocketbase } from "@/lib/pbaseServer";
import ScoutingForm from "./ScoutingForm";
import Loading from "./loading";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { ScoutingQuestionConfig } from "@/lib/types/scoutingTypes";
import { Button } from "@/components/ui/button";

export default async function ScoutingPage() {
  // const { scoutingConfig, userId } = {
  //   scoutingConfig: [
  //     {
  //       name: "Team",
  //       type: "select",
  //       select_key: "sk_EventTeams",
  //       description: "The Team you are scouting",
  //       optional: true
  //     },
  //     {
  //       name: "L4 Scored",
  //       type: "number",
  //       min: 0,
  //       max: 100
  //     },
  //     {
  //       name: "Broke Down?",
  //       type: "boolean",
  //       boolean_default: false,
  //       description: "Did the robot ever stop moving?"
  //     },
  //     {
  //       name: "Climb Level",
  //       type: "slider",
  //       min: 0,
  //       max: 4,
  //       default: 0,
  //       description: "Did the robot climb? If so, how high?"
  //     }
  //   ] as ScoutingQuestionConfig[],

  //   userId: "wo294dln2thb20j"
  // };

  const { scoutingConfig, userId } = await execPocketbase(async (pb) => {
    try {
      const record = await pb
        .collection("ScoutingSettings")
        .getFirstListItem("key='ScoutingConfig'");
      console.log(pb.authStore.record?.id);
      return { scoutingConfig: record.value, userId: pb.authStore.record?.id };
    } catch (e) {
      console.warn("[ScoutingPage]", e);
      return { scoutingConfig: [] };
    }
  });

  return (
    <div className="w-full h-full container mx-auto flex flex-col gap-3 p-4">
      <div className="hidden md:flex flex-shrink-0 mb-4 justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Scouting Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Submit match data for team analysis
          </p>
        </div>
        <NavButtons className="p-3 flex flex-col gap-3" />
      </div>
      <Card className="flex md:hidden bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Match Scouting
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill out all required fields to submit scouting data
          </p>
          <NavButtons className="w-full flex gap-3 pt-3" />
        </CardHeader>
      </Card>
      <Suspense fallback={<Loading />}>
        <ScoutingForm config={scoutingConfig} userId={userId || ""} />
      </Suspense>
    </div>
  );
}

function NavButtons({ className }: { className: string }) {
  return (
    <div {...{ className }}>
      <Button variant={"outline"} className="flex-1">
        Responses
      </Button>
      {false && (
        <Button variant={"outline"} className="flex-1">
          Configure
        </Button>
      )}
    </div>
  );
}
