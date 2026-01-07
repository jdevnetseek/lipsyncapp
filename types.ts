/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum AppState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

export interface ImageFile {
  file: File;
  base64: string;
}

export interface GenerateLipSyncParams {
  script: string;
  image: ImageFile;
}

export interface Scene {
  scene: number;
  description: string;
  // Fix: Add missing imagePrompt property.
  imagePrompt: string;
  imageUrl: string | null;
  isLoading?: boolean;
}