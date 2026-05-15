/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface File {
  name: string;
  content: string;
  type: 'text' | 'code' | 'protocol';
  createdAt: number;
}

export interface SystemStatus {
  cpuUsage: number;
  memoryUsage: number;
  uptime: string;
  securityLevel: string;
  activeProtocols: string[];
}

export interface AssistantState {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  isScanning: boolean;
  lastCommand: string;
}
