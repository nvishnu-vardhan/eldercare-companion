
export enum UserRole {
  PARENT = 'PARENT',
  CHILD = 'CHILD'
}

export interface Media {
  data: string; // base64
  mimeType: string;
  url?: string; // blob url for local display
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  media?: Media;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface CheckInLog {
  id: string;
  timestamp: number;
  mood: string;
  medicine: boolean;
  activity: string;
  meal: string;
  notes: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface AppState {
  currentRole: UserRole;
  parentName: string;
  childName: string;
  messages: Message[];
  logs: CheckInLog[];
}
