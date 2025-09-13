/// <reference lib="webworker" />

import type {
  WorkerMessageFromMain,
  WorkerMessageToMain,
  UploadProgressData,
  UploadCompleteData
} from "@/lib/types/uploadWorker";

// Import PocketBase for API calls
import PocketBase from "pocketbase";
import { UploadStates } from "@/lib/types/uploadWorker";

const POCKETBASE_URL = process.env.NEXT_PUBLIC_PB_URL || "";

if (!POCKETBASE_URL) {
  throw new Error(
    "POCKETBASE_URL is not defined. Please set the NEXT_PUBLIC_PB_URL environment variable."
  );
}

const pb = new PocketBase(POCKETBASE_URL);

interface ResponseToUpload {
  id: number;
  user: string;
  data: string;
  date: Date;
}

let isCancelled = false;

// Upload a single response
async function uploadSingleResponse(response: ResponseToUpload): Promise<void> {
  try {
    // Upload to PocketBase ScoutingResponses collection
    await pb.collection("ScoutingResponses").create({
      user: response.user,
      data: response.data,
      date: response.date.toISOString()
      // Add any other fields your collection requires
    });

    // Send message back to main thread to mark as uploaded in IndexedDB
    self.postMessage({
      type: UploadStates.MARK_UPLOADED,
      payload: { id: response.id }
    });
  } catch (error) {
    console.error(`Failed to upload response ${response.id}:`, error);
    throw new Error(
      `Failed to upload response ${response.id}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Main upload process
async function processUploads(
  responses: ResponseToUpload[],
  authToken?: string
) {
  // Set authentication if provided
  if (authToken) {
    pb.authStore.save(authToken, null);
  }

  const totalCount = responses.length;
  let successCount = 0;
  const errors: Array<{ id: number; error: string }> = [];

  for (let i = 0; i < responses.length && !isCancelled; i++) {
    const response = responses[i];

    // Send progress update
    const progressData: UploadProgressData = {
      currentIndex: i + 1,
      totalCount,
      currentResponse: `Response #${response.id} by ${response.user}`,
      percentage: Math.round(((i + 1) / totalCount) * 100)
    };

    const progressMessage: WorkerMessageToMain = {
      type: UploadStates.PROGRESS_UPDATE,
      payload: progressData
    };

    self.postMessage(progressMessage);

    try {
      await uploadSingleResponse(response);
      successCount++;
    } catch (error) {
      errors.push({
        id: response.id,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  if (isCancelled) {
    const errorMessage: WorkerMessageToMain = {
      type: UploadStates.UPLOAD_ERROR,
      payload: {
        error: "Upload was cancelled by user"
      }
    };
    self.postMessage(errorMessage);
    return;
  }

  // Send completion message
  const completeData: UploadCompleteData = {
    successCount,
    errorCount: errors.length,
    errors
  };

  const completeMessage: WorkerMessageToMain = {
    type: UploadStates.UPLOAD_COMPLETE,
    payload: completeData
  };

  self.postMessage(completeMessage);
}

// Handle messages from main thread
self.addEventListener("message", async (event) => {
  const message: WorkerMessageFromMain = event.data;

  switch (message.type) {
    case UploadStates.START_UPLOAD:
      isCancelled = false;
      try {
        await processUploads(
          message.payload.responses,
          message.payload.authToken
        );
      } catch (error) {
        const errorMessage: WorkerMessageToMain = {
          type: UploadStates.UPLOAD_ERROR,
          payload: {
            error:
              error instanceof Error ? error.message : "Unknown error occurred"
          }
        };
        self.postMessage(errorMessage);
      }
      break;

    case UploadStates.CANCEL_UPLOAD:
      isCancelled = true;
      break;

    default:
      console.warn(
        "Unknown message type received by workeUploadStates.:",
        message
      );
  }
});

// Export empty object to make TypeScript happy
export {};
