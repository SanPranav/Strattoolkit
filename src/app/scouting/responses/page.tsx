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
import { UploadStates } from "../../../lib/types/uploadWorker";
import type {
  WorkerMessageFromMain,
  WorkerMessageToMain,
  UploadProgressData,
  UploadCompleteData,
  MarkUploadedMessage
} from "@/lib/types/uploadWorker";

export default function ResponsesPage() {
  const [responses, setResponses] = useState<DexieScoutingSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Upload progress dialog state
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
  const [backgroundUpload, setBackgroundUpload] = useState(false);

  // Worker management
  const workerRef = useRef<Worker | null>(null);
  const backgroundProgressToastId = useRef<string | number | null>(null);

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

  // Initialize worker
  const initializeWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    workerRef.current = new Worker(
      new URL("./upload.worker.ts", import.meta.url),
      { type: "module" }
    );

    workerRef.current.onmessage = (event) => {
      const message: WorkerMessageToMain = event.data;

      switch (message.type) {
        case UploadStates.PROGRESS_UPDATE:
          setUploadProgress(message.payload);

          // Update background toast if dialog is closed
          if (backgroundUpload) {
            if (backgroundProgressToastId.current) {
              toast.loading(
                `Uploading ${message.payload.currentResponse} (${message.payload.percentage}%)`,
                { id: backgroundProgressToastId.current }
              );
            } else {
              backgroundProgressToastId.current = toast.loading(
                `Uploading ${message.payload.currentResponse} (${message.payload.percentage}%)`
              );
            }
          }
          break;

        case UploadStates.UPLOAD_COMPLETE:
          setUploadStatus("complete");
          setUploadResults(message.payload);
          setIsUploading(false);

          // Refresh the responses list
          loadResponses();

          // Handle background notifications
          if (backgroundUpload && backgroundProgressToastId.current) {
            toast.dismiss(backgroundProgressToastId.current);
            backgroundProgressToastId.current = null;

            if (message.payload.errorCount === 0) {
              toast.success(
                `Successfully uploaded ${
                  message.payload.successCount
                } response${message.payload.successCount !== 1 ? "s" : ""}!`
              );
            } else {
              toast.error(
                `Upload completed with errors: ${message.payload.successCount} succeeded, ${message.payload.errorCount} failed`
              );
            }
          }
          break;

        case UploadStates.UPLOAD_ERROR:
          setUploadStatus("error");
          setUploadError(message.payload.error);
          setIsUploading(false);

          // Handle background notifications
          if (backgroundUpload && backgroundProgressToastId.current) {
            toast.dismiss(backgroundProgressToastId.current);
            backgroundProgressToastId.current = null;
            toast.error(`Upload failed: ${message.payload.error}`);
          }
          break;

        case UploadStates.MARK_UPLOADED:
          // Mark the response as uploaded in IndexedDB
          markResponseAsUploaded(message.payload.id).catch((error) => {
            console.error("Failed to mark response as uploaded:", error);
          });
          break;
      }
    };

    workerRef.current.onerror = (error) => {
      console.error("Worker error:", error);
      setUploadStatus("error");
      setUploadError("Worker error occurred");
      setIsUploading(false);

      if (backgroundUpload && backgroundProgressToastId.current) {
        toast.dismiss(backgroundProgressToastId.current);
        backgroundProgressToastId.current = null;
        toast.error("Upload failed due to worker error");
      }
    };
  }, [backgroundUpload]);

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      if (backgroundProgressToastId.current) {
        toast.dismiss(backgroundProgressToastId.current);
      }
    };
  }, []);

  const handleUpload = async () => {
    try {
      // Get responses to upload
      const responsesToUpload = await uploadResponses();

      if (responsesToUpload.length === 0) {
        toast.info("No responses to upload");
        return;
      }

      // Reset state
      setUploadProgress(null);
      setUploadStatus("uploading");
      setUploadResults(undefined);
      setUploadError(undefined);
      setBackgroundUpload(false);
      setIsUploading(true);

      // Initialize worker
      initializeWorker();

      // Show dialog
      setUploadDialogOpen(true);

      // Start upload
      const message: WorkerMessageFromMain = {
        type: UploadStates.START_UPLOAD,
        payload: {
          responses: responsesToUpload,
          authToken: pb.authStore.token || undefined
        }
      };

      workerRef.current?.postMessage(message);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to prepare responses for upload");
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    if (workerRef.current) {
      const message: WorkerMessageFromMain = {
        type: UploadStates.CANCEL_UPLOAD
      };
      workerRef.current.postMessage(message);
      workerRef.current.terminate();
      workerRef.current = null;
    }

    setIsUploading(false);
    setUploadStatus("idle");
    setUploadDialogOpen(false);

    if (backgroundProgressToastId.current) {
      toast.dismiss(backgroundProgressToastId.current);
      backgroundProgressToastId.current = null;
    }

    toast.info("Upload cancelled");
  };

  const handleContinueInBackground = () => {
    setBackgroundUpload(true);
    setUploadDialogOpen(false);
  };

  const handleDeleteResponse = async (id: number) => {
    try {
      await dexie.responses.delete(id);
      await loadResponses(); // Refresh the list
      toast.success("Response deleted successfully");
    } catch (error) {
      console.error("Failed to delete response:", error);
      toast.error("Failed to delete response");
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

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

      {/* Upload Progress Dialog */}
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
