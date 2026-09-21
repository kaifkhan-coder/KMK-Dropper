export type FileCategory = 'code' | 'text' | 'document' | 'image' | 'binary' | 'data';

export interface QueuedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  isText: boolean;
  content?: string; // For text files
  binaryBlob?: Blob; // For binary files
  originalContent?: string;
  watermarkedContent?: string;
  addedAt: Date;
  status: 'staged' | 'compressing' | 'ready' | 'error';
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SECURE' | 'HTTP' | 'ZIP' | 'NET' | 'DIRECT';

export interface TransferLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
}

export interface NetworkInterfaceInfo {
  name: string;
  displayName: string;
  ipv4: string;
  mac: string;
  isLoopback: boolean;
  isUp: boolean;
  speedMb: number;
  type: 'WIFI' | 'ETHERNET' | 'LOOPBACK';
}

export interface ServerState {
  isRunning: boolean;
  port: number;
  host: string;
  activeInterface: string;
  activeConnections: number;
  totalBytesServed: number;
  totalTransfersCompleted: number;
  startedAt: Date | null;
}

export interface WatermarkState {
  isBypassActive: boolean;
  secretCodeAttempt: string;
  bannerString: string;
  secretAuthCode: string;
  lastUnlockedAt: Date | null;
  securityMessage: string | null;
}
