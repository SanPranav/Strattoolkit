import { useState } from "react";
import { toast } from "sonner";
import { pb, recordToImageUrl } from "@/lib/pbaseClient";
import { formatMinutes } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
  pb_OutreachEventsItem,
  pb_OutreachSessionsItem
} from "@/lib/types";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EventSessionsTableProps {
  event: pb_OutreachEventsItem;
  sessions: pb_OutreachSessionsItem[];
  onSessionDeleted: () => void;
}

export default function EventSessionsTable({
  event,
  sessions,
  onSessionDeleted
}: EventSessionsTableProps) {
  const isMobile = useIsMobile();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteSession = async (sessionId: string) => {
    setDeletingId(sessionId);
    try {
      await pb.collection("OutreachSessions").delete(sessionId);
      toast.success("Session deleted successfully");
      onSessionDeleted();
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session");
    } finally {
      setDeletingId(null);
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hours logged for this event yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-scroll">
      <h4 className="font-semibold">Logged Hours</h4>
      <div className="overflow-y-auto border rounded-md overflow-scroll">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Time</TableHead>
              {!isMobile && <TableHead>Date Logged</TableHead>}
              {!isMobile && (
                <TableHead className="w-[100px]">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={recordToImageUrl(session.expand?.user)?.toString()}
                      />
                      <AvatarFallback>
                        {session.expand?.user?.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {session.expand?.user?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.expand?.user?.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {formatMinutes(session.minutes)}
                  </Badge>
                </TableCell>
                {!isMobile && (
                  <TableCell>
                    {new Date(session.created).toLocaleDateString()}
                  </TableCell>
                )}
                {!isMobile && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSession(session.id)}
                      disabled={deletingId === session.id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
