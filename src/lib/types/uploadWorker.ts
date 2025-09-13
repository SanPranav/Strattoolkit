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

export interface UploadStartMessage extends UploadWorkerMessage {
  type: UploadStates.START_UPLOAD;
  payload: {
    responses: Array<{
      id: number;
      user: string;
      data: string;
      date: Date;
    }>;
    authToken?: string;
  };
}

export interface UploadCancelMessage extends UploadWorkerMessage {
  type: UploadStates.CANCEL_UPLOAD;
}

export interface UploadProgressMessage extends UploadWorkerMessage {
  type: UploadStates.PROGRESS_UPDATE;
  payload: UploadProgressData;
}

export interface UploadCompleteMessage extends UploadWorkerMessage {
  type: UploadStates.UPLOAD_COMPLETE;
  payload: UploadCompleteData;
}

export interface UploadErrorMessage extends UploadWorkerMessage {
  type: UploadStates.UPLOAD_ERROR;
  payload: {
    error: string;
  };
}

export interface MarkUploadedMessage extends UploadWorkerMessage {
  type: UploadStates.MARK_UPLOADED;
  payload: {
    id: number;
  };
}

export type WorkerMessageFromMain = UploadStartMessage | UploadCancelMessage;
export type WorkerMessageToMain =
  | UploadProgressMessage
  | UploadCompleteMessage
  | UploadErrorMessage
  | MarkUploadedMessage;
