"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

interface UploadProgressDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  progress: {
    currentIndex: number;
    totalCount: number;
    currentResponse: string;
    percentage: number;
  } | null;
  status: "idle" | "uploading" | "complete" | "error";
  results?: {
    successCount: number;
    errorCount: number;
    errors: Array<{ id: number; error: string }>;
  };
  error?: string;
  onCancel?: () => void;
  onContinueInBackground?: () => void;
}

export function UploadProgressDialog({
  isOpen,
  onOpenChange,
  progress,
  status,
  results,
  error,
  onCancel,
  onContinueInBackground
}: UploadProgressDialogProps) {
  const [hasUserClosedDialog, setHasUserClosedDialog] = useState(false);

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen) {
      setHasUserClosedDialog(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (status === "uploading") {
      // If still uploading, continue in background
      setHasUserClosedDialog(true);
      onContinueInBackground?.();
    }
    onOpenChange(false);
  };

  const getDialogTitle = () => {
    switch (status) {
      case "uploading":
        return "Uploading Responses";
      case "complete":
        return "Upload Complete";
      case "error":
        return "Upload Error";
      default:
        return "Upload Status";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "uploading":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "complete":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getProgressValue = () => {
    if (!progress) return 0;
    return progress.percentage;
  };

  const getStatusDescription = () => {
    if (status === "uploading" && progress) {
      return `${progress.currentResponse} (${progress.currentIndex} of ${progress.totalCount})`;
    }

    if (status === "complete" && results) {
      const { successCount, errorCount } = results;
      if (errorCount === 0) {
        return `Successfully uploaded ${successCount} response${
          successCount !== 1 ? "s" : ""
        }!`;
      } else {
        return `Uploaded ${successCount} response${
          successCount !== 1 ? "s" : ""
        } successfully. ${errorCount} failed.`;
      }
    }

    if (status === "error") {
      return error || "An unexpected error occurred during upload.";
    }

    return "";
  };

  const canContinueInBackground = status === "uploading";
  const showCancelButton = status === "uploading" && onCancel;
  const showCloseButton = status === "complete" || status === "error";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>{getStatusDescription()}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress bar */}
          {(status === "uploading" || status === "complete") && (
            <div className="space-y-2">
              <Progress value={getProgressValue()} className="h-2" />
              {progress && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>{progress.percentage}%</span>
                </div>
              )}
            </div>
          )}

          {/* Error details */}
          {status === "complete" && results && results.errors.length > 0 && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <h4 className="text-sm font-medium text-red-800 mb-2">
                Failed Uploads:
              </h4>
              <div className="space-y-1">
                {results.errors.slice(0, 3).map((error) => (
                  <div key={error.id} className="text-sm text-red-700">
                    Response #{error.id}: {error.error}
                  </div>
                ))}
                {results.errors.length > 3 && (
                  <div className="text-sm text-red-600">
                    ... and {results.errors.length - 3} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            {showCancelButton && (
              <Button
                variant="outline"
                onClick={onCancel}
                className="sm:w-auto">
                Cancel Upload
              </Button>
            )}

            {canContinueInBackground && (
              <Button
                variant="secondary"
                onClick={handleClose}
                className="sm:w-auto">
                Continue in Background
              </Button>
            )}

            {showCloseButton && (
              <Button onClick={() => onOpenChange(false)} className="sm:w-auto">
                Close
              </Button>
            )}

            {/* Manual close button for non-cancellable states */}
            {!showCloseButton && !canContinueInBackground && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
