"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileText,
  Calendar,
  User,
  Trash2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllResponses,
  uploadResponses,
  dexie,
  markResponseAsUploaded
} from "@/lib/db/scouting";
import { pb } from "@/lib/pbaseClient";
import type { DexieScoutingSubmission, Team } from "@/lib/types/scouting";
import { useNavbar } from "@/hooks/useNavbar";
import { UploadProgressDialog } from "./UploadProgressDialog";
import type {
  UploadProgressData,
  UploadCompleteData
} from "@/lib/types/uploadWorker";

export default function ResponsesPage() {
  const [responses, setResponses] = useState<DexieScoutingSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadProgress, setUploadProgress] =
    useState<UploadProgressData | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "complete" | "error"
  >("idle");
  const [uploadResults, setUploadResults] = useState<
    UploadCompleteData | undefined
  >();
  const [uploadError, setUploadError] = useState<string | undefined>();

  // Cancellation ref for in-component uploads
  const cancelRef = useRef(false);

  const { setDefaultShown, setMobileNavbarSide } = useNavbar();

  useEffect(() => {
    setDefaultShown(false);
    setMobileNavbarSide("right");
  }, [setDefaultShown]);

  const loadResponses = async () => {
    setIsLoading(true);
    try {
      const data = await getAllResponses();
      setResponses(data);
    } catch (error) {
      console.error("Failed to load responses:", error);
      toast.error("Failed to load responses");
    } finally {
      setIsLoading(false);
    }
  };

  // Sequential upload without worker
  const performUpload = useCallback(
    async (items: DexieScoutingSubmission[]) => {
      const totalCount = items.length;
      let successCount = 0;
      const errors: Array<{ id: number; error: string }> = [];

      for (let i = 0; i < items.length; i++) {
        if (cancelRef.current) {
          setUploadStatus("idle");
          toast.info("Upload cancelled");
          return;
        }

        const r = items[i];
        const progress: UploadProgressData = {
          currentIndex: i + 1,
          totalCount,
          currentResponse: `Response #${r.id} by ${r.user}`,
          percentage: Math.round(((i + 1) / totalCount) * 100)
        };
        setUploadProgress(progress);

        try {
          await pb.collection("ScoutingResponses").create({
            user: r.user,
            data: r.data,
            date: new Date(r.date).toISOString()
          });
          if (r.id) {
            await markResponseAsUploaded(r.id);
          }
          successCount++;
        } catch (e: any) {
          errors.push({ id: r.id || i, error: e?.message || "Unknown error" });
        }

        // Yield to UI thread
        await new Promise((res) => setTimeout(res, 0));
      }

      const result: UploadCompleteData = {
        successCount,
        errorCount: errors.length,
        errors
      };

      setUploadResults(result);
      setUploadStatus(errors.length ? "error" : "complete");
      setIsUploading(false);

      if (errors.length === 0) {
        toast.success(
          `Successfully uploaded ${successCount} response${
            successCount !== 1 ? "s" : ""
          }!`
        );
      } else {
        toast.error(
          `Upload finished: ${successCount} succeeded, ${errors.length} failed.`
        );
      }

      loadResponses();
    },
    [loadResponses]
  );

  const handleUpload = async () => {
    try {
      const responsesToUpload = await uploadResponses();
      if (responsesToUpload.length === 0) {
        toast.info("No responses to upload");
        return;
      }
      // Reset state
      cancelRef.current = false;
      setUploadProgress(null);
      setUploadStatus("uploading");
      setUploadResults(undefined);
      setUploadError(undefined);
      setIsUploading(true);
      setUploadDialogOpen(true);
      // Auth token already in pb.authStore
      await performUpload(responsesToUpload as DexieScoutingSubmission[]);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to prepare responses for upload");
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    cancelRef.current = true;
    setUploadDialogOpen(false);
  };

  // Deprecated background upload button functionality -> no-op
  const handleContinueInBackground = () => {
    toast.info("Background upload disabled (worker removed)");
  };

  const handleDeleteResponse = async (id: number) => {
    try {
      await dexie.responses.delete(id);
      await loadResponses();
      toast.success("Response deleted successfully");
    } catch (error) {
      console.error("Failed to delete response:", error);
      toast.error("Failed to delete response");
    }
  };

  const formatDate = (date: Date) => new Date(date).toLocaleString();

  const parseResponseData = (dataString: string) => {
    try {
      return JSON.parse(dataString);
    } catch {
      return {};
    }
  };

  useEffect(() => {
    loadResponses();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading responses...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Scouting Responses
          </h1>
          <p className="text-muted-foreground mt-1">
            {responses.length} response{responses.length !== 1 ? "s" : ""}{" "}
            stored locally
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadResponses}
            disabled={isLoading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || responses.length === 0}>
            <Upload
              className={`h-4 w-4 mr-2 ${isUploading ? "animate-spin" : ""}`}
            />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>

      {/* Responses List */}
      {responses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No responses found</h3>
            <p className="text-muted-foreground text-center">
              Submit some scouting forms to see responses here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {responses.map((response, index) => {
            const parsedData = parseResponseData(response.data);
            const dataEntries = Object.entries(parsedData);
            return (
              <Card key={response.id || index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Badge variant="secondary">
                        #{response.id || index + 1}
                      </Badge>
                      Response -{" "}
                      {response.uploaded ? "Uploaded" : "Not Uploaded"}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        response.id && handleDeleteResponse(response.id)
                      }
                      className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {response.user || "Unknown User"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(response.date)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {dataEntries.length > 0 ? (
                    <ScrollArea className="max-h-64">
                      <div className="space-y-2">
                        {dataEntries.map(([key, value], idx) => {
                          if (key.toLowerCase() === "team") {
                            const team: Team = JSON.parse(value as string);
                            return (
                              <div key={idx}>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                  <span className="font-medium text-sm min-w-0 flex-shrink-0">
                                    Team:
                                  </span>
                                  <span className="text-sm text-muted-foreground break-words">
                                    <strong>{team.name}</strong> {team.value}
                                  </span>
                                </div>
                                {idx < dataEntries.length - 1 && (
                                  <Separator className="mt-2" />
                                )}
                              </div>
                            );
                          }
                          return (
                            <div key={idx}>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                <span className="font-medium text-sm min-w-0 flex-shrink-0">
                                  {key}:
                                </span>
                                <span className="text-sm text-muted-foreground break-words">
                                  {typeof value === "boolean"
                                    ? value
                                      ? "Yes"
                                      : "No"
                                    : String(value)}
                                </span>
                              </div>
                              {idx < dataEntries.length - 1 && (
                                <Separator className="mt-2" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No data available
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <UploadProgressDialog
        isOpen={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        progress={uploadProgress}
        status={uploadStatus}
        results={uploadResults}
        error={uploadError}
        onCancel={handleCancelUpload}
        onContinueInBackground={handleContinueInBackground}
      />
    </div>
  );
}
