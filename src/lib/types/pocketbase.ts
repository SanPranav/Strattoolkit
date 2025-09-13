import { type RecordModel } from "pocketbase";

export interface User extends RecordModel {
  avatar: string;
  collectionId: string;
  collectionName: string;
  created: string;
  email: string;
  emailVisibility: boolean;
  id: string;
  name: string;
  updated: string;
  verified: boolean;
  role: "member" | "admin" | "guest";
}

export interface UserData extends RecordModel {
  created: string;
  updated: string;
  user: string;
  outreachMinutes: number;
  buildMinutes: number;
  lastOutreachEvent: string;
  lastBuildEvent: string;
  expand?: {
    user: User;
  };
}

export interface OutreachEvent extends RecordModel {
  id: string;
  name: string;
  created: string;
  updated: string;
  date: string;
}

export interface OutreachSession extends RecordModel {
  id: string;
  user: string;
  minutes: number;
  created: string;
  expand?: {
    user: User;
    event: OutreachEvent;
  };
}

export interface Setting extends RecordModel {
  id: string;
  key: string;
  value: JSON;
  created: string;
  updated: string;
}

export interface ScoutingResponse extends RecordModel {
  id: string;
  user: string;
  data: JSON;
  date: string;
  created: string;
  expand?: {
    user: User;
  };
}

export type pb_OAuthProvider = "google" | "discord";
