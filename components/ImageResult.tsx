/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {DownloadIcon, PlusIcon} from './icons';

interface ImageResultProps {
  imageUrl: string;
  prompt: string;
  onCreateNew: () => void;
}

const ImageResult: React.FC<ImageResultProps> = ({
  imageUrl,
  prompt,
  onCreateNew,
}) => {
  return (
    <div className="w-full flex flex-col items-center gap-8 p-8 bg-gray-800/50 rounded-lg border border-gray-700 shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-200">
        Image Generated Successfully!
      </h2>
      <div className="w-full max-w-lg aspect-square rounded-lg overflow-hidden bg-black shadow-lg">
        <img
          src={imageUrl}
          alt={prompt}
          className="w-full h-full object-contain"
        />
      </div>
      <p className="text-gray-400 italic text-center max-w-lg">"{prompt}"</p>

      <div className="flex flex-wrap justify-center gap-4">
        <a
          href={imageUrl}
          download={`lipsync-studio-image-${Date.now()}.png`}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
          <DownloadIcon className="w-5 h-5" />
          Download
        </a>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
          Create New
        </button>
      </div>
    </div>
  );
};

export default ImageResult;
