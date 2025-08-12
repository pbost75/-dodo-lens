// Types principaux pour DodoLens MVP

export interface DetectedItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  volume: number;
  confidence: number;
  detectionMethod: 'video' | 'audio' | 'manual';
  videoTimestamp?: number;
  audioMention?: string;
  isEdited: boolean;
}

export interface VideoSegment {
  id: string;
  blob: Blob;
  duration: number;
  timestamp: Date;
  items: DetectedItem[];
}

export interface SpeechResult {
  transcript: string;
  confidence: number;
  timestamp: number;
  isFinal: boolean;
}

export interface AIAnalysisResult {
  items: DetectedItem[];
  confidence: number;
  processingTime: number;
}

export interface SessionData {
  id: string;
  videos: VideoSegment[];
  items: DetectedItem[];
  totalVolume: number;
  confidence: number;
  createdAt: Date;
}
