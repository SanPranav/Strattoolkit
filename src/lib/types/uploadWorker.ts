export enum UploadStates {
  START_UPLOAD,
  PROGRESS_UPDATE,
  UPLOAD_COMPLETE,
  UPLOAD_ERROR,
  CANCEL_UPLOAD,
  MARK_UPLOADED
}

export interface UploadWorkerMessage {
  type: UploadStates;
  payload?: any;
}

export interface UploadProgressData {
  currentIndex: number;
  totalCount: number;
  currentResponse: string;
  percentage: number;
}

export interface UploadCompleteData {
  successCount: number;
  errorCount: number;
  errors: Array<{ id: number; error: string }>;
}

// Minimal types retained for in-component upload logic.
